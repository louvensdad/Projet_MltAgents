from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class ProductAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ProductAgent",
            role="Transformar a ideia bruta em requisitos de negócio."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.user_idea)
        
        prompt = f"""
Você é um Product Manager Sênior. Sua tarefa é transformar a ideia de um SaaS em um documento de requisitos.
Ideia do usuário: {context.user_idea}
Nome do Projeto: {context.project_name}

Por favor, defina claramente:
1. Objetivo do SaaS
2. Público-alvo
3. Funcionalidades principais (MVP)
4. Entidades principais do negócio
5. Regras de negócio essenciais
6. Riscos iniciais
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.requirements = response
        self.log("Requisitos de negócio gerados com sucesso.")
        return response
