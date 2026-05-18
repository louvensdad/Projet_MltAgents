from __future__ import annotations

import logging
from concurrent.futures import ALL_COMPLETED, ThreadPoolExecutor, wait
from time import monotonic
from pathlib import Path

from backend.app.ldcn.agent_dispatcher import LdcnAgentDispatcher
from backend.app.ldcn.context_summarizer import LdcnContextSummarizer
from backend.app.ldcn.conversation_planner import LdcnConversationPlanner
from backend.app.ldcn.intent_classifier import LdcnIntentClassifier
from backend.app.ldcn.knowledge_base_loader import LdcnKnowledgeBase
from backend.app.ldcn.ldcn_conversation_state import LdcnConversationStateMachine
from backend.app.ldcn.natural_reply_engine import LdcnNaturalReplyEngine
from backend.app.ldcn.response_builder import LdcnResponseBuilder
from backend.app.ldcn.schemas import LdcnContext, LdcnResponse
from backend.app.ldcn.specialist_agents import AGENT_REGISTRY, SpecialistAgentResult

logger = logging.getLogger(__name__)


class LdcnMasterAgent:
    def __init__(
        self,
        classifier: LdcnIntentClassifier | None = None,
        dispatcher: LdcnAgentDispatcher | None = None,
        response_builder: LdcnResponseBuilder | None = None,
    ):
        self.classifier = classifier or LdcnIntentClassifier()
        self.dispatcher = dispatcher or LdcnAgentDispatcher()
        self.response_builder = response_builder or LdcnResponseBuilder()
        self.knowledge_base = LdcnKnowledgeBase()
        self.state_machine = LdcnConversationStateMachine()
        self.system_prompt = self._load_system_prompt()
        self.planner = LdcnConversationPlanner()
        self.context_summarizer = LdcnContextSummarizer()
        self.reply_engine = LdcnNaturalReplyEngine()

    def handle(
        self,
        context: LdcnContext,
        memory_snapshot: dict[str, object] | None = None,
        global_timeout_seconds: float = 15.0,
        agent_timeout_seconds: float = 5.0,
        llm_timeout_seconds: float = 12.0,
    ) -> tuple[LdcnResponse, str, list[SpecialistAgentResult]]:
        started_at = monotonic()
        deadline = started_at + global_timeout_seconds
        intent = self.classifier.classify(context.message, context.route or context.page, context.page_context)
        logger.info("intent.done intent=%s conversation_id=%s", intent, context.conversation_id)
        if intent == "unknown" and context.context.get("last_error"):
            intent = "fix_error"
        if intent == "unknown" and memory_snapshot and memory_snapshot.get("intent") in {"create_project", "continue_project"}:
            intent = "continue_project"

        context.context["system_prompt"] = self.system_prompt
        context.context["knowledge_snippets"] = self.knowledge_base.snippets_for(intent, context.route or context.page)
        context.conversation_summary = memory_snapshot or {}
        state_result = self.state_machine.resolve(intent, context.page_context | context.context, memory_snapshot or {})
        context.conversation_state = state_result.state
        context.context["conversation_state_reason"] = state_result.reason

        agents = self.dispatcher.dispatch(intent, context)
        results = self._run_specialists(agents, context, deadline=deadline, timeout_seconds=agent_timeout_seconds)
        context.context["specialist_reports"] = [result.report or {"summary": result.summary, "agent": result.agent_name} for result in results]
        context.context["specialist_summaries"] = [result.summary for result in results if result.summary]
        agents_used = [result.agent_name for result in results]
        if context.context.get("response_partial"):
            context.context["response_status"] = "partial"
        plan = self.planner.plan(context, intent, memory_snapshot or {}, agents_used)
        context.context["llm_timeout_seconds"] = max(0.1, min(llm_timeout_seconds, deadline - monotonic()))
        summary = self.context_summarizer.summarize(context, memory_snapshot or {}, context.context["specialist_summaries"], agents_used)
        context.context["conversation_plan"] = plan
        context.context["conversation_context_summary"] = summary
        if monotonic() >= deadline:
            context.context["response_partial"] = True
            context.context["fallback_used"] = True
            context.context["response_status"] = "partial"
            context.context.setdefault("response_warnings", []).append("Tempo global excedido. Retornando resposta parcial.")
            reply = self.reply_engine._generate_timeout_fallback(context, plan, summary)
            context.context["reply_provider"] = "local_timeout_fallback"
            logger.warning("fallback.used reason=global_timeout conversation_id=%s", context.conversation_id)
        else:
            logger.info("llm.started conversation_id=%s timeout_seconds=%.2f", context.conversation_id, float(context.context["llm_timeout_seconds"]))
            reply = self.reply_engine.generate(context, plan, summary)
            context.context["reply_provider"] = self.reply_engine.last_provider
            if context.context.get("llm_error_type") == "timeout":
                context.context["response_partial"] = True
                context.context["fallback_used"] = True
                context.context["response_status"] = "partial"
                context.context.setdefault("response_warnings", []).append("LLM excedeu o timeout e o fallback local foi usado.")
                logger.warning("llm.timeout conversation_id=%s", context.conversation_id)
                logger.warning("fallback.used reason=llm_timeout conversation_id=%s", context.conversation_id)
        response = self.response_builder.build(context, intent, agents_used, reply, memory_snapshot or {})
        return response, intent, results

    def _run_specialists(
        self,
        agent_names: list[str],
        context: LdcnContext,
        deadline: float,
        timeout_seconds: float,
    ) -> list[SpecialistAgentResult]:
        results: list[SpecialistAgentResult] = []
        warnings = context.context.setdefault("response_warnings", [])
        max_wait = max(0.0, min(timeout_seconds, deadline - monotonic()))
        if max_wait <= 0:
            context.context["response_partial"] = True
            warnings.append("Orcamento de tempo esgotado antes dos especialistas.")
            return [SpecialistAgentResult(agent_name=name, summary=f"{name} adiado por timeout global.", status="timeout") for name in agent_names]

        futures = {}
        with ThreadPoolExecutor(max_workers=max(1, min(len(agent_names), 4))) as executor:
            for agent_name in agent_names:
                specialist = AGENT_REGISTRY.get(agent_name)
                if specialist is None:
                    results.append(SpecialistAgentResult(agent_name=agent_name, summary=f"{agent_name} ainda nao tem executor dedicado.", status="planned"))
                    continue
                logger.info("agent.started agent=%s conversation_id=%s", agent_name, context.conversation_id)
                futures[executor.submit(specialist.run, context)] = agent_name

            done, not_done = wait(list(futures.keys()), timeout=max_wait, return_when=ALL_COMPLETED)

            for future in done:
                agent_name = futures[future]
                try:
                    results.append(future.result())
                except Exception:
                    warnings.append(f"{agent_name} falhou e foi ignorado nesta resposta.")
                    context.context["response_partial"] = True
                    logger.exception("agent.error agent=%s conversation_id=%s", agent_name, context.conversation_id)
                    results.append(SpecialistAgentResult(agent_name=agent_name, summary=f"{agent_name} falhou. Vou seguir com os demais agentes.", status="failed"))

            for future in not_done:
                agent_name = futures[future]
                future.cancel()
                warnings.append(f"{agent_name} excedeu o timeout e sera validado depois.")
                context.context["response_partial"] = True
                logger.warning("agent.timeout agent=%s conversation_id=%s", agent_name, context.conversation_id)
                results.append(SpecialistAgentResult(agent_name=agent_name, summary=f"{agent_name} nao terminou a tempo. Validacao pendente.", status="timeout"))

        ordered = []
        by_name = {result.agent_name: result for result in results}
        for agent_name in agent_names:
            result = by_name.get(agent_name)
            if result is not None:
                ordered.append(result)
        return ordered

    def _load_system_prompt(self) -> str:
        path = Path(__file__).resolve().parent / "prompts" / "ldcn_system_prompt.md"
        try:
            return path.read_text(encoding="utf-8").strip()
        except OSError:
            return ""
