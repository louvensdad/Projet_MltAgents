import os
import sys
from pathlib import Path

from .agent_context import AgentContext


class Pipeline:
    """Official sequential agent pipeline."""

    def __init__(self, agents: list):
        self.agents = agents

    def run(
        self,
        project_name: str,
        user_idea: str,
        project_language: str = "Português",
        backend_stack: str = "Python + FastAPI",
        use_ai: bool = False,
        ai_generation_mode: str = "local_build_90",
        allow_mock_fallback: bool = True,
        max_ai_calls: int = 0,
        max_tokens_budget: int = 0,
        project_brief: dict | None = None,
        design_brief: dict | None = None,
        ux_rules: list | None = None,
        ux_flow: list | None = None,
        advanced_architecture: dict | None = None,
        automation: dict | None = None,
        integrations: dict | None = None,
        ai_payload: dict | None = None,
    ) -> AgentContext:
        project_brief = project_brief or {}
        design_brief = design_brief or {}
        ux_rules = ux_rules or []
        ux_flow = ux_flow or []
        advanced_architecture = advanced_architecture or {}
        automation = automation or {}
        integrations = integrations or {}
        ai_payload = ai_payload or {}

        context = AgentContext(
            project_name=project_name,
            user_idea=user_idea,
            project_language=project_language,
            backend_stack=backend_stack,
            use_ai=use_ai,
            ai_generation_mode=ai_generation_mode,
            allow_mock_fallback=allow_mock_fallback,
            max_ai_calls=max_ai_calls,
            max_tokens_budget=max_tokens_budget,
            ai_payload=ai_payload,
            project_mode=str(project_brief.get("Modo", "Guiado")).lower(),
            project_brief=project_brief,
            design_brief=design_brief,
            ux_rules=ux_rules,
            ux_flow=ux_flow,
            advanced_architecture=advanced_architecture,
            automation_level=automation.get("automation_level", "none"),
            automation_types=automation.get("automation_types", []),
            selected_agents=automation.get("selected_agents", []),
            integrations_required=integrations.get("external_integrations", []),
            env_variables=integrations.get("env_variables", []),
            requires_env_setup=automation.get("requires_env_setup", False) or bool(integrations.get("external_integrations", [])),
            demo_mode=integrations.get("demo_mode", True),
        )

        print(f"\n[Pipeline] Starting project: {project_name}")

        for agent in self.agents:
            try:
                agent.log("Iniciando execução...")
                output = agent.run(context)
                agent.validate_output(output)
            except Exception as exc:
                error_msg = f"Falha na execução do agente {agent.name}: {exc}"
                context.add_error(agent.name, error_msg)
                print(f"[Pipeline] Error: {error_msg}")

        print("\n[Pipeline] Building structured blueprint...")

        if not context.project_brief.get("Entidades"):
            print("[Pipeline] Critical error: no confirmed entities. Aborting generation.")
            context.add_error("Pipeline", "Nenhuma entidade confirmada pelo usuário.")
            return context

        try:
            root_dir = Path(__file__).resolve().parents[2]
            for candidate in (root_dir / "templates", root_dir / "prompt_engine"):
                candidate_str = str(candidate)
                if candidate_str not in sys.path:
                    sys.path.insert(0, candidate_str)
            from blueprints.blueprint_builder import build_blueprint
            from blueprints.blueprint_exporter import export_to_json, export_to_markdown
            from generators.backend.backend_generator_factory import BackendGeneratorFactory

            blueprint_data = build_blueprint(context)

            explicit_output_dir = project_brief.get("_project_output_dir")
            output_dir = explicit_output_dir or os.path.join(os.getcwd(), "generated_projects", project_name)
            os.makedirs(output_dir, exist_ok=True)

            json_path = os.path.join(output_dir, "blueprint.json")
            md_path = os.path.join(output_dir, "blueprint.md")

            export_to_json(blueprint_data, json_path)
            export_to_markdown(blueprint_data, md_path)

            context.blueprint = blueprint_data.model_dump()
            context.blueprint_path_json = json_path
            context.blueprint_path_md = md_path

            print("[Pipeline] Blueprint built and validated.")
            print(f"\n[Pipeline] Generating backend for stack: {context.backend_stack}")

            gen = BackendGeneratorFactory.get_generator(
                context.backend_stack,
                context.blueprint,
                explicit_output_dir or os.path.join(os.getcwd(), "generated_projects"),
            )
            backend_path = gen.generate()
            if backend_path:
                context.artifacts["backend_path"] = backend_path

        except ValueError as exc:
            print(f"[Pipeline] Blueprint validation error: {exc}")
            context.add_error("BlueprintBuilder", str(exc))
        except Exception as exc:
            print(f"[Pipeline] Critical generation error: {exc}")
            context.add_error("Generator", str(exc))

        print("\n[Pipeline] Completed.")
        return context
