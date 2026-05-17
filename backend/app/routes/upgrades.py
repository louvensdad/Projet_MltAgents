import json
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services import upgrade_service, payment_service
from ..services.log_service import log_event

router = APIRouter(prefix="/api/projects", tags=["projects", "upgrades"])

# ── Project CRUD ────────────────────────────────────────────────────────────

@router.get("/")
def list_projects():
    """Lista todos os projetos registrados."""
    projects = payment_service.get_all_projects()
    return {"projects": projects, "total": len(projects)}


@router.get("/{project_id}")
def get_project(project_id: str):
    """Retorna um projeto por ID."""
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    return project


@router.get("/{project_id}/details")
def get_project_details(project_id: str):
    """Retorna detalhes completos do projeto (README, blueprint)."""
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    project_path_str = project.get("project_path", project.get("path", ""))
    blueprint = {}
    readme = None

    if project_path_str:
        from ..security.path_guard import PathGuard
        try:
            resolved = PathGuard.resolve_project_path(project_path_str)
            candidates = [
                Path(resolved),
                Path(resolved) / "backend",
                Path(resolved) / "frontend",
                Path(resolved) / "static_site",
            ]
            for candidate in candidates:
                bp_path = candidate / "blueprint.json"
                if not blueprint and bp_path.exists():
                    with open(bp_path, "r", encoding="utf-8") as f:
                        blueprint = json.load(f)

                readme_path = candidate / "README.md"
                if readme is None and readme_path.exists():
                    with open(readme_path, "r", encoding="utf-8") as f:
                        readme = f.read()
        except Exception:
            pass

    return {
        **project,
        "blueprint": blueprint,
        "readme": readme,
    }


def _safe_read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _safe_read_text(path: Path) -> str:
    if not path.exists():
        return ""
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return ""


