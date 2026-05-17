from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class FrontendAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="FrontendAgent",
            role="Planejar a interface de usuário baseada na arquitetura e requisitos."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.backend_plan)
        
        prompt = f"""
Você é um Desenvolvedor Frontend Sênior. Baseado nos planos anteriores, defina a UI do SaaS.
Arquitetura: {context.architecture}
Backend: {context.backend_plan}
Design Brief: {context.design_brief}
UX Rules: {context.ux_rules}
UX Flow: {context.ux_flow}

Por favor, especifique:
1. Páginas do sistema
2. Componentes reaproveitáveis
3. Fluxos de tela (ex: login -> dashboard)
4. Estado global necessário
5. Estratégia de layout responsivo (TailwindCSS)
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.frontend_plan = response
        self.log("Plano de frontend gerado com sucesso.")
        return response
