from agents.core.governance_agent_base import GovernanceAgent


class QualityAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="QualityAgent",
            role="Garantir que a geracao declara artefatos de qualidade, README, docs e testes.",
        )
