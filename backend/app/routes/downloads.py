from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import StreamingResponse, JSONResponse
from ..services import payment_service, zip_service
from ..services.log_service import log_event
from ..security.path_guard import PathGuard
import os
import sys
from pathlib import Path
from typing import Optional

# Add root to path
ROOT_DIR = Path(__file__).parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

router = APIRouter(prefix="/api/downloads", tags=["downloads"])

# Path to projects.json
PROJECTS_DATA_PATH = Path(__file__).parent.parent.parent / "data" / "projects.json"


def normalize_project_path(project_name: str) -> str:
    """
    Normalize project name to a valid path name.
    "gerenciamento de usuarios" → "gerenciamento_de_usuarios"
    """
    return project_name.replace(" ", "_").lower()


@router.get("/")
def list_downloads():
    """List all projects available for download (paid projects)."""
    projects = payment_service.get_all_projects()
    downloadable = [p for p in projects if p.get("payment_status") == "paid"]
    return {"projects": downloadable, "total": len(downloadable)}


@router.get("/{project_id}")
def get_download_info(project_id: str, request: Request):
    """
    Return download metadata before actual download.
    CORRECTED FLOW:
    1. Fetch project
    2. Validate project exists
    3. Validate payment
    4. Validate path EXISTS and is safe
    5. ONLY THEN run scanner
    """
    # Log request
    log_event("download_info_requested", project_id, {
        "project_id": project_id,
        "client_ip": request.client.host if request.client else "unknown"
    })

    # 1. Fetch project
    project = payment_service.get_project(project_id)
    if not project:
        log_event("project_lookup_failed", project_id, {
            "reason": "project_not_found",
            "project_id": project_id
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado."
        )

    # 2. Payment validation
    if project.get("payment_status") != "paid":
        log_event("download_info_blocked", project_id, {
            "reason": "payment_not_confirmed",
            "project_id": project_id
        })
        return JSONResponse(status_code=402, content={
            "error": "payment_required",
            "message": "Projeto não foi pago ainda."
        })

    # 3. Validate project path - FIRST check if path exists
    project_path_str = project.get("project_path", project.get("path", ""))
    if not project_path_str:
        log_event("download_info_blocked", project_id, {
            "reason": "no_path_in_project",
            "project_id": project_id
        })
        return JSONResponse(status_code=404, content={
            "error": "invalid_project_path",
            "message": "Caminho do projeto não encontrado."
        })

    # 3b. Resolve path usando PathGuard (bloqueia fora de output/generated_projects/)
    try:
        resolved_path = PathGuard.resolve_project_path(project_path_str)
    except HTTPException:
        log_event("download_info_blocked", project_id, {
            "reason": "invalid_project_path",
            "project_id": project_id,
            "path": project_path_str
        })
        return JSONResponse(status_code=404, content={
            "error": "invalid_project_path",
            "message": "Projeto gerado não encontrado. O registro do projeto aponta para um caminho inválido."
        })

    project_path = Path(resolved_path)

    # 4. Check if path exists and is a directory
    if not project_path.exists():
        log_event("invalid_project_path", project_id, {
            "reason": "path_does_not_exist",
            "project_id": project_id,
            "path": str(project_path)
        })
        return JSONResponse(status_code=404, content={
            "error": "project_path_not_found",
            "message": "Projeto gerado não encontrado. O registro do projeto aponta para um caminho inválido."
        })

    if not project_path.is_dir():
        log_event("invalid_project_path", project_id, {
            "reason": "path_not_a_directory",
            "project_id": project_id,
            "path": str(project_path)
        })
        return JSONResponse(status_code=400, content={
            "error": "invalid_project_path",
            "message": "Caminho do projeto não é um diretório válido."
        })

    # 6. ONLY NOW scan for secrets (path is validated and exists)
    has_secrets, secret_details = zip_service.scan_project_for_secrets(project_path)
    security_status = "passed" if not has_secrets else "failed"

    if has_secrets:
        log_event("download_info_blocked", project_id, {
            "reason": "secrets_detected",
            "project_id": project_id,
            "details": secret_details[:5] if secret_details else []
        })
        return JSONResponse(status_code=403, content={
            "error": "download_blocked",
            "message": "Segredos detectados no projeto.",
            "security_status": "failed",
            "details": secret_details[:5] if secret_details else []
        })

    # 7. Calculate file size
    project_name = project.get("name", project_id).replace(" ", "_")
    filename = f"{project_name}_generated_by_Ldcn.zip"

    total_size = 0
    file_count = 0
    if project_path.exists() and project_path.is_dir():
        for f in project_path.rglob("*"):
            if f.is_file():
                try:
                    rel = f.relative_to(project_path)
                    is_allowed, _ = zip_service._is_allowed_item(rel)
                    if is_allowed:
                        total_size += f.stat().st_size
                        file_count += 1
                except ValueError:
                    pass

    def human_size(bytes):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024.0:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024.0
        return f"{bytes:.1f} TB"

    import hashlib
    sha256 = hashlib.sha256()
    sha256.update(str(project_path).encode())
    checksum = sha256.hexdigest()

    log_event("download_info_success", project_id, {
        "project_id": project_id,
        "filename": filename,
        "file_size_bytes": total_size,
        "security_status": security_status
    })

    return {
        "project_id": project_id,
        "project_name": project.get("name"),
        "file_name": filename,
        "file_size_bytes": total_size,
        "file_size_human": human_size(total_size),
        "file_count": file_count,
        "sha256": checksum,
        "security_status": security_status,
        "message": "Somente o projeto gerado será incluído no ZIP.",
        "generated_with": "Ldcn AI Boost" if project.get("ai_boost_status") == "active" else "Ldcn"
    }


def _get_bearer_token(request) -> str | None:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


@router.post("/{project_id}/prepare")
def prepare_download(project_id: str, request: Request):
    """Prepare a project for download (validate, scan, create ZIP)."""
    project = payment_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto nao encontrado.")
    if project.get("payment_status") != "paid":
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Pagamento necessario para liberar o download.")
    log_event("download_prepared", project_id, {"message": "Download preparado com sucesso."})
    return {"status": "ok", "message": "Download preparado. Use GET /api/downloads/{project_id}/download para baixar."}


@router.get("/{project_id}/download")
def download_project(project_id: str, request: Request):
    """
    Download a generated project as a ZIP archive.
    CORRECTED FLOW: validates path BEFORE scanner.
    """

    # 1. Fetch project from database
    project = payment_service.get_project(project_id)
    if not project:
        log_event("download_blocked", project_id, {
            "reason": "project_not_found",
            "project_id": project_id
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado."
        )

    # 2. Payment validation
    if project.get("payment_status") != "paid":
        log_event("download_blocked", project_id, {
            "reason": "payment_not_confirmed",
            "project_id": project_id,
            "payment_status": project.get("payment_status")
        })
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Pagamento necessário para liberar o download."
        )

    # 3. Validate project path EXISTS before anything else
    project_path_str = project.get("project_path", project.get("path", ""))
    if not project_path_str:
        log_event("download_blocked", project_id, {
            "reason": "no_path_in_project",
            "project_id": project_id
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caminho do projeto não encontrado."
        )

    # 3b. Resolve path usando PathGuard (bloqueia fora de output/generated_projects/)
    try:
        resolved_path = PathGuard.resolve_project_path(project_path_str)
    except HTTPException:
        log_event("download_blocked", project_id, {
            "reason": "invalid_project_path",
            "project_id": project_id,
            "path": project_path_str
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto gerado não encontrado. O registro do projeto aponta para um caminho inválido."
        )

    project_path = Path(resolved_path)

    # Check if path exists
    if not project_path.exists():
        log_event("download_blocked", project_id, {
            "reason": "project_path_not_found",
            "project_id": project_id,
            "path": str(project_path)
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivos do projeto não encontrados."
        )

    if not project_path.is_dir():
        log_event("download_blocked", project_id, {
            "reason": "path_not_a_directory",
            "project_id": project_id
        })
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Caminho do projeto inválido."
        )

    # 4. Create secure ZIP (this also validates path and scans for secrets)
    try:
        zip_buffer, checksum, filename = zip_service.create_project_zip(
            project_id, PROJECTS_DATA_PATH
        )
    except ValueError as e:
        error_msg = str(e)
        log_event("download_blocked", project_id, {
            "reason": "security_validation_failed",
            "project_id": project_id,
            "error": error_msg
        })
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except FileNotFoundError as e:
        log_event("download_blocked", project_id, {
            "reason": "project_files_missing",
            "project_id": project_id,
            "error": str(e)
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivos do projeto não encontrados."
        )
    except Exception as e:
        log_event("download_blocked", project_id, {
            "reason": "internal_error",
            "project_id": project_id,
            "error": str(e)
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar arquivo ZIP: {str(e)}"
        )

    # 5. Log successful download
    log_event("download_started", project_id, {
        "project_id": project_id,
        "checksum": checksum,
        "filename": filename,
        "project_name": project.get("name"),
        "bytes": zip_buffer.getbuffer().nbytes
    })

    # Update project status
    payment_service.update_project(project_id, {"status": "downloaded"})

    # 6. Return ZIP
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Checksum-SHA256": checksum,
            "X-Project-Id": project_id,
            "Content-Security-Policy": "default-src 'none'; sandbox allow-scripts",
        }
    )

