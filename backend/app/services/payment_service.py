import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from .log_service import log_event

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "projects.json"

# Repo root for path resolution
REPO_ROOT = DATA_FILE.parent.parent.parent.parent.resolve()
PROJECTS_ROOT = REPO_ROOT / "generated_projects"


def normalize_project_path(project_name: str) -> str:
    """
    Normalize project name to a valid path name.
    "gerenciamento de usuarios" → "gerenciamento_de_usuarios"
    Returns relative path: generated_projects/{normalized}
    """
    normalized_name = project_name.replace(" ", "_").lower()
    return f"generated_projects/{normalized_name}"


def build_project_paths(name: str, project_id: str) -> tuple[str, str]:
    normalized_name = name.replace(" ", "_").lower() if name else project_id
    project_path = f"generated_projects/{normalized_name}_{project_id}"
    absolute_project_path = str((PROJECTS_ROOT / f"{normalized_name}_{project_id}").resolve())
    return project_path, absolute_project_path


def _load() -> list:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")
    raw = DATA_FILE.read_text(encoding="utf-8")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Recover from trailing corrupted content instead of taking down the pipeline.
        decoder = json.JSONDecoder()
        try:
            data, _ = decoder.raw_decode(raw)
            if isinstance(data, list):
                _save(data)
                return data
        except json.JSONDecodeError:
            pass
        DATA_FILE.write_text("[]", encoding="utf-8")
        return []


def _save(projects: list):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)


def register_project(name: str, project_type: str, stack: str, path: str = None) -> str:
    """Registra um projeto gerado e retorna o project_id."""
    projects = _load()
    project_id = str(uuid.uuid4())[:8]

    # Include project_id in path to prevent collisions on duplicate names
    project_path, absolute_project_path = build_project_paths(name, project_id)

    project_data = {
        "id": project_id,
        "name": name,
        "type": project_type,
        "stack": stack,
        "project_path": project_path,               # relative: generated_projects/{id}
        "absolute_project_path": absolute_project_path,  # absolute: C:/.../generated_projects/{id}
        "path": project_path,                        # kept for backward compatibility
        "created_at": datetime.now().isoformat(),
        "status": "generated",
        "payment_status": "pending_payment",
        "agent_boost_status": "inactive",
        "ai_boost_status": "inactive",
        "upgrade_status": "none",
        "usage": {
            "ai_requests_used": 0,
            "ai_requests_limit": 50
        }
    }
    projects.append(project_data)
    _save(projects)
    log_event("project_created", project_id, project_data)
    return project_id


def get_project(project_id: str) -> dict | None:
    """Fetch project by ID."""
    return next((p for p in _load() if p["id"] == project_id), None)


def get_project_by_name(project_name: str) -> dict | None:
    """Fetch project by name (normalized match)."""
    normalized = project_name.replace(" ", "_").lower()
    for p in _load():
        p_normalized = p.get("name", "").replace(" ", "_").lower()
        if p_normalized == normalized:
            return p
    return None


def get_all_projects() -> list:
    return _load()


def update_project(project_id: str, updates: dict) -> bool:
    """Atualiza campos de um projeto."""
    projects = _load()
    for p in projects:
        if p["id"] == project_id:
            if "agent_boost_status" in updates and "ai_boost_status" not in updates:
                updates["ai_boost_status"] = updates["agent_boost_status"]
            if "ai_boost_status" in updates and "agent_boost_status" not in updates:
                updates["agent_boost_status"] = updates["ai_boost_status"]
            p.update(updates)
            _save(projects)
            return True
    return False


def update_payment_status(project_id: str, status: str) -> bool:
    projects = _load()
    for p in projects:
        if p["id"] == project_id:
            p["payment_status"] = status
            if status == "paid":
                p["status"] = "paid"
                log_event("payment_confirmed", project_id, {"new_status": "paid"})
            _save(projects)
            return True
    return False


PLANS = {
    "basic": {"name": "Download Único", "price_mock": "R$ 29,90"},
    "with_docs": {"name": "Download + Documentação", "price_mock": "R$ 49,90"},
    "with_support": {"name": "Download + Suporte Futuro", "price_mock": "R$ 79,90"},
}


def create_checkout(project_id: str, plan: str) -> dict:
    """Cria sessão de pagamento (mock por enquanto)."""
    project = get_project(project_id)
    if not project:
        return {"error": "Project not found"}
    plan_info = PLANS.get(plan, PLANS["basic"])
    return {
        "project_id": project_id,
        "plan": plan,
        "plan_name": plan_info["name"],
        "amount": plan_info["price_mock"],
        "provider": os.getenv("PAYMENT_PROVIDER", "mock"),
        "status": "pending",
        "checkout_url": None
    }


def mock_confirm(project_id: str) -> dict:
    """Simula confirmação de pagamento (modo MOCK)."""
    ok = update_payment_status(project_id, "paid")
    if ok:
        return {"project_id": project_id, "payment_status": "paid", "message": "Pagamento simulado aprovado!"}
    return {"error": "Project not found"}


def delete_project(project_id: str) -> bool:
    """Remove um projeto do banco e opcionalmente deleta os arquivos do disco."""
    projects = _load()
    project = next((p for p in projects if p["id"] == project_id), None)

    if not project:
        return False

    # Remove da lista
    new_projects = [p for p in projects if p["id"] != project_id]
    _save(new_projects)

    log_event("project_deleted", project_id, {"name": project.get("name")})
    return True
