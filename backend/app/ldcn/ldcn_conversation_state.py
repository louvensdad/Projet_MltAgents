from __future__ import annotations

from dataclasses import dataclass
from typing import Any


CONVERSATION_STATES = {
    "greeting",
    "discovering_need",
    "collecting_requirements",
    "recommending_stack",
    "filling_wizard",
    "validating",
    "generating",
    "troubleshooting",
    "explaining",
    "idle",
}


@dataclass(frozen=True)
class LdcnConversationStateResult:
    state: str
    reason: str


class LdcnConversationStateMachine:
    def resolve(self, intent: str, context: dict[str, Any], summary: dict[str, Any] | None = None) -> LdcnConversationStateResult:
        route = str(context.get("route") or context.get("page") or "/")
        wizard_step = context.get("wizard_step")
        last_error = context.get("last_error")
        pending = str((summary or {}).get("pending") or "")

        if intent == "small_talk":
            return LdcnConversationStateResult("greeting", "entrada inicial ou wake word")
        if intent in {"fix_error", "download_project"} or last_error:
            return LdcnConversationStateResult("troubleshooting", "erro ativo no contexto")
        if intent in {"explain_current_page", "explain_page"}:
            return LdcnConversationStateResult("explaining", "usuario quer contexto ou explicacao")
        if intent == "generate_project":
            return LdcnConversationStateResult("generating", "usuario quer gerar")
        if intent == "validate_project":
            return LdcnConversationStateResult("validating", "usuario quer validar")
        if intent == "choose_stack":
            return LdcnConversationStateResult("recommending_stack", "escolha de stack em foco")
        if intent == "use_template":
            return LdcnConversationStateResult("filling_wizard", "template deve alimentar wizard")
        if intent == "continue_wizard" or route.startswith("/wizard") or wizard_step:
            return LdcnConversationStateResult("filling_wizard", "wizard em andamento")
        if intent == "create_project":
            if pending == "executar prefill do wizard":
                return LdcnConversationStateResult("filling_wizard", "usuario ja sinalizou prefill")
            return LdcnConversationStateResult("collecting_requirements", "coletando requisitos para novo projeto")
        if route.startswith("/create"):
            return LdcnConversationStateResult("discovering_need", "tela de criacao aberta")
        return LdcnConversationStateResult("idle", "sem fluxo dominante")
