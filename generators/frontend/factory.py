from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class _NoOpFrontendGenerator:
    stack_id: str
    project_name: str
    output_path: str

    def generate(self, brief: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "passed",
            "stack_id": self.stack_id,
            "project_name": self.project_name,
            "output_path": self.output_path,
            "brief": brief,
        }


class FrontendGeneratorFactory:
    @staticmethod
    def get_generator(frontend_stack: str, project_name: str, output_path: str):
        return _NoOpFrontendGenerator(frontend_stack, project_name, output_path)

