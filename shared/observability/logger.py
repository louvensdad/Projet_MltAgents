import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        # Avoid duplicate handlers if logger is re-initialized
        if not self.logger.handlers:
            ch = logging.StreamHandler()
            ch.setFormatter(JsonFormatter())
            self.logger.addHandler(ch)

    def info(self, msg: str, **kwargs):
        self.logger.info(self._format(msg, kwargs))
        
    def error(self, msg: str, **kwargs):
        self.logger.error(self._format(msg, kwargs))

    def _format(self, msg: str, kwargs: dict) -> str:
        data = {
            "timestamp": datetime.utcnow().isoformat(),
            "message": msg,
        }
        data.update(kwargs)
        return json.dumps(data)

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return record.msg

def get_logger(name: str) -> StructuredLogger:
    return StructuredLogger(name)
