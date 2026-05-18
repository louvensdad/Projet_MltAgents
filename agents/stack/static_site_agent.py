from agents.stack.stack_fiscal_base import StackFiscalBase


class StaticSiteAgent(StackFiscalBase):
    stack_id = "static_site"
    required_terms = ("seo", "responsive")
    forbidden_terms = ("database password", "spring security")
