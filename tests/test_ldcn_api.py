from pathlib import Path
from time import sleep

import pytest
from fastapi.testclient import TestClient

from backend.app.ldcn import ldcn_router
from backend.app.ldcn.ldcn_memory import LdcnMemory
from backend.app.ldcn import orchestrator as ldcn_orchestrator_module
from backend.app.ldcn.memory.session_memory import LdcnSessionMemory
from backend.app.ldcn.specialist_agents import AGENT_REGISTRY, SpecialistAgent, SpecialistAgentResult
from backend.app.main import app


client = TestClient(app)


@pytest.fixture(autouse=True)
def isolate_ldcn_memory(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    original_memory = ldcn_router.orchestrator.memory
    ldcn_router.orchestrator.memory = LdcnSessionMemory(tmp_path / "ldcn_memory.json")
    monkeypatch.setattr(ldcn_router.orchestrator.master.reply_engine.llm_service, "is_available", lambda preferred_mode="local": False)
    monkeypatch.setattr(ldcn_router.orchestrator.master.planner.llm_service, "is_available", lambda preferred_mode="local": False)
    try:
        yield
    finally:
        ldcn_router.orchestrator.memory = original_memory


def test_ldcn_chat_create_project_contract():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "page": "/create",
            "project_id": None,
            "stack_id": None,
            "context": {"wizard_step": "idea"},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "create_project"
    assert "PromptMasterAgent" in data["agents_used"]
    assert "ArchitectureAgent" in data["agents_used"]
    assert any(action["type"] == "prefill_wizard" for action in data["suggested_actions"])
    assert data["actions"]


def test_ldcn_voice_download_intent_contract():
    response = client.post(
        "/api/ldcn/voice",
        json={
            "transcript": "Por que meu download falhou?",
            "page": "/downloads",
            "project_id": "proj_123",
            "stack_id": "fastapi",
            "locale": "pt-BR",
            "context": {"recent_errors": ["zip path not found"]},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "download_project"
    assert "DownloadAgent" in data["agents_used"]
    assert any(action["type"] == "open_download" for action in data["suggested_actions"])


def test_ldcn_unknown_intent_asks_natural_question():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "blz",
            "page": "/",
            "context": {"route": "/", "locale": "pt-BR"},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "unknown"
    assert "criar um projeto" in data["reply"].lower()
    assert data["conversation_turn_id"]


def test_ldcn_ai_health_contract():
    response = client.get("/api/ldcn/ai-health")
    data = response.json()

    assert response.status_code == 200
    assert {"provider", "model", "key_present", "last_latency_ms", "last_error", "mock_enabled"}.issubset(data.keys())


def test_ldcn_chat_use_template_with_context_contract():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "quero usar um template",
            "page": "/templates",
            "route": "/templates",
            "conversation_id": "conv_123",
            "turn_id": "turn_123",
            "history": [
                {"turn_id": "1", "role": "user", "message": "oi"},
                {"turn_id": "2", "role": "assistant", "message": "oi", "reply": "oi"},
            ],
            "context": {"route": "/templates", "page_title": "Templates", "selected_template": "banking-api-platform"},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "use_template"
    assert data["conversation_turn_id"] == "turn_123"
    assert data["context_summary"]["conversation_id"] == "conv_123"
    assert any(action["type"] == "navigate" for action in data["actions"])


def test_ldcn_memory_removes_sensitive_keys(tmp_path: Path):
    memory = LdcnMemory(tmp_path / "ldcn_memory.json")
    memory.remember(
        {
            "message": "validar projeto",
            "api_key": "sk-should-not-be-saved",
            "context": {
                "token": "secret-token",
                "safe": "ok",
            },
        }
    )

    raw = (tmp_path / "ldcn_memory.json").read_text(encoding="utf-8")
    assert "sk-should-not-be-saved" not in raw
    assert "secret-token" not in raw
    assert '"safe": "ok"' in raw


def test_ldcn_webhook_contract():
    response = client.post(
        "/api/ldcn/webhook",
        json={
            "query": "quero melhorar a ui",
            "session_id": "sess_jarvis",
            "metadata": {
                "route": "/settings",
                "page": "/settings",
                "last_error": None,
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "improve_ui"
    assert "UIUXAgent" in data["agents_used"]


def test_ldcn_tts_fallback_contract(monkeypatch):
    monkeypatch.setattr(
        ldcn_router.tts_service,
        "synthesize",
        lambda text, locale="pt-BR": {
            "success": False,
            "provider": "browser",
            "fallback_text": text,
        },
    )
    response = client.post(
        "/api/ldcn/tts",
        json={
            "text": "Teste de voz do LDCN.",
            "locale": "pt-BR",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "provider" in data
    assert "fallback_text" in data


def test_ldcn_contextual_conversation_keeps_topic():
    conversation_id = "conv_clinica_contextual"

    first = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "conversation_id": conversation_id,
            "route": "/wizard/static-site",
            "page": "Static Site Wizard",
            "page_title": "Static Site Wizard",
            "context": {
                "route": "/wizard/static-site",
                "wizard_step": "1",
                "active_stack_id": "static_site",
            },
        },
    )
    assert first.status_code == 200
    first_data = first.json()
    assert first_data["intent"] == "create_project"
    assert first_data["context_summary"]["conversation_state"] in {"collecting_requirements", "filling_wizard"}

    second = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero enterprise",
            "conversation_id": conversation_id,
            "route": "/wizard/static-site",
            "page": "Static Site Wizard",
            "page_title": "Static Site Wizard",
            "context": {
                "route": "/wizard/static-site",
                "wizard_step": "2",
                "active_stack_id": "static_site",
            },
        },
    )
    assert second.status_code == 200
    second_data = second.json()
    assert second_data["intent"] in {"continue_project", "continue_wizard", "create_project"}
    assert "clinica" in second_data["reply"].lower()
    assert "enterprise" in second_data["reply"].lower()

    third = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Pode preencher",
            "conversation_id": conversation_id,
            "route": "/wizard/static-site",
            "page": "Static Site Wizard",
            "page_title": "Static Site Wizard",
            "context": {
                "route": "/wizard/static-site",
                "wizard_step": "3",
                "active_stack_id": "static_site",
            },
        },
    )
    assert third.status_code == 200
    third_data = third.json()
    assert "clinica" in third_data["reply"].lower()
    assert any(action["type"] == "prefill_wizard" for action in third_data["suggested_actions"])


def test_ldcn_voice_reply_is_short_and_uses_error_context():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Por que deu erro?",
            "source": "voice",
            "conversation_id": "conv_voice_error",
            "route": "/downloads",
            "page": "Downloads",
            "page_title": "Downloads",
            "last_error": "zip path not found",
            "context": {
                "route": "/downloads",
                "last_error": "zip path not found",
                "download_status": "failed",
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] in {"fix_error", "download_project"}
    assert "zip path not found" in data["reply"].lower()
    assert data["source"] == "voice"


def test_ldcn_remembers_clinic_context():
    conversation_id = "conv_clinic_memory"
    client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "conversation_id": conversation_id,
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
            "context": {"route": "/wizard"},
        },
    )
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Enterprise",
            "conversation_id": conversation_id,
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
            "context": {"route": "/wizard", "wizard_step": "2"},
        },
    )
    data = response.json()
    assert response.status_code == 200
    assert "clinica" in data["reply"].lower()
    assert "spring boot" in data["reply"].lower()


