from __future__ import annotations

from typing import Any


class TemplateQualityGate:
    def evaluate(self, template: dict[str, Any]) -> dict[str, Any]:
        checks = {
            "blueprint": bool(template.get("blueprint")),
            "stack": bool(template.get("stack")),
            "modules": bool(template.get("modules")),
            "prompt_master_seed": bool(template.get("prompt_master_seed")),
            "preview": bool(template.get("preview_type")) and bool(template.get("demo_data")),
            "gatekeeper": bool(template.get("gatekeeper")),
            "required_files": bool(template.get("required_files")),
            "generation_supported": template.get("generation_supported") is True,
        }

        score = 100
        penalties = {
            "blueprint": 20,
            "stack": 15,
            "modules": 10,
            "prompt_master_seed": 15,
            "preview": 10,
            "gatekeeper": 10,
            "required_files": 10,
            "generation_supported": 10,
        }

        issues: list[str] = []
        for key, ok in checks.items():
            if not ok:
                score -= penalties[key]
                issues.append(f"Missing {key.replace('_', ' ')}")

        if not checks["generation_supported"]:
            status = "planned"
        elif score >= 85:
            status = "ready"
        elif score >= 60:
            status = "partial"
        else:
            status = "planned"

        return {
            "ready": status == "ready",
            "status": status,
            "score": max(0, min(100, score)),
            "checks": checks,
            "issues": issues,
        }

