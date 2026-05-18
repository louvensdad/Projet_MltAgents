from agents.stack.stack_fiscal_base import StackFiscalBase


class AngularAgent(StackFiscalBase):
    stack_id = "angular"
    required_terms = ("angular", "components")
    forbidden_terms = ("pom.xml", "fastapi")
