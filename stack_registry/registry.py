import json
import os
import re
from typing import Any, Dict


class StackRegistry:
    def __init__(self, registry_dir: str = None):
        self.registry_dir = registry_dir or os.path.join(os.path.dirname(__file__), "stacks")
        self.stacks: Dict[str, Any] = {}
        self._load_stacks()

    @staticmethod
    def normalize_stack_id(stack_id: str) -> str:
        raw = str(stack_id or "").strip().lower()
        raw = raw.replace("+", "_").replace("-", "_").replace(" ", "_")
        raw = re.sub(r"_+", "_", raw).strip("_")
        aliases = {
            "static": "static_site",
            "staticsite": "static_site",
            "static_site_wizard": "static_site",
            "static_site": "static_site",
            "static-site": "static_site",
            "static site": "static_site",
            "spring_boot": "springboot",
            "java_springboot": "springboot",
            "python_fastapi": "fastapi",
            "node_nestjs": "nestjs",
        }
        return aliases.get(raw, raw)

    def _load_stacks(self):
        if not os.path.exists(self.registry_dir):
            os.makedirs(self.registry_dir, exist_ok=True)
            return

        for filename in os.listdir(self.registry_dir):
            if not filename.endswith(".json"):
                continue
            path = os.path.join(self.registry_dir, filename)
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                stack_id = self.normalize_stack_id(data.get("id"))
                if not stack_id:
                    continue
                data["id"] = stack_id
                self.stacks[stack_id] = data
                for alias in data.get("aliases", []) or []:
                    normalized_alias = self.normalize_stack_id(alias)
                    if normalized_alias:
                        self.stacks[normalized_alias] = data

    def get_stack(self, stack_id: str) -> Dict[str, Any]:
        normalized = self.normalize_stack_id(stack_id)
        if normalized not in self.stacks:
            raise ValueError(f"Stack {normalized} not found in registry.")
        return self.stacks[normalized]

    def list_stacks(self) -> list:
        unique: dict[str, Any] = {}
        for stack_id, stack in self.stacks.items():
            canonical = stack.get("id", stack_id)
            unique[canonical] = stack
        return list(unique.values())
