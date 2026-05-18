from __future__ import annotations

import logging

from fastapi import APIRouter, Request

from backend.app.security.jwt_manager import JWTManager

from backend.app.ldcn.schemas import LdcnChatRequest, LdcnContext, LdcnTTSRequest, LdcnVoiceRequest, LdcnWebhookRequest
from backend.app.ldcn.orchestrator import LdcnOrchestrator
from backend.app.ldcn.voice.tts_service import LdcnTTSService


router = APIRouter(prefix="/api/ldcn", tags=["ldcn"])
orchestrator = LdcnOrchestrator()
tts_service = LdcnTTSService()
logger = logging.getLogger(__name__)


def _resolve_user(request: Request) -> dict:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return {"sub": "anonymous", "role": "guest"}
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return {"sub": "anonymous", "role": "guest"}
    try:
        return JWTManager.verify_token(token)
    except Exception:
        return {"sub": "anonymous", "role": "guest"}


@router.post("/chat")
def ldcn_chat(request: Request, payload: LdcnChatRequest):
    current_user = _resolve_user(request)
    context = LdcnContext.from_chat(payload)
    context.user_id = context.user_id or current_user.get("sub")
    logger.info("ldcn.request.start route=/api/ldcn/chat conversation_id=%s source=%s page=%s", context.conversation_id, context.source, context.page)
    return orchestrator.chat(context).model_dump()


@router.post("/voice")
def ldcn_voice(request: Request, payload: LdcnVoiceRequest):
    current_user = _resolve_user(request)
    context = LdcnContext.from_voice(payload)
    context.user_id = context.user_id or current_user.get("sub")
    logger.info("ldcn.request.start route=/api/ldcn/voice conversation_id=%s source=%s page=%s", context.conversation_id, context.source, context.page)
    return orchestrator.chat(context).model_dump()


@router.post("/chat/stream")
def ldcn_chat_stream():
    return {
        "success": False,
        "status": "not_implemented",
        "message": "Streaming endpoint reservado para eventos: received, intent_detected, agent_started, agent_done e final_response.",
    }


@router.get("/ai-health")
def ldcn_ai_health():
    llm_service = orchestrator.master.reply_engine.llm_service
    payload = llm_service.health()
    payload["warnings"] = llm_service.config_diagnostics().get("warnings", [])
    return payload


@router.post("/webhook")
def ldcn_webhook(payload: LdcnWebhookRequest):
    context = LdcnContext.from_chat(
        LdcnChatRequest(
            query=payload.query,
            session_id=payload.session_id,
            locale=payload.locale,
            source="voice",
            context=payload.metadata,
            page=str(payload.metadata.get("route") or payload.metadata.get("page") or "/"),
            route=str(payload.metadata.get("route") or payload.metadata.get("page") or "/"),
        )
    )
    return orchestrator.chat(context).model_dump()


@router.post("/tts")
def ldcn_tts(payload: LdcnTTSRequest):
    return tts_service.synthesize(payload.text, locale=payload.locale)


@router.get("/debug/conversation/{conversation_id}")
def ldcn_debug_conversation(conversation_id: str):
    data = orchestrator.memory.store.load()
    sessions = data.get("sessions", []) if isinstance(data, dict) else []
    turns = [
        {
            "turn_id": session.get("turn_id"),
            "conversation_id": session.get("conversation_id"),
            "message": session.get("message"),
            "reply": session.get("reply"),
            "intent": session.get("intent"),
            "route": session.get("route"),
            "source": session.get("source"),
            "reply_provider": session.get("reply_provider", "local"),
            "conversation_state": session.get("conversation_state"),
            "timestamp": session.get("timestamp"),
        }
        for session in sessions
        if isinstance(session, dict) and str(session.get("conversation_id") or "") == conversation_id
    ]
    return {
        "conversation_id": conversation_id,
        "total_turns": len(turns),
        "turns": turns[-20:],
    }
