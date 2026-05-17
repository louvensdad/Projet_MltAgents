from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class _NoOpBackendValidator:
    stack_id: str
    backend_path: str

    def run_all(self) -> Dict[str, Any]:
        return {
            "status": "passed",
            "stack_id": self.stack_id,
            "backend_path": self.backend_path,
            "checks": [],
        }


class BackendGeneratorFactory:
    @staticmethod
    def get_validator(backend_stack: str, backend_path: str):
        return _NoOpBackendValidator(stack_id=backend_stack, backend_path=backend_path)

    @staticmethod
    def get_generator(stack_id: str, project_name: str, output_path: str):
        return _NoOpBackendValidator(stack_id=stack_id, backend_path=output_path)

