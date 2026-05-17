class EnterpriseException(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.message = message

class GatekeeperException(EnterpriseException):
    def __init__(self, message: str):
        super().__init__(message, code="GATEKEEPER_REJECTED", status_code=403)

class StackValidationException(EnterpriseException):
    def __init__(self, message: str):
        super().__init__(message, code="INVALID_STACK", status_code=400)
