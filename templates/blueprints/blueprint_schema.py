from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

class EntityField(BaseModel):
    name: str
    type: str

class Entity(BaseModel):
    name: str
    fields: List[EntityField]
    original_name: Optional[str] = None  # Original user-facing name (e.g., "Usuário" for internal "User")

class Endpoint(BaseModel):
    method: str
    path: str
    description: str
    auth_required: bool
    roles_allowed: List[str]
    request_body: Optional[Dict[str, Any]]
    response_body: Optional[Dict[str, Any]]
    related_entity: Optional[str] = None  # Entity this endpoint relates to

class BlueprintData(BaseModel):
    project_name: str
    project_language: str = "Portuguese"  # Language for docs/UI/messages
    backend_stack: str
    backend_language: str
    description: str
    target_audience: str
    core_features: List[str]
    entities: List[Entity]
    relationships: List[str]
    backend_modules: List[str]
    api_endpoints: List[Endpoint]
    frontend_pages: List[str]
    frontend_components: List[str]
    auth_strategy: str
    security_rules: List[str]
    validation_rules: List[str]
    test_strategy: str
    devops_plan: str
    design_brief: Dict[str, Any] = Field(default_factory=dict)
    ux_rules: List[str] = Field(default_factory=list)
    ux_flow: List[str] = Field(default_factory=list)
    advanced_architecture: Dict[str, Any] = Field(default_factory=dict)
    automation_level: str = "none"
    selected_agents: List[str] = Field(default_factory=list)
    integrations_required: List[str] = Field(default_factory=list)
    env_variables: List[str]
    deployment_plan: str
    risks: List[str]
    next_steps: List[str]
    # ── STRICT BRIEFING FIDELITY FIELDS ──
    confirmed_entities: List[str] = Field(default_factory=list)  # User-confirmed entity names only
    confirmed_features: List[str] = Field(default_factory=list)   # User-confirmed features
    confirmed_business_rules: List[str] = Field(default_factory=list)  # User-confirmed business rules
    language: str = "Portuguese"  # Selected language for documentation/UI
    stack: str = ""  # Selected tech stack
    architecture: str = ""  # Selected architecture type
    strict_briefing: bool = True  # Enforce strict briefing fidelity
    # Step 9 persisted intelligence
    ux_ai_preferences: List[str] = Field(default_factory=list)
    selected_presets: List[str] = Field(default_factory=list)
    smart_recommendations: List[str] = Field(default_factory=list)
    architecture_scores: Dict[str, Any] = Field(default_factory=dict)
    generated_architecture_summary: str = ""
    step9_answers: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('project_name', 'description', 'target_audience', 'auth_strategy', 'test_strategy', 'devops_plan', 'deployment_plan')
    def not_empty_str(cls, v):
        if not v or not v.strip():
            raise ValueError('O campo de string obrigatorio não pode estar vazio.')
        return v

    @field_validator('core_features', 'entities', 'api_endpoints', 'security_rules')
    def not_empty_list(cls, v):
        if not v or len(v) == 0:
            raise ValueError('O campo de lista obrigatório não pode estar vazio.')
        return v

    @field_validator('entities')
    def entities_must_match_confirmed(cls, v, info):
        """Validate that generated entities match confirmed entities when strict_briefing is on."""
        confirmed = info.data.get('confirmed_entities', [])
        if confirmed and len(confirmed) > 0:
            entity_names = {e.name for e in v}
            for c in confirmed:
                if c not in entity_names:
                    raise ValueError(f'Entidade confirmada "{c}" não encontrada na lista de entidades geradas.')
        return v
