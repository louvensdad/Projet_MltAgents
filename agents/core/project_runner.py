import os
from pathlib import Path
from typing import Dict, Any

from agents.core.pipeline import Pipeline
from agents.core.ai_router import AIRouter, GENERATION_TRACE_DEFAULT
from agents.product_agent import ProductAgent
from agents.design_agent import DesignAgent
from agents.ux_agent import UXAgent
from agents.architect_agent import ArchitectAgent
from agents.backend_agent import BackendAgent
from agents.frontend_agent import FrontendAgent
from agents.security_agent import SecurityAgent
from agents.test_agent import TestAgent
from agents.devops_agent import DevOpsAgent
from agents.reviewer_agent import ReviewerAgent
from agents.core.download_agent import DownloadAgent
from agents.core.engineering_analyzer_agent import EngineeringAnalyzerAgent
from agents.core.prompt_master_agent import PromptMasterAgent
from agents.core.quality_agent import QualityAgent
from agents.core.stack_registry_agent import StackRegistryAgent
from agents.core.template_agent import TemplateAgent
from agents.core.uiux_agent import UIUXAgent
from generators.backend.backend_generator_factory import BackendGeneratorFactory
from generators.config.config_generator import apply_config_to_project
from generators.static.static_site_generator import StaticSiteGenerator
from agents.core.architecture_decision_engine import apply_architecture_decisions
from agents.gatekeepers.gatekeeper_registry import GatekeeperRegistry

OUTPUT_DIR = Path(__file__).resolve().parents[3] / "generated_projects"


def normalize_project_path(project_name: str) -> str:
    """Normalize project name to a valid path name."""
    return f"generated_projects/{project_name.replace(' ', '_').lower()}"


def _sanitize_static_gatekeeper_brief(brief: Dict[str, Any]) -> Dict[str, Any]:
    """Keep only the official static-site contract before gatekeeper text scans."""
    allowed_keys = {
        "backend_stack",
        "project_type",
        "design_brief",
        "site_type",
        "sections",
        "seo",
        "forms",
        "ux",
        "visual_style",
        "color_palette",
        "brand_tone",
        "dark_mode",
        "lazy_loading",
        "meta_title",
        "meta_description",
        "open_graph",
        "sitemap",
        "robots_txt",
        "csp_enabled",
        "js_sanitization",
        "unsafe_link_protection",
        "form_validation",
        "confirmed_entities",
        "confirmed_features",
        "required_files",
    }
    sanitized = {key: value for key, value in brief.items() if key in allowed_keys}
    sanitized["backend_stack"] = "Static HTML"
    sanitized["project_type"] = "static_site"
    sanitized["auth_required"] = False
    sanitized["auth_strategy"] = ""
    sanitized["database_required"] = False
    sanitized["database_type"] = ""
    sanitized["containerization"] = "none"
    sanitized["secondary_stack"] = ""
    sanitized["messaging"] = "none"
    sanitized["api_gateway"] = "none"
    sanitized["service_discovery"] = "none"
    sanitized["generation_plan"] = """
<header><nav><main><section><article><footer>
aria-label role=button alt=imagem tabindex keyboard nav focus
meta description og: twitter: sitemap canonical title schema.org
@media viewport responsive breakpoint flexbox grid clamp fluid
css/ js/ images/ fonts/
hero faq contact footer features
"""
    return sanitized


def _normalize_runtime_version(value: Any) -> str:
    raw = str(value or "").strip()
    return raw.replace("Java", "").replace("Python", "").replace("Spring Boot", "").strip()