def test_ldcn_voice_reply_is_short():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica enterprise",
            "source": "voice",
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
            "context": {"route": "/wizard"},
        },
    )
    data = response.json()
    sentences = [chunk.strip() for chunk in data["reply"].replace("!", ".").replace("?", ".").split(".") if chunk.strip()]
    assert len(sentences) <= 3


def test_ldcn_does_not_repeat_previous_reply():
    conversation_id = "conv_no_repeat"
    first = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "conversation_id": conversation_id,
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
        },
    ).json()
    second = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "conversation_id": conversation_id,
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
        },
    ).json()
    assert first["reply"] != second["reply"]


def test_ldcn_uses_last_error():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Isso falhou",
            "route": "/downloads",
            "page": "Downloads",
            "page_title": "Downloads",
            "last_error": "zip service unavailable",
            "context": {"route": "/downloads", "last_error": "zip service unavailable"},
        },
    )
    data = response.json()
    assert "zip service unavailable" in data["reply"].lower()


def test_ldcn_actions_match_intent():
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
        },
    )
    data = response.json()
    action_types = {action["type"] for action in data["suggested_actions"]}
    assert "prefill_wizard" in action_types
    assert "generate_project" in action_types


def test_ldcn_uses_local_llm_when_available(monkeypatch):
    monkeypatch.setattr(ldcn_router.orchestrator.master.reply_engine.llm_service, "is_available", lambda preferred_mode="local": True)
    monkeypatch.setattr(ldcn_router.orchestrator.master.planner.llm_service, "is_available", lambda preferred_mode="local": True)
    monkeypatch.setattr(
        ldcn_router.orchestrator.master.reply_engine.llm_service,
        "generate",
        lambda prompt, system_instruction, preferred_mode="local", project_context=None, **kwargs: {
            "success": True,
            "provider": "openai",
            "response": "Entendi. Vou manter o contexto da clinica e preparar o proximo passo sem perder o fio.",
        },
    )

    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
        },
    )
    data = response.json()
    assert response.status_code == 200
    assert "clinica" in data["reply"].lower()
    assert data["context_summary"]["reply_provider"] == "openai"


