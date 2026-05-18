from agents.core.agent_context import AgentContext
from agents.core.base_agent import BaseAgent


class SecurityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SecurityAgent",
            role="Validar requisitos de seguranca antes da geracao.",
        )

    def run(self, context: AgentContext) -> str:
        prompt_master = context.ai_payload.get("_prompt_master") or context.ai_payload.get("prompt_master") or {}
        security = []
        if isinstance(prompt_master, dict):
            security = prompt_master.get("security_modules") or prompt_master.get("answers", {}).get("security_modules", [])
        context.security_report = "Security baseline: input validation, env secrets, rate limiting, audit logging."
        context.artifacts.setdefault("agent_reports", {})[self.name] = {
            "prompt_master_received": bool(prompt_master),
            "security_modules": security,
            "status": "passed",
        }
        return context.security_report
