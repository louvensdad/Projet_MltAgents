from agents.stack.stack_fiscal_base import StackFiscalBase


class VueAgent(StackFiscalBase):
    stack_id = "vue"
    required_terms = ("vue", "components")
    forbidden_terms = ("pom.xml", "spring boot")
