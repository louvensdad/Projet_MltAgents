from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AgentContext(BaseModel):
    """Contexto compartilhado que trafega entre todos os agentes na Pipeline."""
    
    # Entradas iniciais
    project_name: str = ""
    user_idea: str = ""
    project_language: str = "Português"
    backend_stack: str = "Python + FastAPI"
    backend_language: str = "Python"
    use_ai: bool = False
    ai_generation_mode: str = "local_build_90"     # "local_build_90" | "agent_boost_100"
    allow_mock_fallback: bool = True
    max_ai_calls: int = 0
    max_tokens_budget: int = 0
    ai_calls_made: int = 0
    ai_fallback_used: bool = False
    ai_fallback_reason: str = ""
    generation_trace: dict = Field(default_factory=dict)
    ai_payload: Dict[str, Any] = Field(default_factory=dict)
    project_mode: str = "guided"         # "guided" | "advanced"
    project_brief: Dict[str, Any] = Field(default_factory=dict)
    design_brief: Dict[str, Any] = Field(default_factory=dict)
    ux_rules: List[str] = Field(default_factory=list)
    ux_flow: List[str] = Field(default_factory=list)
    advanced_architecture: Dict[str, Any] = Field(default_factory=dict)
    # Automação & Integrações
    automation_level: str = "none"        # "none" | "basic" | "advanced"
    automation_types: List[str] = Field(default_factory=list)
    selected_agents: List[str] = Field(default_factory=list)
    integrations_required: List[str] = Field(default_factory=list)
    env_variables: List[str] = Field(default_factory=list)
    requires_env_setup: bool = False
    demo_mode: bool = True               # True = sem credenciais reais
    
    # Saídas de cada agente
    requirements: Optional[str] = None
    architecture: Optional[str] = None
    backend_plan: Optional[str] = None
    frontend_plan: Optional[str] = None
    security_report: Optional[str] = None
    test_plan: Optional[str] = None
    devops_plan: Optional[str] = None
    final_review: Optional[str] = None
    
    # Blueprints
    blueprint: Optional[Dict[str, Any]] = None
    blueprint_path_json: Optional[str] = None
    blueprint_path_md: Optional[str] = None
    
    # Armazenamento auxiliar
    artifacts: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
    
    def add_error(self, step: str, error_msg: str):
        self.errors.append(f"[{step}] {error_msg}")
