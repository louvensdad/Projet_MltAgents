from agents.stack.stack_fiscal_base import StackFiscalBase


class ReactAgent(StackFiscalBase):
    stack_id = "react"
    required_terms = ("react", "components")
    forbidden_terms = ("pom.xml", "spring boot")
