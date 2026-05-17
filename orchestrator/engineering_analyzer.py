from typing import Dict, Any

class EngineeringAnalyzer:
    """
    Analyzes the initial context to smartly inject enterprise engineering patterns.
    It upgrades simplistic payloads with real engineering mechanisms (Redis, Kafka, etc.).
    """
    
    def analyze_and_inject(self, context: Dict[str, Any]) -> Dict[str, Any]:
        user_input = context.get("original_request", "").lower()
        form_data = context.get("stack_specific_config", {})
        architecture = context.get("architecture", "").lower()

        engineering = context.get("engineering_patterns", {})
        
        # 1. Circuit Breaker
        # Microservices automatically demand a circuit breaker (e.g. resilience4j)
        engineering["circuit_breaker"] = "microservices" in architecture

        # 2. Rate Limiting
        # Mandatory on APIs unless explicitly internal
        engineering["rate_limit"] = True

        # 3. Cache (Redis)
        # Injected if user mentions high-read scenarios or cache explicitly
        if "redis" in str(form_data).lower() or any(k in user_input for k in ["feed", "dashboard", "cache", "fast"]):
            engineering["cache"] = "redis"
        else:
            engineering["cache"] = form_data.get("cache", "none")

        # 4. Message Queue (Kafka/RabbitMQ)
        if "kafka" in str(form_data).lower() or any(k in user_input for k in ["async", "queue", "webhook", "messaging", "event", "microservice"]):
            engineering["queue"] = "kafka" if "kafka" in str(form_data).lower() else "rabbitmq"
        else:
            engineering["queue"] = form_data.get("messaging", "none")

        # 5. Background Workers
        if any(k in user_input for k in ["email", "report", "video", "processing", "worker", "job"]):
            engineering["workers"] = True
        else:
            engineering["workers"] = False

        # 6. WebSockets
        if any(k in user_input for k in ["chat", "real-time", "live", "socket"]):
            engineering["websockets"] = True
        else:
            engineering["websockets"] = False

        context["engineering_patterns"] = engineering
        return context
