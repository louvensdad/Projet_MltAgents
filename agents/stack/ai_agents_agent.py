from agents.stack.stack_fiscal_base import StackFiscalBase


class AIAgentsAgent(StackFiscalBase):
    stack_id = "ai_agents"
    required_terms = ("agents", "guardrails")
    forbidden_terms = ("hardcoded_api_key",)
