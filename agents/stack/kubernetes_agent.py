from agents.stack.stack_fiscal_base import StackFiscalBase


class KubernetesAgent(StackFiscalBase):
    stack_id = "automation"
    required_terms = ("kubernetes",)
    forbidden_terms = ("cluster_admin_token",)
