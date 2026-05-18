from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from shared.exceptions.exceptions import EnterpriseException
from stack_registry.registry import StackRegistry


class StackFiscalBase(BaseAgent):
    stack_id = ""
    required_terms: tuple[str, ...] = ()
    forbidden_terms: tuple[str, ...] = ()

    def validate(self, context: Dict[str, Any]) -> None:
        registry = StackRegistry()
        registry.get_stack(self.stack_id)
        prompt_master = context.get("prompt_master") or context.get("_prompt_master")
        if not prompt_master:
            raise EnterpriseException(
                f"{self.__class__.__name__}: Prompt Master ausente para a stack {self.stack_id}.",
                code="STACK_AGENT_PROMPT_MASTER_MISSING",
            )

    def fiscalize(self, context: Dict[str, Any]) -> None:
        text = str(context).lower()
        for term in self.required_terms:
            if term.lower() not in text:
                context.setdefault("stack_agent_warnings", []).append(
                    f"{self.stack_id}: termo recomendado ausente no briefing: {term}"
                )

    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        context.setdefault("stack_agent_reports", {})[self.__class__.__name__] = {
            "stack_id": self.stack_id,
            "prompt_master_received": bool(context.get("prompt_master") or context.get("_prompt_master")),
            "status": "passed",
        }
        context[f"{self.stack_id}_agent_executed"] = True
        return context

    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        text = str(context).lower()
        for term in self.forbidden_terms:
            if term.lower() in text:
                raise EnterpriseException(
                    f"{self.__class__.__name__}: termo proibido para {self.stack_id}: {term}",
                    code="STACK_AGENT_FORBIDDEN_TERM",
                )
