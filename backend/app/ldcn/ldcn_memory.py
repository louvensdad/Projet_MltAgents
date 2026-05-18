from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SENSITIVE_KEYS = {"api_key", "apikey", "token", "secret", "password", "senha", "authorization"}


class LdcnMemory:
    def __init__(self, path: Path | None = None):
        root = Path(__file__).resolve().parents[3]
        self.path = path or root / "data" / "ldcn_memory.json"

    def load(self) -> dict[str, Any]:
        if not self.path.exists():
            return {"sessions": [], "preferences": {}}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {"sessions": [], "preferences": {}}

    def remember(self, event: dict[str, Any]) -> None:
        data = self.load()
        sessions = data.setdefault("sessions", [])
        safe_event = self._sanitize(event)
        safe_event["timestamp"] = datetime.now(timezone.utc).isoformat()
        sessions.append(safe_event)
        data["sessions"] = sessions[-40:]
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

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
