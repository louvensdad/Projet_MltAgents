from agents.core.governance_agent_base import GovernanceAgent


class PromptMasterAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="PromptMasterAgent",
            role="Validar que a geracao recebeu um Prompt Master rastreavel.",
        )
