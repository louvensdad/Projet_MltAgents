"""Briefing de Arquitetura Avancada.

Centraliza o fluxo de perguntas, os defaults seguros e as regras por stack.
"""

from __future__ import annotations

from typing import Dict, List


ARCHITECTURE_TYPE_OPTIONS = {
    "1": "monolith_modular",
    "2": "microservices",
    "3": "serverless",
    "4": "event_driven",
    "5": "hexagonal_clean",
}

SERVICE_DISCOVERY_OPTIONS = {
    "1": "none",
    "2": "eureka",
    "3": "consul",
}

API_GATEWAY_OPTIONS = {
    "1": "none",
    "2": "spring_cloud_gateway",
    "3": "kong",
    "4": "nginx",
    "5": "traefik",
}

COMMUNICATION_OPTIONS = {
    "1": "http_rest",
    "2": "grpc",
    "3": "websocket",
    "4": "kafka",
    "5": "rabbitmq",
}

AUTH_PROVIDER_OPTIONS = {
    "1": "jwt_simple",
    "2": "oauth2",
    "3": "keycloak",
    "4": "auth0",
    "5": "clerk",
    "6": "supabase_auth",
}

MONITORING_OPTIONS = {
    "1": "basic_logs",
    "2": "prometheus_grafana",
    "3": "elk_stack",
    "4": "opentelemetry",
    "5": "sentry",
}

CACHE_OPTIONS = {
    "1": "none",
    "2": "redis",
    "3": "memcached",
}

DATABASE_OPTIONS = {
    "1": "sqlite_local",
    "2": "postgresql",
    "3": "mysql",
    "4": "mongodb",
}

TESTING_OPTIONS = {
    "1": "unit_tests",
    "2": "integration_tests",
    "3": "e2e_tests",
    "4": "contract_tests",
    "5": "load_tests",
}

ENDPOINT_TOOL_OPTIONS = {
    "1": "swagger_openapi",
    "2": "postman_collection",
    "3": "insomnia_collection",
    "4": "http_files",
    "5": "api_playground",
}

LOGIC_TOOL_OPTIONS = {
    "1": "tests/unit",
    "2": "tests/integration",
    "3": "tests/e2e",
    "4": "test_cases_documented",
    "5": "business_rule_examples",
}

LABELS = {
    "monolith_modular": "Monólito modular",
    "microservices": "Microsserviços",
    "serverless": "Serverless",
    "event_driven": "Event-driven",
    "hexagonal_clean": "Hexagonal/Clean Architecture",
    "none": "Nenhum",
    "eureka": "Eureka",
    "consul": "Consul",
    "spring_cloud_gateway": "Spring Cloud Gateway",
    "kong": "Kong",
    "nginx": "Nginx",
    "traefik": "Traefik",
    "http_rest": "HTTP REST",
    "grpc": "gRPC",
    "websocket": "WebSocket",
    "kafka": "Kafka",
    "rabbitmq": "RabbitMQ",
    "jwt_simple": "JWT simples",
    "oauth2": "OAuth2",
    "keycloak": "Keycloak",
    "auth0": "Auth0",
    "clerk": "Clerk",
    "supabase_auth": "Supabase Auth",
    "basic_logs": "Logs básicos",
    "prometheus_grafana": "Prometheus + Grafana",
    "elk_stack": "ELK Stack",
    "opentelemetry": "OpenTelemetry",
    "sentry": "Sentry",
    "redis": "Redis",
    "memcached": "Memcached",
    "sqlite_local": "SQLite local",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "unit_tests": "Unitários",
    "integration_tests": "Integração",
    "e2e_tests": "E2E",
    "contract_tests": "Testes de contrato",
    "load_tests": "Testes de carga",
    "api_playground": "API Playground",
    "swagger_openapi": "Swagger/OpenAPI",
    "postman_collection": "Postman Collection",
    "insomnia_collection": "Insomnia Collection",
    "http_files": "HTTP files",
    "api_playground": "API Playground interno",
    "tests/unit": "tests/unit",
    "tests/integration": "tests/integration",
    "tests/e2e": "tests/e2e",
    "test_cases_documented": "Test cases documentados",
    "business_rule_examples": "Arquivos de exemplo para regras de negócio",
}

