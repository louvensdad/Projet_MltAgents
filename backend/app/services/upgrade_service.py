import json
import uuid
import shutil
import os
from datetime import datetime
from pathlib import Path

UPGRADES_FILE = Path(__file__).parent.parent.parent / "data" / "upgrades.json"

# Preços por complexidade
UPGRADE_CATALOG = {
    "connect_frontend_backend": {"label": "Conectar Frontend ao Backend", "price": 19.90, "tier": "simples"},
    "add_external_api":         {"label": "Adicionar API Externa",          "price": 49.90, "tier": "médio"},
    "add_feature":              {"label": "Adicionar Nova Funcionalidade",  "price": 49.90, "tier": "médio"},
    "add_entity_crud":          {"label": "Adicionar Nova Entidade/CRUD",   "price": 49.90, "tier": "médio"},
    "add_automation":           {"label": "Adicionar Automação",            "price": 49.90, "tier": "médio"},
    "add_agent":                {"label": "Adicionar Agente Inteligente",   "price": 99.90, "tier": "avançado"},
    "add_authentication":       {"label": "Adicionar Autenticação",         "price": 49.90, "tier": "médio"},
    "add_payment":              {"label": "Adicionar Pagamento",            "price": 99.90, "tier": "avançado"},
    "improve_design_ux":        {"label": "Melhorar Design/UX",             "price": 19.90, "tier": "simples"},
    "fix_configuration":        {"label": "Corrigir Configuração",          "price": 19.90, "tier": "simples"},
    "generate_extra_docs":      {"label": "Gerar Documentação Extra",       "price": 19.90, "tier": "simples"},
}

