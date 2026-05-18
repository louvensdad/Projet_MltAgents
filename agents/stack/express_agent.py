from agents.stack.stack_fiscal_base import StackFiscalBase


class ExpressAgent(StackFiscalBase):
    stack_id = "express"
    required_terms = ("node", "api")
    forbidden_terms = ("pom.xml", "spring boot")
