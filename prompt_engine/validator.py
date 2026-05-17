from shared.exceptions.exceptions import EnterpriseException

class PromptValidationException(EnterpriseException):
    def __init__(self, message: str):
        super().__init__(message, code="INVALID_PROMPT", status_code=400)

class PromptValidator:
    """
    Interceptor that blocks invalid prompts before they reach the Prompt Master.
    """
    def __init__(self, stack_registry):
        self.stack_registry = stack_registry

    def validate(self, user_input: str, stack_id: str, form_data: dict):
        normalized_stack_id = self.stack_registry.normalize_stack_id(stack_id)
        self._check_stack_exists(normalized_stack_id)
        self._check_generic_prompt(user_input)
        self._check_required_fields(normalized_stack_id, form_data)
        self._check_incompatible_architecture(normalized_stack_id, form_data)

    def _check_stack_exists(self, stack_id: str):
        try:
            self.stack_registry.get_stack(stack_id)
        except ValueError:
            raise PromptValidationException(f"Invalid Stack: '{stack_id}' does not exist in the registry.")

    def _check_generic_prompt(self, user_input: str):
        if not user_input or len(user_input.strip()) < 15:
            raise PromptValidationException("Prompt is too generic or short. Please describe the business logic in more detail.")
        
        words = user_input.split()
        if len(words) < 4:
            raise PromptValidationException("Prompt is too generic. Must contain at least 4 words describing the app.")

    def _check_required_fields(self, stack_id: str, form_data: dict):
        try:
            stack = self.stack_registry.get_stack(stack_id)
        except ValueError:
            return

        required_fields = stack.get("required_fields", []) or []
        missing = []
        for field in required_fields:
            value = form_data.get(field)
            if isinstance(value, bool):
                continue
            if isinstance(value, list):
                if not value:
                    missing.append(field)
                continue
            if value is None or not str(value).strip():
                missing.append(field)

        if missing:
            raise PromptValidationException(f"Missing required fields: {', '.join(missing)}")

    def _check_incompatible_architecture(self, stack_id: str, form_data: dict):
        # E.g., static-site shouldn't have microservices
        if stack_id == "static_site" and form_data.get("architecture") == "microservices":
            raise PromptValidationException("Incompatible Architecture: Static Sites cannot be microservices.")
        
        # E.g., Spring Boot microservices requires API Gateway
        if stack_id == "springboot" and form_data.get("architecture") == "microservices":
            if not form_data.get("api_gateway", False):
                raise PromptValidationException("Incompatible Architecture: Spring Boot microservices must have an API Gateway enabled.")
