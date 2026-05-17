import json
import time
from pathlib import Path
from typing import Dict, List, Optional

AUDIT_LOG = Path("control_panel/backend/logs/audit.log")


def parse_recent_activity(limit: int = 20, event_type: Optional[str] = None) -> List[Dict]:
    if not AUDIT_LOG.exists():
        return []
    lines = AUDIT_LOG.read_text(encoding="utf-8", errors="ignore").splitlines()
    out: List[Dict] = []
    for line in reversed(lines[-2000:]):
        try:
            payload = json.loads(line.split(" - ", 2)[-1])
        except Exception:
            continue
        if event_type and payload.get("event_type") != event_type:
            continue
        out.append(payload)
        if len(out) >= limit:
            break
    return out


def stream_activity(event_type: Optional[str] = None):
    last_payload = None
    while True:
        events = parse_recent_activity(limit=1, event_type=event_type)
        current = events[0] if events else {"event_type": "idle", "timestamp": None, "project_id": None}
        encoded = json.dumps(current, ensure_ascii=False)
        if encoded != last_payload:
            yield f"data: {encoded}\n\n"
            last_payload = encoded
        time.sleep(2)
