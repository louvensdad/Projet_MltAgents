from agents.stack.stack_fiscal_base import StackFiscalBase


class FastAPIAgent(StackFiscalBase):
    stack_id = "fastapi"
    required_terms = ("fastapi", "python")
    forbidden_terms = ("pom.xml", "spring boot")
