from __future__ import annotations

from backend.app.ldcn.schemas import LdcnContext


INTENT_AGENTS = {
    "create_project": ["ProjectCreationAgent", "PromptMasterAgent", "ArchitectureAgent"],
    "continue_wizard": ["ProjectCreationAgent", "PromptMasterAgent", "ArchitectureAgent"],
    "continue_project": ["ProjectCreationAgent", "PromptMasterAgent", "ArchitectureAgent"],
    "explain_current_page": ["DocumentationAgent", "ArchitectureAgent"],
    "explain_page": ["DocumentationAgent", "ArchitectureAgent"],
    "explain_screen": ["DocumentationAgent", "ArchitectureAgent"],
    "fix_error": ["ErrorFixAgent", "GatekeeperAgent"],
    "download_project": ["DownloadAgent"],
    "use_template": ["TemplateAgent"],
    "validate_project": ["GatekeeperAgent", "SecurityAgent", "StackAgent"],
    "choose_stack": ["StackAgent", "ArchitectureAgent"],
    "generate_project": ["ProjectCreationAgent", "GatekeeperAgent"],
    "activate_agent_boost": ["AgentBoostAgent"],
    "improve_ui": ["UIUXAgent"],
    "navigate": ["DocumentationAgent"],
    "small_talk": ["PromptMasterAgent"],
    "unknown": ["PromptMasterAgent"],
}


class LdcnAgentDispatcher:
    """Maps intents to the internal agents that should own the answer."""

    def dispatch(self, intent: str, context: LdcnContext) -> list[str]:
        agents = list(INTENT_AGENTS.get(intent, INTENT_AGENTS["unknown"]))
        if intent in {"create_project", "continue_wizard", "continue_project", "choose_stack", "validate_project", "generate_project"}:
            agents.append("StackAgent")
        if context.download_status and intent == "download_project":
            agents.insert(0, "DownloadAgent")
        if context.last_error and intent == "fix_error":
            agents.insert(0, "ErrorFixAgent")
        if context.context.get("security_review"):
            agents.append("SecurityAgent")
        return _dedupe(agents)


def _dedupe(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
