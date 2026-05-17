"""AI Boost Routes - Endpoints para Gemini AI Boost."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import sys
import os

# Adicionar raiz do projeto ao path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ..services.gemini_service import (
    AI_BOOST_PLANS,
    AI_BOOST_STATUS,
    get_usage,
    activate_ai_boost,
    deactivate_ai_boost,
    check_limit,
    increment_usage,
    improve_code,
    generate_feature,
    generate_tests,
    generate_docs,
    chat_with_project,
    GEMINI_API_KEY,
    verify_platform_key,
)
from ..services.payment_service import get_project, update_project

router = APIRouter(prefix="/api/ai-boost", tags=["AI Boost"])


# ==========================================
# Schemas / Models
# ==========================================

class ActivatePlanRequest(BaseModel):
    plan: str = Field(..., description="Plano: basic, pro, advanced")
    project_id: str


class MockConfirmRequest(BaseModel):
    project_id: str
    plan: str


class ImproveCodeRequest(BaseModel):
    code: str = Field(..., max_length=10000)
    language: str = "python"


class GenerateFeatureRequest(BaseModel):
    description: str = Field(..., max_length=5000)
    include_tests: bool = False


class GenerateTestsRequest(BaseModel):
    code: str = Field(..., max_length=10000)
    language: str = "python"


class GenerateDocsRequest(BaseModel):
    code: str = Field(..., max_length=10000)


class ChatRequest(BaseModel):
    prompt: str = Field(..., max_length=5000)


# ==========================================
# Status & Plans
# ==========================================

@router.get("/plans")
def list_plans():
    """Lista planos disponíveis do AI Boost."""
    return {"plans": AI_BOOST_PLANS}


@router.get("/status/{project_id}")
def get_ai_status(project_id: str):
    """Retorna status do AI Boost para um projeto."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    usage = get_usage(project_id)
    can_use = usage["status"] == AI_BOOST_STATUS["active"]
    
    return {
        "project_id": project_id,
        "ai_boost_active": can_use,
        "agent_boost_status": project.get("agent_boost_status", "inactive"),
        "payment_status": project.get("payment_status", "pending_payment"),
        "status": usage["status"],
        "requests_used": usage["requests_used"],
        "max_requests": usage["max_requests"],
        "requests_remaining": max(0, usage["max_requests"] - usage["requests_used"]),
        "plan": usage.get("plan"),
        "gemini_configured": bool(GEMINI_API_KEY),
        "generation_mode": "agent_boost_100" if can_use else "local_build_90",
        "api_key_source": "platform_backend",
        "api_key_exposed": False,
    }


@router.get("/check-permission/{project_id}")
def check_agent_boost_permission(project_id: str):
    """Verifica se Agent Boost esta permitido para um projeto.

    Retorna status detalhado: allowed, mode, reason, api_key info.
    A chave de API NUNCA sai do backend.
    """
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")

    platform_info = verify_platform_key()
    agent_boost_status = project.get("agent_boost_status", "inactive")
    payment_status = project.get("payment_status", "pending_payment")
    platform_key_ok = platform_info["platform_key_configured"]

    # Determine if Agent Boost is allowed
    if not platform_key_ok:
        agent_boost_allowed = False
        mode = "local_build_90"
        reason = "Agent Boost temporariamente indisponivel. Voce pode continuar com Local Build 90%."
    elif agent_boost_status != "active":
        agent_boost_allowed = False
        mode = "local_build_90"
        reason = "Agent Boost nao esta ativo para este projeto."
    elif payment_status != "paid":
        agent_boost_allowed = False
        mode = "local_build_90"
        reason = "Pagamento nao confirmado. Agent Boost requer pagamento ativo."
    else:
        agent_boost_allowed = True
        mode = "agent_boost_100"
        reason = "Agent Boost disponivel"

    return {
        "project_id": project_id,
        "agent_boost_allowed": agent_boost_allowed,
        "mode": mode,
        "reason": reason,
        "api_key_source": "platform_backend",
        "api_key_exposed": False,
        "agent_boost_status": agent_boost_status,
        "payment_status": payment_status,
    }


# ==========================================
# Activation & Payment
# ==========================================

