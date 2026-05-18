from __future__ import annotations

from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator


class LdcnAction(BaseModel):
    type: str
    label: str
    href: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    requires_confirmation: bool = False


class LdcnConversationTurn(BaseModel):
    turn_id: str = Field(default_factory=lambda: uuid4().hex)
    message: str
    reply: str = ""
    intent: str = "unknown"
    agents_used: list[str] = Field(default_factory=list)
    route: str = "/"
    page_context: dict[str, Any] = Field(default_factory=dict)
    source: str = "chat"


class LdcnChatRequest(BaseModel):
    message: str | None = None
    query: str | None = None
    source: str = "text"
    page: str = "/"
    page_title: str | None = None
    route: str | None = None
    conversation_id: str | None = None
    turn_id: str | None = None
    project_id: str | None = None
    active_stack_id: str | None = None
    stack_id: str | None = None
    user_id: str | None = None
    session_id: str | None = None
    client_turn_id: str | None = None
    page_context: dict[str, Any] = Field(default_factory=dict)
    history: list[dict[str, Any]] = Field(default_factory=list)
    conversation_history: list[dict[str, Any]] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)
    locale: str = "pt-BR"
    mode: str = "local_build"
    last_error: str | None = None
    active_project: str | None = None
    wizard_step: str | None = None
    last_generation_result: str | None = None

    @model_validator(mode="after")
    def ensure_message(self) -> "LdcnChatRequest":
        resolved = (self.message or self.query or "").strip()
        self.message = resolved
        return self


class LdcnVoiceRequest(BaseModel):
    transcript: str
    source: str = "voice"
    page: str = "/"
    page_title: str | None = None
    route: str | None = None
    conversation_id: str | None = None
    turn_id: str | None = None
    project_id: str | None = None
    active_stack_id: str | None = None
    stack_id: str | None = None
    user_id: str | None = None
    session_id: str | None = None
    client_turn_id: str | None = None
    page_context: dict[str, Any] = Field(default_factory=dict)
    history: list[dict[str, Any]] = Field(default_factory=list)
    conversation_history: list[dict[str, Any]] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)
    locale: str = "pt-BR"
    mode: str = "local_build"
    last_error: str | None = None
    active_project: str | None = None
    wizard_step: str | None = None
    last_generation_result: str | None = None


class LdcnWebhookRequest(BaseModel):
    query: str
    session_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    locale: str = "pt-BR"


class LdcnTTSRequest(BaseModel):
    text: str
    locale: str = "pt-BR"


