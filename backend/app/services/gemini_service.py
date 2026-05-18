"""Gemini AI Boost Service - Integração com Google Gemini API."""
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import json
import os
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# ── Config from .env ──────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
GEMINI_ENABLED = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
ALLOW_MOCK_AI = os.getenv("ALLOW_MOCK_AI", "true").lower() == "true"
AI_BOOST_ENABLED = os.getenv("AI_BOOST_ENABLED", "false").lower() == "true"
AI_BOOST_MAX_REQUESTS = int(os.getenv("AI_BOOST_MAX_REQUESTS", "50"))

DATA_DIR = Path(__file__).parent.parent.parent / "data"
AI_USAGE_FILE = DATA_DIR / "ai_usage.json"

# ── Plans ─────────────────────────────────────────────────────
AI_BOOST_PLANS = {
    "basic": {
        "name": "Basico",
        "price": 29.90,
        "price_display": "R$ 29,90",
        "max_requests": 50,
        "mode": "agent_boost_100",
        "features": ["melhorar codigo", "gerar documentacao"]
    },
    "pro": {
        "name": "Pro",
        "price": 79.90,
        "price_display": "R$ 79,90",
        "max_requests": 150,
        "mode": "agent_boost_100",
        "features": ["melhorar codigo", "gerar features", "gerar docs", "gerar testes"]
    },
    "advanced": {
        "name": "Avancado",
        "price": 149.90,
        "price_display": "R$ 149,90",
        "max_requests": 500,
        "mode": "agent_boost_100",
        "features": ["melhorar codigo", "gerar features", "gerar docs", "gerar testes", "otimizar arquitetura", "assistente IA"]
    }
}

AI_BOOST_STATUS = {
    "inactive": "inactive",
    "pending_payment": "pending_payment",
    "active": "active",
    "expired": "expired"
}


# ── Gemini health check (usado pelo /api/ai/status) ──────────
def check_gemini_connectivity() -> dict:
    """Testa conectividade real com Gemini via google.genai."""
    if not GEMINI_ENABLED:
        return {
            "mode": "MOCK_MODE",
            "model": GEMINI_MODEL,
            "mock": True,
            "reason": "Agent Boost desabilitado (GEMINI_ENABLED=false).",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "none",
        }
    if not GEMINI_API_KEY:
        reason = "Agent Boost uses platform infrastructure. Chave de plataforma nao configurada."
        return {
            "mode": "MOCK_MODE" if ALLOW_MOCK_AI else "GEMINI_ERROR",
            "model": GEMINI_MODEL,
            "mock": True,
            "reason": reason,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "none",
        }
    try:
        import google.genai as genai
    except ImportError:
        reason = "google.genai nao instalado. pip install google-genai"
        return {
            "mode": "MOCK_MODE" if ALLOW_MOCK_AI else "GEMINI_ERROR",
            "model": GEMINI_MODEL,
            "mock": True,
            "reason": reason,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "none",
        }
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents="Responda apenas: OK",
        )
        return {
            "mode": "GEMINI_CONNECTED",
            "model": GEMINI_MODEL,
            "mock": False,
            "reason": "",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "google",
        }
    except Exception as e:
        err_str = str(e)
        logger.error("[AI_STATUS] %s", err_str)
        clean = _clean_gemini_error(err_str)
        return {
            "mode": "MOCK_MODE" if ALLOW_MOCK_AI else "GEMINI_ERROR",
            "model": GEMINI_MODEL,
            "mock": True,
            "reason": clean,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "google",
        }


