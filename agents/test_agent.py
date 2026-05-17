from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class TestAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="TestAgent",
            role="Elaborar um plano de qualidade e testes para o projeto."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.backend_plan)
        
        prompt = f"""
Você é um Engenheiro de QA Sênior. Crie o plano de testes do sistema.
Requisitos: {context.requirements}

Por favor, liste:
1. Testes Unitários necessários (módulos críticos)
2. Testes de Integração (fluxos principais)
3. Testes E2E (comportamento do usuário)
4. Critérios mínimos de qualidade para aceitação
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.test_plan = response
        self.log("Plano de testes gerado com sucesso.")
        return response
