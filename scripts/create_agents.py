import os

root_dir = r"c:\Users\louvens\OneDrive\Projet_MltAgents"
core_dir = os.path.join(root_dir, "agents", "core")
stack_dir = os.path.join(root_dir, "agents", "stack")

os.makedirs(core_dir, exist_ok=True)
os.makedirs(stack_dir, exist_ok=True)

core_agents = [
    "ArchitectureAgent", "SecurityAgent", "DevOpsAgent", "PerformanceAgent", 
    "BackendAgent", "FrontendAgent", "DatabaseAgent", "DocumentationAgent", 
    "ObservabilityAgent", "AntiPatternAgent", "RefactorAgent"
]

stack_agents = [
    "SpringBootAgent", "FastAPIAgent", "NestJSAgent", "NextJSAgent", 
    "DockerAgent", "KubernetesAgent"
]

template = """from typing import Dict, Any
from agents.base_agent import BaseAgent
from shared.exceptions.exceptions import EnterpriseException

class {name}(BaseAgent):
    def validate(self, context: Dict[str, Any]) -> None:
        pass

    def fiscalize(self, context: Dict[str, Any]) -> None:
        pass

    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        context["{lower_name}_executed"] = True
        return context

    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        pass
"""

refactor_template = """from typing import Dict, Any
from agents.base_agent import BaseAgent
from shared.exceptions.exceptions import EnterpriseException

class RefactorAgent(BaseAgent):
    def validate(self, context: Dict[str, Any]) -> None:
        pass

    def fiscalize(self, context: Dict[str, Any]) -> None:
        pass

    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._validate_impact(context)
        self._validate_imports(context)
        self._validate_routes(context)
        self._validate_dependencies(context)
        context["refactor_agent_executed"] = True
        return context

    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        pass

    def _validate_impact(self, context: Dict[str, Any]):
        pass

    def _validate_imports(self, context: Dict[str, Any]):
        pass

    def _validate_routes(self, context: Dict[str, Any]):
        pass

    def _validate_dependencies(self, context: Dict[str, Any]):
        pass
"""

for agent in core_agents:
    filename = "".join(['_'+c.lower() if c.isupper() else c for c in agent]).lstrip('_') + ".py"
    path = os.path.join(core_dir, filename)
    with open(path, "w") as f:
        if agent == "RefactorAgent":
            f.write(refactor_template)
        else:
            f.write(template.format(name=agent, lower_name=agent.lower()))

for agent in stack_agents:
    filename = "".join(['_'+c.lower() if c.isupper() else c for c in agent]).lstrip('_') + ".py"
    path = os.path.join(stack_dir, filename)
    with open(path, "w") as f:
        f.write(template.format(name=agent, lower_name=agent.lower()))

print("Agents generated successfully.")
