from typing import Dict, Any
from agents.base_agent import BaseAgent
from shared.exceptions.exceptions import EnterpriseException

class EngineeringGatekeeperAgent(BaseAgent):
    """
    The ultimate barrier for Backend Engineering rules.
    If a generated context fails these rules, the pipeline aborts.
    """
    def validate(self, context: Dict[str, Any]) -> None:
        pass

    def fiscalize(self, context: Dict[str, Any]) -> None:
        pass

    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        context["engineering_gatekeeper_executed"] = True
        return context

    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        engineering = context.get("engineering_patterns", {})
        architecture = context.get("architecture", "").lower()
        security = context.get("security", {})
        observability = context.get("observability", "none")
        
        # Rule 1: Microservices without messaging
        if "microservices" in architecture and engineering.get("queue") == "none":
            raise EnterpriseException(
                message="Engineering Rule Violation: Microservices without a Messaging layer (Kafka/RabbitMQ) is an anti-pattern. Decoupling is mandatory.",
                code="ENG_NO_MESSAGING"
            )
            
        # Rule 2: Public APIs without Rate Limit
        if not engineering.get("rate_limit"):
            raise EnterpriseException(
                message="Engineering Rule Violation: Public API requires Rate Limiting. Do not expose unprotected endpoints.",
                code="ENG_NO_RATE_LIMIT"
            )

        # Rule 3: Enterprise system without logs
        if observability == "none" and "monolith" not in architecture: # Assuming monoliths might have basic stdout, but distributed systems need APM
            raise EnterpriseException(
                message="Engineering Rule Violation: Distributed enterprise systems must enforce structured logging and tracing (Datadog/Zipkin/Prometheus).",
                code="ENG_NO_OBSERVABILITY"
            )

        # Rule 4: Auth without proper hashing (Usually validated in security context, but enforced here as a hard rule)
        # We ensure auth provider is modern.
        if security.get("auth_provider") == "none":
            raise EnterpriseException(
                message="Engineering Rule Violation: Authentication is mandatory for backend generation.",
                code="ENG_NO_AUTH"
            )