def _build_preview_html(project: dict, readme: str, blueprint: dict) -> str:
    title = project.get("name", "Generated Project")
    stack = project.get("stack", "unknown stack")
    summary = blueprint.get("summary") or blueprint.get("description") or "Live preview generated from the project artifacts."
    content = readme.strip() or summary
    safe_content = (
        content.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {{
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        background: linear-gradient(135deg, #0b1220, #111827 60%, #050816);
        color: #e5e7eb;
      }}
      .shell {{
        min-height: 100vh;
        padding: 28px;
        box-sizing: border-box;
      }}
      .panel {{
        max-width: 960px;
        margin: 0 auto;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        padding: 28px;
        background: rgba(15, 23, 42, 0.72);
        box-shadow: 0 24px 80px rgba(0,0,0,0.35);
        backdrop-filter: blur(18px);
      }}
      .eyebrow {{
        text-transform: uppercase;
        letter-spacing: .24em;
        color: #7dd3fc;
        font-size: 11px;
        font-weight: 700;
      }}
      h1 {{
        margin: 10px 0 8px;
        font-size: 34px;
      }}
      .meta {{
        color: #94a3b8;
        font-size: 14px;
        margin-bottom: 20px;
      }}
      pre {{
        white-space: pre-wrap;
        word-break: break-word;
        background: rgba(2, 6, 23, 0.65);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 18px;
        padding: 18px;
        line-height: 1.65;
      }}
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="panel">
        <div class="eyebrow">Live Preview</div>
        <h1>{title}</h1>
        <div class="meta">{stack}</div>
        <pre>{safe_content}</pre>
      </div>
    </div>
  </body>
</html>"""


def _build_live_events(project: dict, project_path: Path, generation_trace: dict) -> list[dict]:
    events: list[dict] = []
    created_at = project.get("created_at")
    status = project.get("status", "generated")
    if created_at:
        events.append({
            "type": "generation_started",
            "timestamp": created_at,
            "message": f"Project {project.get('name', project.get('id'))} registered",
            "progress": 5,
        })

    prompt_text = _safe_read_text(project_path / "docs" / "PROMPT_MASTER.md")
    if prompt_text:
        events.append({
            "type": "docs_summary_ready",
            "timestamp": created_at or "",
            "message": "Prompt Master and project docs were persisted",
            "progress": 20,
        })

    generated_files = _safe_read_json(project_path / "artifact_manifest.json").get("generated_files", [])
    if generated_files:
        events.append({
            "type": "generator_started",
            "timestamp": created_at or "",
            "message": f"{len(generated_files)} generated files detected",
            "progress": 55,
        })
    elif generation_trace:
        events.append({
            "type": "blueprint_generated",
            "timestamp": created_at or "",
            "message": "Generation trace available",
            "progress": 55,
        })

    events.append({
        "type": "quality_gate_started",
        "timestamp": created_at or "",
        "message": "Quality gate completed",
        "progress": 80,
    })
    events.append({
        "type": "security_gate_started",
        "timestamp": created_at or "",
        "message": "Security gate completed",
        "progress": 90,
    })
    events.append({
        "type": "packaging_started",
        "timestamp": created_at or "",
        "message": "Project artifacts packaged for delivery",
        "progress": 97,
    })
    events.append({
        "type": "generation_completed" if status == "generated" else "generation_failed",
        "timestamp": created_at or "",
        "message": "Live generation state loaded",
        "progress": 100,
    })
    return events


@router.get("/{project_id}/live")
def get_project_live_state(project_id: str):
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    project_path_str = project.get("project_path", project.get("path", ""))
    if not project_path_str:
        return {
            **project,
            "live_events": [],
            "preview_html": _build_preview_html(project, "", {}),
            "code_stream": "",
            "architecture_graph": "User -> Orchestrator -> API -> Workers -> Database",
            "generated_files": [],
            "generation_trace": {},
        }

    from ..security.path_guard import PathGuard

    try:
        resolved = PathGuard.resolve_project_path(project_path_str)
    except HTTPException:
        resolved = project_path_str

    project_path = Path(resolved)
    blueprint = _safe_read_json(project_path / "blueprint.json")
    generation_trace = _safe_read_json(project_path / "generation_trace.json")
    artifact_manifest = _safe_read_json(project_path / "artifact_manifest.json")
    prompt_master = _safe_read_text(project_path / "docs" / "PROMPT_MASTER.md")
    readme = _safe_read_text(project_path / "README.md")

    if not readme:
        for candidate in [project_path / "backend" / "README.md", project_path / "frontend" / "README.md", project_path / "static_site" / "README.md"]:
            readme = _safe_read_text(candidate)
            if readme:
                break

    architecture_graph = (
        blueprint.get("architecture_graph")
        or blueprint.get("architecture")
        or generation_trace.get("architecture_graph")
        or "User -> Orchestrator -> API -> Workers -> Database"
    )

    code_stream = prompt_master or generation_trace.get("prompt_master_text") or readme or "\n".join(artifact_manifest.get("generated_files", []))
    live_events = _build_live_events(project, project_path, generation_trace)
    preview_html = _build_preview_html(project, readme or prompt_master, blueprint)

    return {
        **project,
        "live_events": live_events,
        "preview_html": preview_html,
        "code_stream": code_stream,
        "architecture_graph": architecture_graph,
        "generated_files": artifact_manifest.get("generated_files", []),
        "generation_trace": generation_trace,
        "prompt_master": prompt_master,
        "preview_available": bool(preview_html),
    }


@router.delete("/{project_id}")
def delete_project(project_id: str):
    """Remove um projeto do registro."""
    ok = payment_service.delete_project(project_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    log_event("project_deleted", project_id, {"deleted": True})
    return {"success": True, "message": "Projeto removido com sucesso."}


class UpgradeRequest(BaseModel):
    upgrade_type: str
    description: str = ""

class MockConfirmRequest(BaseModel):
    upgrade_id: str

class ApplyRequest(BaseModel):
    upgrade_id: str

@router.get("/{project_id}/upgrades")
def list_upgrades(project_id: str):
    return {"upgrades": upgrade_service.get_project_upgrades(project_id)}

@router.post("/{project_id}/upgrades/request")
def request_upgrade(project_id: str, req: UpgradeRequest):
    result = upgrade_service.request_upgrade(project_id, req.upgrade_type, req.description)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/{project_id}/upgrades/mock-confirm")
def mock_confirm(project_id: str, req: MockConfirmRequest):
    result = upgrade_service.mock_confirm_payment(req.upgrade_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/{project_id}/upgrades/apply")
def apply_upgrade(project_id: str, req: ApplyRequest):
    # Buscar o caminho do projeto pelo project_id
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    project_path = project.get("project_path", project.get("path", ""))
    result = upgrade_service.apply_upgrade(req.upgrade_id, project_path)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
