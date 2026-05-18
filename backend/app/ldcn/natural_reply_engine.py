from __future__ import annotations

from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from backend.app.ldcn.llm_service import LdcnLlmService
from backend.app.ldcn.schemas import LdcnContext


class LdcnNaturalReplyEngine:
    def __init__(self):
        self.prompt = self._load_prompt()
        self.llm_service = LdcnLlmService()
        self.last_provider = "local"

    def generate(self, context: LdcnContext, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        if self.llm_service.is_available(str(plan.get("mode") or "local")):
            reply = self._generate_with_llm(context, plan, summary)
            if reply:
                return self._post_process(reply, plan, summary)
            if context.context.get("llm_error_type") == "timeout":
                self.last_provider = "local_timeout_fallback"
                return self._post_process(self._generate_timeout_fallback(context, plan, summary), plan, summary)
            self.last_provider = "local_error_fallback"
            return self._post_process(self._generate_contextual_fallback(context, plan, summary, reason="error"), plan, summary)
        self.last_provider = "local"
        return self._post_process(self._generate_local(context, plan, summary), plan, summary)

    def _generate_with_llm(self, context: LdcnContext, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        prompt = self._build_llm_prompt(context, plan, summary)
        result = self.llm_service.generate(
            prompt,
            system_instruction=self.prompt,
            preferred_mode=str(plan.get("mode") or "local"),
            project_context={"name": summary.get("goal", ""), "stack": plan.get("selected_stack", ""), "type": summary.get("domain", "")},
            timeout_seconds=float(context.context.get("llm_timeout_seconds") or 12.0),
            source=context.source,
        )
        if not result.get("success"):
            context.context["llm_error_type"] = result.get("error_type") or "provider_error"
            context.context["llm_error_message"] = result.get("error") or ""
            return ""
        self.last_provider = str(result.get("provider") or "llm")
        return str(result.get("response") or "").strip()

    def _generate_local(self, context: LdcnContext, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        intent = plan["intent"]
        goal = str(plan.get("goal") or context.message)
        domain = str(plan.get("domain") or "software")
        selected_stack = str(plan.get("selected_stack") or "fastapi")
        if "enterprise" in context.message.lower() and domain in {"clinica", "erp", "saude"}:
            selected_stack = "spring_boot"
        stack = self._stack_label(selected_stack)
        pending = str(plan.get("pending_question") or summary.get("pending_question") or "")
        last_error = str(summary.get("last_error") or context.last_error or "")
        known_features = summary.get("known_features") or []

        if intent == "unknown":
            return "Entendi em partes. Voce quer criar um projeto, corrigir um erro ou entender essa tela?"
        if intent == "fix_error":
            if last_error:
                return f"Achei o suspeito. {last_error} Quer que eu foque na causa tecnica ou te leve para a tela certa?"
            return "Tem erro no caminho, mas ainda falta a mensagem exata para eu cravar a causa."
        if intent in {"create_project", "continue_project", "continue_wizard"}:
            feature_line = self._feature_line(known_features, domain)
            if "enterprise" in context.message.lower():
                return f"Entendi. Mantendo o contexto de {goal}, eu recomendaria uma linha enterprise com {stack} modular, PostgreSQL, autenticacao, logs, metricas e Docker. Quer que eu preencha o wizard?"
            if "preencher" in context.message.lower():
                return f"Perfeito. Vou preparar o wizard com {goal}, {feature_line} e arquitetura {self._architecture_label(stack)}. Antes de gerar, eu ainda valido com o gatekeeper."
            return f"Entendi. Para {domain}, normalmente eu comeco com {feature_line}. Voce quer algo simples ou enterprise?"
        if intent == "download_project":
            if last_error:
                return f"Achei o vilao. O download esbarrou nisto: {last_error}. Posso abrir os downloads ou explicar a causa tecnica."
            return "Vou olhar o pacote e o ZIP antes de te passar um palpite."
        if intent == "use_template":
            return f"Consigo manter o contexto de {goal} e procurar um template que reduza o trabalho manual. Quer que eu abra a galeria?"
        if intent == "choose_stack":
            return f"Para {goal}, minha leitura inicial favorece {stack}. Se quiser, eu justifico rapido ou ja preparo o wizard."
        if intent == "generate_project":
            return f"Posso seguir com a geracao de {goal}. Antes, eu mantenho a validacao tecnica para nao virar loteria."
        if intent in {"explain_page", "explain_current_page", "explain_screen"}:
            return f"Voce esta em {context.route}. Eu estou usando essa tela, a memoria da conversa e os agentes ativos para te orientar sem perder o contexto."
        if pending:
            return f"Estou acompanhando {goal}. O proximo ponto aberto e {pending}. Quer que eu execute isso?"
        return f"Estou mantendo o contexto de {goal} e sigo a partir daqui sem resetar a conversa."

    def _generate_timeout_fallback(self, context: LdcnContext, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        return self._generate_contextual_fallback(context, plan, summary, reason="timeout")

    def _build_llm_prompt(self, context: LdcnContext, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        compact_history = self._compact_history_for_prompt(summary.get("history"))
        short_summary = str(summary.get("conversation_summary") or summary.get("goal") or context.message).strip()[:220]
        last_action = summary.get("last_action") if isinstance(summary.get("last_action"), dict) else {}
        return (
            f"Mensagem do usuario: {context.message}\n"
            f"Intent: {plan.get('intent')}\n"
            f"Estado da conversa: {plan.get('conversation_state')}\n"
            f"Rota: {context.route}\n"
            f"Pagina: {context.page_title or context.page}\n"
            f"Wizard step: {context.wizard_step}\n"
            f"Stack ativa: {context.active_stack_id or context.stack_id}\n"
            f"Erro atual: {context.last_error}\n"
            f"Resumo curto: {short_summary}\n"
            f"Objetivo: {summary.get('goal')}\n"
            f"Ultima acao: {last_action.get('label') or last_action.get('type') or 'nenhuma'}\n"
            f"Historico recente: {compact_history}\n"
            f"Especialistas: {summary.get('specialist_summaries')}\n"
            f"Origem: {context.source}\n"
            "Responda em portugues do Brasil. Seja curto, contextual, util e acionavel. "
            "Nao repita o historico. Se a origem for voice, use no maximo 3 frases curtas."
        )

    def _generate_contextual_fallback(
        self,
        context: LdcnContext,
        plan: dict[str, Any],
        summary: dict[str, Any],
        reason: str,
    ) -> str:
        screen = self._screen_label(context, summary)
        stack = str(summary.get("active_stack_label") or self._stack_label(str(plan.get("selected_stack") or context.active_stack_id or context.stack_id or ""))).strip()
        intent = str(plan.get("intent") or "unknown")
        last_error = str(context.last_error or summary.get("last_error") or "").strip()
        last_action = summary.get("last_action") if isinstance(summary.get("last_action"), dict) else {}
        last_action_label = str(last_action.get("label") or last_action.get("type") or "").strip()
        prefix = (
            "O modo IA premium demorou. Vou continuar no modo local com base no contexto da tela."
            if reason == "timeout"
            else "O modo IA premium falhou. Vou continuar no modo local com base no contexto da tela."
        )
        location = f"Vejo que voce esta em {screen}." if screen else f"Vejo que voce esta em {context.route or context.page}."
        stack_line = f" A stack em foco e {stack}." if stack else ""
        error_line = f" O erro atual e {last_error}." if last_error else ""
        action_line = f" A ultima acao relevante foi {last_action_label}." if last_action_label else ""
        options = self._fallback_options(intent, context, plan, summary)
        return f"{prefix} {location}{stack_line}{error_line}{action_line} Posso {options}."

    def _fallback_options(self, intent: str, context: LdcnContext, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        route = (context.route or context.page or "/").lower()
        if route.startswith("/wizard/static-site"):
            return "revisar os campos, gerar o Prompt Master ou tentar gerar o projeto novamente"
        if route.startswith("/wizard"):
            return "revisar o wizard, preencher os campos principais ou preparar a geracao"
        if "download" in route or intent == "download_project":
            return "abrir os downloads, explicar a causa tecnica ou tentar o fluxo novamente"
        if "template" in route or intent == "use_template":
            return "abrir a galeria, comparar templates ou aplicar um template agora"
        if "validation" in route or intent in {"fix_error", "validate_project"}:
            return "revisar a validacao, focar no erro atual ou checar a seguranca"
        if intent in {"create_project", "continue_project", "continue_wizard", "generate_project"}:
            return "revisar os dados do projeto, montar o proximo passo ou tentar a geracao novamente"
        if intent in {"explain_page", "explain_current_page", "explain_screen"}:
            return "explicar essa tela, apontar o proximo passo ou abrir a acao mais segura"
        return "explicar a tela atual, revisar o contexto ou tentar novamente com menos latencia"

    def _screen_label(self, context: LdcnContext, summary: dict[str, Any]) -> str:
        page_title = str(context.page_title or "").strip()
        if page_title:
            return page_title
        route = (context.route or context.page or "/").strip("/")
        if not route:
            return "a tela inicial"
        normalized = route.replace("-", " ").replace("/", " / ")
        return normalized.title()

    def _compact_history_for_prompt(self, history: Any) -> str:
        if not isinstance(history, list):
            return "[]"
        parts: list[str] = []
        for turn in history[:6]:
            if not isinstance(turn, dict):
                continue
            role = str(turn.get("role") or "turn")
            message = str(turn.get("message") or "")[:120]
            if message:
                parts.append(f"{role}: {message}")
        return " | ".join(parts)

    def _post_process(self, reply: str, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        previous_reply = str(plan.get("previous_reply") or "")
        cleaned = " ".join(reply.split())
        if self._too_similar(cleaned, previous_reply):
            cleaned = self._vary_reply(cleaned, plan, summary)
        if plan.get("voice_mode"):
            cleaned = self._trim_for_voice(cleaned)
        return cleaned

    def _vary_reply(self, reply: str, plan: dict[str, Any], summary: dict[str, Any]) -> str:
        goal = str(plan.get("goal") or summary.get("goal") or "esse fluxo")
        if plan.get("intent") in {"create_project", "continue_project", "continue_wizard"}:
            return f"Seguindo o contexto de {goal}, eu ajustaria o proximo passo sem repetir o briefing. Se quiser, eu ja preparo o wizard."
        if plan.get("intent") == "fix_error":
            return f"Continuando no mesmo problema de {goal}, eu focaria primeiro no erro atual antes de trocar qualquer outra coisa."
        return f"Vou continuar a partir de {goal} sem reciclar a mesma resposta."

    def _too_similar(self, current: str, previous: str) -> bool:
        if not current or not previous:
            return False
        return SequenceMatcher(a=current.lower(), b=previous.lower()).ratio() > 0.84

    def _trim_for_voice(self, reply: str) -> str:
        chunks = [chunk.strip() for chunk in reply.replace("!", ".").replace("?", ".").split(".") if chunk.strip()]
        trimmed = ". ".join(chunks[:3]).strip()
        if trimmed and not trimmed.endswith("."):
            trimmed += "."
        return trimmed

    def _feature_line(self, known_features: list[str], domain: str) -> str:
        if known_features:
            return ", ".join(known_features[:4])
        if domain == "clinica":
            return "pacientes, medicos, agendamentos e permissoes"
        if domain == "erp":
            return "modulos, permissoes, auditoria e integracoes"
        return "modulos principais e regras de negocio"

    def _architecture_label(self, stack: str) -> str:
        if "Spring" in stack:
            return "enterprise"
        return "consistente"

    def _stack_label(self, stack: str) -> str:
        labels = {
            "spring_boot": "Spring Boot",
            "fastapi": "FastAPI",
            "static_site": "Static Site",
            "nextjs": "Next.js",
            "react": "React",
        }
        return labels.get(stack, stack.replace("_", " ").title())

    def _load_prompt(self) -> str:
        path = Path(__file__).resolve().parent / "prompts" / "ldcn_conversation_prompt.md"
        try:
            return path.read_text(encoding="utf-8").strip()
        except OSError:
            return ""
