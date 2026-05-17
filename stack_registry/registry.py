import json
import os
from typing import Dict, Any

class StackRegistry:
    def __init__(self, registry_dir: str = None):
        self.registry_dir = registry_dir or os.path.join(os.path.dirname(__file__), "stacks")
        self.stacks: Dict[str, Any] = {}
        self._load_stacks()

    def _load_stacks(self):
        if not os.path.exists(self.registry_dir):
            os.makedirs(self.registry_dir, exist_ok=True)
            return

        for filename in os.listdir(self.registry_dir):
            if filename.endswith(".json"):
                path = os.path.join(self.registry_dir, filename)
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.stacks[data.get("id")] = data

    def get_stack(self, stack_id: str) -> Dict[str, Any]:
        if stack_id not in self.stacks:
            raise ValueError(f"Stack {stack_id} not found in registry.")
        return self.stacks[stack_id]

    def list_stacks(self) -> list:
        return list(self.stacks.values())
