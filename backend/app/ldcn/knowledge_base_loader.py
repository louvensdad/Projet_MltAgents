from __future__ import annotations

from pathlib import Path


class LdcnKnowledgeBase:
    def __init__(self, root: Path | None = None):
        base_root = Path(__file__).resolve().parent / "knowledge_base"
        self.root = root or base_root

    def load(self) -> dict[str, str]:
        payload: dict[str, str] = {}
        if not self.root.exists():
            return payload
        for path in sorted(self.root.glob("*.md")):
            try:
                payload[path.stem] = path.read_text(encoding="utf-8").strip()
            except OSError:
                payload[path.stem] = ""
        return payload

    def snippets_for(self, intent: str, route: str) -> list[str]:
        docs = self.load()
        snippets: list[str] = []
        mapping = {
            "create_project": ("stacks", "generation_pipeline", "agents"),
            "continue_wizard": ("generation_pipeline", "routes"),
            "use_template": ("templates", "routes"),
            "fix_error": ("troubleshooting", "agents"),
            "download_project": ("troubleshooting", "routes"),
            "validate_project": ("agents", "generation_pipeline"),
            "choose_stack": ("stacks",),
            "explain_page": ("routes", "agents"),
        }
        for key in mapping.get(intent, ("agents",)):
            if docs.get(key):
                snippets.append(docs[key][:500])
        if route.startswith("/wizard") and docs.get("routes"):
            snippets.append(docs["routes"][:300])
        return snippets[:4]
