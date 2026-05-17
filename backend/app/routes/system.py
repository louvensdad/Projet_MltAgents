"""routes/system.py — System status, AI models, docs, settings, etc."""

from datetime import datetime, timezone
from fastapi import APIRouter
from ..services.marketplace_catalog import build_billing_snapshot

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/system/status")
def system_status():
    """Status do sistema: serviços, geradores, health."""
    try:
        from generators.generator_adapters import STACK_STATUS, STACK_NAMES
    except ImportError:
        STACK_STATUS = {}
        STACK_NAMES = {}

    services = [
        {"name": "API Gateway", "status": "online", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"name": "Generation Engine", "status": "online", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"name": "Security Scanner", "status": "online", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"name": "Documentation Engine", "status": "online", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"name": "Payment Gateway", "status": "mock", "updated_at": datetime.now(timezone.utc).isoformat()},
    ]

    generators_data = []
    for sid, status in STACK_STATUS.items():
        generators_data.append({
            "id": sid,
            "name": STACK_NAMES.get(sid, sid),
            "support_level": status,
        })

    return {
        "services": services,
        "generators": {
            "generators": generators_data,
            "total": len(generators_data),
        },
        "projects_total": _count_projects(),
        "status": "online",
    }


@router.get("/ai/status")
def ai_generation_status():
    """Status dos modos de geracao AI: Local Build 90% vs Agent Boost 100%."""
    import os
    platform_key_exists = bool(os.getenv("GEMINI_API_KEY", "").strip())
    gemini_enabled = os.getenv("GEMINI_ENABLED", "true").lower() == "true"

    if platform_key_exists and gemini_enabled:
        mode = "agent_boost_100"
        available = True
        message = "Agent Boost 100% disponivel"
    else:
        mode = "local_build_90"
        available = False
        message = "Agent Boost temporariamente indisponivel. Voce pode continuar com Local Build 90%."

    return {
        "generation_quality_mode": mode,
        "agent_boost_available": available,
        "message": message,
        "api_key_source": "platform_backend",
        "api_key_exposed": False,
        "modes": {
            "local_build_90": {
                "description": "Geracao local, sem custo, qualidade base",
                "max_ai_calls": 0,
                "max_tokens": 0,
            },
            "agent_boost_100": {
                "description": "Qualidade maxima com IA, requer Agent Boost ativo",
                "max_ai_calls": 10,
                "max_tokens": 12000,
            },
        },
    }


@router.get("/ai-models")
def list_ai_models():
    """Lista modelos de IA disponíveis."""
    models = [
        {
            "name": "Agent Boost 100%",
            "provider": "Google Gemini",
            "status": "active",
            "mode": "agent_boost_100",
            "model": "gemini-2.5-flash-lite",
            "pricing": "Por requisicao (ver planos)",
            "memory_usage": "128K tokens",
            "request_limit": "50/dia (Basic)",
            "show_metrics": True,
            "api_key_source": "platform_backend",
            "api_key_exposed": False,
        },
        {
            "name": "Local Build 90%",
            "provider": "Ldcn",
            "status": "active",
            "mode": "local_build_90",
            "model": "rule-engine-v2",
            "pricing": "Incluso",
            "memory_usage": "N/A",
            "request_limit": "Ilimitado",
            "show_metrics": True,
        },
        {
            "name": "Recommendation Engine",
            "provider": "Ldcn",
            "status": "active",
            "mode": "ACTIVE",
            "model": "recommendation-v1",
            "pricing": "Incluso",
            "memory_usage": "N/A",
            "request_limit": "Ilimitado",
            "show_metrics": True,
        },
        {
            "name": "Security AI",
            "provider": "Ldcn",
            "status": "active",
            "mode": "ACTIVE",
            "model": "security-scanner-v2",
            "pricing": "Incluso",
            "memory_usage": "N/A",
            "request_limit": "Ilimitado",
            "show_metrics": True,
        },
        {
            "name": "UX AI",
            "provider": "Ldcn",
            "status": "active",
            "mode": "ACTIVE",
            "model": "ux-engine-v1",
            "pricing": "Incluso",
            "memory_usage": "N/A",
            "request_limit": "Ilimitado",
            "show_metrics": True,
        },
        {
            "name": "Claude Code (Planned)",
            "provider": "Anthropic",
            "status": "planned",
            "mode": "OFFLINE",
            "model": "claude-sonnet-4-20250514",
            "pricing": "Em análise",
            "memory_usage": "200K tokens",
            "request_limit": "N/A",
            "show_metrics": False,
            "description": "Integração com Claude Code para revisão de código avançada.",
            "availability": "Q3 2026",
        },
    ]
    return {"models": models}


