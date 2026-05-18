from agents.stack.stack_fiscal_base import StackFiscalBase


class BlazorAgent(StackFiscalBase):
    stack_id = "blazor"
    required_terms = ("blazor", "components")
    forbidden_terms = ("requirements.txt", "fastapi")
