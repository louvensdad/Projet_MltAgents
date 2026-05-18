from agents.stack.stack_fiscal_base import StackFiscalBase


class DockerAgent(StackFiscalBase):
    stack_id = "automation"
    required_terms = ("docker",)
    forbidden_terms = ("docker password",)
