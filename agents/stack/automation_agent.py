from agents.stack.stack_fiscal_base import StackFiscalBase


class AutomationAgent(StackFiscalBase):
    stack_id = "automation"
    required_terms = ("workflow", "retries")
    forbidden_terms = ("hardcoded_secret",)
