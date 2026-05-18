from __future__ import annotations

from typing import Any, Dict, List


def _palette(project_name: str, project_type: str) -> List[str]:
    seed = (project_name + project_type).lower()
    if "ai" in seed:
        return ["#0f172a", "#1d4ed8", "#22c55e", "#67e8f9"]
    if "finance" in seed or "bank" in seed:
        return ["#020617", "#0f766e", "#38bdf8", "#e2e8f0"]
    return ["#020617", "#3b82f6", "#8b5cf6", "#22d3ee"]


def infer_design_brief(
    project_name: str,
    description: str,
    project_type: str,
    brief: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    brief = brief or {}
    return {
        "niche": project_type or "product",
        "visual_concept": brief.get("visual_style") or "premium enterprise dark UI",
        "color_palette": brief.get("color_palette") or _palette(project_name, project_type),
        "tone": brief.get("tone") or "cinematic",
        "description": description or project_name,
    }


def infer_ux_intelligence(
    project_name: str,
    description: str,
    project_type: str,
    brief: Dict[str, Any] | None = None,
    design_brief: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    brief = brief or design_brief or {}
    ux_flow = brief.get("ux_flow") or ["landing", "onboarding", "dashboard", "settings"]
    return {
        "project": project_name,
        "pattern": brief.get("ux_pattern") or "guided-premium",
        "priority": brief.get("ux_priority") or "conversion",
        "motion": brief.get("motion") or "subtle",
        "description": description or project_name,
        "project_type": project_type,
        "user_journey": brief.get("user_journey") or "discover -> configure -> generate -> download",
        "ux_rules": brief.get("ux_rules") or ["responsive", "accessible", "clear_empty_states", "safe_loading_states"],
        "ux_flow": ux_flow,
    }
