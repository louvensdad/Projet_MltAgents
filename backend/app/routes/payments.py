from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services import payment_service

router = APIRouter(prefix="/api/payments", tags=["payments"])

class CheckoutRequest(BaseModel):
    project_id: str
    plan: str = "basic"

class MockConfirmRequest(BaseModel):
    project_id: str

@router.post("/create-checkout")
def create_checkout(req: CheckoutRequest):
    result = payment_service.create_checkout(req.project_id, req.plan)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/mock-confirm")
def mock_confirm(req: MockConfirmRequest):
    result = payment_service.mock_confirm(req.project_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    # Also activate agent_boost_status when payment is confirmed
    payment_service.update_project(req.project_id, {
        "agent_boost_status": "active",
    })
    return result

@router.get("/status/{project_id}")
def payment_status(project_id: str):
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "project_id": project_id,
        "payment_status": project.get("payment_status", "pending_payment"),
        "download_status": project.get("download_status", "locked")
    }


@router.get("/generation-access/{project_id}")
def generation_access(project_id: str):
    """Verifica status combinado de pagamento e Agent Boost para geracao."""
    import os
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    payment_status = project.get("payment_status", "pending_payment")
    agent_boost_status = project.get("agent_boost_status", "inactive")
    platform_key_exists = bool(os.getenv("GEMINI_API_KEY", "").strip())

    # Determine generation mode
    if payment_status == "paid" and agent_boost_status == "active" and platform_key_exists:
        generation_mode = "agent_boost_100"
        agent_boost_allowed = True
        reason = "Agent Boost disponivel"
    elif not platform_key_exists:
        generation_mode = "local_build_90"
        agent_boost_allowed = False
        reason = "Agent Boost temporariamente indisponivel. Voce pode continuar com Local Build 90%."
    elif payment_status != "paid":
        generation_mode = "local_build_90"
        agent_boost_allowed = False
        reason = "Pagamento nao confirmado. Agent Boost requer pagamento ativo."
    else:
        generation_mode = "local_build_90"
        agent_boost_allowed = False
        reason = "Agent Boost nao esta ativo para este projeto."

    return {
        "project_id": project_id,
        "payment_status": payment_status,
        "agent_boost_status": agent_boost_status,
        "agent_boost_allowed": agent_boost_allowed,
        "generation_mode": generation_mode,
        "reason": reason,
        "api_key_source": "platform_backend",
        "api_key_exposed": False,
    }