class LdcnContext(BaseModel):
    message: str
    source: str = "text"
    page: str = "/"
    page_title: str | None = None
    route: str = "/"
    conversation_id: str = Field(default_factory=lambda: uuid4().hex)
    active_stack_id: str | None = None
    project_id: str | None = None
    stack_id: str | None = None
    user_id: str | None = None
    session_id: str | None = None
    client_turn_id: str | None = None
    turn_id: str = Field(default_factory=lambda: uuid4().hex)
    page_context: dict[str, Any] = Field(default_factory=dict)
    conversation_history: list[dict[str, Any]] = Field(default_factory=list)
    locale: str = "pt-BR"
    mode: str = "local_build"
    context: dict[str, Any] = Field(default_factory=dict)
    recent_errors: list[str] = Field(default_factory=list)
    wizard_step: str | None = None
    selected_template: str | None = None
    last_error: str | None = None
    active_project: str | None = None
    last_generation_result: str | None = None
    backend_status: str | None = None
    download_status: str | None = None
    conversation_state: str | None = None
    conversation_summary: dict[str, Any] = Field(default_factory=dict)

    @classmethod
    def from_chat(cls, payload: LdcnChatRequest) -> "LdcnContext":
        context = _merge_context(payload.context, payload.page_context)
        route = payload.route or context.get("route") or payload.page or "/"
        history = _as_history(
            payload.history
            or payload.conversation_history
            or context.get("history")
            or context.get("conversation_history")
        )
        conversation_id = (
            payload.conversation_id
            or context.get("conversation_id")
            or payload.session_id
            or context.get("session_id")
            or uuid4().hex
        )
        turn_id = payload.turn_id or payload.client_turn_id or context.get("turn_id") or uuid4().hex
        return cls(
            message=payload.message.strip(),
            source=payload.source or str(context.get("source") or "text"),
            page=payload.page or route or "/",
            page_title=payload.page_title or context.get("page_title") or context.get("title"),
            route=route,
            conversation_id=str(conversation_id),
            active_stack_id=payload.active_stack_id or payload.stack_id or context.get("active_stack_id") or context.get("stack_id"),
            project_id=payload.project_id or context.get("project_id"),
            stack_id=payload.stack_id or context.get("stack_id"),
            user_id=payload.user_id or context.get("user_id") or context.get("sub"),
            session_id=payload.session_id or context.get("session_id"),
            client_turn_id=payload.client_turn_id or context.get("client_turn_id"),
            turn_id=str(turn_id),
            page_context={**context, **payload.page_context, "page_title": payload.page_title or context.get("page_title")},
            conversation_history=history,
            locale=payload.locale or context.get("locale", "pt-BR"),
            mode=payload.mode or context.get("mode", "local_build"),
            context=context,
            recent_errors=_as_list(payload.last_error or context.get("last_error") or context.get("recent_errors") or context.get("errors")),
            wizard_step=payload.wizard_step or str(context.get("wizard_step") or context.get("step") or "") or None,
            selected_template=str(context.get("selected_template") or context.get("template_id") or "") or None,
            last_error=payload.last_error or context.get("last_error"),
            active_project=payload.active_project or context.get("active_project"),
            last_generation_result=payload.last_generation_result or str(context.get("last_generation_result") or context.get("generation_result") or "") or None,
            backend_status=str(context.get("backend_status") or context.get("system_status") or "") or None,
            download_status=str(context.get("download_status") or context.get("downloads_status") or "") or None,
            conversation_state=str(context.get("conversation_state") or "") or None,
            conversation_summary=context.get("conversation_summary") if isinstance(context.get("conversation_summary"), dict) else {},
        )

    @classmethod
    def from_voice(cls, payload: LdcnVoiceRequest) -> "LdcnContext":
        return cls.from_chat(
            LdcnChatRequest(
                message=payload.transcript,
                page=payload.page,
                page_title=payload.page_title,
                route=payload.route,
                conversation_id=payload.conversation_id,
                turn_id=payload.turn_id,
                project_id=payload.project_id,
                active_stack_id=payload.active_stack_id,
                stack_id=payload.stack_id,
                user_id=payload.user_id,
                session_id=payload.session_id,
                client_turn_id=payload.client_turn_id,
                page_context=payload.page_context,
                history=payload.history,
                conversation_history=payload.conversation_history,
                context=payload.context,
                locale=payload.locale,
                mode=payload.mode,
                last_error=payload.last_error,
                active_project=payload.active_project,
                wizard_step=payload.wizard_step,
                last_generation_result=payload.last_generation_result,
            )
        )


class LdcnResponse(BaseModel):
    success: bool = True
    status: str = "success"
    partial: bool = False
    fallback_used: bool = False
    reply: str
    intent: str
    agents_used: list[str] = Field(default_factory=list)
    actions: list[LdcnAction] = Field(default_factory=list)
    suggested_actions: list[LdcnAction] = Field(default_factory=list)
    ui_actions: list[LdcnAction] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    quick_reply: str | None = None
    timing: dict[str, Any] = Field(default_factory=dict)
    context_summary: dict[str, Any] = Field(default_factory=dict)
    conversation_turn_id: str | None = None
    should_pause_listening: bool = True
    source: str = "chat"


def _merge_context(*contexts: dict[str, Any] | None) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for context in contexts:
        if isinstance(context, dict):
            merged.update(context)
    return merged


def _as_list(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if item]
    return [str(value)]


def _as_history(value: Any) -> list[dict[str, Any]]:
    if not value or not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]
