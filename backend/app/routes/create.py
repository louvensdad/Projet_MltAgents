"""
routes/create.py — Endpoints de Criação por Stack
Valida e cria projetos isolados por stack/linguagem.
"""
import json
import os
import sys
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["create"])


class CreateProjectPayload(BaseModel):
    project_type: str
    stack_profile_id: str
    project_name: str
    project_description: Optional[str] = ""
    backend_stack: Optional[str] = None
    frontend_stack: Optional[str] = None
    selected_versions: Dict[str, Any] = {}
    selected_stack_options: Dict[str, List[str]] = {}
    confirmed_entities: List[str] = []
    confirmed_features: List[str] = []
    confirmed_business_rules: List[str] = []

    class Config:
        extra = "allow"


class ValidateStackPayload(BaseModel):
    stack_profile_id: str
    project_name: str
    selected_versions: Dict[str, Any] = {}
    selected_stack_options: Dict[str, List[str]] = {}

    class Config:
        extra = "allow"


def _resolve_stack_id(raw: str) -> str:
    """Normalize stack_profile_id to our internal ID."""
    mapping = {
        "java_springboot": "springboot",
        "python_fastapi": "fastapi",
        "node_nestjs": "nestjs",
        "node_express": "express",
        "php_laravel": "laravel",
        "dotnet_aspnetcore": "dotnet",
        "static_site": "static",
    }
    return mapping.get(raw, raw)


def _get_profile(stack_id: str) -> dict:
    try:
        from config.stack_profiles import STACK_PROFILES
        result = STACK_PROFILES.get(stack_id)
        if result:
            return result
        for sid, prof in STACK_PROFILES.items():
            if prof.get("id") == stack_id:
                return prof
        return {}
    except ImportError:
        return {}


def _get_frontend_matrix():
    try:
        from config.frontend_compatibility import BACKEND_FRONTEND_MATRIX
        return BACKEND_FRONTEND_MATRIX
    except ImportError:
        return {}


def _stack_statuses():
    from generators.generator_adapters import STACK_STATUS, STACK_NAMES
    backend_profiles = _load_all_backend_profiles()
    results = []
    seen = set()
    for sid, status in STACK_STATUS.items():
        normalized = _resolve_stack_id(sid)
        if normalized in seen:
            continue
        seen.add(normalized)
        name = STACK_NAMES.get(sid, sid)
        # Also check backend profiles
        for bsid, bprof in backend_profiles.items():
            if bsid == normalized or bprof.get("id") == sid:
                name = bprof.get("name", name)
                break
        results.append({
            "id": sid,
            "name": name,
            "status": status,
        })
    # Add profiles that are not in STACK_STATUS
    for sid, prof in backend_profiles.items():
        norm = _resolve_stack_id(prof.get("id", sid))
        if norm not in seen:
            seen.add(norm)
            results.append({
                "id": prof.get("id", sid),
                "name": prof.get("name", sid),
                "status": "not_implemented",
            })
    return sorted(results, key=lambda x: x["name"])


def _load_all_backend_profiles():
    try:
        from config.stack_profiles import STACK_PROFILES
        return STACK_PROFILES
    except ImportError:
        return {}


@router.get("/create/stacks")
def list_stacks():
    """Lista todas as stacks com status do gerador."""
    stacks = _stack_statuses()
    return {"stacks": stacks}


