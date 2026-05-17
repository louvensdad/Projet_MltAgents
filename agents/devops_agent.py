from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class DevOpsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="DevOpsAgent",
            role="Definir estratégia de infraestrutura e deployment."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.architecture)
        
        prompt = f"""
Você é um Engenheiro DevOps Sênior. Defina o plano de infraestrutura para este SaaS.
Arquitetura: {context.architecture}

Por favor, crie as diretrizes para:
1. Containers Docker (Frontend e Backend)
2. Variáveis de ambiente principais
3. Pipeline CI/CD futura (passos necessários)
4. Estratégia de deploy
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.devops_plan = response
        self.log("Plano de DevOps gerado com sucesso.")
        return response
