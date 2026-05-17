from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from .core.gemini_client import GeminiClient

class ReviewerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ReviewerAgent",
            role="Validar tudo que foi gerado e emitir o veredito final."
        )
        self.client = GeminiClient()

    def run(self, context: AgentContext) -> str:
        # Revisor olha para tudo. Vamos garantir que a pipeline passou nos principais.
        self.validate_input(context.devops_plan)
        
        prompt = f"""
Você é o CTO Revisor. Analise todos os planos gerados na pipeline para a Fase de Especificação.
Projeto: {context.project_name}

Por favor, gere:
1. Resumo final do que foi decidido
2. Pontos fortes do planejamento
3. Problemas ou riscos não mitigados encontrados nos planos
4. Próximos passos práticos para os desenvolvedores
"""
        response = self.ai_generate(context, prompt, system_instruction=self.role)
        context.final_review = response
        self.log("Revisão final completada com sucesso.")
        return response
