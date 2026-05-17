from typing import Any, Dict, List


class DocsRegistry:
    def __init__(self):
        self.registry: Dict[str, List[Dict[str, Any]]] = {
            "springboot": [
                {"name": "Spring Framework", "version": "6.x", "summary": "Framework principal para APIs e microsserviços Java."},
                {"name": "Spring Boot", "version": "3.3.x", "summary": "Auto-configuração, starters, actuator e ergonomia de build."},
                {"name": "PostgreSQL", "version": "16.x", "summary": "Banco relacional recomendado para workloads transacionais."},
                {"name": "Apache Kafka", "version": "3.x", "summary": "Mensageria e eventos para arquitetura distribuída."},
            ],
            "fastapi": [
                {"name": "FastAPI", "version": "latest", "summary": "Framework ASGI com OpenAPI nativo e tipagem forte."},
                {"name": "SQLAlchemy", "version": "2.x", "summary": "ORM recomendado para persistência síncrona/assíncrona."},
                {"name": "Pydantic", "version": "2.x", "summary": "Validação e contratos de dados tipados."},
                {"name": "PostgreSQL", "version": "16.x", "summary": "Banco relacional para APIs e workers."},
            ],
            "static_site": [
                {"name": "MDN HTML", "version": "current", "summary": "Semântica HTML, acessibilidade e estrutura."},
                {"name": "MDN CSS", "version": "current", "summary": "Layout, responsividade e animações."},
                {"name": "MDN JavaScript", "version": "current", "summary": "Comportamento progressivo e interatividade segura."},
                {"name": "Google Search Central", "version": "current", "summary": "SEO técnico, sitemap e robots."},
            ],
            "angular": [
                {"name": "Angular", "version": "18.x", "summary": "Framework com CLI, guards, services e interceptor pipeline."},
                {"name": "RxJS", "version": "7.x", "summary": "Fluxos reativos para estado e comunicação."},
            ],
            "react": [
                {"name": "React", "version": "18.x", "summary": "Composição de UI com client/server components quando aplicável."},
                {"name": "Vite", "version": "5.x", "summary": "Build moderno e feedback rápido para SPA."},
            ],
            "nextjs": [
                {"name": "Next.js", "version": "15.x", "summary": "App Router, render híbrido e data fetching moderno."},
                {"name": "React", "version": "18.x", "summary": "Base do runtime e da composição de interface."},
            ],
        }

    def get_sources(self, stack: str) -> List[Dict[str, Any]]:
        return self.registry.get(stack, self.registry["static_site"])

    def get_source(self, stack: str) -> Dict[str, Any]:
        return {
            "stack": stack,
            "sources": self.get_sources(stack),
            "repo": "official_registry",
            "local_fallback": None,
        }
