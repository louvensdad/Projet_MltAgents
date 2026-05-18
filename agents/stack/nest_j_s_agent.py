from agents.stack.stack_fiscal_base import StackFiscalBase


class NestJSAgent(StackFiscalBase):
    stack_id = "nestjs"
    required_terms = ("nestjs", "node")
    forbidden_terms = ("pom.xml", "spring boot")
