from agents.core.governance_agent_base import GovernanceAgent


class DownloadAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="DownloadAgent",
            role="Validar que o projeto segue o fluxo oficial de registro e download.",
        )
