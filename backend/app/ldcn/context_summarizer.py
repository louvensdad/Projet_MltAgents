from __future__ import annotations

from typing import Any

from backend.app.ldcn.schemas import LdcnContext


class LdcnContextSummarizer:
    def summarize(
        self,
        context: LdcnContext,
        memory_snapshot: dict[str, Any],
        specialist_summaries: list[str],
        agents_used: list[str],
    ) -> dict[str, Any]:
        return {
            "message": context.message,
            "route": context.route,
            "page": context.page,
            "page_title": context.page_title,
            "wizard_step": context.wizard_step,
            "active_stack_id": context.active_stack_id,
            "active_stack_label": self._stack_label(str(context.active_stack_id or memory_snapshot.get("selected_stack") or context.stack_id or "")),
            "active_project": context.active_project or context.project_id,
            "last_error": context.last_error,
            "conversation_summary": str(memory_snapshot.get("summary", ""))[:240],
            "goal": memory_snapshot.get("goal", ""),
            "domain": memory_snapshot.get("domain", ""),
            "selected_stack": memory_snapshot.get("selected_stack", ""),
            "pending_question": memory_snapshot.get("pending_question", ""),
            "known_entities": memory_snapshot.get("known_entities", []),
            "known_features": memory_snapshot.get("known_features", []),
            "last_user_intent": memory_snapshot.get("last_user_intent", ""),
            "last_action": memory_snapshot.get("last_action", {}),
            "history": self._compact_history(context.conversation_history[-6:]),
            "specialist_summaries": specialist_summaries[:3],
            "agents_used": agents_used,
            "locale": context.locale,
            "source": context.source,
            "conversation_state": context.conversation_state,
        }

    def _compact_history(self, history: list[dict[str, Any]]) -> list[dict[str, str]]:
        compact: list[dict[str, str]] = []
        for turn in history:
            if not isinstance(turn, dict):
                continue
            compact.append(
                {
                    "role": str(turn.get("role") or "unknown"),
                    "message": str(turn.get("message") or turn.get("reply") or "")[:160],
                }
            )
        return compact

    def _stack_label(self, stack: str) -> str:
        labels = {
            "spring_boot": "Spring Boot",
            "fastapi": "FastAPI",
            "static_site": "Static Site",
            "nextjs": "Next.js",
            "react": "React",
        }
        normalized = stack.strip().lower()
        return labels.get(normalized, normalized.replace("_", " ").title()) if normalized else ""