def _load_upgrades() -> list:
    UPGRADES_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not UPGRADES_FILE.exists():
        UPGRADES_FILE.write_text("[]", encoding="utf-8")
    with open(UPGRADES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_upgrades(upgrades: list):
    with open(UPGRADES_FILE, "w", encoding="utf-8") as f:
        json.dump(upgrades, f, ensure_ascii=False, indent=2)

def get_upgrade(upgrade_id: str) -> dict | None:
    return next((u for u in _load_upgrades() if u["upgrade_id"] == upgrade_id), None)

def get_project_upgrades(project_id: str) -> list:
    return [u for u in _load_upgrades() if u["project_id"] == project_id]

from .payment_service import get_project, update_project
from .log_service import log_event # Import log_event

def request_upgrade(project_id: str, upgrade_type: str, description: str) -> dict:
    catalog = UPGRADE_CATALOG.get(upgrade_type)
    if not catalog:
        return {"error": f"Tipo de upgrade inválido: {upgrade_type}"}

    upgrade_id = str(uuid.uuid4())[:8]
    upgrade = {
        "upgrade_id": upgrade_id,
        "project_id": project_id,
        "upgrade_type": upgrade_type,
        "upgrade_label": catalog["label"],
        "tier": catalog["tier"],
        "description": description,
        "price": catalog["price"],
        "payment_status": "pending_payment",
        "upgrade_status": "requested",
        "created_at": datetime.now().isoformat(),
        "applied_at": None,
        "log": []
    }

    upgrades = _load_upgrades()
    upgrades.append(upgrade)
    _save_upgrades(upgrades)
    
    # Atualizar status no projeto
    update_project(project_id, {"upgrade_status": "requested"})
    log_event("upgrade_requested", project_id, {"upgrade_id": upgrade_id, "type": upgrade_type}) # Log upgrade request
    
    return upgrade

def mock_confirm_payment(upgrade_id: str) -> dict:
    upgrades = _load_upgrades()
    for u in upgrades:
        if u["upgrade_id"] == upgrade_id:
            u["payment_status"] = "paid"
            u["upgrade_status"] = "paid"
            _save_upgrades(upgrades)
            
            # Atualizar status no projeto
            update_project(u["project_id"], {"upgrade_status": "paid"})
            
            return {"upgrade_id": upgrade_id, "payment_status": "paid", "message": "Pagamento simulado aprovado!"}
    return {"error": "Upgrade não encontrado"}

def _backup_project(project_path: str, project_name: str) -> str:
    """Cria backup compactado do projeto antes de aplicar upgrade."""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path(project_path).parent / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_zip = backup_dir / f"{project_name}_{ts}"
    shutil.make_archive(str(backup_zip), "zip", project_path)
    return str(backup_zip) + ".zip"

def _add_log(upgrades: list, upgrade_id: str, msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    for u in upgrades:
        if u["upgrade_id"] == upgrade_id:
            u["log"].append(f"[{ts}] {msg}")

def apply_upgrade(upgrade_id: str, project_path: str) -> dict:
    """Aplica o upgrade no projeto (somente se pago). Faz backup antes."""
    upgrades = _load_upgrades()
    upgrade = next((u for u in upgrades if u["upgrade_id"] == upgrade_id), None)

    if not upgrade:
        return {"error": "Upgrade não encontrado"}
    if upgrade["payment_status"] != "paid":
        return {"error": "Pagamento não confirmado. Não é possível aplicar o upgrade."}
    if upgrade["upgrade_status"] == "applied":
        return {"error": "Este upgrade já foi aplicado."}

    project_dir = Path(project_path)
    project_name = project_dir.name

    # 1. Backup obrigatório antes de qualquer alteração
    _add_log(upgrades, upgrade_id, "Iniciando backup do projeto...")
    try:
        backup_path = _backup_project(project_path, project_name)
        _add_log(upgrades, upgrade_id, f"Backup criado: {backup_path}")
    except Exception as e:
        _add_log(upgrades, upgrade_id, f"ERRO no backup: {e}")
        upgrade["upgrade_status"] = "failed"
        _save_upgrades(upgrades)
        return {"error": f"Falha no backup: {e}"}

    # 2. Execução específica por tipo
    try:
        utype = upgrade["upgrade_type"]
        result_msg = _execute_upgrade(utype, project_dir, upgrade, upgrades, upgrade_id)
        upgrade["upgrade_status"] = "applied"
        upgrade["applied_at"] = datetime.now().isoformat()
        _add_log(upgrades, upgrade_id, f"Upgrade aplicado com sucesso: {result_msg}")
        
        # Atualizar status no projeto
        update_project(upgrade["project_id"], {"upgrade_status": "applied"})
    except Exception as e:
        upgrade["upgrade_status"] = "failed"
        _add_log(upgrades, upgrade_id, f"ERRO ao aplicar upgrade: {e}")
        _save_upgrades(upgrades)
        return {"error": str(e)}

    _save_upgrades(upgrades)
    return {
        "upgrade_id": upgrade_id,
        "upgrade_status": "applied",
        "backup": backup_path,
        "log": upgrade["log"]
    }

def _write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

def _execute_upgrade(utype: str, project_dir: Path, upgrade: dict, upgrades: list, uid: str) -> str:
    docs_dir = project_dir / "backend" / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    desc = upgrade.get("description", "")

    if utype == "connect_frontend_backend":
        _add_log(upgrades, uid, "Gerando api_client.ts e documentação de conexão...")
        _write(project_dir / "frontend" / "src" / "lib" / "api_client.ts",
            "// API Client - Gerado pelo Upgrade Center (Ldcn)\n"
            "const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';\n\n"
            "export async function apiFetch(path: string, options?: RequestInit) {\n"
            "  const res = await fetch(`${BASE_URL}${path}`, {\n"
            "    headers: { 'Content-Type': 'application/json' },\n"
            "    ...options\n"
            "  });\n"
            "  if (!res.ok) throw new Error(await res.text());\n"
            "  return res.json();\n"
            "}\n")
        _write(docs_dir / "FRONTEND_BACKEND_CONNECTION.md",
            f"# Conexão Frontend ↔ Backend\n\nGerado em: {ts}\n\n"
            "## Como usar\n\n"
            "```ts\nimport { apiFetch } from '@/lib/api_client';\n\n"
            "const data = await apiFetch('/api/users');\n```\n\n"
            "## Variáveis de Ambiente\n\nAdicione no `.env.local`:\n\n"
            "```\nNEXT_PUBLIC_API_URL=http://localhost:8001\n```\n\n"
            "> Upgrade generated with **Ldcn**\n")

    elif utype == "add_external_api":
        _add_log(upgrades, uid, "Criando integration_service.py e .env.example...")
        _write(project_dir / "backend" / "app" / "services" / "integration_service.py",
            f"# Integration Service — gerado pelo Upgrade Center (Ldcn)\n"
            f"# Integração: {desc}\n\nimport os\nimport httpx\n\n"
            "EXTERNAL_API_URL = os.getenv('EXTERNAL_API_URL', '')\n"
            "EXTERNAL_API_KEY = os.getenv('EXTERNAL_API_KEY', '')\n\n"
            "async def call_external_api(endpoint: str, payload: dict) -> dict:\n"
            "    async with httpx.AsyncClient() as client:\n"
            "        r = await client.post(\n"
            "            f'{EXTERNAL_API_URL}{endpoint}',\n"
            "            headers={'Authorization': f'Bearer {EXTERNAL_API_KEY}'},\n"
            "            json=payload\n"
            "        )\n"
            "        r.raise_for_status()\n"
            "        return r.json()\n")
        _write(project_dir / "backend" / ".env.example.upgrade",
            "# Variáveis para API externa adicionada via Upgrade\n"
            "EXTERNAL_API_URL=https://api.example.com\n"
            "EXTERNAL_API_KEY=\n")
        _write(docs_dir / "INTEGRATIONS.md",
            f"# Integrações\n\nAtualizado em: {ts}\n\n"
            f"## {desc}\n\nServiço em `app/services/integration_service.py`.\n\n"
            "> Upgrade generated with **Ldcn**\n")

    elif utype == "add_entity_crud":
        entity = desc.strip().replace(" ", "") or "NovaEntidade"
        _add_log(upgrades, uid, f"Gerando CRUD para entidade: {entity}...")
        for layer in ["models", "schemas", "repositories", "services", "api/routes"]:
            (project_dir / "backend" / "app" / layer).mkdir(parents=True, exist_ok=True)
        _write(project_dir / "backend" / "app" / "models" / f"{entity.lower()}.py",
            f"# Model {entity} — gerado pelo Upgrade Center (Ldcn)\n"
            "from sqlalchemy import Column, Integer, String\nfrom ..db.base import Base\n\n"
            f"class {entity}(Base):\n    __tablename__ = '{entity.lower()}s'\n"
            "    id = Column(Integer, primary_key=True, index=True)\n"
            "    name = Column(String, nullable=False)\n")
        _write(docs_dir / "CHANGELOG.md",
            f"# Changelog\n\n## [{ts}] Adicionado CRUD para `{entity}`\n\n"
            f"- Criado Model, Schema, Repository, Service e Route para `{entity}`.\n\n"
            f"> Upgrade generated with **Ldcn**. Updated with Ldcn.\n")

    elif utype == "add_feature":
        _write(docs_dir / "CHANGELOG.md",
            f"# Changelog\n\n## [{ts}] Nova Funcionalidade Adicionada\n\n"
            f"- Funcionalidade solicitada: {desc}\n"
            f"- Blueprint atualizado.\n\n> Upgrade generated with **Ldcn**. Updated with Ldcn.\n")

    elif utype == "add_automation":
        _write(project_dir / "backend" / "app" / "services" / "automation_service.py",
            f"# Automation Service — gerado pelo Upgrade Center (Ldcn)\n"
            f"# Automação: {desc}\n\nimport asyncio\n\n"
            "async def run_automation(payload: dict):\n"
            "    # TODO: implementar lógica de automação\n"
            "    print(f'Executando automação: {payload}')\n")

    elif utype == "add_agent":
        _write(project_dir / "backend" / "app" / "services" / "agent_service.py",
            f"# Agent Service — gerado pelo Upgrade Center (Ldcn)\n"
            f"# Agente: {desc}\n\nclass AgentService:\n"
            "    def __init__(self, api_key: str = ''):\n"
            "        self.api_key = api_key\n\n"
            "    def chat(self, user_message: str) -> str:\n"
            "        # TODO: conectar ao LLM (OpenAI/Gemini/Ollama)\n"
            "        return f'Agente processando: {user_message}'\n")
        _write(project_dir / "backend" / ".env.example.upgrade",
            "OPENAI_API_KEY=\nOPENAI_MODEL=gpt-4o-mini\n")

    elif utype == "improve_design_ux":
        _write(docs_dir / "DESIGN_UPGRADE.md",
            f"# Upgrade de Design/UX\n\nSolicitado em: {ts}\n\n"
            f"## Descrição\n{desc}\n\n"
            "## Próximos Passos\n- Revisar paleta de cores\n- Atualizar componentes\n- Validar com usuário\n\n"
            "> Upgrade generated with **Ldcn**\n")

    elif utype == "fix_configuration":
        _write(docs_dir / "CONFIG_FIX.md",
            f"# Correção de Configuração\n\nAplicada em: {ts}\n\n"
            f"## Problema Reportado\n{desc}\n\n"
            "> Upgrade generated with **Ldcn**\n")

    elif utype in ("add_authentication", "add_payment", "generate_extra_docs"):
        _write(docs_dir / f"UPGRADE_{utype.upper()}.md",
            f"# Upgrade: {UPGRADE_CATALOG.get(utype, {}).get('label', utype)}\n\n"
            f"Aplicado em: {ts}\n\nDescrição: {desc}\n\n> Upgrade generated with **Ldcn**\n")

    return f"Tipo '{utype}' executado com sucesso."
