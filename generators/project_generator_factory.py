from __future__ import annotations

from typing import Any, Dict

from stack_registry.registry import StackRegistry


class ProjectGeneratorFactory:
    @staticmethod
    def validate_payload(stack_id: str, stack_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        registry = StackRegistry()
        normalized = registry.normalize_stack_id(stack_id)
        errors: list[str] = []
        warnings: list[str] = []
        recommendations: list[str] = []

        try:
            stack = registry.get_stack(normalized)
        except ValueError:
            return {
                "valid": False,
                "errors": [f"Stack '{stack_id}' not found in registry."],
                "warnings": [],
                "recommendations": [],
            }

        for field in stack.get("required_fields", []):
            value = payload.get(field)
            if isinstance(value, list) and not value:
                errors.append(f"Missing required field: {field}")
            elif value is None or (isinstance(value, str) and not value.strip()):
                errors.append(f"Missing required field: {field}")

        for forbidden in stack.get("forbidden", []):
            if forbidden.lower() in str(payload).lower():
                warnings.append(f"Forbidden term present in payload: {forbidden}")

        if not payload.get("project_name"):
            errors.append("project_name is required")

        return {
            "valid": not errors,
            "errors": errors,
            "warnings": warnings,
            "recommendations": recommendations,
            "stack_id": normalized,
            "stack_name": stack.get("display_name", stack_name),
        }

    @staticmethod
    def generate(stack_id: str, stack_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        registry = StackRegistry()
        normalized = registry.normalize_stack_id(stack_id)
        try:
            stack = registry.get_stack(normalized)
        except ValueError as exc:
            return {"status": "error", "message": str(exc), "stack_id": normalized, "stack_name": stack_name}

        return {
            "status": "success",
            "message": f"Generation routed for {stack.get('display_name', stack_name)}",
            "stack_id": normalized,
            "stack_name": stack.get("display_name", stack_name),
            "generator": stack.get("generator"),
            "gatekeeper": stack.get("gatekeeper"),
            "payload": payload,
        }

