from agents.stack.stack_fiscal_base import StackFiscalBase


class NextJSAgent(StackFiscalBase):
    stack_id = "nextjs"
    required_terms = ("next", "react")
    forbidden_terms = ("pom.xml", "spring boot")
