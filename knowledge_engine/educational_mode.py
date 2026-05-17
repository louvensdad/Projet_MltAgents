from typing import Dict

class EducationalMode:
    """
    Engine responsible for explaining the 'Why' behind architectural components.
    """
    def explain(self, topic: str) -> Dict[str, str]:
        topic = topic.lower().replace(" ", "_")
        explanations = {
            "kafka": {
                "title": "Why use Kafka?",
                "explanation": "Kafka is a distributed event streaming platform. We use it to decouple microservices. Instead of Service A calling Service B synchronously (which can cause cascading failures if B is down), Service A drops a message in Kafka. Service B reads it at its own pace. It provides backpressure, high throughput, and event replayability."
            },
            "redis": {
                "title": "Why use Redis?",
                "explanation": "Redis is an in-memory data store. We use it to drastically reduce database load for data that changes infrequently but is read constantly (like user sessions or configurations). It is also the industry standard for implementing distributed Rate Limiting and Circuit Breaker states."
            },
            "java_21": {
                "title": "Why use Java 21?",
                "explanation": "Java 21 introduces Virtual Threads (Project Loom). Historically, every Java thread mapped 1:1 to an OS thread, making high-concurrency expensive. Virtual Threads are cheap and lightweight, allowing you to run millions of concurrent tasks on standard hardware without complex reactive programming (WebFlux)."
            },
            "dto": {
                "title": "Why use DTOs (Data Transfer Objects)?",
                "explanation": "DTOs decouple your internal Database Models from your API contracts. Without DTOs, a database schema change breaks your API clients. Also, exposing DB models directly can leak sensitive fields (like password hashes) if not carefully ignored."
            }
        }
        
        return explanations.get(topic, {"error": "Topic not found."})