@router.get("/documentation")
def list_documentation():
    """Lista documentação disponível por stack."""
    try:
        from generators.generator_adapters import STACK_NAMES
    except ImportError:
        STACK_NAMES = {}

    docs = []
    for sid, name in STACK_NAMES.items():
        docs.append({
            "name": name,
            "technology": sid,
            "status": "available",
            "summary": f"Documentação oficial e guia de uso para {name}.",
            "last_update": "2026-05-01",
        })
    return {"docs": docs, "summary": f"{len(docs)} stacks documentadas"}


@router.get("/documentation/sources")
def documentation_sources(stack: str):
    from documentation_engine.docs_registry import DocsRegistry

    registry = DocsRegistry()
    return {"stack": stack, "sources": registry.get_sources(stack)}


@router.get("/security-status")
def security_status():
    """Status de segurança do sistema."""
    return {
        "security_score": 94,
        "layers": [
            {"name": "Secret Scanner", "status": "active"},
            {"name": "Path Traversal Protection", "status": "active"},
            {"name": "CORS Policy", "status": "active"},
            {"name": "CSRF Protection", "status": "active"},
            {"name": "Input Sanitization", "status": "active"},
            {"name": "Rate Limiter", "status": "active"},
            {"name": "JWT Manager", "status": "active"},
            {"name": "Audit Logger", "status": "active"},
        ],
    }


@router.get("/billing")
def billing_info():
    """Informacoes de faturamento, planos e Agent Boost."""
    snapshot = build_billing_snapshot()
    snapshot["usage"]["projects_this_month"] = _count_projects()
    return snapshot


@router.get("/settings")
def get_settings():
    """Configurações do painel (servidor)."""
    return {
        "api_version": "1.0.0",
        "environment": "development",
        "features": {
            "ai_generation": True,
            "auto_docs": True,
            "security_scan": True,
            "auto_backup": False,
        },
    }


@router.get("/generators")
def list_generators():
    """Lista geradores com status detalhado."""
    try:
        from generators.generator_adapters import STACK_STATUS, STACK_NAMES
    except ImportError:
        STACK_STATUS = {}
        STACK_NAMES = {}

    result = []
    for sid, status in STACK_STATUS.items():
        result.append({
            "id": sid,
            "name": STACK_NAMES.get(sid, sid),
            "status": status,
        })
    return {"generators": result, "total": len(result)}


@router.get("/activity")
def activity_feed():
    """Feed de atividades recentes."""
    return {
        "activities": [
            {
                "id": "1",
                "type": "project_created",
                "message": "Projeto 'Teste Site' criado",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": "2",
                "type": "generation_completed",
                "message": "Geração static_site concluída",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        ]
    }


@router.get("/recommendations")
def list_recommendations():
    """Recomendações de arquitetura e stack."""
    return {
        "recommendations": [
            {
                "id": "1",
                "type": "security",
                "priority": "high",
                "message": "Habilitar autenticação JWT em todos os endpoints",
            },
            {
                "id": "2",
                "type": "performance",
                "priority": "medium",
                "message": "Adicionar cache Redis para reduzir latência",
            },
            {
                "id": "3",
                "type": "architecture",
                "priority": "low",
                "message": "Migrar para arquitetura modular para escalabilidade futura",
            },
        ]
    }


@router.get("/validation-center")
def validation_center():
    """Centro de validação - status dos gates."""
    return {
        "gates": [
            {"name": "Quality Gate", "status": "active"},
            {"name": "Security Gate", "status": "active"},
            {"name": "Stack Gate", "status": "active"},
            {"name": "Fidelity Gate", "status": "active"},
            {"name": "Locale Gate", "status": "active"},
        ],
        "last_validation": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/validation/summary")
def validation_summary():
    center = validation_center()
    gates = center.get("gates", [])
    items = [
        {
            "rule": gate["name"],
            "status": "validado" if gate["status"] == "active" else "warning",
            "detail": f"Status atual: {gate['status']}",
        }
        for gate in gates
    ]
    return {"items": items, "last_validation": center.get("last_validation")}


@router.post("/ai-models/{slug}/test")
def test_ai_model(slug: str):
    from ..services.gemini_service import check_gemini_connectivity

    slug_normalized = slug.strip().lower()
    if slug_normalized in {"agent-boost-100", "gemini", "gemini-2.5-flash-lite"}:
        status = check_gemini_connectivity()
        return {
            "mode": status.get("mode", "OFFLINE"),
            "connected": not status.get("mock", True),
            "reason": status.get("reason", ""),
            "last_check": status.get("last_check"),
            "provider": status.get("provider", "none"),
            "model": status.get("model"),
        }

    return {
        "mode": "PLANNED",
        "connected": False,
        "reason": f"Teste real ainda não implementado para {slug}.",
        "last_check": datetime.now(timezone.utc).isoformat(),
        "provider": "planned",
        "model": slug,
    }


def _count_projects() -> int:
    try:
        from ..services.payment_service import get_all_projects
        return len(get_all_projects())
    except Exception:
        return 0
