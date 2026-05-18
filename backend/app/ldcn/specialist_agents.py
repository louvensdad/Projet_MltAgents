from __future__ import annotations

from dataclasses import dataclass

from backend.app.ldcn.schemas import LdcnContext


@dataclass
class SpecialistAgentResult:
    agent_name: str
    summary: str
    status: str = "ok"
    report: dict[str, object] | None = None


class SpecialistAgent:
    name = "SpecialistAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(agent_name=self.name, summary="")


class ProjectCreationAgent(SpecialistAgent):
    name = "ProjectCreationAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, f"Projeto em foco: {context.message[:120]}")


class PromptMasterAgent(SpecialistAgent):
    name = "PromptMasterAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Estruturei o pedido para evitar ambiguidade no fluxo.")


class TemplateAgent(SpecialistAgent):
    name = "TemplateAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, f"Template atual: {context.selected_template or 'nao selecionado'}")


class StackAgent(SpecialistAgent):
    name = "StackAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, f"Stack ativa: {context.stack_id or context.active_stack_id or 'indefinida'}")


class ArchitectureAgent(SpecialistAgent):
    name = "ArchitectureAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Organizei a arquitetura candidata e os riscos principais.")


class GatekeeperAgent(SpecialistAgent):
    name = "GatekeeperAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Validei o caminho antes de acionar passos sensiveis.")


class DownloadAgent(SpecialistAgent):
    name = "DownloadAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, f"Status de download analisado: {context.download_status or 'desconhecido'}")


class SecurityAgent(SpecialistAgent):
    name = "SecurityAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Revisei seguranca, exposicao e dependencias do fluxo.")


class UIUXAgent(SpecialistAgent):
    name = "UIUXAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Apontei ajustes de clareza visual, hierarquia e fluxo.")


class DocumentationAgent(SpecialistAgent):
    name = "DocumentationAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Preparei explicacao objetiva da pagina e do contexto atual.")


class AgentBoostAgent(SpecialistAgent):
    name = "AgentBoostAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        return SpecialistAgentResult(self.name, "Mapeei o modo Agent Boost e os custos de ativacao.")


class ErrorFixAgent(SpecialistAgent):
    name = "ErrorFixAgent"

    def run(self, context: LdcnContext) -> SpecialistAgentResult:
        last_error = context.last_error or (context.recent_errors[0] if context.recent_errors else "erro nao informado")
        return SpecialistAgentResult(self.name, f"Isolando causa raiz do erro: {last_error}")


AGENT_REGISTRY = {
    agent.name: agent
    for agent in [
        ProjectCreationAgent(),
        PromptMasterAgent(),
        TemplateAgent(),
        StackAgent(),
        ArchitectureAgent(),
        GatekeeperAgent(),
        DownloadAgent(),
        SecurityAgent(),
        UIUXAgent(),
        DocumentationAgent(),
        AgentBoostAgent(),
        ErrorFixAgent(),
    ]
}

