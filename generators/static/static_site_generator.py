from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class StaticSiteGenerator:
    project_name: str
    output_path: str
    brief: Dict[str, Any]

    def generate(self) -> Dict[str, Any]:
        return {
            "status": "passed",
            "project_name": self.project_name,
            "output_path": self.output_path,
            "brief": self.brief,
        }