def test_ldcn_debug_conversation_exposes_reply_provider():
    conversation_id = "conv_debug_provider"
    first = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "conversation_id": conversation_id,
            "route": "/wizard",
            "page": "Wizard",
            "page_title": "Wizard",
        },
    )
    assert first.status_code == 200

    response = client.get(f"/api/ldcn/debug/conversation/{conversation_id}")
    data = response.json()
    assert response.status_code == 200
    assert data["conversation_id"] == conversation_id
    assert data["total_turns"] >= 1
    assert data["turns"][-1]["reply_provider"] in {"local", "openai", "gemini"}


def test_ldcn_returns_partial_when_llm_times_out(monkeypatch):
    monkeypatch.setattr(ldcn_router.orchestrator.master.reply_engine.llm_service, "is_available", lambda preferred_mode="local": True)
    monkeypatch.setattr(ldcn_router.orchestrator.master.planner.llm_service, "is_available", lambda preferred_mode="local": True)
    monkeypatch.setattr(
        ldcn_router.orchestrator.master.reply_engine.llm_service,
        "generate",
        lambda *args, **kwargs: {
            "success": False,
            "provider": "openai",
            "response": "",
            "error_type": "timeout",
        },
    )

    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero criar um sistema de clinica",
            "route": "/wizard/static-site",
            "page": "Static Site Wizard",
            "page_title": "Static Site Wizard",
            "context": {
                "route": "/wizard/static-site",
                "wizard_step": "3",
                "active_stack_id": "static_site",
            },
        },
    )
    data = response.json()

    assert response.status_code == 200
    assert data["status"] == "partial"
    assert data["partial"] is True
    assert data["fallback_used"] is True
    assert "modo ia premium demorou" in data["reply"].lower()
    assert "static site wizard" in data["reply"].lower()
    assert "prompt master" in data["reply"].lower()


def test_ldcn_responds_usefully_when_llm_is_unavailable(monkeypatch):
    monkeypatch.setattr(ldcn_router.orchestrator.master.reply_engine.llm_service, "is_available", lambda preferred_mode="local": True)
    monkeypatch.setattr(ldcn_router.orchestrator.master.planner.llm_service, "is_available", lambda preferred_mode="local": True)
    monkeypatch.setattr(
        ldcn_router.orchestrator.master.reply_engine.llm_service,
        "generate",
        lambda *args, **kwargs: {
            "success": False,
            "provider": "openai",
            "response": "",
            "error_type": "unavailable",
            "error": "provider disabled",
        },
    )

    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero validar esse projeto",
            "route": "/validation-center",
            "page": "Validation Center",
            "page_title": "Validation Center",
            "context": {
                "route": "/validation-center",
                "last_error": "lint failed",
            },
        },
    )
    data = response.json()

    assert response.status_code == 200
    assert "modo ia premium falhou" in data["reply"].lower()
    assert "validation center" in data["reply"].lower()
    assert "erro atual" in data["reply"].lower() or "lint failed" in data["reply"].lower()


def test_ldcn_returns_partial_when_agent_times_out(monkeypatch):
    class SlowSecurityAgent(SpecialistAgent):
        name = "SecurityAgent"

        def run(self, context):  # type: ignore[override]
            sleep(6)
            return SpecialistAgentResult(agent_name=self.name, summary="late")

    monkeypatch.setattr(ldcn_router.orchestrator.master.dispatcher, "dispatch", lambda intent, context: ["ArchitectureAgent", "SecurityAgent"])
    monkeypatch.setitem(AGENT_REGISTRY, "SecurityAgent", SlowSecurityAgent())
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Valide esse projeto",
            "route": "/validation-center",
            "page": "Validation Center",
            "page_title": "Validation Center",
            "context": {"security_review": True},
        },
    )

    data = response.json()
    assert response.status_code == 200
    assert data["partial"] is True
    assert any("securityagent" in warning.lower() for warning in data["warnings"])
    assert "ArchitectureAgent" in data["agents_used"]


def test_ldcn_chat_respects_global_timeout_budget(monkeypatch):
    original_run_specialists = ldcn_router.orchestrator.master._run_specialists

    def delayed_run_specialists(*args, **kwargs):
        sleep(0.1)
        return original_run_specialists(*args, **kwargs)

    monkeypatch.setattr(ldcn_router.orchestrator.master, "_run_specialists", delayed_run_specialists)
    monkeypatch.setattr(ldcn_orchestrator_module, "GLOBAL_TIMEOUT_SECONDS", 0.05)
    response = client.post(
        "/api/ldcn/chat",
        json={
            "message": "Quero entender essa tela",
            "route": "/create",
            "page": "Create",
            "page_title": "Create",
        },
    )
    data = response.json()

    assert response.status_code == 200
    assert data["status"] == "partial"
    assert data["partial"] is True
    assert data["timing"]["global_timeout_seconds"] == 0.05
    assert data["timing"]["total_seconds"] >= 0.05
