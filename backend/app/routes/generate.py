"""Official generation entrypoint.

Everything must pass through:
- Prompt Engine
- Documentation Engine
- AI Router / Project Runner
- Gates
- Registry / checkout / download
"""

import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter

ROOT_DIR = Path(__file__).resolve().parents[4]
SRC_DIR = ROOT_DIR / "src"
for candidate in (ROOT_DIR, SRC_DIR):
    candidate_str = str(candidate)
    if candidate_str not in sys.path:
        sys.path.insert(0, candidate_str)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["generate"])

for stream_name in ("stdout", "stderr"):
    stream = getattr(sys, stream_name, None)
    reconfigure = getattr(stream, "reconfigure", None)
    if callable(reconfigure):
        try:
            reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "service": "saas-factory-api",
    }


def _normalize_stack_id(payload: dict[str, Any]) -> str:
    stack = str(payload.get("stack_profile_id") or payload.get("wizard_type") or payload.get("backend_stack") or "static_site")
    normalized = stack.strip().lower().replace(" ", "_").replace("+", "_").replace("-", "_")
    aliases = {
        "static_site": "static_site",
        "static": "static_site",
        "springboot": "springboot",
        "java_springboot": "springboot",
        "fastapi": "fastapi",
        "python_fastapi": "fastapi",
        "angular": "angular",
        "react": "react",
        "nextjs": "nextjs",
    }
    return aliases.get(normalized, normalized)


def _to_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _map_architecture(value: str, stack_id: str) -> str:
    raw = (value or "").lower()
    if stack_id == "springboot":
        if "micro" in raw:
            return "microservices"
        if "modular" in raw:
            return "modular_monolith"
        return "monolith"
    if stack_id == "fastapi":
        if "micro" in raw:
            return "microservices"
        if "modular" in raw:
            return "modular_monolith"
        return "monolith"
    return raw


def _build_prompt_answers(payload: dict[str, Any], stack_id: str) -> dict[str, Any]:
    locale = str(payload.get("project_language") or payload.get("locale") or "pt").split("-")[0]
    project_name = payload.get("project_name") or payload.get("site_name") or "projeto"
    base: dict[str, Any] = {
        "project_name": project_name,
        "project_language": locale,
        "project_description": payload.get("project_description") or payload.get("user_idea") or payload.get("content", {}).get("company_description") or f"Projeto {project_name}",
        "target_audience": payload.get("target_audience") or payload.get("content", {}).get("target_audience") or "general_users",
        "ai_generation_mode": payload.get("ai_generation_mode", "local_build_90"),
    }

    if stack_id == "static_site":
        sections = _to_list(payload.get("sections"))
        form_options = _to_list(payload.get("forms", {}).get("options"))
        ux_options = _to_list(payload.get("ux", {}).get("options"))
        normalized_form_features = [
            "contact_capture" if "contact" in item.lower() else item.lower().replace("_", "-")
            for item in form_options
        ]
        base.update({
            "site_type": payload.get("site_type", "landing_page"),
            "sections": sections,
            "visual_style": payload.get("design", {}).get("visual_style", "glassmorphism"),
            "color_palette": payload.get("design", {}).get("color_palette", "dark_cyber"),
            "brand_tone": payload.get("design", {}).get("brand_tone", "tech_startup"),
            "dark_mode": payload.get("design", {}).get("dark_mode", True),
            "lazy_loading": payload.get("seo", {}).get("lazy_loading", True),
            "meta_title": payload.get("seo", {}).get("meta_title") or project_name,
            "meta_description": payload.get("seo", {}).get("meta_description") or payload.get("content", {}).get("company_description") or project_name,
            "open_graph": payload.get("seo", {}).get("open_graph", True),
            "sitemap": payload.get("seo", {}).get("sitemap", True),
            "robots_txt": payload.get("seo", {}).get("robots_txt", True),
            "csp_enabled": payload.get("security_frontend", {}).get("csp_enabled", True),
            "js_sanitization": payload.get("security_frontend", {}).get("js_sanitization", True),
            "unsafe_link_protection": payload.get("security_frontend", {}).get("unsafe_link_protection", True),
            "form_validation": payload.get("security_frontend", {}).get("form_validation", True),
            "auth_strategy": "none",
            "containerization": "none",
            "confirmed_entities": ["LandingPage", "MarketingSection"] if sections else ["LandingPage", "SiteContent"],
            "confirmed_features": sections + normalized_form_features + ux_options or ["hero", "contact", "seo", "responsive-layout"],
        })
        return base

    if stack_id == "springboot":
        security = _to_list(payload.get("security"))
        events = _to_list(payload.get("events"))
        observability = _to_list(payload.get("observability"))
        tests = _to_list(payload.get("tests"))
        auth_strategy = "jwt"
        if any("oauth" in item.lower() for item in security):
            auth_strategy = "oauth2"
        base.update({
            "java_version": str(payload.get("java_version", "Java 21")).replace("Java", "").strip(),
            "spring_boot_version": str(payload.get("spring_boot_version", "Spring Boot 3.3")).replace("Spring Boot", "").strip() + ".x",
            "build_tool": str(payload.get("build_tool", "maven")).lower(),
            "architecture": _map_architecture(str(payload.get("architecture", "")), "springboot"),
            "database": str(payload.get("database", "postgresql")).lower(),
            "orm": "jpa_hibernate",
            "auth_strategy": auth_strategy,
            "security_modules": [item.lower().replace(" ", "_") for item in security] or ["spring_security"],
            "messaging": "kafka" if any("kafka" in item.lower() for item in events) else "rabbitmq" if any("rabbit" in item.lower() for item in events) else "none",
            "monitoring": "actuator_prometheus" if observability else "actuator_only",
            "service_discovery": "eureka" if any("eureka" in item.lower() for item in observability) else "none",
            "api_gateway": "spring_cloud_gateway" if any("gateway" in item.lower() for item in events + observability) else "none",
            "openapi": True,
            "testing_strategy": "unit_integration" if tests else "unit_only",
            "confirmed_entities": ["User", "AuditLog"],
            "confirmed_features": security + events + observability + tests or ["crud_api", "validation", "openapi"],
        })
        return base

    if stack_id == "fastapi":
        auth = _to_list(payload.get("auth_options"))
        workers = _to_list(payload.get("worker_options"))
        docs_options = _to_list(payload.get("docs_options"))
        tests = _to_list(payload.get("test_options"))
        orm_options = _to_list(payload.get("orm_options"))
        base.update({
            "python_version": str(payload.get("python_version", "Python 3.12")).replace("Python", "").strip(),
            "architecture": _map_architecture(str(payload.get("architecture", "")), "fastapi"),
            "database": str(payload.get("database", "postgresql")).lower(),
            "orm": "sqlalchemy" if any("sqlalchemy" in item.lower() for item in orm_options) else "sqlmodel",
            "auth_strategy": "jwt" if auth else "none",
            "async_mode": True,
            "workers_mode": "celery" if any("celery" in item.lower() for item in workers) else "background_tasks",
            "openapi": any("swagger" in item.lower() or "openapi" in item.lower() for item in docs_options) or True,
            "testing_strategy": "unit_integration" if tests else "unit_only",
            "confirmed_entities": ["User", "Job"],
            "confirmed_features": auth + workers + docs_options + tests or ["crud_api", "openapi", "pytest"],
        })
        return base

    return base