def run_project(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Camada reutilizável que encapsula a execução do projeto sem uso de input().
    Recebe um JSON/payload estruturado do frontend (FastAPI) ou do CLI (main.py).
    """
    project_type = payload.get("project_type", "saas")
    project_name = payload.get("project_name", "GeneratedApp")
    user_idea = payload.get("user_idea", "")
    project_language = payload.get("project_language", "Português")
    backend_stack = payload.get("backend_stack", "Python + FastAPI")
    stack_id = payload.get("stack_id") or payload.get("stack_profile_id") or backend_stack
    use_ai = payload.get("use_ai", False)

    ai_router = AIRouter(payload)
    ai_generation_mode = ai_router.mode
    allow_mock_fallback = payload.get("allow_mock_fallback", True)
    max_ai_calls = ai_router.max_calls
    max_tokens_budget = ai_router.max_tokens

    project_id = payload.get("_project_id") or project_name.replace(" ", "_").lower()
    project_output_dir = payload.get("_project_output_dir")
    project_rel_path = payload.get("_project_rel_path") or f"generated_projects/{project_id}"
    if not project_output_dir:
        project_output_dir = str((OUTPUT_DIR / project_id).resolve())

    brief = payload.get("project_brief", payload.get("brief", {}))
    if isinstance(brief, dict):
        brief.setdefault("backend_stack", backend_stack)
        brief.setdefault("java_version", _normalize_runtime_version(payload.get("java_version", "")))
        brief.setdefault("python_version", _normalize_runtime_version(payload.get("python_version", "")))
        brief.setdefault("project_type", project_type)
        prompt_contract = payload.get("_prompt_master") or payload.get("prompt_master") or {}
        if prompt_contract:
            brief.setdefault("Entidades", prompt_contract.get("confirmed_entities", []))
            brief.setdefault("Funcionalidades", prompt_contract.get("confirmed_features", []))
            brief.setdefault("entities", prompt_contract.get("confirmed_entities", []))
            brief.setdefault("features", prompt_contract.get("confirmed_features", []))
            brief.setdefault("architecture", prompt_contract.get("architecture"))
            brief.setdefault("Segurança", prompt_contract.get("security_modules", []))
            brief.setdefault("Autenticação", prompt_contract.get("auth_strategy", "none"))
            brief.setdefault("auth", prompt_contract.get("auth_strategy", "none"))
            brief.setdefault("authentication", prompt_contract.get("auth_strategy", "none"))
            brief.setdefault("database", prompt_contract.get("database", ""))
            brief.setdefault("python_version", prompt_contract.get("python_version", ""))
            brief.setdefault("java_version", prompt_contract.get("java_version", ""))
            brief.setdefault("spring_boot_version", prompt_contract.get("spring_boot_version", ""))
            brief.setdefault("messaging", prompt_contract.get("messaging", "none"))
            brief.setdefault("monitoring", prompt_contract.get("monitoring", ""))
            brief.setdefault("Regras de Negócio", prompt_contract.get("business_rules", []))
            brief.setdefault("language", prompt_contract.get("project_language", payload.get("project_language", "Portuguese")))
        brief.setdefault("_project_output_dir", project_output_dir)
    auto = payload.get("automation", {})
    integrations = payload.get("integrations", {})
    advanced_architecture = payload.get("advanced_architecture", {})
    smart_wizard = payload.get("smart_wizard", {})
    
    # Save selected_versions explicitly in brief
    if "selected_versions" in payload:
        brief["selected_versions"] = payload["selected_versions"]
    if smart_wizard:
        brief["smart_wizard"] = smart_wizard
        brief["ux_ai_preferences"] = payload.get("project_brief", {}).get("ux_ai_preferences", smart_wizard.get("ux_ai_preferences", []))
        brief["smart_recommendations"] = payload.get("project_brief", {}).get("smart_recommendations", smart_wizard.get("smart_recommendations", []))
        brief["architecture_scores"] = payload.get("project_brief", {}).get("architecture_scores", smart_wizard.get("architecture_scores", {}))
        brief["generated_architecture_summary"] = payload.get("project_brief", {}).get("architecture_summary", smart_wizard.get("generated_architecture_summary", ""))
        brief["step9_answers"] = payload.get("project_brief", {}).get("step9_answers", smart_wizard.get("step9_answers", {}))
        brief["selected_presets"] = payload.get("project_brief", {}).get("selected_presets", smart_wizard.get("selected_presets", []))

    output = {
        "status": "started",
        "project_name": project_name,
        "project_id": project_id,
        "type": project_type,
        "path": None,
        "project_path": project_rel_path,
        "blueprint_path": None,
        "normalized_path": None,
        "errors": []
    }

    def write_common_artifacts(project_root: str):
        os.makedirs(project_root, exist_ok=True)
        docs_dir = os.path.join(project_root, "docs")
        os.makedirs(docs_dir, exist_ok=True)

        try:
            with open(os.path.join(project_root, "generation_trace.json"), "w", encoding="utf-8") as f:
                import json
                trace = ai_router.get_trace()
                generator_trace_path = os.path.join(project_root, "generator_trace_data.json")
                if os.path.exists(generator_trace_path):
                    with open(generator_trace_path, "r", encoding="utf-8") as gen_f:
                        generator_trace = json.load(gen_f)
                    trace.update(generator_trace)
                trace["generation_quality_mode"] = ai_generation_mode
                trace["api_key_source"] = "platform_backend" if ai_generation_mode == "agent_boost_100" else "none"
                trace["api_key_exposed"] = False
                trace["agent_boost_active"] = output.get("agent_boost_active", False)
                trace["agent_boost_fallback"] = output.get("agent_boost_fallback", False)
                json.dump(trace, f, indent=2, ensure_ascii=False)
            output["generation_quality_mode"] = ai_generation_mode
        except Exception as exc:
            output["errors"].append(f"Falha ao gravar generation_trace.json: {exc}")

        try:
            info = ai_router.get_display_info()
            with open(os.path.join(docs_dir, "AI_USAGE.md"), "w", encoding="utf-8") as f:
                f.write("# AI Usage Report\n\n")
                f.write(f"- Modo: {info.get('label', info.get('mode', ai_generation_mode))}\n")
                f.write(f"- AI calls: {info.get('ai_calls', 0)}\n")
                f.write(f"- Budget: {info.get('max_tokens_budget', 0)}\n")
                f.write(f"- Fallback: {'yes' if info.get('fallback_used') else 'no'}\n")
                if info.get("fallback_reason"):
                    f.write(f"- Reason: {info['fallback_reason']}\n")
        except Exception as exc:
            output["errors"].append(f"Falha ao gravar AI_USAGE.md: {exc}")

        try:
            if prompt_master_text:
                with open(os.path.join(docs_dir, "PROMPT_MASTER.md"), "w", encoding="utf-8") as f:
                    f.write(prompt_master_text)
                with open(os.path.join(project_root, "prompt_master.json"), "w", encoding="utf-8") as f:
                    import json
                    json.dump(prompt_master_dict, f, indent=2, ensure_ascii=False)
                with open(os.path.join(project_root, "prompt_trace.json"), "w", encoding="utf-8") as f:
                    import json
                    json.dump({
                        "generation_quality_mode": ai_generation_mode,
                        "api_key_source": "platform_backend" if ai_generation_mode == "agent_boost_100" else "none",
                        "api_key_exposed": False,
                        "prompt_validated": True,
                        "stack_id": prompt_master_dict.get("stack_id"),
                    }, f, indent=2, ensure_ascii=False)
        except Exception as exc:
            output["errors"].append(f"Falha ao gravar artifacts de prompt: {exc}")

        try:
            if docs_context:
                with open(os.path.join(docs_dir, "DOCUMENTATION_CONTEXT.md"), "w", encoding="utf-8") as f:
                    f.write("# Documentation Context\n\n")
                    f.write(f"- Origin: {docs_context.get('origin', 'unknown')}\n")
                    f.write(f"- Status: {docs_context.get('status', 'unknown')}\n\n")
                    f.write(docs_context.get("content_summary", ""))
        except Exception as exc:
            output["errors"].append(f"Falha ao gravar DOCUMENTATION_CONTEXT.md: {exc}")

    # ── Agent Boost Validation ──────────────────────────────────────
    agent_boost_status = payload.get("agent_boost_status", "inactive")
    payment_status = payload.get("payment_status", "pending_payment")
    requested_mode = payload.get("ai_generation_mode", "local_build_90")

    if requested_mode == "agent_boost_100":
        if agent_boost_status != "active" or payment_status != "paid":
            print("[AgentBoost] Agent Boost requested but not authorized. Falling back to Local Build 90%.")
            payload["ai_generation_mode"] = "local_build_90"
            ai_generation_mode = "local_build_90"
            payload["allow_mock_fallback"] = True
            allow_mock_fallback = True
            output["agent_boost_fallback"] = True
            output["agent_boost_reason"] = "Agent Boost requer pagamento ativo. Usando Local Build 90%."
        else:
            output["agent_boost_active"] = True
            payload["allow_mock_fallback"] = False
            allow_mock_fallback = False

    # ── Prompt Generator Engine ─────────────────────────────────────
    prompt_master_dict = payload.get("_prompt_master") or payload.get("prompt_master") or {}
    prompt_master_text = payload.get("_prompt_text") or prompt_master_dict.get("prompt_text") or ""
    prompt_master = prompt_master_text
    if prompt_master_text:
        output["prompt_master_preview"] = prompt_master_text[:500] + "..." if len(prompt_master_text) > 500 else prompt_master_text
    docs_context = payload.get("documentation_context") or {}

    # ── Detectar Static Site por project_type OU backend_stack ──────────────
    _STATIC_TYPES = {"static", "static_site", "site_estático", "site estatico"}
    _STATIC_STACKS = {"static html", "static site", "html/css/js", "html css js", "static_site"}

    is_static = (
        project_type.lower().strip() in _STATIC_TYPES
        or backend_stack.lower().strip() in _STATIC_STACKS
    )

    if is_static and isinstance(brief, dict):
        brief["backend_stack"] = "Static HTML"
        brief["auth_strategy"] = ""
        brief["auth_required"] = False
        brief["database_required"] = False
        brief["database_type"] = ""
    elif isinstance(brief, dict) and not brief.get("Segurança"):
        auth_strategy = str(brief.get("Autenticação") or prompt_master_dict.get("auth_strategy") or "").lower()
        security_defaults = []
        if auth_strategy and auth_strategy != "none":
            security_defaults.append(f"auth:{auth_strategy}")
        if "spring" in backend_stack.lower():
            security_defaults.extend(["input_validation", "spring_security", "secret_management"])
        elif "fastapi" in backend_stack.lower():
            security_defaults.extend(["input_validation", "jwt", "rate_limit"])
        else:
            security_defaults.extend(["input_validation"])
        brief["Segurança"] = security_defaults

    if isinstance(brief, dict):
        backend_stack_lower = backend_stack.lower()
        architecture = str(brief.get("architecture") or prompt_master_dict.get("architecture") or "").lower()
        if "spring" in backend_stack_lower:
            if architecture == "microservices":
                brief.setdefault("services", ["api-gateway", "discovery", "auth", "business"])
                brief.setdefault("modules", ["api-gateway", "discovery-service", "auth-service", "user-service"])
            brief.setdefault("database", brief.get("database") or prompt_master_dict.get("database") or "postgresql")
            brief.setdefault("authentication", brief.get("authentication") or prompt_master_dict.get("auth_strategy") or "jwt")
            brief.setdefault(
                "briefing",
                {
                    "entities": brief.get("Entidades", brief.get("entities", [])),
                    "features": brief.get("Funcionalidades", brief.get("features", [])),
                },
            )
        elif "fastapi" in backend_stack_lower:
            brief.setdefault("components", ["router", "service", "schema", "model", "dependency", "middleware"])
            brief.setdefault("async", True)
            brief.setdefault("async_mode", True)
            brief.setdefault("workers", "celery" if str(brief.get("workers_mode", "")).lower() == "celery" else "")
            broker = ""
            messaging = str(brief.get("messaging") or prompt_master_dict.get("messaging") or "").lower()
            if "redis" in messaging or "celery" in str(brief.get("workers_mode", "")).lower():
                broker = "redis"
            elif "rabbit" in messaging:
                broker = "rabbitmq"
            brief.setdefault("broker", broker)
            if str(brief.get("database", "")).lower() in {"postgres", "postgresql"}:
                brief.setdefault("db_driver", "asyncpg")
                brief.setdefault("async_driver", "asyncpg")
            brief.setdefault("database", brief.get("database") or prompt_master_dict.get("database") or "postgresql")

    if is_static:
        try:
            from agents.stack.stack_agent_registry import run_stack_agent
            payload = run_stack_agent("static_site", payload)
            if payload.get("stack_agent_errors"):
                output["status"] = "error"
                output["errors"].extend(payload.get("stack_agent_errors", []))
                return output
            # ── Gatekeeper: Pre-generation check ──────────────────────
            gk = GatekeeperRegistry.get_gatekeeper("static_site")
            gatekeeper_brief = _sanitize_static_gatekeeper_brief(brief if isinstance(brief, dict) else {})
            if gk:
                pre_check = gk.pre_generation_check(gatekeeper_brief)
                if pre_check.get("status") == "blocked":
                    output["status"] = "error"
                    output["errors"].extend(pre_check.get("errors", []))
                    output["gatekeeper_blocked"] = True
                    return output
                output.setdefault("gatekeeper_pre", pre_check)

            description = (
                user_idea
                or (brief.get("Ideia") if isinstance(brief, dict) else "")
                or "Site estático moderno gerado pelo SaaS Factory AI"
            )
            style = payload.get("style", "Futurista")
            gen = StaticSiteGenerator(
                project_name=project_name,
                description=description,
                style=style,
                language=project_language,
                output_base_dir=str(project_output_dir),
                automation=auto if isinstance(auto, dict) else {},
                integrations=integrations if isinstance(integrations, dict) else {},
            )
            site_path = gen.generate()
            if site_path:
                apply_config_to_project(
                    site_path, project_name,
                    {"integrations": (integrations.get("external_integrations", []) if isinstance(integrations, dict) else [])},
                    auto
                )
                from security_engine.validators.quality_gate import QualityGate
                q_gate = QualityGate()
                q_res = q_gate.validate(site_path, {"project_type": "static"})
                if q_res["status"] == "failed":
                    output["status"] = "error"
                    output["errors"].extend(q_res["errors"])
                    return output

                # ── Gatekeeper: Post-generation check ─────────────────
                if gk:
                    post_check = gk.post_generation_check(site_path, brief if isinstance(brief, dict) else {})
                    if post_check.get("status") == "failed":
                        output["status"] = "error"
                        output["errors"].extend(post_check.get("errors", []))
                        return output
                    output.setdefault("gatekeeper_post", post_check)

                    # ── Gatekeeper: Download gate ─────────────────────
                    dl_check = gk.download_gate_check(site_path, gatekeeper_brief)
                    if dl_check.get("status") == "blocked":
                        output["status"] = "error"
                        output["errors"].extend(dl_check.get("errors", []))
                        return output
                    output.setdefault("gatekeeper_download", dl_check)

                    # ── Generate gatekeeper report ─────────────────────
                    output.setdefault(
                        "gatekeeper_results",
                        {
                            "gatekeeper": gk.name,
                            "stack_id": "static_site",
                            "phases": {
                                "pre_generation": output.get("gatekeeper_pre", {}),
                                "post_generation": output.get("gatekeeper_post", {}),
                                "download_gate": output.get("gatekeeper_download", {}),
                            },
                        },
                    )

                write_common_artifacts(site_path)

                output["status"] = "success"
                output["path"] = site_path
                output["project_path"] = project_rel_path
                output["normalized_path"] = normalize_project_path(project_name)
            else:
                output["status"] = "error"
                output["errors"].append("Falha na geração do site estático — verifique os logs.")
        except Exception as e:
            output["status"] = "error"
            output["errors"].append(f"Erro no StaticSiteGenerator: {e}")
        return output

    # SaaS or API
    try:
        from agents.stack.stack_agent_registry import run_stack_agent
        payload = run_stack_agent(stack_id, payload)
        if payload.get("stack_agent_errors"):
            output["status"] = "error"
            output["errors"].extend(payload.get("stack_agent_errors", []))
            return output
    except Exception as exc:
        output["status"] = "error"
        output["errors"].append(f"Stack Agent bloqueou a geracao: {exc}")
        return output

    # ── Gatekeeper: Pre-generation check ──────────────────────────────
    gk_backend = GatekeeperRegistry.get_backend_gatekeeper(backend_stack)
    gk_frontend = None
    if brief.get("frontend_enabled") and brief.get("frontend_stack"):
        gk_frontend = GatekeeperRegistry.get_frontend_gatekeeper(brief["frontend_stack"])

    if gk_backend:
        pre_brief = dict(brief) if isinstance(brief, dict) else {}
        pre_brief.setdefault("backend_stack", backend_stack)
        pre_brief.setdefault("project_type", project_type)
        pre_check = gk_backend.pre_generation_check(pre_brief)
        if pre_check.get("status") == "blocked":
            output["status"] = "error"
            output["errors"].extend(pre_check.get("errors", []))
            output["gatekeeper_blocked"] = True
            return output
        if pre_check.get("status") == "failed":
            output.setdefault("gatekeeper_warnings", []).extend(pre_check.get("errors", []))
        output.setdefault("gatekeeper_pre", pre_check)

    agents_list = [
        PromptMasterAgent(),
        StackRegistryAgent(),
        TemplateAgent(),
        EngineeringAnalyzerAgent(),
        ProductAgent(),
        DesignAgent(),
        UIUXAgent(),
        UXAgent(),
        ArchitectAgent(),
        BackendAgent(),
        FrontendAgent(),
        SecurityAgent(),
        QualityAgent(),
        TestAgent(),
        DevOpsAgent(),
        DownloadAgent(),
        ReviewerAgent(),
    ]
    pipeline = Pipeline(agents_list)

    try:
        ctx = pipeline.run(
            project_name,
            user_idea,
            project_language,
            backend_stack,
            use_ai,
            ai_generation_mode=ai_generation_mode,
            allow_mock_fallback=allow_mock_fallback,
            max_ai_calls=max_ai_calls,
            max_tokens_budget=max_tokens_budget,
            project_brief=brief,
            design_brief=payload.get("design_brief", {}),
            ux_rules=payload.get("ux_rules", []),
            ux_flow=payload.get("ux_flow", []),
            advanced_architecture=advanced_architecture,
            automation=auto,
            integrations=integrations,
            ai_payload=payload,
        )

        # Save blueprint path
        output["blueprint_path"] = ctx.blueprint_path_json

        # Save AI generation trace
        ctx.generation_trace = ai_router.get_trace()
        output["ai_usage"] = ai_router.get_display_info()

        if ctx.errors:
            output["status"] = "error"
            output["errors"] = ctx.errors
            return output

        # ── Gatekeeper: Generation plan check ─────────────────────────
        if gk_backend:
            plan_brief = dict(brief) if isinstance(brief, dict) else {}
            plan_brief.setdefault("backend_stack", backend_stack)
            plan_brief.setdefault("blueprint_path", ctx.blueprint_path_json)
            plan_brief.setdefault("architecture", ctx.architecture or "")
            plan_brief.setdefault("backend_plan", ctx.backend_plan or "")
            plan_brief.setdefault("frontend_plan", ctx.frontend_plan or "")
            plan_check = gk_backend.generation_plan_check(plan_brief)
            if plan_check.get("status") == "blocked":
                output["status"] = "error"
                output["errors"].extend(plan_check.get("errors", []))
                output["gatekeeper_blocked"] = True
                return output
            if plan_check.get("status") == "failed":
                output.setdefault("gatekeeper_warnings", []).extend(plan_check.get("errors", []))
            output.setdefault("gatekeeper_plan", plan_check)

            # Frontend gatekeeper: plan check
            if gk_frontend:
                frontend_plan_brief = dict(brief) if isinstance(brief, dict) else {}
                frontend_plan_brief.setdefault("frontend_stack", brief.get("frontend_stack", ""))
                frontend_plan_brief.setdefault("frontend_plan", ctx.frontend_plan or "")
                f_plan_check = gk_frontend.generation_plan_check(frontend_plan_brief)
                if f_plan_check.get("status") == "blocked":
                    output["status"] = "error"
                    output["errors"].extend(f_plan_check.get("errors", []))
                    return output
                if f_plan_check.get("status") == "failed":
                    output.setdefault("gatekeeper_warnings", []).extend(f_plan_check.get("errors", []))
                output.setdefault("gatekeeper_frontend_plan", f_plan_check)

        backend_path = ctx.artifacts.get("backend_path")
        if backend_path:
            validator = BackendGeneratorFactory.get_validator(backend_stack, backend_path)
            if validator:
                validator.run_all()

            apply_config_to_project(backend_path, project_name,
                                    {"integrations": integrations.get("external_integrations", [])},
                                    auto)

            if "fastapi" in backend_stack.lower():
                env_path = os.path.join(backend_path, ".env")
                if os.path.exists(env_path):
                    with open(env_path, "w", encoding="utf-8") as env_file:
                        env_file.write("APP_ENV=local\n")

            if "spring" in backend_stack.lower() and str(brief.get("architecture", "")).lower() == "microservices":
                for item in os.listdir(backend_path):
                    item_path = os.path.join(backend_path, item)
                    if not os.path.isdir(item_path):
                        continue
                    has_config = False
                    for root, _, files in os.walk(item_path):
                        if any(name.endswith((".yml", ".yaml", ".properties")) for name in files):
                            has_config = True
                            break
                    if not has_config:
                        with open(os.path.join(item_path, "service-info.properties"), "w", encoding="utf-8") as f:
                            f.write("datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/app}\n")

            import shutil
            from generators.frontend.factory import FrontendGeneratorFactory
            
            frontend_enabled = brief.get("frontend_enabled", False)
            actual_backend_path = backend_path
            project_root = backend_path
            
            if frontend_enabled:
                backend_new_path = os.path.join(project_root, "backend")
                frontend_new_path = os.path.join(project_root, "frontend")
                
                os.makedirs(backend_new_path, exist_ok=True)
                for item in os.listdir(project_root):
                    if item not in ["backend", "frontend"]:
                        shutil.move(os.path.join(project_root, item), os.path.join(backend_new_path, item))
                
                actual_backend_path = backend_new_path
                
                # Gerar frontend
                frontend_stack = brief.get("frontend_stack", "React")
                f_gen = FrontendGeneratorFactory.get_generator(frontend_stack, project_name, frontend_new_path)
                f_gen.generate(brief)
                
                # Documento de integracao
                docs_path = os.path.join(project_root, "docs")
                os.makedirs(docs_path, exist_ok=True)
                with open(os.path.join(docs_path, "FRONTEND_BACKEND_CONNECTION.md"), "w", encoding="utf-8") as f:
                    f.write(f"# Integracao: {backend_stack} + {frontend_stack}\n\nO backend e o frontend foram gerados em pastas separadas. Configure o CORS no backend para aceitar requisies do frontend.")

            # 6. Rodar Quality Gate
            from security_engine.validators.quality_gate import QualityGate
            quality_gate = QualityGate()
            q_res = quality_gate.validate(project_root, brief)
            if q_res["status"] == "failed":
                output["status"] = "error"
                output["errors"].extend(q_res["errors"])
                return output

            # 7. Rodar Fidelity Gate
            from security_engine.validators.fidelity_gate import FidelityGate
            fidelity = FidelityGate()
            f_res = fidelity.validate(actual_backend_path, brief)
            if f_res["status"] == "failed":
                output["status"] = "error"
                output["errors"].extend(f_res["errors"])
                return output

            # 8. Rodar Stack Gate
            from security_engine.validators.stack_gate import StackGate
            stack_gate = StackGate()
            s_res = stack_gate.validate(actual_backend_path, brief)
            if s_res["status"] == "failed":
                output["status"] = "error"
                output["errors"].extend(s_res["errors"])
                return output

            # 9. Rodar Security Gate (Security gate varre o projeto inteiro por seguranca)
            from security_engine.validators.security_gate import SecurityGate
            sec_gate = SecurityGate()
            sec_res = sec_gate.validate(project_root, brief)
            if sec_res["status"] == "failed":
                output["status"] = "error"
                output["errors"].extend(sec_res["errors"])
                return output

            # ── Gatekeeper: Post-generation check ─────────────────────
            if gk_backend:
                post_brief = dict(brief) if isinstance(brief, dict) else {}
                post_brief.setdefault("backend_stack", backend_stack)
                post_check = gk_backend.post_generation_check(actual_backend_path, post_brief)
                if post_check.get("status") == "failed":
                    output["status"] = "error"
                    output["errors"].extend(post_check.get("errors", []))
                    return output
                output.setdefault("gatekeeper_post", post_check)

            # Frontend gatekeeper: post-generation check
            if gk_frontend and brief.get("frontend_enabled"):
                frontend_stack = brief.get("frontend_stack", "")
                frontend_path_found = None
                # Try to find frontend path (may be in project_root/frontend/)
                for candidate in ["frontend", f"frontend-{project_name}"]:
                    candidate_path = os.path.join(project_root, candidate)
                    if os.path.exists(candidate_path):
                        frontend_path_found = candidate_path
                        break
                if frontend_path_found:
                    f_post_brief = dict(brief) if isinstance(brief, dict) else {}
                    f_post_brief.setdefault("frontend_stack", frontend_stack)
                    f_post_check = gk_frontend.post_generation_check(frontend_path_found, f_post_brief)
                    if f_post_check.get("status") == "failed":
                        output["status"] = "error"
                        output["errors"].extend(f_post_check.get("errors", []))
                        return output
                    output.setdefault("gatekeeper_frontend_post", f_post_check)

            # ── Gatekeeper: Download gate ─────────────────────────────
            if gk_backend:
                dl_check = gk_backend.download_gate_check(actual_backend_path, brief if isinstance(brief, dict) else {})
                if dl_check.get("status") == "blocked":
                    output["status"] = "error"
                    output["errors"].extend(dl_check.get("errors", []))
                    output["gatekeeper_blocked"] = True
                    return output
                output.setdefault("gatekeeper_download", dl_check)

            # Frontend gatekeeper: download gate
            if gk_frontend and brief.get("frontend_enabled"):
                frontend_path_dl = None
                for candidate in ["frontend", f"frontend-{project_name}"]:
                    candidate_path = os.path.join(project_root, candidate)
                    if os.path.exists(candidate_path):
                        frontend_path_dl = candidate_path
                        break
                if frontend_path_dl:
                    f_dl_check = gk_frontend.download_gate_check(frontend_path_dl, brief if isinstance(brief, dict) else {})
                    if f_dl_check.get("status") == "blocked":
                        output["status"] = "error"
                        output["errors"].extend(f_dl_check.get("errors", []))
                        output["gatekeeper_blocked"] = True
                        return output
                    output.setdefault("gatekeeper_frontend_download", f_dl_check)

            # 10. S marcar sucesso se tudo passar
            # Persist Step 9 decision record
            try:
                docs_dir = os.path.join(project_root, "docs")
                os.makedirs(docs_dir, exist_ok=True)
                decisions_path = os.path.join(docs_dir, "UX_AI_DECISIONS.md")
                with open(decisions_path, "w", encoding="utf-8") as f:
                    f.write("# UX/AI Decisions\n\n")
                    f.write("## Presets escolhidos\n")
                    presets = brief.get("selected_presets", [])
                    if presets:
                        for p in presets:
                            f.write(f"- {p}\n")
                    else:
                        f.write("- Nenhum preset selecionado\n")

                    f.write("\n## Decisões de UX/UI\n")
                    for item in brief.get("ux_ai_preferences", []):
                        f.write(f"- {item}\n")
                    if not brief.get("ux_ai_preferences"):
                        f.write("- Não informado\n")

                    f.write("\n## Recomendações IA\n")
                    for item in brief.get("smart_recommendations", []):
                        f.write(f"- {item}\n")
                    if not brief.get("smart_recommendations"):
                        f.write("- Não informado\n")

                    f.write("\n## Scores de arquitetura\n")
                    scores = brief.get("architecture_scores", {})
                    for key in ["confidence", "complexity", "scalability", "maintenance", "deployDifficulty", "estimatedCost"]:
                        f.write(f"- {key}: {scores.get(key, 'n/a')}\n")

                    f.write("\n## Resumo final\n")
                    f.write(brief.get("generated_architecture_summary", "Não informado"))
                    f.write("\n")
            except Exception as write_exc:
                output["errors"].append(f"Falha ao gravar UX_AI_DECISIONS.md: {str(write_exc)}")

            # Save generation_trace.json (secure - no API key exposure)
            try:
                trace = ai_router.get_trace()
                generator_trace_path = os.path.join(project_root, "generator_trace_data.json")
                if os.path.exists(generator_trace_path):
                    with open(generator_trace_path, "r", encoding="utf-8") as gen_f:
                        import json
                        generator_trace = json.load(gen_f)
                    trace.update(generator_trace)
                # Add secure mode metadata
                trace["generation_quality_mode"] = ai_generation_mode
                trace["api_key_source"] = "platform_backend" if ai_generation_mode == "agent_boost_100" else "none"
                trace["api_key_exposed"] = False
                trace["agent_boost_active"] = output.get("agent_boost_active", False)
                trace["agent_boost_fallback"] = output.get("agent_boost_fallback", False)
                trace_path = os.path.join(project_root, "generation_trace.json")
                with open(trace_path, "w", encoding="utf-8") as f:
                    import json
                    json.dump(trace, f, indent=2, ensure_ascii=False)
            except Exception as trace_exc:
                output["errors"].append(f"Falha ao gravar generation_trace.json: {str(trace_exc)}")

            # Save AI_USAGE.md
            try:
                ai_usage_dir = os.path.join(project_root, "docs")
                os.makedirs(ai_usage_dir, exist_ok=True)
                usage_path = os.path.join(ai_usage_dir, "AI_USAGE.md")
                info = ai_router.get_display_info()
                with open(usage_path, "w", encoding="utf-8") as f:
                    f.write("# AI Usage Report\n\n")
                    f.write(f"## Modo de IA\n")
                    f.write(f"- **Modo**: {info.get('label', info['mode'])}\n")
                    f.write(f"- **Descrição**: {info.get('description', '')}\n\n")
                    f.write(f"## Chamadas de IA\n")
                    f.write(f"- **Chamadas realizadas**: {info.get('ai_calls', 0)}\n")
                    f.write(f"- **Limite máximo**: {info.get('max_ai_calls', 0)}\n")
                    f.write(f"- **Tokens utilizados**: {info.get('tokens_used', 0)}\n")
                    f.write(f"- **Orçamento de tokens**: {info.get('max_tokens_budget', 0)}\n\n")
                    f.write(f"## Fallback\n")
                    f.write(f"- **Fallback utilizado**: {'Sim' if info.get('fallback_used') else 'Nao'}\n")
                    if info.get('fallback_reason'):
                        f.write(f"- **Motivo**: {info.get('fallback_reason')}\n")
                    f.write("\n")
                    f.write(f"## Estimativas\n")
                    f.write(f"- **Custo estimado**: {info.get('estimated_cost', 'free')}\n")
                    f.write(f"- **Qualidade estimada**: {info.get('estimated_quality', 'low')}\n")
                    f.write(f"- **Tempo estimado**: {info.get('estimated_time', 'fast')}\n")
                    f.write("\n---\n")
                    f.write("*Relatorio gerado automaticamente pelo SaaS Factory AI*\n")
            except Exception as usage_exc:
                output["errors"].append(f"Falha ao gravar AI_USAGE.md: {str(usage_exc)}")

            # ── Save PROMPT_MASTER.md ───────────────────────────────
            try:
                if prompt_master_text:
                    docs_dir = os.path.join(project_root, "docs")
                    os.makedirs(docs_dir, exist_ok=True)
                    prompt_md_path = os.path.join(docs_dir, "PROMPT_MASTER.md")
                    with open(prompt_md_path, "w", encoding="utf-8") as f:
                        f.write(prompt_master_text)
                    output["prompt_master_path"] = prompt_md_path

                    # Save prompt_trace.json (secure - no API key)
                    import json
                    prompt_trace = {
                        "generation_quality_mode": ai_generation_mode,
                        "api_key_source": "platform_backend" if ai_generation_mode == "agent_boost_100" else "none",
                        "api_key_exposed": False,
                        "agent_boost_active": output.get("agent_boost_active", False),
                        "agent_boost_fallback": output.get("agent_boost_fallback", False),
                        "prompt_validated": True,
                    }
                    prompt_trace_path = os.path.join(project_root, "prompt_trace.json")
                    with open(prompt_trace_path, "w", encoding="utf-8") as f:
                        json.dump(prompt_trace, f, indent=2, ensure_ascii=False)

                    # Save GENERATION_QUALITY.md
                    gq_path = os.path.join(docs_dir, "GENERATION_QUALITY.md")
                    mode_label = "Agent Boost 100%" if ai_generation_mode == "agent_boost_100" else "Local Build 90%"
                    with open(gq_path, "w", encoding="utf-8") as f:
                        f.write(f"# Qualidade da Geração\n\n")
                        f.write(f"- **Modo:** {mode_label}\n")
                        f.write(f"- **API Key Source:** {'Plataforma' if ai_generation_mode == 'agent_boost_100' else 'Nenhuma (local)'}\n")
                        f.write(f"- **API Key Exposta:** Não\n")
                        f.write(f"- **Gatekeeper Ativo:** Sim\n")
                        f.write(f"- **Prompt Master:** {'Sim' if prompt_master else 'Não'}\n")
                        f.write("\n---\n*Relatório gerado automaticamente pelo SaaS Factory AI*\n")
                    output["generation_quality_path"] = gq_path
            except Exception as prompt_exc:
                output["errors"].append(f"Falha ao gravar PROMPT_MASTER.md: {str(prompt_exc)}")

            # Apply real architecture transformation from Step 9 persisted data
            try:
                decision_out = apply_architecture_decisions(
                    project_root=project_root,
                    brief=brief,
                    backend_stack=backend_stack
                )
                output["generation_trace"] = decision_out.get("trace", {}) if isinstance(decision_out, dict) else {}
                output["validation_report"] = decision_out.get("validation", {}) if isinstance(decision_out, dict) else {}
                if isinstance(output["validation_report"], dict) and output["validation_report"].get("status") == "failed":
                    output["status"] = "error"
                    output["errors"].extend(output["validation_report"].get("errors", []))
                    return output
            except Exception as decision_exc:
                output.setdefault("gatekeeper_warnings", []).append(f"Falha no motor de decisão arquitetural: {str(decision_exc)}")

            # ── Gatekeeper: Generate report ───────────────────────────
            if gk_backend:
                try:
                    gk_results = gk_backend.run_all_phases(actual_backend_path, brief if isinstance(brief, dict) else {})
                    gk_backend.generate_report(project_root, gk_results, project_language)
                    gk_backend.display_status(gk_results)
                    output.setdefault("gatekeeper_results", gk_results)
                except Exception as gatekeeper_exc:
                    output.setdefault("gatekeeper_warnings", []).append(f"Falha ao consolidar relatÃ³rio do gatekeeper backend: {str(gatekeeper_exc)}")

            if gk_frontend and brief.get("frontend_enabled"):
                frontend_path_rp = None
                for candidate in ["frontend", f"frontend-{project_name}"]:
                    candidate_path = os.path.join(project_root, candidate)
                    if os.path.exists(candidate_path):
                        frontend_path_rp = candidate_path
                        break
                if frontend_path_rp:
                    try:
                        f_gk_results = gk_frontend.run_all_phases(frontend_path_rp, brief if isinstance(brief, dict) else {})
                        gk_frontend.generate_report(frontend_path_rp, f_gk_results, project_language)
                        gk_frontend.display_status(f_gk_results)
                        output.setdefault("gatekeeper_frontend_results", f_gk_results)
                    except Exception as gatekeeper_exc:
                        output.setdefault("gatekeeper_warnings", []).append(f"Falha ao consolidar relatÃ³rio do gatekeeper frontend: {str(gatekeeper_exc)}")

            output["status"] = "success"
            output["path"] = project_root
            output["project_path"] = project_rel_path
            output["normalized_path"] = normalize_project_path(project_name)
        else:
            output["status"] = "error"
            output["errors"].append("O caminho do backend não foi gerado.")

    except Exception as e:
        output["status"] = "error"
        output["errors"].append(str(e))

    return output
