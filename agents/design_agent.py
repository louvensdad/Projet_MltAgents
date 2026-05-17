from .core.base_agent import BaseAgent
from .core.agent_context import AgentContext
from design_intelligence import infer_design_brief


class DesignAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="DesignAgent",
            role="Definir identidade visual, conceito e linguagem de interface para o projeto."
        )

    def run(self, context: AgentContext) -> str:
        self.validate_input(context.user_idea or context.project_name)

        brief = infer_design_brief(
            project_name=context.project_name,
            description=context.user_idea,
            project_type=context.project_brief.get("Tipo", context.project_mode),
            brief=context.project_brief,
        )
        context.design_brief = brief

        response = (
            "Design brief criado com sucesso: "
            f"{brief['niche']} | {brief['visual_concept']} | "
            f"paleta {', '.join(brief['color_palette'])}"
        )
        self.log(response)
        return response

