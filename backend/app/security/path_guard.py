from pathlib import Path
from fastapi import HTTPException, status

# Repo root = Projet_MltAgents/
REPO_ROOT = Path(__file__).parent.parent.parent.parent.parent.resolve()
PROJECTS_ROOT = REPO_ROOT / "generated_projects"
LEGACY_PROJECTS_ROOT = REPO_ROOT / "output" / "generated_projects"


def _normalize_project_path(raw_path: str) -> Path:
    path_obj = Path(raw_path)
    if path_obj.is_absolute():
        return path_obj.resolve(strict=False)

    normalized = str(path_obj).replace("\\", "/").lstrip("./")
    if normalized.startswith("output/generated_projects/"):
        normalized = normalized.replace("output/generated_projects/", "generated_projects/", 1)

    return (REPO_ROOT / normalized).resolve(strict=False)


class PathGuard:
    @staticmethod
    def verify_safe_path(target_path: str) -> str:
        try:
            resolved = _normalize_project_path(target_path)
            if not PathGuard.is_within_generated_projects(str(resolved)):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Projeto gerado nao encontrado. O registro do projeto aponta para um caminho invalido.",
                )
            return str(resolved)
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Caminho de arquivo invalido.",
            )

    @staticmethod
    def is_safe_project_id(project_id: str) -> bool:
        if not project_id:
            return False
        if ".." in project_id or "/" in project_id or "\\" in project_id:
            return False
        return True

    @staticmethod
    def is_within_generated_projects(path: str) -> bool:
        try:
            resolved = Path(path).resolve(strict=False)
            return str(resolved).startswith(str(PROJECTS_ROOT)) or str(resolved).startswith(str(LEGACY_PROJECTS_ROOT))
        except Exception:
            return False

    @staticmethod
    def resolve_project_path(project_path_relative: str) -> str:
        resolved = _normalize_project_path(project_path_relative)
        if not PathGuard.is_within_generated_projects(str(resolved)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Projeto gerado nao encontrado. O registro do projeto aponta para um caminho invalido.",
            )
        return str(resolved)
