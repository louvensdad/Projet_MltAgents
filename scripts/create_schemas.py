import os
import json

registry_dir = r"c:\Users\louvens\OneDrive\Projet_MltAgents\stack_registry\stacks"
os.makedirs(registry_dir, exist_ok=True)

# 1. Spring Boot
springboot = {
    "id": "springboot",
    "name": "Java + Spring Boot",
    "description": "Enterprise Java with full Spring ecosystem",
    "form_schema": [
        {"id": "java_version", "label": "Java Version", "type": "select", "options": ["17", "21"], "default": "21"},
        {"id": "architecture", "label": "Architecture", "type": "select", "options": ["monolith", "microservices"], "default": "monolith"},
        {"id": "api_gateway", "label": "API Gateway", "type": "boolean", "default": False},
        {"id": "messaging", "label": "Messaging", "type": "select", "options": ["none", "kafka"], "default": "none"},
        {"id": "cache", "label": "Cache", "type": "select", "options": ["none", "redis"], "default": "none"},
        {"id": "infrastructure", "label": "Infrastructure", "type": "select", "options": ["docker", "kubernetes"], "default": "docker"},
        {"id": "auth", "label": "Auth Provider", "type": "select", "options": ["jwt", "keycloak", "oauth2"], "default": "jwt"},
        {"id": "observability", "label": "Observability / Tracing", "type": "select", "options": ["none", "zipkin", "datadog", "prometheus"], "default": "prometheus"},
        {"id": "cicd", "label": "CI/CD", "type": "select", "options": ["none", "github_actions", "gitlab_ci"], "default": "github_actions"}
    ],
    "validation_rules": [
        {"condition": "architecture == 'microservices' and api_gateway == False", "level": "warning", "message": "Using Microservices without an API Gateway is an anti-pattern."}
    ]
}

# 2. FastAPI
fastapi = {
    "id": "fastapi",
    "name": "Python + FastAPI",
    "description": "Modern async APIs with performance",
    "form_schema": [
        {"id": "async_mode", "label": "Use Async Mode?", "type": "boolean", "default": True},
        {"id": "background_workers", "label": "Background Workers", "type": "select", "options": ["none", "celery", "rq"], "default": "none"},
        {"id": "websockets", "label": "Enable WebSockets", "type": "boolean", "default": False},
        {"id": "cache", "label": "Cache", "type": "select", "options": ["none", "redis"], "default": "none"},
        {"id": "vector_db", "label": "Vector DB", "type": "select", "options": ["none", "pinecone", "milvus", "qdrant"], "default": "none"},
        {"id": "ai_integration", "label": "AI Integration", "type": "select", "options": ["none", "gemini", "openai", "local"], "default": "none"}
    ],
    "validation_rules": [
        {"condition": "ai_integration != 'none' and vector_db == 'none'", "level": "warning", "message": "Using AI without a Vector DB limits RAG capabilities."}
    ]
}

# 3. Static Site
static_site = {
    "id": "static-site",
    "name": "Static Site",
    "description": "HTML/CSS/JS with SEO-first architecture",
    "form_schema": [
        {"id": "site_type", "label": "Site Type", "type": "select", "options": ["landing_page", "portfolio", "blog"], "default": "landing_page"},
        {"id": "seo", "label": "Enable Advanced SEO", "type": "boolean", "default": True},
        {"id": "cms", "label": "CMS Integration", "type": "select", "options": ["none", "netlify_cms", "sanity"], "default": "none"},
        {"id": "analytics", "label": "Analytics", "type": "select", "options": ["none", "google_analytics", "plausible"], "default": "none"},
        {"id": "animations", "label": "Animations Library", "type": "select", "options": ["none", "framer_motion", "gsap"], "default": "none"},
        {"id": "forms", "label": "Forms & Newsletter", "type": "boolean", "default": False}
    ],
    "validation_rules": []
}

with open(os.path.join(registry_dir, "springboot.json"), "w") as f: json.dump(springboot, f, indent=4)
with open(os.path.join(registry_dir, "fastapi.json"), "w") as f: json.dump(fastapi, f, indent=4)
with open(os.path.join(registry_dir, "static_site.json"), "w") as f: json.dump(static_site, f, indent=4)

print("Schemas generated.")