STACK_NOTES = {
    "java": [
        "Se microsserviços, Spring Cloud Gateway, Eureka e Config Server ficam opcionais, não obrigatórios.",
        "Actuator e OpenAPI/Swagger devem estar presentes.",
        "Kafka ou RabbitMQ são opcionais quando houver comunicação assíncrona.",
        "Keycloak é a opção preferencial se o projeto pedir SSO/Identity centralizada.",
        "Prometheus + Grafana, JUnit, Mockito e Testcontainers podem entrar conforme a complexidade.",
    ],
    "fastapi": [
        "OpenAPI já é nativo no FastAPI.",
        "pytest e httpx/TestClient cobrem o fluxo padrão.",
        "Redis, RabbitMQ e Kafka são opcionais, não obrigatórios.",
        "Prometheus pode ser adicionado apenas se houver necessidade operacional real.",
    ],
    "nestjs": [
        "Swagger module deve ser incluído para documentar a API.",
        "Jest e Supertest cobrem testes de API e integração.",
        "RabbitMQ e Kafka são opcionais para cenários assíncronos.",
        "Passport/JWT/Keycloak entram somente quando a autenticação exigir.",
    ],
    "express": [
        "Swagger UI e middleware de segurança devem existir no baseline.",
        "Jest e Supertest cobrem o fluxo principal.",
        "RabbitMQ e Kafka são opcionais para cenários assíncronos.",
    ],
    "laravel": [
        "Pest ou PHPUnit devem ser usados para cobertura de lógica.",
        "Sanctum ou Passport entram conforme a necessidade de auth.",
        "Horizon/Queue pode ser habilitado em cenários com processamento assíncrono.",
        "Telescope e Swagger são opcionais.",
    ],
}


SAFE_DEFAULT = {
    "architecture_type": "monolith_modular",
    "service_discovery": "none",
    "api_gateway": "none",
    "communication_protocols": ["http_rest"],
    "auth_provider": "jwt_simple",
    "monitoring": "basic_logs",
    "cache": "none",
    "database": "sqlite_local",
    "database_production": "postgresql",
    "testing_strategy": ["unit_tests", "integration_tests"],
    "endpoint_testing_tools": ["swagger_openapi"],
    "logic_testing_tools": ["tests/unit", "tests/integration"],
    "stack_notes": [
        "Baseline simples e seguro para começar sem excesso de complexidade.",
        "Docker permanece opcional.",
    ],
}


def _label(value: str) -> str:
    return LABELS.get(value, value)


def _ask_choice(prompt: str, options: Dict[str, str], default: str) -> str:
    print(prompt)
    for key, value in options.items():
        print(f"  {key}. {_label(value)}")
    raw = input(f"  Escolha [padrão: {default}]: ").strip() or default
    return options.get(raw, options.get(default, default))


def _ask_multi(prompt: str, options: Dict[str, str], default: List[str]) -> List[str]:
    print(prompt)
    for key, value in options.items():
        print(f"  {key}. {_label(value)}")
    raw = input("  Escolha separada por vírgula [Enter para padrão]: ").strip()
    if not raw:
        return default[:]
    chosen = []
    for part in raw.replace(" ", "").split(","):
        value = options.get(part)
        if value and value not in chosen:
            chosen.append(value)
    return chosen or default[:]


def _stack_key(backend_stack: str) -> str:
    stack = (backend_stack or "").lower()
    if "spring" in stack or "java" in stack:
        return "java"
    if "fastapi" in stack:
        return "fastapi"
    if "nestjs" in stack:
        return "nestjs"
    if "express" in stack:
        return "express"
    if "laravel" in stack:
        return "laravel"
    return "generic"


def _apply_stack_notes(backend_stack: str, advanced: dict) -> None:
    key = _stack_key(backend_stack)
    notes = list(advanced.get("stack_notes", []))
    notes.extend(STACK_NOTES.get(key, []))

    if key == "java" and advanced.get("architecture_type") == "microservices":
        notes.insert(0, "Para microsserviços, mantenha Actuator e Swagger como obrigatórios.")
        if advanced.get("service_discovery") == "none":
            advanced["service_discovery"] = "eureka"
        if advanced.get("api_gateway") == "none":
            advanced["api_gateway"] = "spring_cloud_gateway"
        if advanced.get("auth_provider") == "jwt_simple":
            advanced["auth_provider"] = "keycloak"
    elif key == "fastapi":
        advanced["endpoint_testing_tools"] = ["swagger_openapi"] + [x for x in advanced.get("endpoint_testing_tools", []) if x != "swagger_openapi"]
        if "tests/unit" not in advanced.get("logic_testing_tools", []):
            advanced["logic_testing_tools"] = ["tests/unit", "tests/integration"] + [x for x in advanced.get("logic_testing_tools", []) if x not in ("tests/unit", "tests/integration")]
    elif key == "nestjs":
        if "swagger_openapi" not in advanced.get("endpoint_testing_tools", []):
            advanced["endpoint_testing_tools"] = ["swagger_openapi"] + advanced.get("endpoint_testing_tools", [])

    advanced["stack_notes"] = list(dict.fromkeys(notes))


