from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from prompt_engine.master_builder import PromptMaster
from prompt_engine.validator import PromptValidator, PromptValidationException
from stack_registry.registry import StackRegistry


@dataclass
class PromptMasterContract:
    stack_id: str
    answers: dict[str, Any]
    prompt_text: str
    status: str = "validated"

    def model_dump(self) -> dict[str, Any]:
        return {
            "stack_id": self.stack_id,
            "answers": self.answers,
            "prompt_text": self.prompt_text,
            "status": self.status,
        }


class PromptGeneratorEngine:
    def __init__(self, stack_id: str):
        self.stack_id = stack_id
        self.stack_registry = StackRegistry()
        self.prompt_validator = PromptValidator(self.stack_registry)
        self.prompt_master_builder = PromptMaster(self.stack_registry)
        self.answers: dict[str, Any] = {}
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self._validated = False

    @classmethod
    def list_stacks(cls) -> list[dict[str, Any]]:
        return StackRegistry().list_stacks()

    def answer_bulk(self, answers: dict[str, Any]) -> None:
        self.answers.update(answers or {})

    def validate(self) -> bool:
        self.errors = []
        self.warnings = []
        try:
            user_input = str(self.answers.get("project_description") or self.answers.get("project_name") or "").strip()
            self.prompt_validator.validate(user_input, self.stack_id, self.answers)
            self._validated = True
            return True
        except PromptValidationException as exc:
            self.errors.append(str(exc))
            self._validated = False
            return False
        except Exception as exc:
            self.errors.append(str(exc))
            self._validated = False
            return False

    def finalize(self) -> PromptMasterContract:
        if not self._validated and not self.validate():
            raise ValueError("Prompt validation failed")

        user_input = str(self.answers.get("project_description") or self.answers.get("project_name") or "")
        prompt_data = self.prompt_master_builder.build_master_prompt(user_input, self.stack_id, self.answers)
        prompt_text = "\n".join(
            [
                f"STACK={self.stack_id}",
                f"PROJECT={self.answers.get('project_name', 'project')}",
                f"ARCHITECTURE={prompt_data.get('architecture', 'monolith')}",
                f"ENTITIES={', '.join(prompt_data.get('entities', []))}",
                f"MANDATORY_FILES={', '.join(prompt_data.get('mandatory_files', []))}",
            ]
        )
        return PromptMasterContract(
            stack_id=self.stack_id,
            answers=dict(self.answers),
            prompt_text=prompt_text,
        )

    def missing_required(self) -> list[str]:
        required = ["project_name", "project_description"]
        return [field for field in required if not str(self.answers.get(field, "")).strip()]


PromptGenerator = PromptGeneratorEngine
