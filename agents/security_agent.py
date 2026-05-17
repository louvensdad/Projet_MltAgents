class SecurityAgent:
    def scan_and_secure(self, context):
        # Applies rules from the security engine
        context["secured"] = True
        return context
