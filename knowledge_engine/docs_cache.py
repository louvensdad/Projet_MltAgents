from datetime import datetime
from typing import Dict, Any

_CACHE: Dict[str, Dict[str, Any]] = {}


def get_cached_source(key: str):
    return _CACHE.get(key)


def set_cached_source(key: str, payload: Dict[str, Any]):
    _CACHE[key] = {**payload, "cached_at": datetime.utcnow().isoformat()}