def collect_architecture_block(backend_stack: str, project_type: str = "") -> dict:
    result = {
        "advanced_architecture": dict(SAFE_DEFAULT),
        "architecture_mode": "safe",
    }

    print("\n" + "═" * 44)
    print("  🏗 ARQUITETURA AVANÇADA")
    print("═" * 44)
    print("\n[ Arquitetura Avançada ]")
    print("Deseja configurar arquitetura avançada?")
    print("  1. Não, usar padrão seguro recomendado")
    print("  2. Sim, quero escolher manualmente")
    mode_raw = input("  Escolha (1-2) [padrão: 1]: ").strip() or "1"

    if mode_raw != "2":
        print("  ℹ️  Usando arquitetura segura recomendada: monólito modular, HTTP REST, JWT, Swagger/OpenAPI, logs básicos, SQLite local em dev e PostgreSQL em produção.")
        advanced = dict(SAFE_DEFAULT)
        _apply_stack_notes(backend_stack, advanced)
        result["advanced_architecture"] = advanced
        return result

    print("\n  ℹ️  Escolha manual: se algo estiver em dúvida, prefira opções simples e seguras.")
    advanced = {}
    advanced["architecture_type"] = _ask_choice("\n[ Tipo de arquitetura ]", ARCHITECTURE_TYPE_OPTIONS, "1")
    advanced["service_discovery"] = _ask_choice("\n[ Service Discovery ]", SERVICE_DISCOVERY_OPTIONS, "1")
    advanced["api_gateway"] = _ask_choice("\n[ API Gateway ]", API_GATEWAY_OPTIONS, "1")
    advanced["communication_protocols"] = _ask_multi(
        "\n[ Comunicação entre serviços ]",
        COMMUNICATION_OPTIONS,
        ["http_rest"],
    )
    advanced["auth_provider"] = _ask_choice("\n[ Segurança ]", AUTH_PROVIDER_OPTIONS, "1")
    advanced["monitoring"] = _ask_choice("\n[ Monitoramento ]", MONITORING_OPTIONS, "1")
    advanced["cache"] = _ask_choice("\n[ Cache ]", CACHE_OPTIONS, "1")
    advanced["database"] = _ask_choice("\n[ Banco ]", DATABASE_OPTIONS, "1")
    advanced["database_production"] = "postgresql" if advanced["database"] == "sqlite_local" else advanced["database"]
    advanced["testing_strategy"] = _ask_multi(
        "\n[ Testes ]",
        TESTING_OPTIONS,
        ["unit_tests", "integration_tests"],
    )
    advanced["endpoint_testing_tools"] = _ask_multi(
        "\n[ Ferramentas para testar endpoints ]",
        ENDPOINT_TOOL_OPTIONS,
        ["swagger_openapi"],
    )
    advanced["logic_testing_tools"] = _ask_multi(
        "\n[ Espaço para testar lógica ]",
        LOGIC_TOOL_OPTIONS,
        ["tests/unit", "tests/integration"],
    )
    advanced["architecture_mode"] = "manual"

    _apply_stack_notes(backend_stack, advanced)
    result["advanced_architecture"] = advanced
    return result


def format_architecture_for_summary(advanced_architecture: dict) -> dict:
    if not advanced_architecture:
        advanced_architecture = dict(SAFE_DEFAULT)

    summary = {
        "Arquitetura": [
            f"Tipo: {_label(advanced_architecture.get('architecture_type', 'monolith_modular'))}",
            f"Service Discovery: {_label(advanced_architecture.get('service_discovery', 'none'))}",
            f"API Gateway: {_label(advanced_architecture.get('api_gateway', 'none'))}",
            f"Comunicação: {', '.join(_label(v) for v in advanced_architecture.get('communication_protocols', ['http_rest']))}",
            f"Segurança: {_label(advanced_architecture.get('auth_provider', 'jwt_simple'))}",
            f"Monitoramento: {_label(advanced_architecture.get('monitoring', 'basic_logs'))}",
            f"Cache: {_label(advanced_architecture.get('cache', 'none'))}",
            f"Banco: {_label(advanced_architecture.get('database', 'sqlite_local'))}",
            f"Testes: {', '.join(_label(v) for v in advanced_architecture.get('testing_strategy', ['unit_tests', 'integration_tests']))}",
            f"Teste de Endpoints: {', '.join(_label(v) for v in advanced_architecture.get('endpoint_testing_tools', ['swagger_openapi']))}",
            f"Teste de Lógica: {', '.join(_label(v) for v in advanced_architecture.get('logic_testing_tools', ['tests/unit', 'tests/integration']))}",
        ]
    }
    return summary
