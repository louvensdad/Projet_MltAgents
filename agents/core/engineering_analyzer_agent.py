from agents.core.agent_context import AgentContext
from agents.core.governance_agent_base import GovernanceAgent
from orchestrator.engineering_analyzer import EngineeringAnalyzer


class EngineeringAnalyzerAgent(GovernanceAgent):
    def __init__(self):
        super().__init__(
            name="EngineeringAnalyzerAgent",
            role="Executar analise tecnica deterministica sobre o briefing oficial.",
        )

    def run(self, context: AgentContext) -> str:
        prompt_master = self._prompt_master(context)
        analyzer = EngineeringAnalyzer()
        analysis = analyzer.analyze_and_inject(dict(context.ai_payload or {}))
        context.artifacts.setdefault("agent_reports", {})[self.name] = {
            "agent": self.name,
            "prompt_master_received": bool(prompt_master),
            "status": "passed",
            "analysis": analysis,
        }
        return f"{self.name}: engineering analysis completed."
