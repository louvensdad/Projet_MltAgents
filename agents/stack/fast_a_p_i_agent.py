from typing import Dict, Any
from agents.base_agent import BaseAgent
from shared.exceptions.exceptions import EnterpriseException

class FastAPIAgent(BaseAgent):
    def validate(self, context: Dict[str, Any]) -> None:
        pass

    def fiscalize(self, context: Dict[str, Any]) -> None:
        pass

    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        context["fastapiagent_executed"] = True
        return context

    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        pass
