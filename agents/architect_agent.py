from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class ArchitectAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ArchitectAgent",
            role="Desenhar a arquitetura técnica baseada nos requisitos."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.requirements)
        
        prompt = f"""
Você é um Arquiteto de Software Sênior. Com base nos requisitos fornecidos, defina a arquitetura do SaaS.
Requisitos: {context.requirements}

Por favor, gere um documento contendo:
1. Stack recomendada (com Next.js, FastAPI/NestJS, PostgreSQL)
2. Módulos do sistema (Frontend, Backend, Banco, etc.)
3. Desenho da arquitetura macro
4. Banco de dados sugerido (esquema inicial)
5. Padrões usados (ex: REST, JWT, MVC, Clean Architecture)
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.architecture = response
        self.log("Arquitetura técnica definida com sucesso.")
        return response
