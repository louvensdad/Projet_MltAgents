from __future__ import annotations

from backend.app.ldcn.schemas import LdcnAction, LdcnContext, LdcnResponse


class LdcnResponseBuilder:
    def build(
        self,
        context: LdcnContext,
        intent: str,
        agents: list[str],
        reply: str,
        memory_snapshot: dict[str, object] | None = None,
    ) -> LdcnResponse:
        suggested_actions, ui_actions = self._actions(context, intent)
        specialist_summaries = context.context.get("specialist_summaries", [])
        return LdcnResponse(
            success=True,
            status=str(context.context.get("response_status") or "success"),
            partial=bool(context.context.get("response_partial")),
            fallback_used=bool(context.context.get("fallback_used")),
            reply=reply,
            intent=intent,
            agents_used=agents,
            actions=ui_actions or suggested_actions,
            suggested_actions=suggested_actions,
            ui_actions=ui_actions,
            warnings=list(context.context.get("response_warnings") or []),
            quick_reply=str(context.context.get("quick_reply") or "") or None,
            timing=context.context.get("timing") if isinstance(context.context.get("timing"), dict) else {},
            context_summary={
                "page": context.page,
                "page_title": context.page_title,
                "route": context.route,
                "conversation_id": context.conversation_id,
                "turn_id": context.turn_id,
                "project_id": context.project_id,
                "active_stack_id": context.active_stack_id,
                "stack_id": context.stack_id,
                "mode": context.mode,
                "locale": context.locale,
                "wizard_step": context.wizard_step,
                "selected_template": context.selected_template,
                "recent_errors": context.recent_errors[:3],
                "last_error": context.last_error,
                "active_project": context.active_project,
                "last_generation_result": context.last_generation_result,
                "backend_status": context.backend_status,
                "download_status": context.download_status,
                "conversation_state": context.conversation_state,
                "conversation_summary": context.conversation_summary,
                "reply_provider": context.context.get("reply_provider", "local"),
                "specialist_summaries": specialist_summaries[:4] if isinstance(specialist_summaries, list) else [],
                "fallback_used": bool(context.context.get("fallback_used")),
                "response_warnings": list(context.context.get("response_warnings") or []),
            },
            conversation_turn_id=context.turn_id,
            should_pause_listening=True,
            source="voice" if context.source == "voice" or context.context.get("source") == "voice" else "chat",
        )

    def _actions(self, context: LdcnContext, intent: str) -> tuple[list[LdcnAction], list[LdcnAction]]:
        if intent in {"create_project", "generate_project"}:
            stack = self._recommended_stack(context.message, context.stack_id)
            href = f"/wizard/{stack.replace('_', '-')}" if stack else "/wizard"
            action = LdcnAction(type="navigate", label=f"Abrir wizard {self._stack_label(stack)}", href=href)
            prefill = LdcnAction(
                type="prefill_wizard",
                label="Preencher wizard",
                payload={
                    "idea": context.message,
                    "recommended_stack": stack,
                    "page_context": context.page_context,
                    "active_project": context.active_project or context.project_id,
                },
            )
            generate = LdcnAction(
                type="generate_project",
                label="Gerar projeto agora",
                payload={"turn_id": context.turn_id},
                requires_confirmation=True,
            )
            return [action, prefill, generate], [action, generate]

        if intent in {"continue_wizard", "continue_project"}:
            actions = [LdcnAction(type="navigate", label="Continuar wizard", href="/wizard")]
            if "preencher" in (context.message or "").lower():
                actions.append(
                    LdcnAction(
                        type="prefill_wizard",
                        label="Preencher wizard",
                        payload={
                            "idea": context.conversation_summary.get("goal") or context.message,
                            "recommended_stack": self._recommended_stack(
                                str(context.conversation_summary.get("goal") or context.message),
                                context.stack_id,
                            ),
                            "page_context": context.page_context,
                            "active_project": context.active_project or context.project_id,
                        },
                    )
                )
            return actions, []

        if intent == "choose_stack":
            return [LdcnAction(type="navigate", label="Abrir Templates", href="/templates")], []

        if intent == "use_template":
            return [LdcnAction(type="navigate", label="Abrir Templates", href="/templates")], []

        if intent == "explain_page":
            return [LdcnAction(type="navigate", label="Abrir contexto da pagina", href=context.route or context.page or "/")], []

        if intent == "download_project":
            href = f"/downloads/{context.project_id}" if context.project_id else "/downloads"
            return [LdcnAction(type="open_download", label="Abrir downloads", href=href)], []

        if intent == "validate_project":
            return [LdcnAction(type="run_validation", label="Validar projeto", payload={"project_id": context.project_id or ""})], []

        if intent == "fix_error":
            return [LdcnAction(type="navigate", label="Abrir Validation Center", href="/validation-center")], []

        if intent == "activate_agent_boost":
            return [LdcnAction(type="navigate", label="Abrir AI Models", href="/ai-models")], []

        if intent == "improve_ui":
            return [LdcnAction(type="navigate", label="Abrir Validation Center", href="/validation-center")], []

        if intent == "navigate":
            target = self._navigate_target(context)
            return [LdcnAction(type="navigate", label=target["label"], href=target["href"])], []

        return [], []

    def _recommended_stack(self, message: str, current_stack: str | None) -> str:
        if current_stack:
            return current_stack.replace("-", "_")
        text = (message or "").lower()
        if any(word in text for word in ("clinica", "erp", "financeiro", "gestao", "saude")):
            return "spring_boot"
        if any(word in text for word in ("landing", "site", "institucional", "pagina", "page")):
            return "static_site"
        if any(word in text for word in ("ia", "agent", "automacao", "api", "workflow")):
            return "fastapi"
        if any(word in text for word in ("dashboard", "painel", "portal")):
            return "nextjs"
        return "fastapi"

    def _stack_label(self, stack: str) -> str:
        labels = {
            "spring_boot": "Spring Boot",
            "fastapi": "FastAPI",
            "static_site": "Static Site",
            "nextjs": "Next.js",
            "react": "React",
        }
        return labels.get(stack, stack.replace("_", " ").title())

    def _has_project_context(self, context: LdcnContext) -> bool:
        return bool(context.active_project or context.project_id or context.stack_id)

    def _navigate_target(self, context: LdcnContext) -> dict[str, str]:
        page = (context.route or context.page).lower()
        if "template" in page:
            return {"href": "/templates", "label": "Abrir Templates"}
        if "download" in page:
            return {"href": "/downloads", "label": "Abrir Downloads"}
        if "wizard" in page:
            return {"href": "/wizard", "label": "Abrir Wizard"}
        if "validate" in page:
            return {"href": "/validation-center", "label": "Abrir Validation Center"}
        return {"href": "/create", "label": "Abrir Create"}