@router.post("/activate")
def activate_plan(req: ActivatePlanRequest):
    """Ativa plano AI Boost (após confirmação de pagamento)."""
    project = get_project(req.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    if req.plan not in AI_BOOST_PLANS:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    result = activate_ai_boost(req.project_id, req.plan)
    return {
        "success": True,
        "message": f"AI Boost {AI_BOOST_PLANS[req.plan]['name']} ativado!",
        "plan": req.plan,
        "max_requests": result["max_requests"],
        "status": result["status"]
    }


@router.post("/deactivate/{project_id}")
def deactivate_plan(project_id: str):
    """Desativa AI Boost de um projeto."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    deactivate_ai_boost(project_id)
    return {"success": True, "message": "AI Boost desativado"}


@router.post("/mock-confirm")
def mock_confirm_payment(req: MockConfirmRequest):
    """Confirma pagamento mock e ativa o AI Boost."""
    project = get_project(req.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    if req.plan not in AI_BOOST_PLANS:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    # Ativar plano e marcar pagamento como pago
    result = activate_ai_boost(req.project_id, req.plan)
    update_project(req.project_id, {
        "payment_status": "paid",
        "agent_boost_status": "active",
    })

    return {
        "success": True,
        "message": f"Pagamento simulado aprovado! Agent Boost {AI_BOOST_PLANS[req.plan]['name']} ativado.",
        "project_id": req.project_id,
        "plan": req.plan,
        "max_requests": result["max_requests"],
        "status": "active",
        "agent_boost_status": "active",
        "payment_status": "paid",
        "generation_mode": "agent_boost_100",
    }


# ==========================================
# AI Features
# ==========================================

@router.post("/projects/{project_id}/ai/improve-code")
def ai_improve_code(project_id: str, req: ImproveCodeRequest):
    """Melhora código usando Gemini AI."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Verificar limite
    can_use, status_info = check_limit(project_id)
    if not can_use:
        raise HTTPException(status_code=403, detail=status_info.get("error", "Limite atingido"))
    
    # Executar
    result = improve_code(req.code, req.language)
    
    if result.get("success"):
        increment_usage(project_id)
    
    return {
        **result,
        "requests_used": get_usage(project_id)["requests_used"],
        "requests_remaining": max(0, get_usage(project_id)["max_requests"] - get_usage(project_id)["requests_used"]),
        "generated_with": "Ldcn AI Boost"
    }


@router.post("/projects/{project_id}/ai/generate-feature")
def ai_generate_feature(project_id: str, req: GenerateFeatureRequest):
    """Gera nova feature automaticamente."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    can_use, status_info = check_limit(project_id)
    if not can_use:
        raise HTTPException(status_code=403, detail=status_info.get("error", "Limite atingido"))
    
    # Incluir contexto do projeto
    project_context = {
        "name": project.get("name"),
        "stack": project.get("stack"),
        "type": project.get("type")
    }
    
    result = generate_feature(req.description, project_context)
    
    if result.get("success"):
        increment_usage(project_id)
        if req.include_tests:
            increment_usage(project_id)
    
    return {
        **result,
        "requests_used": get_usage(project_id)["requests_used"],
        "requests_remaining": max(0, get_usage(project_id)["max_requests"] - get_usage(project_id)["requests_used"]),
        "generated_with": "Ldcn AI Boost"
    }


@router.post("/projects/{project_id}/ai/generate-tests")
def ai_generate_tests(project_id: str, req: GenerateTestsRequest):
    """Gera testes unitários."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    can_use, status_info = check_limit(project_id)
    if not can_use:
        raise HTTPException(status_code=403, detail=status_info.get("error", "Limite atingido"))
    
    result = generate_tests(req.code, req.language)
    
    if result.get("success"):
        increment_usage(project_id)
    
    return {
        **result,
        "requests_used": get_usage(project_id)["requests_used"],
        "requests_remaining": max(0, get_usage(project_id)["max_requests"] - get_usage(project_id)["requests_used"]),
        "generated_with": "Ldcn AI Boost"
    }


@router.post("/projects/{project_id}/ai/generate-docs")
def ai_generate_docs(project_id: str, req: GenerateDocsRequest):
    """Gera documentação avançada."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    can_use, status_info = check_limit(project_id)
    if not can_use:
        raise HTTPException(status_code=403, detail=status_info.get("error", "Limite atingido"))
    
    project_context = {
        "name": project.get("name"),
        "stack": project.get("stack"),
        "type": project.get("type")
    }
    
    result = generate_docs(req.code, project_context)
    
    if result.get("success"):
        increment_usage(project_id)
    
    return {
        **result,
        "requests_used": get_usage(project_id)["requests_used"],
        "requests_remaining": max(0, get_usage(project_id)["max_requests"] - get_usage(project_id)["requests_used"]),
        "generated_with": "Ldcn AI Boost"
    }


@router.post("/projects/{project_id}/ai/chat")
def ai_chat(project_id: str, req: ChatRequest):
    """Assistente IA para dúvidas sobre o projeto."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    can_use, status_info = check_limit(project_id)
    if not can_use:
        raise HTTPException(status_code=403, detail=status_info.get("error", "Limite atingido"))
    
    project_context = {
        "name": project.get("name"),
        "stack": project.get("stack"),
        "type": project.get("type"),
        "path": project.get("path")
    }
    
    result = chat_with_project(req.prompt, project_context)
    
    if result.get("success"):
        increment_usage(project_id)
    
    return {
        **result,
        "requests_used": get_usage(project_id)["requests_used"],
        "requests_remaining": max(0, get_usage(project_id)["max_requests"] - get_usage(project_id)["requests_used"]),
        "generated_with": "Ldcn AI Boost"
    }


@router.get("/usage/{project_id}")
def get_usage_info(project_id: str):
    """Retorna informações detalhadas de uso."""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    usage = get_usage(project_id)
    return {
        "project_id": project_id,
        "status": usage["status"],
        "plan": usage.get("plan"),
        "requests_used": usage["requests_used"],
        "max_requests": usage["max_requests"],
        "requests_remaining": max(0, usage["max_requests"] - usage["requests_used"]),
        "last_used": usage.get("last_used"),
        "usage_percentage": round((usage["requests_used"] / usage["max_requests"]) * 100, 1) if usage["max_requests"] > 0 else 0,
        "limit_reached": usage["requests_used"] >= usage["max_requests"]
    }
