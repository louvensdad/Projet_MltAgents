from abc import ABC, abstractmethod
from typing import Any
from .agent_context import AgentContext
from .validators import validate_agent_input, validate_agent_output
from .gemini_client import GeminiClient

class BaseAgent(ABC):
    """Classe base abstrata para todos os agentes."""
    
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.input_schema = "str"
        self.output_schema = "str"
        self._gemini_client: GeminiClient | None = None

    @abstractmethod
    def run(self, context: AgentContext) -> str:
        """Executa a lógica principal do agente e retorna a saída (string)."""
        pass

    def validate_input(self, input_data: Any) -> bool:
        """Valida se a entrada é válida para o agente processar."""
        return validate_agent_input(self.name, input_data)

    def validate_output(self, output_data: str) -> bool:
        """Valida se a saída gerada atende aos critérios do sistema."""
        return validate_agent_output(self.name, output_data)

    def log(self, message: str):
        print(f"[{self.name}] {message}")

    def should_use_ai(self, context: AgentContext) -> bool:
        from agents.core.ai_router import should_use_gemini
        return should_use_gemini(context.ai_generation_mode, self.name, context.ai_payload)

    def ai_generate(self, context: AgentContext, prompt: str, system_instruction: str | None = None) -> str:
        if not self.should_use_ai(context):
            self.log(f"[MOCK] Modo {context.ai_generation_mode} — gerando localmente")
            return f"[MOCK-{context.ai_generation_mode}] Resposta local para: {self.name}"

        if self._gemini_client is None:
            self._gemini_client = GeminiClient(
                generation_mode=context.ai_generation_mode,
                payload=context.ai_payload,
            )

        try:
            result = self._gemini_client.generate(prompt, system_instruction)
            context.ai_calls_made += 1
            return result
        except Exception as e:
            if context.allow_mock_fallback:
                context.ai_fallback_used = True
                context.ai_fallback_reason = str(e)
                self.log(f"[FALLBACK] Gemini falhou: {e}. Usando fallback local.")
                return f"[MOCK-FALLBACK] Resposta local para: {self.name}"
            raise
