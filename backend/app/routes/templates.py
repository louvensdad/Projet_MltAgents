from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from backend.templates import TemplateRegistry

router = APIRouter(prefix="/api", tags=["templates"])
registry = TemplateRegistry()


@router.get("/templates")
def list_templates():
    return {
        "catalog": registry.list_public_templates(),
        "featured": registry.list_featured(),
        "categories": registry.list_by_category(),
        "stats": registry.stats(),
        "source": "template_registry",
    }


@router.get("/templates/{template_id}")
def get_template(template_id: str):
    try:
        return {"template": registry.get_template(template_id), "source": "template_registry"}
    except KeyError:
        raise HTTPException(status_code=404, detail="Template not found")


@router.get("/templates/{template_id}/preview")
def get_template_preview(template_id: str):
    try:
        return registry.get_preview(template_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Template not found")


@router.get("/templates/{template_id}/blueprint")
def get_template_blueprint(template_id: str):
    try:
        return registry.get_blueprint(template_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Template not found")


@router.post("/templates/{template_id}/prepare-generation")
def prepare_generation(template_id: str, payload: dict[str, Any] | None = None):
    try:
        return registry.prepare_generation(template_id, payload or {})
    except KeyError:
        raise HTTPException(status_code=404, detail="Template not found")
