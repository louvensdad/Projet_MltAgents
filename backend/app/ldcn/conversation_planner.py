from __future__ import annotations

from typing import Any

from backend.app.ldcn.llm_service import LdcnLlmService
from backend.app.ldcn.schemas import LdcnContext


class LdcnConversationPlanner:
    def __init__(self):
        self.llm_service = LdcnLlmService()

    def plan(
        self,
        context: LdcnContext,
        intent: str,
        memory_snapshot: dict[str, Any],
        agents_used: list[str],
    ) -> dict[str, Any]:
        goal = str(memory_snapshot.get("goal") or context.message).strip()
        domain = str(memory_snapshot.get("domain") or self._infer_domain(goal)).strip()
        selected_stack = str(
            memory_snapshot.get("selected_stack")
            or context.active_stack_id
            or context.stack_id
            or self._infer_stack(goal)
        ).strip()
        previous_reply = self._extract_previous_reply(context.conversation_history)
        if not previous_reply:
            previous_reply = self._extract_previous_reply(memory_snapshot.get("recent_turns", []))
        pending_question = str(memory_snapshot.get("pending_question") or memory_snapshot.get("pending") or "").strip()
        mode = "llm" if self._should_use_llm(context) else "local"

        return {
            "intent": intent,
            "mode": mode,
            "goal": goal,
            "domain": domain,
            "selected_stack": selected_stack,
            "pending_question": pending_question,
            "previous_reply": previous_reply,
            "conversation_state": context.conversation_state or "idle",
            "agents_used": agents_used,
            "voice_mode": context.source == "voice",
            "last_action": memory_snapshot.get("last_action", {}),
        }

    def _extract_previous_reply(self, history: list[dict[str, Any]] | Any) -> str:
        if not isinstance(history, list):
            return ""
        for turn in reversed(history):
            if isinstance(turn, dict):
                reply = str(turn.get("reply") or turn.get("message") or "").strip()
                role = str(turn.get("role") or "")
                if (role == "assistant" or not role) and reply:
                    return reply
        return ""

    def _infer_domain(self, text: str) -> str:
        normalized = text.lower()
        if "clinica" in normalized:
            return "clinica"
        if "erp" in normalized:
            return "erp"
        if "saude" in normalized:
            return "saude"
        if "finance" in normalized:
            return "financeiro"
        return "software"

    def _infer_stack(self, text: str) -> str:
        normalized = text.lower()
        if any(token in normalized for token in ("clinica", "enterprise", "erp", "saude")):
            return "spring_boot"
        if any(token in normalized for token in ("site", "landing", "institucional")):
            return "static_site"
        return "fastapi"

    def _should_use_llm(self, context: LdcnContext) -> bool:
        mode = (context.mode or "").lower()
        if self.llm_service.is_available("llm" if mode in {"agent_boost", "agent_boost_100", "premium"} else "local"):
            return True
        return False
