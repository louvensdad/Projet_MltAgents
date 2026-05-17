from __future__ import annotations

from typing import Any, Dict


def apply_config_to_project(project_path: str, project_name: str, integrations: Dict[str, Any], auto: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "status": "passed",
        "project_path": project_path,
        "project_name": project_name,
        "integrations": integrations,
        "automation": auto,
    }

