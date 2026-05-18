from agents.core.agent_context import AgentContext
from agents.core.governance_agent_base import GovernanceAgent
from stack_registry.registry import StackRegistry


class StackRegistryAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="StackRegistryAgent",
            role="Validar que a stack esta registrada e normalizada.",
        )

    def run(self, context: AgentContext) -> str:
        prompt_master = self._prompt_master(context)
        registry = StackRegistry()
        stack_id = context.ai_payload.get("stack_id") or context.ai_payload.get("stack_profile_id") or context.backend_stack
        try:
            stack = registry.get_stack(str(stack_id))
            status = "passed"
        except ValueError as exc:
            stack = {}
            status = "failed"
            context.add_error(self.name, str(exc))
        context.artifacts.setdefault("agent_reports", {})[self.name] = {
            "agent": self.name,
            "stack": stack.get("id", stack_id),
            "prompt_master_received": bool(prompt_master),
            "registered": bool(stack),
            "status": status,
        }
        return f"{self.name}: stack registry check {status}."