def _load_documentation_context(stack_id: str) -> dict[str, Any]:
    from documentation_engine.docs_fetcher import DocsFetcher
    from documentation_engine.docs_registry import DocsRegistry

    fetcher = DocsFetcher(DocsRegistry())
    docs_result = fetcher.fetch_docs(stack_id)
    return docs_result


def _backend_stack_name(stack_id: str) -> str:
    return {
        "static_site": "Static HTML",
        "springboot": "Java + Spring Boot",
        "fastapi": "Python + FastAPI",
        "angular": "Angular",
        "react": "React",
        "nextjs": "Next.js",
    }.get(stack_id, stack_id)


@router.post("/generate")
def generate_project(payload: dict[str, Any]):
    from agents.core.project_runner import run_project
    from ..security.path_guard import PathGuard
    from ..services.payment_service import get_project, register_project, update_project
    from prompt_engine.prompt_generator import PromptGeneratorEngine
    from ..streamer import streamer

    stack_id = _normalize_stack_id(payload)
    project_name = payload.get("project_name") or payload.get("site_name") or "projeto"
    project_type = payload.get("project_type", "static_site" if stack_id == "static_site" else "api")
    prompt_answers = _build_prompt_answers(payload, stack_id)

    logger.info("Official generate requested: project=%s stack=%s", project_name, stack_id)

    engine = PromptGeneratorEngine(stack_id)
    engine.answer_bulk(prompt_answers)

    if not engine.validate():
        logger.warning("Prompt validation blocked generation for %s: %s", project_name, engine.errors)
        return {
            "success": False,
            "status": "prompt_rejected",
            "error_code": "PROMPT_VALIDATION_FAILED",
            "message": "Prompt Master inválido. Ajuste as respostas do wizard antes de gerar.",
            "details": engine.errors,
            "warnings": engine.warnings,
            "missing_required": engine.missing_required(),
        }

    prompt_master = engine.finalize()
    docs_context = _load_documentation_context(stack_id)

    project_id = register_project(name=project_name, project_type=project_type, stack=stack_id)
    requested_payment_status = payload.get("payment_status")
    requested_agent_boost_status = payload.get("agent_boost_status")
    if requested_payment_status or requested_agent_boost_status:
        update_project(
            project_id,
            {
                "payment_status": requested_payment_status or "pending_payment",
                "agent_boost_status": requested_agent_boost_status or "inactive",
            },
        )
    project_record = get_project(project_id) or {}
    project_output_dir = PathGuard.resolve_project_path(project_record.get("project_path", ""))
    os.makedirs(project_output_dir, exist_ok=True)

    payload["_project_id"] = project_id
    payload["_project_output_dir"] = project_output_dir
    payload["_project_rel_path"] = project_record.get("project_path")
    payload["_prompt_master"] = prompt_master.model_dump()
    payload["_prompt_text"] = prompt_master.prompt_text
    payload["prompt_master"] = prompt_master.model_dump()
    payload["stack_profile_id"] = stack_id
    payload["project_name"] = project_name
    payload["project_type"] = project_type
    payload["user_idea"] = payload.get("user_idea") or prompt_answers.get("project_description", "")
    payload["backend_stack"] = _backend_stack_name(stack_id)
    payload["project_language"] = prompt_answers.get("project_language", "pt")
    payload["project_description"] = prompt_answers.get("project_description", "")
    payload["documentation_context"] = docs_context
    payload["payment_status"] = project_record.get("payment_status", "pending_payment")
    payload["agent_boost_status"] = project_record.get("agent_boost_status", "inactive")

    streamer.broadcast_sync(project_id, "STREAM_TERMINAL", {"message": f"[SYSTEM] Starting generation for {project_name}"})
    streamer.broadcast_sync(project_id, "STREAM_CODE", {"chunk": f"# Project: {project_name}\n# Stack: {stack_id}\n"})

    result = run_project(payload)
    generation_status = result.get("status", "error")
    if generation_status != "success":
        update_project(project_id, {"status": "generation_failed"})
        streamer.broadcast_sync(project_id, "STREAM_TERMINAL", {"message": f"[ERROR] Generation failed for {project_name}"})
        return {
            "success": False,
            "id": project_id,
            "project_id": project_id,
            "project_name": project_name,
            "stack": stack_id,
            "status": generation_status,
            "message": result.get("message", "Falha ao gerar projeto"),
            "details": result.get("errors", []),
            "warnings": result.get("gatekeeper_warnings", []),
        }

    project_record = get_project(project_id) or {}
    payment_status = project_record.get("payment_status", "pending_payment")
    redirect_url = f"/downloads/{project_id}" if payment_status == "paid" else f"/projects/{project_id}/checkout"

    update_project(
        project_id,
        {
            "status": "generated",
            "project_path": result.get("project_path", project_record.get("project_path")),
            "absolute_project_path": result.get("path", project_output_dir),
            "path": result.get("project_path", project_record.get("project_path")),
            "generator_result_path": result.get("path"),
            "redirect_url": redirect_url,
            "preview_url": result.get("preview_url"),
            "generation_quality_mode": result.get("generation_quality_mode", payload.get("ai_generation_mode", "local_build_90")),
        },
    )
    streamer.broadcast_sync(project_id, "STREAM_ARCH", {"graph": result.get("architecture_graph", "User -> Orchestrator -> API -> Workers -> Database")})
    streamer.broadcast_sync(project_id, "STREAM_TERMINAL", {"message": f"[SYSTEM] Generation completed for {project_name}"})

    logger.info("Projeto gerado pelo pipeline oficial: %s (id=%s)", project_name, project_id)

    return {
        "success": True,
        "id": project_id,
        "project_id": project_id,
        "project_name": project_name,
        "stack": stack_id,
        "status": "generated",
        "message": f"Projeto {project_name} gerado com sucesso",
        "redirect_url": redirect_url,
        "download_url": f"/downloads/{project_id}",
        "checkout_url": f"/projects/{project_id}/checkout",
        "preview_url": result.get("preview_url"),
        "prompt_validated": True,
        "prompt_master_status": prompt_master.status,
        "documentation_status": docs_context.get("status"),
        "generation_quality_mode": result.get("generation_quality_mode", payload.get("ai_generation_mode", "local_build_90")),
        "effective_generation_mode": result.get("generation_quality_mode", payload.get("ai_generation_mode", "local_build_90")),
        "agent_boost_fallback": result.get("agent_boost_fallback", False),
        "agent_boost_reason": result.get("agent_boost_reason"),
    }
