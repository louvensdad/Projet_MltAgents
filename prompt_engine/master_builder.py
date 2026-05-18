import json
from typing import Dict, Any

class PromptMaster:
    """
    The Single Source of Truth for Prompt Generation.
    Aggregates all architectural decisions into a strict, deterministic payload.
    """
    def __init__(self, stack_registry):
        self.stack_registry = stack_registry

    def build_master_prompt(self, user_input: str, stack_id: str, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Builds the absolute source of truth payload.
        """
        stack_def = self.stack_registry.get_stack(stack_id)
        
        # 1. Stack
        stack_info = {
            "id": stack_def["id"],
            "name": stack_def.get("name") or stack_def.get("display_name") or stack_def["id"],
            "core_technologies": stack_def.get("architecture", [])
        }
        
        # 2. Architecture
        architecture = form_data.get("architecture", "monolith")
        if form_data.get("async_mode"): architecture += " (Async)"
        
        # 3. Entities
        # Extracted from user input heuristically or assumed base entities
        entities = self._extract_entities(user_input)
        
        # 4. Security
        security = {
            "auth_provider": form_data.get("auth", "jwt"),
            "rules": ["Enforce CSRF", "Input Validation", "Rate Limiting"]
        }
        
        # 5. Observability
        observability = form_data.get("observability", form_data.get("analytics", "none"))
        
        # 6. Docker
        docker = {
            "enabled": form_data.get("infrastructure", "docker") in ["docker", "kubernetes"],
            "orchestration": form_data.get("infrastructure", "none")
        }
        
        # 7. Tests
        tests = {
            "unit": True,
            "integration": True,
            "coverage_required": "80%"
        }
        
        # 8. Mandatory Files
        mandatory_files = [
            "README.md",
            ".env.example",
            ".gitignore",
            "docker-compose.yml" if docker["enabled"] else None
        ]
        mandatory_files = [f for f in mandatory_files if f]

        master_payload = {
            "instruction": "You are an expert enterprise software architect. Generate the exact codebase following these strict guidelines.",
            "original_request": user_input,
            "stack": stack_info,
            "architecture": architecture,
            "entities": entities,
            "security": security,
            "observability": observability,
            "docker": docker,
            "tests": tests,
            "mandatory_files": mandatory_files,
            "stack_specific_config": form_data
        }
        
        return master_payload

    def _extract_entities(self, text: str):
        # Basic heuristic for MVP. In reality, could use an NLP model.
        words = text.lower().split()
        potential_entities = []
        if "user" in words or "usuarios" in words: potential_entities.append("User")
        if "product" in words or "produtos" in words: potential_entities.append("Product")
        if "order" in words or "pedidos" in words: potential_entities.append("Order")
        if not potential_entities:
            potential_entities = ["BaseEntity"]
        return potential_entities
