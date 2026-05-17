from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    """
    Enterprise Base Agent Protocol.
    All specialized agents must implement this strict lifecycle.
    """
    
    @abstractmethod
    def validate(self, context: Dict[str, Any]) -> None:
        """Inspects the context for domain-specific validity."""
        pass

    @abstractmethod
    def fiscalize(self, context: Dict[str, Any]) -> None:
        """Analyzes specific metrics or limits to ensure enterprise compliance."""
        pass

    @abstractmethod
    def improve(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Suggests or injects architectural improvements into the context."""
        pass

    @abstractmethod
    def block_bad_practices(self, context: Dict[str, Any]) -> None:
        """Raises an EnterpriseException if an anti-pattern or bad practice is detected."""
        pass

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        The standard lifecycle execution for all agents.
        """
        self.block_bad_practices(context)
        self.validate(context)
        self.fiscalize(context)
        return self.improve(context)
