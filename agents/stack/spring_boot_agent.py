from agents.stack.stack_fiscal_base import StackFiscalBase


class SpringBootAgent(StackFiscalBase):
    stack_id = "spring_boot"
    required_terms = ("spring", "java")
    forbidden_terms = ("fastapi", "requirements.txt")
