"""
fix_project_records.py — Corrige projects.json com paths inválidos.

Uso:
    python scripts/fix_project_records.py

O que faz:
    - Abre control_panel/backend/data/projects.json
    - Procura projetos com path inválido (vazio, relativo sem output/generated_projects, etc.)
    - Tenta encontrar pasta correspondente em output/generated_projects/
    - Corrige project_path e absolute_project_path
    - Se não encontrar, marca status = "broken_path"
"""
import json
import sys
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent.parent
PROJECTS_JSON = SCRIPT_DIR / "control_panel" / "backend" / "data" / "projects.json"
GENERATED_DIR = SCRIPT_DIR / "output" / "generated_projects"

# Cores para terminal
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def find_matching_folder(project_name: str, project_path_str: str) -> Path | None:
    """Tenta encontrar a pasta correta em output/generated_projects/."""
    # Tenta match por nome
    if project_name:
        normalized = project_name.replace(" ", "_").lower()
        candidate = GENERATED_DIR / normalized
        if candidate.exists() and candidate.is_dir():
            return candidate

    # Tenta match pelo path antigo
    if project_path_str:
        old_path = Path(project_path_str)
        if old_path.exists() and old_path.is_dir():
            # Verifica se está dentro de generated_projects/
            try:
                old_path.relative_to(GENERATED_DIR)
                return old_path
            except ValueError:
                pass

        # Tenta só o nome da pasta final
        folder_name = old_path.name
        candidate = GENERATED_DIR / folder_name
        if candidate.exists() and candidate.is_dir():
            return candidate

    # Scan geral em output/generated_projects/
    if GENERATED_DIR.exists():
        for child in GENERATED_DIR.iterdir():
            if child.is_dir():
                if project_name and project_name.replace(" ", "_").lower() in child.name.lower():
                    return child
                if project_path_str and project_path_str.lower() in child.name.lower():
                    return child

    return None


def fix_records():
    if not PROJECTS_JSON.exists():
        print(f"{RED}ERRO: {PROJECTS_JSON} não encontrado.{RESET}")
        sys.exit(1)

    with open(PROJECTS_JSON, "r", encoding="utf-8") as f:
        projects = json.load(f)

    print(f"{BLUE}Verificando {len(projects)} projetos...{RESET}\n")

    fixed_count = 0
    broken_count = 0
    ok_count = 0

    for project in projects:
        pid = project.get("id", "???")
        name = project.get("name", "")
        path_val = project.get("path", "")
        project_path_val = project.get("project_path", "")
        abs_path_val = project.get("absolute_project_path", "")

        # Determina o path relativo correto
        expected_rel = f"output/generated_projects/{name.replace(' ', '_').lower()}" if name else ""

        is_valid = True
        issues = []

        # Verifica project_path
        if not project_path_val or project_path_val in ("generated_projects/", "output/generated_projects/", ".", ""):
            is_valid = False
            issues.append(f"project_path inválido: '{project_path_val}'")

        # Verifica absolute_project_path
        if not abs_path_val or abs_path_val == "." or abs_path_val == "":
            is_valid = False
            issues.append(f"absolute_project_path vazio/ inválido")

        if not is_valid:
            # Tenta encontrar a pasta correta
            matched = find_matching_folder(name, path_val)

            if matched:
                rel_path = f"output/generated_projects/{matched.name}"
                abs_path = str(matched.resolve())

                project["project_path"] = rel_path
                project["absolute_project_path"] = abs_path
                project["path"] = rel_path  # Mantém compatibilidade

                print(f"{GREEN}FIXED {pid} ({name}):{RESET}")
                print(f"   project_path: {rel_path}")
                print(f"   absolute_project_path: {abs_path}")
                fixed_count += 1
            else:
                project["project_path"] = expected_rel if expected_rel else "broken_path"
                project["absolute_project_path"] = ""
                project["path"] = expected_rel if expected_rel else "broken_path"
                project["status"] = "broken_path"

                print(f"{RED}BROKEN {pid} ({name}):{RESET}")
                print(f"   Pasta correspondente NAO encontrada em {GENERATED_DIR}")
                print(f"   Marcado como broken_path")
                broken_count += 1
        else:
            ok_count += 1

    # Salva
    with open(PROJECTS_JSON, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)

    print(f"\n{BLUE}═" * 44)
    print(f"  RESUMO")
    print(f"═" * 44)
    print(f"  OK:       {ok_count}")
    print(f"  Corrigidos: {fixed_count}")
    print(f"  Broken:   {broken_count}")
    print(f"  Total:    {len(projects)}{RESET}")

    if broken_count > 0:
        print(f"\n{YELLOW}⚠️  Projetos marcados como broken_path precisam de atenção manual.{RESET}")
        print(f"   Verifique se as pastas existem em: {GENERATED_DIR}")

    return fixed_count > 0 or broken_count > 0


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print(f"{BLUE}Fix Project Records{RESET}")
    print(f"{BLUE}   {PROJECTS_JSON}{RESET}\n")
    fix_records()
