from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class BackendAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="BackendAgent",
            role="Desenvolver especificações e lógica de APIs backend."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.architecture)
        
        prompt = f"""
Você é um Desenvolvedor Backend Sênior. Baseado na arquitetura, crie a especificação do backend.
Arquitetura: {context.architecture}

Por favor, defina:
1. Estrutura de módulos backend
2. Endpoints REST (rotas, métodos, parâmetros)
3. Entidades/Modelos de banco de dados
4. Regras de validação
5. Permissões de usuários
6. Serviços necessários
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.backend_plan = response
        self.log("Plano de backend gerado com sucesso.")
        return response
