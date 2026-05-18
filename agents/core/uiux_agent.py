from agents.core.governance_agent_base import GovernanceAgent


class UIUXAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="UIUXAgent",
            role="Fiscalizar requisitos de experiencia, responsividade e estados de UI.",
        )
