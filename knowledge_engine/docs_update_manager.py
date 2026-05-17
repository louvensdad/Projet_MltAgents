from datetime import datetime
from .docs_registry import DocsRegistry
from .docs_cache import get_cached_source, set_cached_source


def resolve_sources_for_stack(stack: str):
    registry = DocsRegistry()
    sources = registry.get_sources(stack)
    resolved = []
    for source in sources:
      cached = get_cached_source(source["name"])
      if cached:
        resolved.append({**cached, "cache": "HIT"})
      else:
        payload = {
            "name": source["name"],
            "version": source["version"],
            "updated_at": datetime.utcnow().strftime("%Y-%m-%d"),
            "status": "online",
        }
        set_cached_source(source["name"], payload)
        resolved.append({**payload, "cache": "MISS"})
    return resolved
