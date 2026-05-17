from typing import Any
from .exceptions import AgentValidationError

def validate_agent_input(agent_name: str, input_data: Any, expected_keys: list[str] = None):
    """Validador genérico para as entradas dos agentes."""
    if not input_data:
        raise AgentValidationError(f"[{agent_name}] Entrada vazia fornecida.")
    
    if expected_keys and isinstance(input_data, dict):
        for key in expected_keys:
            if key not in input_data:
                raise AgentValidationError(f"[{agent_name}] Chave '{key}' ausente na entrada.")
    
    return True

def validate_agent_output(agent_name: str, output_data: str):
    """Validador genérico para as saídas (geralmente strings de texto do LLM)."""
    if not output_data or not str(output_data).strip():
        raise AgentValidationError(f"[{agent_name}] Gerou uma saída vazia ou nula.")
    
    return True
