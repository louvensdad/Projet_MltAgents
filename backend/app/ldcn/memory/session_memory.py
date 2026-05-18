from __future__ import annotations

from pathlib import Path
from typing import Any

from backend.app.ldcn.conversation_summarizer import LdcnConversationSummarizer
from backend.app.ldcn.memory import LdcnMemory


class LdcnSessionMemory:
    def __init__(self, path: Path | None = None):
        self.store = LdcnMemory(path=path)
        self.summarizer = LdcnConversationSummarizer()

    def snapshot(self, conversation_id: str, user_id: str | None, session_id: str | None, limit: int = 10) -> dict[str, Any]:
        data = self.store.load()
        sessions = data.get("sessions", [])
        if not isinstance(sessions, list):
            sessions = []

        conversation_turns = [
            session
            for session in sessions
            if isinstance(session, dict) and str(session.get("conversation_id") or "") == str(conversation_id)
        ]
        recent_turns = conversation_turns[-limit:]
        summary = self.summarizer.summarize(conversation_turns, limit=limit)
        current = conversation_turns[-1] if conversation_turns else {}

        return {
            "conversation_id": conversation_id,
            "user_snapshot": self.store.user_snapshot(user_id, session_id, limit=limit),
            "recent_turns": recent_turns,
            "summary": summary.get("summary", ""),
            "goal": summary.get("goal", ""),
            "domain": self._infer_domain(summary.get("goal", "")),
            "selected_stack": current.get("stack_id") if isinstance(current, dict) else None,
            "last_decision": self._extract_last_decision(conversation_turns),
            "pending_question": self._extract_pending_question(conversation_turns, summary),
            "known_entities": self._extract_known_entities(conversation_turns),
            "known_features": self._extract_known_features(conversation_turns, summary),
            "decisions": summary.get("decisions", ""),
            "collected_fields": summary.get("collected_fields", ""),
            "pending": summary.get("pending", ""),
            "recent_errors": summary.get("recent_errors", ""),
            "intent": current.get("intent", "unknown") if isinstance(current, dict) else "unknown",
            "last_user_intent": current.get("intent", "unknown") if isinstance(current, dict) else "unknown",
            "active_project": current.get("active_project") if isinstance(current, dict) else None,
            "stack_id": current.get("stack_id") if isinstance(current, dict) else None,
            "last_error": current.get("last_error") if isinstance(current, dict) else None,
            "last_action": self._extract_last_action(current if isinstance(current, dict) else {}),
        }

    def remember(self, event: dict[str, Any]) -> None:
        self.store.remember(event)

    def _extract_last_action(self, event: dict[str, Any]) -> dict[str, Any] | None:
        actions = event.get("actions")
        if isinstance(actions, list) and actions:
            first = actions[0]
            if isinstance(first, dict):
                return first
        return None

    def _infer_domain(self, goal: str) -> str:
        normalized = str(goal).lower()
        if "clinica" in normalized:
            return "clinica"
        if "erp" in normalized:
            return "erp"
        if "saude" in normalized:
            return "saude"
        if "finance" in normalized:
            return "financeiro"
        return "software"

    def _extract_last_decision(self, turns: list[dict[str, Any]]) -> str:
        for turn in reversed(turns):
            message = str(turn.get("message") or "").strip()
            if message:
                return message
        return ""

    def _extract_pending_question(self, turns: list[dict[str, Any]], summary: dict[str, Any]) -> str:
        pending = str(summary.get("pending") or "").strip()
        if pending:
            return pending
        for turn in reversed(turns):
            reply = str(turn.get("reply") or "").strip()
            if "?" in reply:
                return reply
        return ""

    def _extract_known_entities(self, turns: list[dict[str, Any]]) -> list[str]:
        entities: list[str] = []
        for turn in turns:
            message = str(turn.get("message") or "").lower()
            for entity in ("clinica", "pacientes", "medicos", "agendamentos", "erp", "docker", "postgresql"):
                if entity in message and entity not in entities:
                    entities.append(entity)
        return entities

    def _extract_known_features(self, turns: list[dict[str, Any]], summary: dict[str, Any]) -> list[str]:
        features = [item for item in self._extract_known_entities(turns) if item not in {"clinica", "erp"}]
        if features:
            return features
        if self._infer_domain(summary.get("goal", "")) == "clinica":
            return ["pacientes", "medicos", "agendamentos", "permissoes"]
        return []