def _clean_gemini_error(err: str) -> str:
    """Extrai mensagem amigável do erro bruto do Gemini."""
    import re
    if not err:
        return "Erro desconhecido ao conectar ao Gemini."
    if "429" in err or "RESOURCE_EXHAUSTED" in err:
        m = re.search(r"Please retry in ([\d.]+)s", err)
        retry = f"Tente novamente em {m.group(1)}s." if m else ""
        limit_m = re.search(r"limit:\s*(\d+)", err)
        limit = f"Limite: {limit_m.group(1)} requisições gratuitas." if limit_m else ""
        return f"Limite de requisições gratuito atingido. {limit} {retry}".strip()
    if "API_KEY" in err.upper() or "api key" in err.lower():
        return "Chave de API invalida ou nao configurada. Agent Boost uses platform infrastructure."
    if "DEADLINE_EXCEEDED" in err:
        return "Tempo limite excedido. O serviço demorou muito para responder."
    if "PERMISSION_DENIED" in err or "FORBIDDEN" in err:
        return "Acesso negado. Verifique as permissões da chave de API."
    if "NOT_FOUND" in err or "not found" in err.lower():
        return "Modelo não encontrado. Verifique GEMINI_MODEL no .env."
    if "UNAVAILABLE" in err or "INTERNAL" in err:
        return "Serviço temporariamente indisponível. Tente novamente mais tarde."
    if "INVALID_ARGUMENT" in err:
        return "Requisição inválida. Verifique os parâmetros de configuração."
    lines = err.strip().split("\n")
    first_line = lines[0].strip()
    if len(first_line) > 120:
        first_line = first_line[:117] + "..."
    return first_line


# ── Core generation ──────────────────────────────────────────
def _get_gemini_client():
    if not GEMINI_API_KEY:
        return None
    if not GEMINI_ENABLED:
        return None
    try:
        import google.genai as genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        return client
    except ImportError:
        logger.warning("google.genai nao instalado")
        return None
    except Exception as e:
        logger.error("Erro ao criar cliente Gemini: %s", e)
        return None


def _generate_real(prompt: str, system_instruction: str | None = None, temperature: float | None = None) -> dict:
    client = _get_gemini_client()
    if not client:
        # NEVER silently mock -- report why Agent Boost is unavailable
        platform_key_exists = bool(os.getenv("GEMINI_API_KEY", "").strip())
        if not platform_key_exists:
            reason = "Agent Boost temporariamente indisponivel. Voce pode continuar com Local Build 90%."
        else:
            reason = "Agent Boost indisponivel. Biblioteca ou configuracao ausente."
        return {
            "success": False,
            "error": reason,
            "mode": "local_build_90",
            "reason": reason,
        }
    try:
        config = None
        if system_instruction:
            from google.genai import types

            config_kwargs: dict[str, Any] = {"system_instruction": system_instruction}
            if temperature is not None:
                config_kwargs["temperature"] = temperature
            config = types.GenerateContentConfig(**config_kwargs)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=config,
        )
        logger.info("[AI_ENGINE] mode=GEMINI_CONNECTED model=%s", GEMINI_MODEL)
        return {
            "success": True,
            "response": response.text,
            "model": GEMINI_MODEL,
            "generated_with": "Gemini API",
        }
    except Exception as e:
        logger.error("[AI_ENGINE] mode=GEMINI_ERROR error=%s", e)
        # NEVER silently mock -- always report the real reason
        return {
            "success": False,
            "error": str(e),
            "mode": "agent_boost_100",
            "reason": "Agent Boost: erro na geracao. Tente novamente.",
        }


def verify_platform_key() -> dict:
    """Verifica se a chave de plataforma (Agent Boost) esta configurada no .env.

    A chave NUNCA sai do backend. Este metodo apenas reporta se existe.
    """
    key_exists = bool(os.getenv("GEMINI_API_KEY", "").strip())
    gemini_enabled = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
    return {
        "platform_key_configured": key_exists and gemini_enabled,
        "api_key_source": "platform_backend",
        "api_key_exposed": False,
        "mode": "agent_boost_100" if (key_exists and gemini_enabled) else "local_build_90",
    }


def _mock_response(prompt: str) -> dict:
    return {
        "success": True,
        "response": (
            "**Modo Local Build 90% - Agent Boost**\n\n"
            "*Nota: Agent Boost uses platform infrastructure. Ative o Agent Boost para geracao com IA real.*\n\n"
            f"**Solicitacao:**\n```\n{prompt[:200]}...\n```\n\n"
            "**Recursos disponiveis:**\n"
            "- Melhorar codigo (refactor)\n"
            "- Gerar novas features\n"
            "- Gerar documentacao\n"
            "- Gerar testes\n"
            "- Otimizar arquitetura\n\n"
            "**Gerado em modo Local Build 90%**\n"
        ),
        "model": "local_build_90",
        "generated_with": "Ldcn Agent Boost (Local Build 90%)",
    }


