from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class IntentMatch:
    intent: str
    score: int = 0


class LdcnIntentClassifier:
    """Deterministic intent classifier for LDCN/Vens."""

    INTENTS = {
        "create_project",
        "continue_wizard",
        "continue_project",
        "explain_current_page",
        "explain_page",
        "explain_screen",
        "fix_error",
        "download_project",
        "use_template",
        "validate_project",
        "choose_stack",
        "generate_project",
        "activate_agent_boost",
        "improve_ui",
        "navigate",
        "small_talk",
        "unknown",
    }

    KEYWORDS: list[tuple[str, tuple[str, ...]]] = [
        ("fix_error", ("erro", "falha", "bug", "quebrou", "exception", "traceback", "travou", "nao funciona")),
        ("download_project", ("download", "baixar", "zip", "arquivo", "exportar")),
        ("use_template", ("template", "modelo", "galeria", "marketplace")),
        ("validate_project", ("validar", "validacao", "quality", "auditar", "checagem")),
        ("validate_project", ("seguranca", "security review", "security", "compliance")),
        ("choose_stack", ("stack", "spring", "fastapi", "nestjs", "react", "next", "vue", "angular", "laravel", "dotnet", "blazor")),
        ("explain_page", ("arquitetura", "architecture", "explica a arquitetura", "explicar arquitetura")),
        ("explain_screen", ("explica a tela", "explica essa tela", "explica esta tela", "entender essa tela")),
        ("generate_project", ("gerar agora", "gera agora", "gerar projeto", "criar projeto", "montar projeto")),
        ("activate_agent_boost", ("agent boost", "boost", "modo agente", "modo premium", "pago")),
        ("improve_ui", ("ui", "ux", "layout", "visual", "design", "melhorar a interface", "melhorar ui", "melhorar ux")),
        ("explain_page", ("o que tem aqui", "explica esta pagina", "explica essa pagina", "mostrar contexto", "me explica essa tela", "explicar essa tela")),
        ("create_project", ("criar", "construir", "iniciar", "montar", "novo projeto", "projeto novo", "app", "sistema", "saas")),
        ("continue_project", ("continuar projeto", "seguir projeto", "retomar projeto")),
        ("navigate", ("navegar", "abrir", "ir para", "vai para", "leva para", "tela", "pagina")),
        ("continue_wizard", ("continuar", "seguir", "proximo passo", "voltar ao wizard", "wizard")),
        ("small_talk", ("oi", "ola", "bom dia", "boa tarde", "boa noite", "obrigado", "valeu", "tudo bem")),
    ]

    def classify(self, message: str, page: str = "/", page_context: dict[str, object] | None = None) -> str:
        text = self._normalize(message)
        context = page_context or {}

        if not text:
            return "unknown"

        if any(token in text for token in ("ei ldcn", "ei vens", "vens", "jarvis", "javis", "ldcn")):
            if len(text.split()) <= 3:
                return "small_talk"

        for intent, keywords in self.KEYWORDS:
            if any(keyword in text for keyword in keywords):
                return intent

        if self._looks_like_affirmation(text):
            if page.startswith("/wizard"):
                return "continue_wizard"
            if page.startswith("/templates"):
                return "use_template"
            if page.startswith("/downloads"):
                return "download_project"
            if page.startswith("/validation"):
                return "validate_project"
            return "small_talk"

        if page.startswith("/wizard"):
            return "continue_wizard"
        if page.startswith("/templates"):
            return "use_template"
        if page.startswith("/downloads"):
            return "download_project"
        if page.startswith("/validation"):
            return "validate_project"
        if page.startswith("/create"):
            return "create_project"
        if "selected_template" in context:
            return "use_template"
        if context.get("last_error") or context.get("recent_errors"):
            return "fix_error"
        if context.get("active_project") or context.get("active_project_id"):
            return "continue_project"
        return "unknown"

    def _normalize(self, message: str) -> str:
        text = (message or "").lower().strip()
        text = text.replace("?", " ").replace("!", " ")
        text = " ".join(text.split())
        return text

    def _looks_like_affirmation(self, text: str) -> bool:
        return text in {"sim", "s", "ok", "okay", "beleza", "pode", "vamos", "certo", "isso", "claro"}