@router.get("/create/stack/{raw_id}")
def get_stack_info(raw_id: str):
    """Retorna informações detalhadas de uma stack, sem opções de outras stacks."""
    stack_id = _resolve_stack_id(raw_id)
    profile = _get_profile(stack_id)

    if not profile:
        # Check by raw_id
        profile = _get_profile(raw_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Stack '{raw_id}' não encontrada")

    from generators.generator_adapters import STACK_STATUS, STACK_NAMES

    profile_id = profile.get("id", stack_id)
    name = profile.get("name", STACK_NAMES.get(stack_id, raw_id))
    status = STACK_STATUS.get(stack_id) or STACK_STATUS.get(profile_id) or "not_implemented"

    return {
        "stack_id": stack_id,
        "name": name,
        "status": status,
        "category": profile.get("category", "backend"),
        "allowed_databases": profile.get("allowed_databases", []),
        "allowed_auth": profile.get("allowed_auth", []),
        "allowed_architecture": profile.get("allowed_architecture", []),
        "allowed_testing": profile.get("allowed_testing", []),
        "allowed_messaging": profile.get("allowed_messaging", []),
        "recommended_frontends": profile.get("recommended_frontends", []),
        "recommended_backends": profile.get("recommended_backends", []),
        "required_files": profile.get("required_files", []),
        "forbidden_terms": profile.get("forbidden_terms", []),
    }


@router.post("/create/validate")
def validate_stack_payload(payload: ValidateStackPayload):
    """Valida o payload sem criar projeto."""
    stack_id = _resolve_stack_id(payload.stack_profile_id)
    profile = _get_profile(stack_id)

    if not profile:
        return {"valid": False, "errors": [f"Stack '{payload.stack_profile_id}' não encontrada"], "warnings": [], "recommendations": []}

    from generators.project_generator_factory import ProjectGeneratorFactory

    result = ProjectGeneratorFactory.validate_payload(
        stack_id=stack_id,
        stack_name=profile.get("name", stack_id),
        payload=payload.model_dump(),
    )

    # Also check version matrix
    try:
        from config.version_matrix import VERSION_MATRIX
        for key, value in payload.selected_versions.items():
            if key in VERSION_MATRIX:
                if value not in VERSION_MATRIX[key].get("versions", {}):
                    result["errors"].append(f"Versão '{value}' não suportada para {key}")
    except ImportError:
        pass

    result["valid"] = len(result["errors"]) == 0
    return result


@router.post("/create")
def create_project(payload: CreateProjectPayload):
    """Cria projeto validando stack e acionando o gerador correto."""
    try:
        stack_id = _resolve_stack_id(payload.stack_profile_id)
        profile = _get_profile(stack_id)
        stack_name = profile.get("name", payload.stack_profile_id)

        # Validate
        from generators.project_generator_factory import ProjectGeneratorFactory
        validation = ProjectGeneratorFactory.validate_payload(
            stack_id=stack_id,
            stack_name=stack_name,
            payload=payload.model_dump(),
        )

        if not validation.get("valid", False):
            return {
                "success": False,
                "error_code": "VALIDATION_ERROR",
                "message": "Validação da stack falhou",
                "details": validation.get("errors", []),
            }

        # Check for required files
        required = profile.get("required_files", [])
        if required and payload.project_type != "frontend":
            is_static = stack_id in ("static", "static_site") or profile.get("category") == "static"
            if is_static and "index.html" in required:
                pass  # StaticSiteGenerator will create it

        # Generate
        result = ProjectGeneratorFactory.generate(
            stack_id=stack_id,
            stack_name=stack_name,
            payload=payload.model_dump(),
        )

        status = result.get("status", "error")

        if status == "not_implemented":
            return {
                "success": False,
                "error_code": "STACK_NOT_IMPLEMENTED",
                "message": result.get("message", f"Gerador ainda não implementado para {stack_name}"),
                "details": [payload.stack_profile_id],
            }

        if status != "success":
            return {
                "success": False,
                "error_code": "GENERATION_FAILED",
                "message": result.get("message", "Falha ao gerar projeto"),
                "details": [str(result)],
            }

        # Register project (path is computed automatically by register_project)
        project_id = _register_project(payload, stack_name)

        logger.info(f"Projeto criado: {payload.project_name} (stack={stack_name}, id={project_id})")

        return {
            "success": True,
            "project_id": project_id,
            "project_name": payload.project_name,
            "stack": stack_name,
            "stack_profile_id": payload.stack_profile_id,
            "message": f"Projeto {payload.project_name} criado com sucesso",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erro ao criar projeto")
        return {
            "success": False,
            "error_code": "INTERNAL_ERROR",
            "message": "Erro interno ao criar projeto",
            "details": [str(e)],
        }


def _register_project(payload: CreateProjectPayload, stack_name: str) -> str:
    try:
        from ..services.payment_service import register_project
        project_id = register_project(
            name=payload.project_name,
            project_type=payload.project_type,
            stack=stack_name,
        )
        return project_id
    except ImportError:
        import uuid
        return str(uuid.uuid4())[:8]