def generate_with_gemini(
    prompt: str,
    project_context: dict = None,
    system_instruction: str | None = None,
    temperature: float | None = None,
) -> dict:
    context_prompt = ""
    if project_context:
        context_prompt = (
            f"Contexto do Projeto:\n"
            f"- Nome: {project_context.get('name', 'N/A')}\n"
            f"- Stack: {project_context.get('stack', 'N/A')}\n"
            f"- Tipo: {project_context.get('type', 'N/A')}\n\n"
        )
    full_prompt = f"{context_prompt}{prompt}\n\nResponda de forma clara."
    return _generate_real(full_prompt, system_instruction=system_instruction, temperature=temperature)


def improve_code(code: str, language: str = "python") -> dict:
    prompt = f"Analise e melhore o seguinte código {language}:\n```{language}\n{code}\n```\nForneça código melhorado com explicações."
    return generate_with_gemini(prompt)


def generate_feature(description: str, project_context: dict = None) -> dict:
    prompt = f"Gere uma nova feature com base na descrição:\n{description}\nInclua código e instruções de integração."
    return generate_with_gemini(prompt, project_context)


def generate_tests(code: str, language: str = "python") -> dict:
    prompt = f"Gere testes unitários para:\n```{language}\n{code}\n```"
    return generate_with_gemini(prompt)


def generate_docs(code: str, project_context: dict = None) -> dict:
    prompt = f"Gere documentação completa (README e docstrings) para:\n```\n{code}\n```"
    return generate_with_gemini(prompt, project_context)


def chat_with_project(prompt: str, project_context: dict = None) -> dict:
    return generate_with_gemini(prompt, project_context)


def chat_with_ldcn(
    prompt: str,
    project_context: dict | None = None,
    system_instruction: str | None = None,
) -> dict:
    return generate_with_gemini(
        prompt,
        project_context,
        system_instruction=system_instruction,
        temperature=0.25,
    )


# ── Usage tracking ────────────────────────────────────────────
from .payment_service import get_project, update_project
from .log_service import log_event


def get_usage(project_id: str) -> dict:
    project = get_project(project_id)
    if not project:
        return {
            "project_id": project_id,
            "requests_used": 0,
            "max_requests": AI_BOOST_MAX_REQUESTS,
            "last_used": None,
            "plan": None,
            "status": AI_BOOST_STATUS["inactive"]
        }
    usage = project.get("usage", {})
    return {
        "project_id": project_id,
        "requests_used": usage.get("ai_requests_used", 0),
        "max_requests": usage.get("ai_requests_limit", AI_BOOST_MAX_REQUESTS),
        "last_used": project.get("ai_last_used"),
        "plan": project.get("ai_plan"),
        "status": project.get("ai_boost_status", AI_BOOST_STATUS["inactive"])
    }


def increment_usage(project_id: str) -> dict:
    project = get_project(project_id)
    if not project:
        return {}
    usage = project.get("usage", {"ai_requests_used": 0, "ai_requests_limit": AI_BOOST_MAX_REQUESTS})
    usage["ai_requests_used"] += 1
    update_project(project_id, {
        "usage": usage,
        "ai_last_used": datetime.now().isoformat()
    })
    return get_usage(project_id)


def activate_ai_boost(project_id: str, plan: str) -> dict:
    if plan not in AI_BOOST_PLANS:
        return {"error": "Plano inválido"}
    plan_info = AI_BOOST_PLANS[plan]
    update_project(project_id, {
        "ai_boost_status": AI_BOOST_STATUS["active"],
        "ai_plan": plan,
        "ai_activated_at": datetime.now().isoformat(),
        "usage": {"ai_requests_used": 0, "ai_requests_limit": plan_info["max_requests"]}
    })
    log_event("ai_boost_activated", project_id, {"plan": plan, "max_requests": plan_info["max_requests"]})
    return get_usage(project_id)


def check_limit(project_id: str) -> tuple:
    usage = get_usage(project_id)
    if usage["status"] != AI_BOOST_STATUS["active"]:
        return False, {"error": "AI Boost não está ativo", "status": usage["status"]}
    if usage["requests_used"] >= usage["max_requests"]:
        return False, {"error": "Limite de requests atingido", "usage": usage}
    return True, usage


def deactivate_ai_boost(project_id: str) -> dict:
    update_project(project_id, {"ai_boost_status": AI_BOOST_STATUS["inactive"]})
    return {"status": AI_BOOST_STATUS["inactive"]}
