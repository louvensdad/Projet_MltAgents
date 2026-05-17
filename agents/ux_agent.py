from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from design_intelligence import infer_ux_intelligence


class UXAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="UXAgent",
            role="Definir jornada, regras de usabilidade e fluxo principal da experiencia."
        )

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.user_idea or context.project_name)

        ux = infer_ux_intelligence(
            project_name=context.project_name,
            description=context.user_idea,
            design_brief=context.design_brief,
            project_type=context.project_brief.get("Tipo", context.project_mode),
        )
        context.ux_rules = ux["ux_rules"]
        context.ux_flow = ux["ux_flow"]
        context.artifacts["ux"] = ux

        response = (
            "UX intelligence criada com sucesso: "
            f"jornada={ux['user_journey']} | fluxo={'; '.join(ux['ux_flow'])}"
        )
        self.log(response)
        return response

