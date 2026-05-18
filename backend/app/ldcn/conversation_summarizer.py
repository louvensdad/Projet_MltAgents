from __future__ import annotations

from typing import Any


class LdcnConversationSummarizer:
    def summarize(self, history: list[dict[str, Any]], limit: int = 10) -> dict[str, str]:
        if not history:
            return {
                "summary": "",
                "goal": "",
                "decisions": "",
                "collected_fields": "",
                "pending": "",
                "recent_errors": "",
            }

        older_turns = history[:-limit]
        recent_turns = history[-limit:]

        goal = self._extract_goal(history)
        decisions = self._join_unique(self._extract_decisions(history))
        collected_fields = self._join_unique(self._extract_fields(history))
        pending = self._infer_pending(history)
        recent_errors = self._join_unique(self._extract_errors(history))

        older_summary = " | ".join(self._format_turn(turn) for turn in older_turns[-6:])
        recent_summary = " | ".join(self._format_turn(turn) for turn in recent_turns[-6:])
        summary = " || ".join(part for part in [older_summary, recent_summary] if part)

        return {
            "summary": summary[:1200],
            "goal": goal[:240],
            "decisions": decisions[:320],
            "collected_fields": collected_fields[:320],
            "pending": pending[:240],
            "recent_errors": recent_errors[:240],
        }

    def _format_turn(self, turn: dict[str, Any]) -> str:
        role = str(turn.get("role") or turn.get("source") or "turn")
        message = str(turn.get("message") or "")[:90]
        intent = str(turn.get("intent") or "unknown")
        return f"{role}:{intent}:{message}".strip(":")

    def _extract_goal(self, history: list[dict[str, Any]]) -> str:
        for turn in history:
            role = str(turn.get("role") or "").strip()
            message = str(turn.get("message") or "").strip()
            if message and (role == "user" or not role):
                return message
        return ""

    def _extract_decisions(self, history: list[dict[str, Any]]) -> list[str]:
        decisions: list[str] = []
        for turn in history:
            message = str(turn.get("message") or "").lower()
            if "enterprise" in message:
                decisions.append("usuario escolheu perfil enterprise")
            if "template" in message:
                decisions.append("usuario demonstrou interesse em template")
            if "spring" in message or "spring_boot" in message:
                decisions.append("spring boot entrou na conversa")
            if "fastapi" in message:
                decisions.append("fastapi entrou na conversa")
        return decisions

    def _extract_fields(self, history: list[dict[str, Any]]) -> list[str]:
        fields: list[str] = []
        for turn in history:
            page_context = turn.get("page_context")
            if isinstance(page_context, dict):
                for key in ("active_project_id", "active_stack_id", "wizard_step", "selected_template"):
                    value = page_context.get(key)
                    if value:
                        fields.append(f"{key}={value}")
        return fields

    def _extract_errors(self, history: list[dict[str, Any]]) -> list[str]:
        errors: list[str] = []
        for turn in history:
            page_context = turn.get("page_context")
            if isinstance(page_context, dict) and page_context.get("last_error"):
                errors.append(str(page_context.get("last_error")))
            if turn.get("intent") == "fix_error":
                message = str(turn.get("message") or "")
                if message:
                    errors.append(message)
        return errors

    def _infer_pending(self, history: list[dict[str, Any]]) -> str:
        last_user = ""
        for turn in reversed(history):
            if str(turn.get("role")) == "user":
                last_user = str(turn.get("message") or "")
                break
        if not last_user:
            return ""
        if "pode preencher" in last_user.lower():
            return "executar prefill do wizard"
        if "erro" in last_user.lower():
            return "diagnosticar erro atual"
        return "confirmar proximo passo do fluxo"

    def _join_unique(self, items: list[str]) -> str:
        seen: set[str] = set()
        ordered: list[str] = []
        for item in items:
            clean = item.strip()
            if clean and clean not in seen:
                seen.add(clean)
                ordered.append(clean)
        return "; ".join(ordered)
