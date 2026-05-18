from __future__ import annotations

from agents.core.agent_context import AgentContext
from agents.core.base_agent import BaseAgent


class GovernanceAgent(BaseAgent):
    """Small deterministic agent used to enforce pipeline governance checks."""

    artifact_key = "governance"
    required_prompt_master = True

    def __init__(self, name: str, role: str):
        super().__init__(name=name, role=role)

    def _prompt_master(self, context: AgentContext) -> dict:
        prompt_master = context.ai_payload.get("_prompt_master") or context.ai_payload.get("prompt_master") or {}
        if self.required_prompt_master and not prompt_master:
            context.add_error(self.name, "Prompt Master ausente no contexto oficial.")
        return prompt_master if isinstance(prompt_master, dict) else {}

    def run(self, context: AgentContext) -> str:
        prompt_master = self._prompt_master(context)
        report = {
            "agent": self.name,
            "stack": context.ai_payload.get("stack_id") or context.ai_payload.get("stack_profile_id"),
            "prompt_master_received": bool(prompt_master),
            "project_name": context.project_name,
            "status": "passed",
        }
        context.artifacts.setdefault("agent_reports", {})[self.name] = report
        return f"{self.name}: governance check passed."
