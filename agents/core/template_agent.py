from agents.core.governance_agent_base import GovernanceAgent


class TemplateAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="TemplateAgent",
            role="Validar sementes e metadados quando a geracao vem do marketplace.",
        )
