class AgentExecutionError(Exception):
    """Exception raised for errors in the agent execution process."""
    pass

class GeminiAPIError(Exception):
    """Exception raised for errors during Gemini API calls."""
    pass

class AgentValidationError(Exception):
    """Exception raised when an agent input or output fails validation."""
    pass
