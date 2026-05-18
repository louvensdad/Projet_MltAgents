from agents.stack.stack_fiscal_base import StackFiscalBase


class DotnetAgent(StackFiscalBase):
    stack_id = "dotnet"
    required_terms = ("dotnet", "api")
    forbidden_terms = ("requirements.txt", "spring boot")
