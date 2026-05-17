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

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

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
    stack = str(
        payload.get("stack_id")
        or payload.get("stack_profile_id")
        or payload.get("project_type")
        or payload.get("wizard_type")
        or payload.get("backend_stack")
        or "static_site"
    )
    normalized = stack.strip().lower().replace(" ", "_").replace("+", "_").replace("-", "_")
    aliases = {
        "static_site": "static_site",
        "static": "static_site",
        "static-site": "static_site",
        "static_site_wizard": "static_site",
        "springboot": "spring_boot",
        "spring_boot": "spring_boot",
        "java_springboot": "spring_boot",
        "java_spring_boot": "spring_boot",
        "fastapi": "fastapi",
        "python_fastapi": "fastapi",
        "fast-api": "fastapi",
        "fast_api": "fastapi",
        "angular": "angular",
        "react": "react",
        "nextjs": "nextjs",
        "next-js": "nextjs",
        "next.js": "nextjs",
        "nestjs": "nestjs",
        "node_nestjs": "nestjs",
        "node-nestjs": "nestjs",
        "express": "express",
        "node_express": "express",
        "node-express": "express",
        "laravel": "laravel",
        "php_laravel": "laravel",
        "dotnet": "dotnet",
        "dotnet_aspnetcore": "dotnet",
        "aspnet_core": "dotnet",
        "asp-net": "dotnet",
        "blazor": "blazor",
        "vue": "vue",
        "automation": "automation",
        "ai_agents": "ai_agents",
        "ai-agents": "ai_agents",
        "agentes-ia": "ai_agents",
    }
    return aliases.get(normalized, normalized)


def _to_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _merge_answer_payload(payload: dict[str, Any]) -> dict[str, Any]:
    merged = dict(payload)
    answers = payload.get("answers")
    if isinstance(answers, dict):
        for key, value in answers.items():
            if key not in merged or merged.get(key) in (None, "", [], {}):
                merged[key] = value
    return merged


def _map_architecture(value: str, stack_id: str) -> str:
    raw = (value or "").lower()
    if stack_id == "spring_boot":
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
    locale = str(payload.get("project_language") or payload.get("locale") or "pt").strip()
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
        brand_colors = _to_list(payload.get("brand_colors")) or _to_list(payload.get("design", {}).get("brand_colors"))
        seo_keywords = _to_list(payload.get("seo_keywords")) or _to_list(payload.get("seo", {}).get("keywords"))
        animations = str(payload.get("animations") or payload.get("design", {}).get("animations") or "subtle")
        contact_method = str(payload.get("contact_method") or payload.get("forms", {}).get("contact_method") or "form")
        accessibility_level = str(payload.get("accessibility_level") or "strong")
        analytics = bool(payload.get("analytics", payload.get("seo", {}).get("analytics", True)))
        seo_title = payload.get("seo_title") or payload.get("seo", {}).get("meta_title") or project_name
        seo_description = payload.get("seo_description") or payload.get("seo", {}).get("meta_description") or payload.get("business_goal") or payload.get("project_description") or project_name
        section_summary = ", ".join(sections[:6]) if sections else "hero and contact sections"
        project_description = payload.get("project_description") or (
            f"{project_name} is a {str(payload.get('site_type') or 'landing page').replace('_', ' ')}"
            f" for {payload.get('target_audience') or 'qualified visitors'}."
            f" It should help the business goal of {payload.get('business_goal') or 'capturing leads'}"
            f" with sections like {section_summary} and a {payload.get('visual_style') or 'premium'} visual style."
        )
        base.update({
            "site_type": payload.get("site_type", "landing_page"),
            "business_goal": payload.get("business_goal") or f"Convert visitors through a {section_summary} experience for {project_name}.",
            "target_audience": payload.get("target_audience") or "general_users",
            "sections": sections,
            "visual_style": payload.get("visual_style") or payload.get("design", {}).get("visual_style", "premium"),
            "brand_colors": brand_colors,
            "seo_keywords": seo_keywords,
            "color_palette": ", ".join(brand_colors),
            "brand_tone": payload.get("visual_style") or "premium",
            "dark_mode": str(payload.get("visual_style") or "").lower() == "dark_tech",
            "contact_method": contact_method,
            "analytics": analytics,
            "animations": animations,
            "accessibility_level": accessibility_level,
            "language": payload.get("language") or payload.get("project_language") or locale,
            "seo_title": seo_title,
            "seo_description": seo_description,
            "meta_title": seo_title,
            "meta_description": seo_description,
            "open_graph": payload.get("open_graph", payload.get("seo", {}).get("open_graph", True)),
            "lazy_loading": payload.get("lazy_loading", payload.get("seo", {}).get("lazy_loading", True)),
            "seo": {
                "meta_title": seo_title,
                "meta_description": seo_description,
                "keywords": seo_keywords,
                "open_graph": payload.get("open_graph", payload.get("seo", {}).get("open_graph", True)),
                "sitemap": payload.get("sitemap", payload.get("seo", {}).get("sitemap", True)),
                "robots_txt": payload.get("robots_txt", payload.get("seo", {}).get("robots_txt", True)),
                "lazy_loading": payload.get("lazy_loading", payload.get("seo", {}).get("lazy_loading", True)),
            },
            "forms": {
                "contact_method": contact_method,
                "options": [] if contact_method == "none" else [contact_method],
            },
            "ux": {
                "options": [animations, accessibility_level],
            },
            "project_description": project_description,
            "gatekeeper_active": True,
            "confirmed_business_rules": [
                "Semantic HTML required",
                "No backend or database",
                "SEO, accessibility and responsiveness are mandatory",
            ],
            "confirmed_entities": ["LandingPage", "MarketingSection", "ContactForm"] if sections else ["LandingPage"],
            "confirmed_features": sections + brand_colors + seo_keywords + [contact_method, animations, accessibility_level],
            "required_files": [
                "index.html",
                "assets/css/style.css",
                "assets/js/main.js",
                "README.md",
                "docs/SEO.md",
                "docs/ACCESSIBILITY.md",
            ],
        })
        return base

    if stack_id == "spring_boot":
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
            "architecture": _map_architecture(str(payload.get("architecture", "")), "spring_boot"),
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
    from knowledge_engine.docs_fetcher import DocsFetcher
    from knowledge_engine.docs_registry import DocsRegistry

    try:
        fetcher = DocsFetcher(DocsRegistry())
        docs_result = fetcher.fetch_docs(stack_id)
        if isinstance(docs_result, dict) and docs_result.get("status") == "success":
            return docs_result
        return {
            "status": "fallback",
            "origin": "official_registry",
            "version": "registry-current",
            "cached": False,
            "content_summary": f"Documentation context available for {stack_id}.",
            "sources": [],
        }
    except Exception as exc:
        logger.warning("documentation.context_fallback stack=%s error=%s", stack_id, exc)
        return {
            "status": "fallback",
            "origin": "official_registry",
            "version": "registry-current",
            "cached": False,
            "content_summary": f"Documentation context fallback for {stack_id}.",
            "sources": [],
            "warning": str(exc),
        }


