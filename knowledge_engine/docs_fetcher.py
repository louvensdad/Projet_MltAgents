import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from .docs_registry import DocsRegistry


class DocsFetcher:
    """Documentation context loader backed by the official local registry/cache.

    This does not fabricate a green status anymore:
    - If a stack exists in the registry, the context is returned from that registry
    - A cache file is written/read for traceability
    - If the stack is unknown, the request fails explicitly
    """

    def __init__(self, registry: DocsRegistry):
        self.registry = registry
        self.cache_dir = Path(__file__).resolve().parents[2] / ".cache" / "docs"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def fetch_docs(self, stack: str) -> dict:
        source_config = self.registry.get_source(stack)
        sources = source_config.get("sources", [])
        if not sources:
            return {"status": "failed", "reason": f"Stack {stack} não mapeada no registro oficial."}

        summary_lines = [
            f"- {source['name']} {source['version']}: {source.get('summary', '').strip()}"
            for source in sources
        ]
        content = "\n".join(summary_lines)
        timestamp = datetime.now(timezone.utc).isoformat()
        payload = {
            "status": "success",
            "origin": source_config.get("repo", "official_registry"),
            "version": "registry-current",
            "date": timestamp,
            "hash": hashlib.sha256(content.encode("utf-8")).hexdigest(),
            "content_summary": content,
            "sources": sources,
            "cached": False,
        }

        cache_path = self.cache_dir / f"{stack}.json"
        cache_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return payload

    def load_cached_docs(self, stack: str) -> dict:
        cache_path = self.cache_dir / f"{stack}.json"
        if not cache_path.exists():
            return {"status": "failed", "reason": f"Cache de documentação não encontrado para {stack}."}
        data = json.loads(cache_path.read_text(encoding="utf-8"))
        data["cached"] = True
        return data
