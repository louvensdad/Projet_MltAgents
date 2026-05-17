from typing import Dict, Any

class ComparisonEngine:
    """
    Engine responsible for comparing architectural and engineering choices.
    """
    def compare(self, option_a: str, option_b: str) -> Dict[str, Any]:
        key = f"{option_a}_vs_{option_b}".lower()
        reverse_key = f"{option_b}_vs_{option_a}".lower()

        comparisons = {
            "java_17_vs_java_21": {
                "title": "Java 17 vs Java 21",
                "option_a_pros": ["LTS Stability", "Widespread enterprise adoption"],
                "option_b_pros": ["Virtual Threads (Project Loom) for massive concurrency", "Generational ZGC", "Pattern Matching enhancements"],
                "recommendation": "Use Java 21 for any new greenfield project, especially if using Spring Boot 3.2+ due to native Virtual Thread support."
            },
            "rest_vs_graphql": {
                "title": "REST vs GraphQL",
                "option_a_pros": ["Standardized caching (HTTP)", "Simple conceptually", "Easier rate limiting"],
                "option_b_pros": ["No over-fetching/under-fetching", "Strongly typed schema", "Single endpoint"],
                "recommendation": "Use REST for systemic integrations and B2B APIs. Use GraphQL for BFFs (Backend-For-Frontend) and complex client-heavy data graphs."
            },
            "redis_vs_none": {
                "title": "Redis vs No Cache",
                "option_a_pros": ["Sub-millisecond read latency", "Enables global Rate Limiting", "Pub/Sub capabilities"],
                "option_b_pros": ["Lower infrastructure complexity", "No cache invalidation headaches"],
                "recommendation": "Use Redis immediately if your system has a >80% read ratio or requires distributed rate limiting."
            },
            "docker_bad_vs_docker_optimized": {
                "title": "Naive Docker vs Optimized Docker",
                "option_a_pros": ["Easy to write (just FROM node)"],
                "option_b_pros": ["Multi-stage builds reduce image size by 80%", "Distroless images reduce attack surface", "No compiler tools in production"],
                "recommendation": "Always use multi-stage optimized Docker builds. Never ship development dependencies."
            }
        }

        if key in comparisons:
            return comparisons[key]
        if reverse_key in comparisons:
            return comparisons[reverse_key]
            
        return {"error": "Comparison not found."}
