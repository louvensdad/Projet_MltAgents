from __future__ import annotations

from backend.app.ldcn.ldcn_context import LdcnContext


INTENT_AGENTS = {
    "create_project": ["PromptMasterAgent", "ArchitectureAgent", "StackAgent"],
    "choose_stack": ["StackRegistryAgent", "ArchitectureAgent"],
    "explain_architecture": ["ArchitectureAgent", "EngineeringAnalyzerAgent", "DocumentationAgent"],
    "fix_error": ["EngineeringAnalyzerAgent", "QualityAgent"],
    "validate_project": ["QualityAgent", "SecurityAgent", "EngineeringAnalyzerAgent"],
    "use_template": ["TemplateAgent", "PromptMasterAgent"],
    "generate_prompt_master": ["PromptMasterAgent", "DocumentationAgent"],
    "download_project": ["DownloadAgent", "QualityAgent"],
    "improve_ui": ["UIUXAgent", "FrontendAgent"],
    "security_review": ["SecurityAgent", "QualityAgent"],
    "billing_agent_boost": ["DevOpsAgent", "PerformanceAgent"],
    "general_help": ["PromptMasterAgent"],
}


class LdcnAgentDispatcher:
    """Maps Vens intents to the internal agents that should own the answer."""

    def dispatch(self, intent: str, context: LdcnContext) -> list[str]:
        agents = list(INTENT_AGENTS.get(intent, INTENT_AGENTS["general_help"]))
        stack_agent = self._stack_agent(context.stack_id)
        if stack_agent and intent in {"create_project", "choose_stack", "validate_project"}:
            agents.append(stack_agent)
        return _dedupe(agents)

    def _stack_agent(self, stack_id: str | None) -> str | None:
        if not stack_id:
            return None
        mapping = {
            "static_site": "StaticSiteAgent",
            "springboot": "SpringBootAgent",
            "spring_boot": "SpringBootAgent",
            "fastapi": "FastAPIAgent",
            "nestjs": "NestJSAgent",
            "express": "ExpressAgent",
            "laravel": "LaravelAgent",
            "dotnet": "DotnetAgent",
            "angular": "AngularAgent",
            "react": "ReactAgent",
            "nextjs": "NextJSAgent",
            "vue": "VueAgent",
            "blazor": "BlazorAgent",
            "automation": "AutomationAgent",
            "ai_agents": "AIAgentsAgent",
        }
        return mapping.get(stack_id.replace("-", "_").lower())


def _dedupe(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