def _backend_stack_name(stack_id: str) -> str:
    return {
        "static_site": "Static HTML",
        "spring_boot": "Java + Spring Boot",
        "fastapi": "Python + FastAPI",
        "nestjs": "Node.js + NestJS",
        "express": "Node.js + Express",
        "laravel": "PHP + Laravel",
        "dotnet": "C# + ASP.NET Core",
        "angular": "Angular",
        "react": "React",
        "nextjs": "Next.js",
        "vue": "Vue",
        "blazor": "Blazor",
        "automation": "Automation",
        "ai_agents": "AI Agents",
    }.get(stack_id, stack_id)


def _project_type_for_stack(stack_id: str) -> str:
    if stack_id == "static_site":
        return "static_site"
    if stack_id in {"spring_boot", "fastapi", "nestjs", "express", "laravel", "dotnet"}:
        return "api"
    if stack_id in {"angular", "react", "nextjs", "vue", "blazor"}:
        return "frontend"
    if stack_id == "automation":
        return "automation"
    if stack_id == "ai_agents":
        return "ai_agents"
    return "api"


@router.post("/generate")
def generate_project(payload: dict[str, Any]):
    from agents.core.project_runner import run_project
    from ..security.path_guard import PathGuard
    from ..services.payment_service import get_project, register_project, update_project
    from prompt_engine.prompt_generator import PromptGeneratorEngine
    from ..streamer import streamer

    payload = _merge_answer_payload(payload)
    stack_id = _normalize_stack_id(payload)
    project_name = payload.get("project_name") or payload.get("site_name") or "projeto"
    project_type = payload.get("project_type") or _project_type_for_stack(stack_id)
    prompt_answers = _build_prompt_answers(payload, stack_id)

    logger.info("generate.start project=%s stack=%s", project_name, stack_id)

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
    payload["stack_id"] = stack_id
    payload["stack_profile_id"] = stack_id
    payload["project_name"] = project_name
    payload["project_type"] = project_type
    payload["project_brief"] = prompt_answers
    payload["brief"] = prompt_answers
    payload["user_idea"] = payload.get("user_idea") or prompt_answers.get("project_description", "")
    payload["backend_stack"] = _backend_stack_name(stack_id)
    payload["project_language"] = prompt_answers.get("project_language", "pt")
    payload["project_description"] = prompt_answers.get("project_description", "")
    payload["documentation_context"] = docs_context
    payload["payment_status"] = project_record.get("payment_status", "pending_payment")
    payload["agent_boost_status"] = project_record.get("agent_boost_status", "inactive")

    streamer.broadcast_sync(project_id, "STREAM_TERMINAL", {"message": f"[SYSTEM] Starting generation for {project_name}"})
    streamer.broadcast_sync(project_id, "STREAM_CODE", {"chunk": f"# Project: {project_name}\n# Stack: {stack_id}\n"})
    logger.info("generate.registry_saved project_id=%s path=%s", project_id, project_record.get("project_path"))

    result = run_project(payload)
    generation_status = str(result.get("status", "error"))
    artifact_exists = False
    try:
        artifact_exists = Path(project_output_dir).exists() and any(Path(project_output_dir).iterdir())
    except Exception:
        artifact_exists = False

    if generation_status != "success" and not artifact_exists:
        update_project(project_id, {"status": "generation_failed", "generation_status": "failed"})
        streamer.broadcast_sync(project_id, "STREAM_TERMINAL", {"message": f"[ERROR] Generation failed for {project_name}"})
        logger.error("generate.response failure project_id=%s status=%s errors=%s", project_id, generation_status, result.get("errors", []))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error_code": "GENERATION_FAILED",
                "stage": "generator",
                "message": result.get("message", "Falha ao gerar projeto"),
                "details": result.get("errors", []),
            },
        )

    if generation_status != "success" and artifact_exists:
        result.setdefault("warnings", []).append("Runner returned non-success status, but project artifacts were created on disk.")
        generation_status = "success"

    project_record = get_project(project_id) or {}
    stored_payment_status = project_record.get("payment_status", "pending_payment")
    if stack_id == "static_site":
        stored_payment_status = "free"
    payment_required = stored_payment_status not in {"paid", "free"}
    download_ready = not payment_required
    download_url = f"/downloads/{project_id}" if download_ready else None
    checkout_url = f"/projects/{project_id}/checkout" if payment_required else None
    redirect_url = checkout_url or download_url

    update_project(
        project_id,
        {
            "status": "generated",
            "generation_status": "generated",
            "project_path": result.get("project_path", project_record.get("project_path")),
            "absolute_project_path": result.get("path", project_output_dir),
            "path": result.get("project_path", project_record.get("project_path")),
            "generator_result_path": result.get("path"),
            "redirect_url": redirect_url,
            "preview_url": result.get("preview_url"),
            "generation_quality_mode": result.get("generation_quality_mode", payload.get("ai_generation_mode", "local_build_90")),
            "stack_id": stack_id,
            "project_type": project_type,
            "payment_status": stored_payment_status,
            "download_ready": download_ready,
        },
    )
    streamer.broadcast_sync(project_id, "STREAM_ARCH", {"graph": result.get("architecture_graph", "User -> Orchestrator -> API -> Workers -> Database")})
    streamer.broadcast_sync(project_id, "STREAM_TERMINAL", {"message": f"[SYSTEM] Generation completed for {project_name}"})

    logger.info("generate.success project=%s id=%s download_ready=%s payment_required=%s", project_name, project_id, download_ready, payment_required)

    response = {
        "success": True,
        "id": project_id,
        "project_id": project_id,
        "project_name": project_name,
        "stack": stack_id,
        "stack_id": stack_id,
        "project_type": project_type,
        "project_path": project_record.get("project_path"),
        "status": "generated",
        "message": "Projeto gerado com sucesso." if not payment_required else "Projeto gerado. Checkout necessário para liberar o download.",
        "payment_required": payment_required,
        "download_ready": download_ready,
        "redirect_url": redirect_url,
        "download_url": download_url,
        "checkout_url": checkout_url,
        "preview_url": result.get("preview_url"),
        "prompt_validated": True,
        "prompt_master_status": prompt_master.status,
        "documentation_status": docs_context.get("status"),
        "generation_quality_mode": result.get("generation_quality_mode", payload.get("ai_generation_mode", "local_build_90")),
        "effective_generation_mode": result.get("generation_quality_mode", payload.get("ai_generation_mode", "local_build_90")),
        "agent_boost_fallback": result.get("agent_boost_fallback", False),
        "agent_boost_reason": result.get("agent_boost_reason"),
    }
    logger.info("generate.response project_id=%s payload=%s", project_id, {k: response.get(k) for k in ("success", "project_id", "stack_id", "payment_required", "download_ready", "redirect_url")})
    return response
