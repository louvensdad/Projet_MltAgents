from __future__ import annotations

import logging
from time import monotonic

from backend.app.ldcn.agent_dispatcher import LdcnAgentDispatcher
from backend.app.ldcn.master_agent import LdcnMasterAgent
from backend.app.ldcn.memory import LdcnSessionMemory
from backend.app.ldcn.schemas import LdcnContext, LdcnResponse

logger = logging.getLogger(__name__)

QUICK_REPLY_SECONDS = 2.0
AGENT_TIMEOUT_SECONDS = 5.0
LLM_TIMEOUT_SECONDS = 12.0
GLOBAL_TIMEOUT_SECONDS = 13.0


class LdcnOrchestrator:
    def __init__(self):
        self.dispatcher = LdcnAgentDispatcher()
        self.memory = LdcnSessionMemory()
        self.master = LdcnMasterAgent(dispatcher=self.dispatcher)

    def chat(self, context: LdcnContext) -> LdcnResponse:
        started_at = monotonic()
        memory_snapshot = self.memory.snapshot(context.conversation_id, context.user_id, context.session_id, limit=10)
        context.context.setdefault("conversation_memory", memory_snapshot)
        context.context.setdefault("page_context", context.page_context)
        context.context["source"] = "voice" if context.source == "voice" or context.context.get("source") == "voice" else "chat"
        context.context.setdefault("conversation_id", context.conversation_id)
        context.context.setdefault("turn_id", context.turn_id)
        context.context.setdefault("conversation_summary", memory_snapshot)
        context.context.setdefault("quick_reply", "Entendi. Estou analisando isso com os agentes certos.")

        response, intent, specialist_results = self.master.handle(
            context,
            memory_snapshot,
            global_timeout_seconds=GLOBAL_TIMEOUT_SECONDS,
            agent_timeout_seconds=AGENT_TIMEOUT_SECONDS,
            llm_timeout_seconds=LLM_TIMEOUT_SECONDS,
        )
        response.conversation_turn_id = context.client_turn_id or context.turn_id
        response.actions = response.ui_actions or response.suggested_actions
        elapsed = round(monotonic() - started_at, 3)
        timing = {
            "total_seconds": elapsed,
            "quick_reply_budget_seconds": QUICK_REPLY_SECONDS,
            "agent_timeout_seconds": AGENT_TIMEOUT_SECONDS,
            "llm_timeout_seconds": LLM_TIMEOUT_SECONDS,
            "global_timeout_seconds": GLOBAL_TIMEOUT_SECONDS,
        }
        response.timing = timing
        response.quick_reply = context.context.get("quick_reply")
        context.context["timing"] = timing
        if context.context.get("response_partial") and response.status == "success":
            response.status = "partial"
            response.partial = True
        if elapsed >= GLOBAL_TIMEOUT_SECONDS:
            response.status = "partial"
            response.partial = True
            response.fallback_used = True
            response.warnings.append("Tempo global excedido. Resposta parcial enviada.")
            logger.warning("fallback.used reason=global_timeout conversation_id=%s", context.conversation_id)

        self.memory.remember(
            {
                "turn_id": response.conversation_turn_id,
                "conversation_id": context.conversation_id,
                "message": context.message,
                "page": context.page,
                "page_title": context.page_title,
                "route": context.route,
                "project_id": context.project_id,
                "stack_id": context.stack_id,
                "active_stack_id": context.active_stack_id,
                "user_id": context.user_id,
                "session_id": context.session_id,
                "intent": intent,
                "agents_used": response.agents_used,
                "mode": context.mode,
                "locale": context.locale,
                "context": context.context,
                "reply": response.reply,
                "last_error": context.last_error,
                "active_project": context.active_project,
                "last_generation_result": context.last_generation_result,
                "actions": [action.model_dump() for action in response.actions],
                "source": response.source,
                "reply_provider": context.context.get("reply_provider", "local"),
                "conversation_state": context.conversation_state,
                "conversation_summary": context.conversation_summary,
                "specialist_reports": [result.report or {"summary": result.summary, "agent_name": result.agent_name} for result in specialist_results],
                "response_status": response.status,
                "partial": response.partial,
                "fallback_used": response.fallback_used,
                "warnings": response.warnings,
                "timing": response.timing,
            }
        )
        logger.info("response.sent conversation_id=%s status=%s partial=%s total_seconds=%.3f", context.conversation_id, response.status, response.partial, elapsed)
        return response
