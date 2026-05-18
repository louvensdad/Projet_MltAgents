from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SENSITIVE_KEYS = {"api_key", "apikey", "token", "secret", "password", "senha", "authorization"}


class LdcnMemory:
    def __init__(self, path: Path | None = None):
        root = Path(__file__).resolve().parents[4]
        self.path = path or root / "data" / "ldcn_memory.json"

    def load(self) -> dict[str, Any]:
        if not self.path.exists():
            return {"sessions": [], "preferences": {}, "users": {}}
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                return {"sessions": [], "preferences": {}, "users": {}}
            data.setdefault("sessions", [])
            data.setdefault("preferences", {})
            data.setdefault("users", {})
            return data
        except (json.JSONDecodeError, OSError):
            return {"sessions": [], "preferences": {}, "users": {}}

    def recent(self, limit: int = 8) -> list[dict[str, Any]]:
        data = self.load()
        sessions = data.get("sessions", [])
        if not isinstance(sessions, list):
            return []
        return [session for session in sessions[-limit:] if isinstance(session, dict)]

    def snapshot(self, limit: int = 8) -> dict[str, Any]:
        data = self.load()
        recent_sessions = self.recent(limit)
        recent_turns = [
            {
                "message": str(session.get("message", ""))[:140],
                "intent": session.get("intent", "unknown"),
                "page": session.get("page", "/"),
                "route": session.get("route", "/"),
                "project_id": session.get("project_id"),
                "stack_id": session.get("stack_id"),
                "mode": session.get("mode"),
                "turn_id": session.get("turn_id"),
            }
            for session in recent_sessions
        ]
        return {
            "recent_sessions": recent_sessions,
            "recent_turns": recent_turns,
            "preferences": data.get("preferences", {}),
        }

    def user_snapshot(self, user_id: str | None, session_id: str | None, limit: int = 8) -> dict[str, Any]:
        if not user_id:
            return self.snapshot(limit)

        data = self.load()
        users = data.setdefault("users", {})
        user = users.get(user_id, {})
        sessions = user.get("sessions", {})
        current_session = sessions.get(session_id or "default", {}) if isinstance(sessions, dict) else {}
        recent_turns = current_session.get("turns", [])[-limit:] if isinstance(current_session, dict) else []
        return {
            "user_id": user_id,
            "session_id": session_id or "default",
            "profile": user.get("profile", {}),
            "summary": user.get("summary", ""),
            "recent_turns": recent_turns,
            "preferences": data.get("preferences", {}),
        }

    def remember(self, event: dict[str, Any]) -> None:
        data = self.load()
        sessions = data.setdefault("sessions", [])
        safe_event = self._sanitize(event)
        safe_event["timestamp"] = datetime.now(timezone.utc).isoformat()
        sessions.append(safe_event)
        data["sessions"] = sessions[-60:]

        user_id = str(safe_event.get("user_id") or "anonymous")
        session_id = str(safe_event.get("session_id") or "default")
        users = data.setdefault("users", {})
        user = users.setdefault(user_id, {"profile": {}, "sessions": {}, "summary": ""})
        user_sessions = user.setdefault("sessions", {})
        current_session = user_sessions.setdefault(session_id, {"turns": []})
        turns = current_session.setdefault("turns", [])
        turns.append(
            {
                "turn_id": safe_event.get("turn_id"),
                "message": safe_event.get("message", ""),
                "intent": safe_event.get("intent", "unknown"),
                "reply": safe_event.get("reply", ""),
                "page": safe_event.get("page", "/"),
                "route": safe_event.get("route", "/"),
                "stack_id": safe_event.get("stack_id"),
                "project_id": safe_event.get("project_id"),
                "agents_used": safe_event.get("agents_used", []),
                "timestamp": safe_event["timestamp"],
            }
        )
        current_session["turns"] = turns[-12:]

        profile = user.setdefault("profile", {})
        profile["last_locale"] = safe_event.get("locale", profile.get("last_locale", "pt-BR"))
        profile["last_mode"] = safe_event.get("mode", profile.get("last_mode", "local_build"))
        if safe_event.get("stack_id"):
            profile["favorite_stack"] = safe_event.get("stack_id")
        if safe_event.get("page"):
            profile["last_page"] = safe_event.get("page")

        user["summary"] = self._build_summary(turns)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def _build_summary(self, turns: list[dict[str, Any]]) -> str:
        if not turns:
            return ""
        snippets = []
        for turn in turns[-4:]:
            message = str(turn.get("message", "")).strip()
            intent = str(turn.get("intent", "unknown"))
            reply = str(turn.get("reply", "")).strip()
            if message:
                snippets.append(f"{intent}: {message[:90]}" + (f" -> {reply[:90]}" if reply else ""))
        return " | ".join(snippets)[-600:]

    def _sanitize(self, value: Any) -> Any:
        if isinstance(value, dict):
            clean: dict[str, Any] = {}
            for key, item in value.items():
                normalized = str(key).lower().replace("-", "_")
                if any(secret in normalized for secret in SENSITIVE_KEYS):
                    continue
                clean[str(key)] = self._sanitize(item)
            return clean
        if isinstance(value, list):
            return [self._sanitize(item) for item in value[:20]]
        if isinstance(value, str):
            if len(value) > 600:
                return value[:600] + "..."
            return value
        return value


from backend.app.ldcn.memory.session_memory import LdcnSessionMemory

__all__ = ["LdcnMemory", "LdcnSessionMemory"]
