"""routes/prompt_routes.py — Prompt Generator Engine API endpoints."""

import json
import os
import sys
import logging
from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
SRC_DIR = os.path.join(ROOT_DIR, "src")
for candidate in (ROOT_DIR, SRC_DIR):
    if candidate not in sys.path:
        sys.path.insert(0, candidate)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/prompt", tags=["prompt"])


# ── Request/Response Models ──────────────────────────────────────────────────

class PromptAnswersRequest(BaseModel):
    stack_id: str
    project_type: Optional[str] = None
    answers: dict[str, Any] = {}
    locale: Optional[str] = None

class PromptValidateRequest(BaseModel):
    stack_id: str
    project_type: Optional[str] = None
    project_name: str
    answers: dict[str, Any] = {}
    locale: Optional[str] = None


def _normalize_stack_id(stack_id: str) -> str:
    from stack_registry.registry import StackRegistry
    return StackRegistry.normalize_stack_id(stack_id)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/stacks")
def list_prompt_stacks():
    """Lista todas as stacks com suporte ao Prompt Generator Engine."""
    try:
        from prompt_engine.prompt_generator import PromptGeneratorEngine
        stacks = PromptGeneratorEngine.list_stacks()
        return {"stacks": stacks, "total": len(stacks)}
    except ImportError:
        return {"stacks": [], "total": 0, "message": "Prompt Engine not available"}


@router.get("/profile/{stack_id}")
def get_stack_profile(stack_id: str):
    """Retorna o perfil de perguntas para uma stack especifica."""
    try:
        from prompt_engine.stack_prompt_profiles import get_stack_profile

        profile = get_stack_profile(stack_id)
        questions = []
        for g in sorted(profile.question_groups, key=lambda g: g.order):
            for q in sorted(g.questions, key=lambda q: q.order):
                questions.append({
                    "id": q.id,
                    "group": q.group,
                    "group_label": g.label,
                    "text": q.text,
                    "description": q.description,
                    "type": q.type,
                    "options": q.options,
                    "default": q.default,
                    "required": q.id in profile.required_question_ids,
                    "order": q.order,
                })

        return {
            "stack_id": profile.stack_id,
            "stack_name": profile.stack_name,
            "category": profile.category,
            "question_count": len(questions),
            "required_count": len(profile.required_question_ids),
            "forbidden_terms": profile.forbidden_terms,
            "required_files": profile.required_files,
            "questions": questions,
        }
    except ImportError:
        raise HTTPException(503, "Prompt Engine not available")
    except KeyError:
        raise HTTPException(404, f"Stack profile not found: {stack_id}")


@router.post("/build")
def build_prompt_master(req: PromptAnswersRequest):
    """Constroi e valida um Prompt Master a partir das respostas do wizard."""
    try:
        from prompt_engine.prompt_generator import PromptGeneratorEngine
    except ImportError:
        raise HTTPException(503, "Prompt Engine not available")

    try:
        stack_id = _normalize_stack_id(req.stack_id or req.project_type or "")
        engine = PromptGeneratorEngine(stack_id)
        engine.answer_bulk(req.answers)

        if not engine.validate():
            missing = engine.missing_required()
            return {
                "success": False,
                "status": "rejected",
                "stack_id": stack_id,
                "errors": engine.errors,
                "warnings": engine.warnings,
                "missing_fields": missing,
                "validation": {"passed": False},
            }

        master = engine.finalize()
        return {
            "success": True,
            "status": master.status,
            "stack_id": stack_id,
            "prompt_master": master.model_dump(),
            "warnings": engine.warnings,
            "missing_fields": [],
            "validation": {"passed": True},
        }
    except (KeyError, ValueError):
        raise HTTPException(404, f"Stack profile not found: {req.stack_id}")
    except Exception as e:
        logger.exception("Prompt build failed")
        raise HTTPException(500, f"Prompt build error: {e}")


@router.post("/validate")
def validate_prompt(req: PromptValidateRequest):
    """Valida se as respostas do wizard atendem aos requisitos da stack."""
    try:
        from prompt_engine.prompt_generator import PromptGeneratorEngine
    except ImportError:
        raise HTTPException(503, "Prompt Engine not available")

    try:
        stack_id = _normalize_stack_id(req.stack_id or req.project_type or "")
        engine = PromptGeneratorEngine(stack_id)

        # Always set project_name explicitly
        engine.answer("project_name", req.project_name)
        engine.answer_bulk(req.answers)

        if not engine.validate():
            return {
                "valid": False,
                "stack_id": stack_id,
                "errors": engine.errors,
                "warnings": engine.warnings,
                "missing_fields": engine.missing_required(),
                "answered_count": engine.answered_count,
                "total_questions": engine.total_questions,
            }

        return {
            "valid": True,
            "stack_id": stack_id,
            "warnings": engine.warnings,
            "answered_count": engine.answered_count,
            "total_questions": engine.total_questions,
            "stack_name": engine.stack_name,
        }
    except (KeyError, ValueError):
        raise HTTPException(404, f"Stack profile not found: {req.stack_id}")
    except Exception as e:
        logger.exception("Prompt validation failed")
        raise HTTPException(500, f"Prompt validation error: {e}")


@router.get("/template/{stack_id}")
def get_prompt_template(stack_id: str):
    """Retorna o template de prompt markdown para uma stack."""
    template_dirs = [
        os.path.join(ROOT_DIR, "prompt_engine", "templates"),
        os.path.join(ROOT_DIR, "prompt_engine", "prompt_templates"),
    ]
    normalized_stack_id = _normalize_stack_id(stack_id)
    template_path = None

    for template_dir in template_dirs:
        candidate = os.path.join(template_dir, f"{normalized_stack_id}_prompt.md")
        if os.path.exists(candidate):
            template_path = candidate
            break

    if not template_path:
        raise HTTPException(404, f"No prompt template for stack: {normalized_stack_id}")

    with open(template_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {"stack_id": normalized_stack_id, "template": content}
