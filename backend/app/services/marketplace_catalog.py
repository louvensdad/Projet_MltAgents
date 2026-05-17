from __future__ import annotations

from datetime import datetime, timezone


def list_templates_catalog():
    from backend.templates import TemplateRegistry

    return TemplateRegistry().list_public_templates()


def find_template(slug: str):
    from backend.templates import TemplateRegistry

    registry = TemplateRegistry()
    try:
        return registry.get_template(slug)
    except KeyError:
        return None


def build_templates_overview():
    from backend.templates import TemplateRegistry

    registry = TemplateRegistry()
    return {
        "catalog": registry.list_public_templates(),
        "featured": registry.list_featured(),
        "categories": registry.list_by_category(),
        "stats": registry.stats(),
        "source": "template_registry",
    }


def build_billing_snapshot():
    import os

    platform_key_exists = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return {
        "current_plan": "Enterprise",
        "provider_status": "operational",
        "payment_provider": "platform_backend",
        "usage": {
            "projects_this_month": 0,
            "projects_limit": 100,
            "ai_requests_used": 0,
            "ai_requests_limit": 500,
        },
        "plan_price": "R$ 199,90/mes",
        "next_billing": "2026-06-15",
        "plans": [
            {
                "name": "Local Build",
                "price": "Gratis",
                "status": "available",
                "highlight": "Geracao offline com qualidade base",
                "limits": ["Projetos locais", "Preview ao vivo", "Sem chave externa"],
            },
            {
                "name": "Agent Boost",
                "price": "Sob demanda",
                "status": "active" if platform_key_exists else "paused",
                "highlight": "Qualidade maxima com Gemini/OpenAI da plataforma",
                "limits": ["IA premium", "Trace completo", "Fallback seguro"],
            },
            {
                "name": "Enterprise",
                "price": "R$ 199,90/mes",
                "status": "active",
                "highlight": "Fluxo completo para equipes e escala",
                "limits": ["Governanca", "Observabilidade", "Priority support"],
            },
        ],
        "history": [
            {"item": "Local Build - Projeto entregue", "date": "2026-05-10", "status": "paid"},
            {"item": "Agent Boost - Upgrade ativado", "date": "2026-05-12", "status": "pending"},
            {"item": "Enterprise - Renovacao", "date": "2026-06-15", "status": "scheduled"},
        ],
        "agent_boost": {
            "enabled": platform_key_exists,
            "mode": "agent_boost_100" if platform_key_exists else "local_build_90",
            "api_key_source": "platform_backend",
            "api_key_exposed": False,
        },
        "stripe": {
            "connected": False,
            "mode": "platform_backend",
            "public_key_set": False,
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
