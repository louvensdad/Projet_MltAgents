class Gatekeeper:
    def verify(self, context):
        # Final sanity checks before allowing generation
        return context.get("secured", False)
