import logging
import os
from pathlib import Path
from datetime import datetime
import json

LOG_DIR = Path(__file__).parent.parent.parent / "logs"
AUDIT_LOG_FILE = LOG_DIR / "audit.log"

# Ensure log directory exists
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a file handler
handler = logging.FileHandler(AUDIT_LOG_FILE, encoding="utf-8")
handler.setLevel(logging.INFO)

# Create a formatter and add it to the handler
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

# Add the handler to the logger
if not logger.handlers:
    logger.addHandler(handler)

def log_event(event_type: str, project_id: str, details: dict = None):
    """Logs an audit event to the audit.log file."""
    event_details = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "project_id": project_id,
        "details": details if details is not None else {}
    }
    logger.info(json.dumps(event_details, ensure_ascii=False))
