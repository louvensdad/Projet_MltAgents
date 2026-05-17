from typing import Dict, Any
from agents.base_agent import BaseAgent
from shared.exceptions.exceptions import EnterpriseException
import re

class AntiPatternAgent(BaseAgent):
    """
    Scans the context (and eventually the generated code) for known bad practices.
    Blocks the generation if severe anti-patterns are detected.
    """
    def validate(self, context: Dict[str, Any]) -> None:
        pass

    def fiscalize(self, context: Dict[str, Any]) -> None:
        pass

    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        context["antipatternagent_executed"] = True
        
        # Inject strict instructions into the context so the Generation Engine knows what to avoid
        if "forbidden_patterns" not in context:
            context["forbidden_patterns"] = []
            
        context["forbidden_patterns"].extend([
            "Fat Controllers: Route handlers must delegate business logic to Services.",
            "No DTO: Input/Output must be mapped via DTOs or Pydantic schemas, never raw ORM models.",
            "No Validation: All input DTOs must have strict type and length validation.",
            "No Logging: Avoid basic print(). Use the structured logger provided in the context.",
            "Hardcoded Secrets: Never hardcode credentials. Use os.getenv() or ConfigService."
        ])
        
        return context

    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        # Currently we validate the context. If we had the raw code here, we would regex it.
        # For now, let's assume we can scan any provided 'custom_code_snippets' or prompt directives
        prompt = str(context.get("original_request", "")).lower()
        
        if "print(" in prompt or "console.log" in prompt:
            raise EnterpriseException(
                "Anti-Pattern Detected: Do not use raw print/console statements. Use a structured logger.",
                code="ANTI_PATTERN_LOGGING"
            )
            
        if "password=" in prompt or "secret=" in prompt:
            raise EnterpriseException(
                "Anti-Pattern Detected: Hardcoded secrets found in the request. Use environment variables.",
                code="ANTI_PATTERN_SECRETS"
            )
            
    def scan_generated_code(self, code_payload: str):
        """
        To be called post-generation to reject bad AI outputs.
        """
        if re.search(r'(password|secret)\s*=\s*[\'"][^\'"]+[\'"]', code_payload, re.IGNORECASE):
            raise EnterpriseException("Generated code contains hardcoded secrets.", code="ANTI_PATTERN_SECRETS")
            
        if "print(" in code_payload or "console.log(" in code_payload:
            # Maybe just a warning, but user wants strict block
            raise EnterpriseException("Generated code uses generic printing instead of structured logging.", code="ANTI_PATTERN_LOGGING")
