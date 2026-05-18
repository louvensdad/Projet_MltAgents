from agents.stack.stack_fiscal_base import StackFiscalBase


class LaravelAgent(StackFiscalBase):
    stack_id = "laravel"
    required_terms = ("php", "laravel")
    forbidden_terms = ("pom.xml", "fastapi")
