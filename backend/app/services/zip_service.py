import io
import os
import zipfile
import hashlib
import re
import json
import logging
from pathlib import Path
from typing import Tuple, List

logger = logging.getLogger(__name__)

from ..security.path_guard import PathGuard, PROJECTS_ROOT, REPO_ROOT


def sanitize_environment_variables(data: str) -> str:
    """
    Remove/sanitize environment variable values that look like real secrets.
    Replace actual values with empty strings or placeholders.
    """
    lines = data.split('\n')
    sanitized_lines = []

    for line in lines:
        if '=' in line and not line.strip().startswith('#'):
            key, _, value = line.partition('=')
            key = key.strip()
            value = value.strip()

            # Skip if already looks like a placeholder
            if any(indicator in value.lower() for indicator in [
                'change_me', 'replace_me', 'your_', 'example', 'placeholder', 'mock', 'dummy', '<', '>'
            ]):
                sanitized_lines.append(line)
                continue

            # Check if value looks like a real secret (high entropy, no spaces, long)
            if len(value) > 20 and not ' ' in value and not value.startswith('"') and not value.startswith("'"):
                # Mask the value
                sanitized_lines.append(f"{key}=<SANITIZED>")
            else:
                sanitized_lines.append(line)
        else:
            sanitized_lines.append(line)

    return '\n'.join(sanitized_lines)


def mask_secret_in_log(secret: str, visible_chars: int = 4) -> str:
    """
    Mask a secret value for logging. Show only first/last N characters.
    """
    if not secret or len(secret) <= visible_chars * 2:
        return '*' * len(secret) if secret else ''
    return secret[:visible_chars] + '*' * (len(secret) - visible_chars * 2) + secret[-visible_chars:]


def normalize_project_path(project_name: str) -> str:
    """
    Normalize project name to a valid path name.
    "gerenciamento de usuarios" → "gerenciamento_de_usuarios"
    """
    return project_name.replace(" ", "_").lower()


# ── Security Configuration ──────────────────────────────────────────────────

# Root of generated projects (absolute path)
# Uses the same PROJECTS_ROOT as PathGuard for consistency
GENERATED_ROOT = PROJECTS_ROOT

# Allowed top-level directories and files inside a generated project
ALLOWED_ITEMS = {
    # Directories
    "backend",
    "frontend",
    "static_site",
    "docs",
    "src",
    "app",
    "assets",
    "sections",
    "components",
    "content",
    # Allowed root-level files
    "README.md",
    ".env.example",
    "package.json",
    "requirements.txt",
    "pom.xml",
    "pyproject.toml",
    "setup.py",
    "Makefile",
    "Dockerfile",
    "docker-compose.yml",
    ".dockerignore",
    ".gitignore",
    "robots.txt",
    "sitemap.xml",
}

# Explicitly forbidden patterns
FORBIDDEN_PATTERNS = [
    re.compile(r"^\.env$"),  # Exact match for .env
    re.compile(r"\.env$"),  # Files ending with .env
    re.compile(r"\.key$"),
    re.compile(r"\.pem$"),
    re.compile(r"\.p12$"),
    re.compile(r"\.pfx$"),
    re.compile(r"\.secret$"),
    re.compile(r"\.crt$"),
    re.compile(r"\.cer$"),
    re.compile(r"\.jks$"),
    re.compile(r"\.keystore$"),
    re.compile(r"credentials"),
    re.compile(r"secrets?"),
    re.compile(r"\.git/"),
    re.compile(r"__pycache__/"),
    re.compile(r"\.pyc$"),
    re.compile(r"\.pyo$"),
    re.compile(r"node_modules/"),
    re.compile(r"venv/"),
    re.compile(r"\.venv/"),
    re.compile(r"env/"),
    re.compile(r"\.pytest_cache/"),
    re.compile(r"\.coverage$"),
    re.compile(r"\.idea/"),
    re.compile(r"\.vscode/"),
    re.compile(r"\.DS_Store$"),
    re.compile(r"Thumbs\.db$"),
    re.compile(r"desktop\.ini$"),
]

# Forbidden top-level directories (SaaS Factory internal)
FORBIDDEN_ROOT_DIRS = {
    "agents",
    "generators",
    "control_panel",
    "briefing",
    "blueprints",
    "_tmp_arch_fastapi",
    "_tmp_autotest",
    "_tmp_designux",
    "_tmp_engine",
    "data",
    "infra",
    "output",
    "shared",
    "validators",
    "training_engine",
    "documentation_engine"
}

# Explicitly forbid root files
FORBIDDEN_ROOT_FILES = {
    "main.py",
    ".env",
    "project_runner.py"
}


# Secret patterns for scanning - ONLY detect REAL secrets, not placeholders
# These patterns are conservative to avoid false positives
SECRET_PATTERNS = [
    # Actual Gemini/OpenAI API keys (not placeholders, min 32 chars)
    re.compile(r'sk-[a-zA-Z0-9]{24,}'),  # Real sk- keys are long high-entropy values
    re.compile(r'sk_live_[a-zA-Z0-9]{24,}'),  # Stripe live keys
    re.compile(r'pk_live_[a-zA-Z0-9]{24,}'),  # Stripe publishable keys

    # AWS credentials (real format)
    re.compile(r'AKIA[0-9A-Z]{16}'),  # AWS Access Key ID format

    # Private keys (actual key content)
    re.compile(r'-----BEGIN (?:RSA )?PRIVATE KEY-----'),

    # GitHub tokens (real format)
    re.compile(r'ghp_[a-zA-Z0-9_]{36,}'),  # GitHub Personal Access Token
    re.compile(r'github_pat_[a-zA-Z0-9_]{82,}'),  # GitHub PAT (new format)

    # Slack tokens
    re.compile(r'xoxb-[0-9a-zA-Z-]{10,48}'),  # Slack bot tokens

    # Generic high-entropy strings - ONLY if they look like real secrets
    # Must be long (40+ chars), no spaces, no common placeholder words
    re.compile(r'(?i)(?:api_key|secret_key|password|token)\s*[=:]\s*["\']?[a-zA-Z0-9+/_=-]{40,}["\']?'),

    # AWS Secret Access Key format (40+ chars base64)
    re.compile(r'(?i)aws_secret_access_key\s*[=:]\s*["\']?[a-zA-Z0-9/+=]{40,}["\']?'),
]

# Files/patterns to skip (examples, demos, mocks)
EXAMPLE_FILE_PATTERNS = [
    re.compile(r'\.env\.example$'),
    re.compile(r'\.example$'),
    re.compile(r'demo'),
    re.compile(r'test'),
    re.compile(r'mock'),
    re.compile(r'placeholder'),
]


def _is_safe_path(path: Path) -> Tuple[bool, str]:
    """Validate that a path is safe: within output/generated_projects/, no traversal."""
    try:
        resolved = path.resolve(strict=False)
        if not PathGuard.is_within_generated_projects(str(resolved)):
            return False, f"Path outside output/generated_projects: {path}"
        return True, ""
    except Exception as e:
        return False, f"Path validation error: {e}"


def _is_allowed_item(relative_path: Path) -> Tuple[bool, str]:
    """
    Check if a file/directory should be included in the ZIP.
    The project_path has already been validated to be within output/generated_projects/.
    We only block explicitly forbidden items (agents/, generators/, etc.).
    Everything else in the generated project directory is allowed.
    """
    parts = relative_path.parts
    if not parts or not str(relative_path).strip():
        return False, "Empty path"

    first_part = parts[0]

    # Block forbidden root-level directories (SaaS Factory internals)
    if first_part in FORBIDDEN_ROOT_DIRS:
        return False, f"Forbidden root directory: {first_part}"

    # Block forbidden root-level files
    if len(parts) == 1 and first_part in FORBIDDEN_ROOT_FILES:
        return False, f"Forbidden root file: {first_part}"

    # Block files matching forbidden patterns (.env, .git, node_modules, etc.)
    path_str = str(relative_path).replace("\\", "/")
    for pattern in FORBIDDEN_PATTERNS:
        if pattern.search(path_str):
            return False, f"Forbidden pattern: {pattern.pattern}"

    # Everything else in the generated project is allowed
    return True, ""


def _scan_for_secrets(file_path: Path) -> Tuple[bool, List[str]]:
    """Scan a file for potential secrets. Returns (has_secrets, list_of_detected_secrets)."""
    detected = []

    # Skip example/template files
    file_name = file_path.name.lower()
    for pattern in EXAMPLE_FILE_PATTERNS:
        if pattern.search(file_name):
            return False, []  # Skip example files

    skip_extensions = {
        '.pyc', '.pyo', '.so', '.dll', '.exe', '.bin',
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
        '.zip', '.tar', '.gz', '.bz2', '.xz',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    }

    if file_path.suffix.lower() in skip_extensions:
        return False, []

    try:
        if file_path.stat().st_size > 10 * 1024 * 1024:
            return False, []
    except OSError:
        return False, []

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Skip if content contains placeholder indicators
        content_lower = content.lower()
        if any(indicator in content_lower for indicator in [
            'change_me', 'replace_me', 'your_here', 'example', 'placeholder', 'mock', 'dummy', 'todo'
        ]):
            # Still scan but with higher threshold (log warning instead of blocking)
            pass

        for pattern in SECRET_PATTERNS:
            matches = pattern.findall(content)
            if matches:
                for match in matches[:3]:
                    # Convert match to string if it's a tuple
                    match_str = match if isinstance(match, str) else match[0] if match else ''
                    detected.append(f"{pattern.pattern[:50]}...: {str(match_str)[:50]}")

        # Additional check: if file is .env or config, check for real values (not placeholders)
        if file_path.name in ['.env', 'config.env', '.env.local']:
            lines = content.split('\n')
            for line in lines:
                if '=' in line and not line.strip().startswith('#'):
                    key, _, value = line.partition('=')
                    # Skip if value looks like a placeholder
                    if any(placeholder in value.lower() for placeholder in [
                        'change_me', 'replace_me', 'your_', 'example', 'placeholder', 'mock', 'dummy', '<', '>'
                    ]):
                        continue
                    # Only flag if value looks like a real secret (high entropy, no spaces, etc.)
                    # Use a more conservative check: > 24 chars, no spaces, and contains both letters and numbers
                    val = value.strip()
                    has_letters = any(c.isalpha() for c in val)
                    has_digits = any(c.isdigit() for c in val)
                    if len(val) > 24 and not ' ' in val and has_letters and has_digits:
                        detected.append(f"Potential secret in env: {key.strip()}=...")

    except Exception:
        pass

    return len(detected) > 0, detected


def scan_project_for_secrets(project_path: Path) -> Tuple[bool, List[str]]:
    """Scan all text files in a project directory for secrets."""
    all_detected = []
    if not project_path.exists() or not project_path.is_dir():
        return False, []

    try:
        for file_path in project_path.rglob("*"):
            if file_path.is_file():
                has_secrets, detected = _scan_for_secrets(file_path)
                if has_secrets:
                    rel_path = file_path.relative_to(project_path)
                    all_detected.extend([f"{rel_path}: {d}" for d in detected])
    except Exception as e:
        logger.error(f"Error scanning project {project_path}: {e}")
        return False, []

    return len(all_detected) > 0, all_detected


def create_project_zip(project_id: str, projects_data_path: Path) -> Tuple[io.BytesIO, str, str]:
    """
    Create a ZIP archive of a generated project.

    CORRECT ORDER:
    1. Load project from projects.json
    2. Validate project exists
    3. Validate path exists and is safe
    4. ONLY THEN scan for secrets
    5. Create ZIP
    """
    # 1. Load project from projects.json
    if not projects_data_path.exists():
        raise FileNotFoundError(f"Projects database not found: {projects_data_path}")

    with open(projects_data_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    project = None
    for p in projects:
        if p.get("id") == project_id:
            project = p
            break

    if not project:
        raise ValueError(f"Project not found: {project_id}")

    # 2. Validate path exists in project (use project_path field, fallback to path)
    project_path_str = project.get("project_path", project.get("path", ""))
    if not project_path_str:
        raise ValueError(f"Projeto gerado não encontrado. O registro do projeto aponta para um caminho vazio.")

    # CRITICAL: Resolve path seguro usando PathGuard (bloqueia fora de output/generated_projects/)
    try:
        project_path_str = PathGuard.resolve_project_path(project_path_str)
    except Exception as e:
        raise ValueError(f"Projeto gerado não encontrado. O registro do projeto aponta para um caminho inválido.")

    project_path = Path(project_path_str)

    # CRITICAL: Previne zipar a raiz da SaaS Factory
    if project_path == GENERATED_ROOT or project_path == REPO_ROOT:
        raise ValueError("Projeto gerado não encontrado. O registro do projeto aponta para um caminho inválido.")

    # 4. CRITICAL: Check if path exists BEFORE scanner
    if not project_path.exists():
        log_event("invalid_project_path", project_id, {
            "reason": "path_does_not_exist",
            "path": str(project_path)
        })
        raise ValueError(f"Project path does not exist: {project_path}")

    if not project_path.is_dir():
        log_event("invalid_project_path", project_id, {
            "reason": "path_not_a_directory",
            "path": str(project_path)
        })
        raise ValueError(f"Project path is not a directory: {project_path}")

    has_secrets, secret_details = scan_project_for_secrets(project_path)
    if has_secrets:
        logger.warning(f"Download blocked for project {project_id}: secrets detected")
        error_msg = "Projeto contem segredo sensivel e foi bloqueado por seguranca. "
        error_msg += "Remova credenciais antes de tentar baixar."
        debug_mode = os.getenv("DOWNLOAD_DEBUG", "false").lower() == "true"
        if debug_mode and secret_details:
            error_msg += "\n\nArquivos com problemas:"
            for detail in secret_details[:3]:
                error_msg += f"\n- {detail}"
        raise ValueError(error_msg)

    # 4.1. Run Quality Gate and Security Gate
    blueprint_data = {}
    blueprint_path = os.path.join(project_path, "blueprint.json")
    if os.path.exists(blueprint_path):
        with open(blueprint_path, "r", encoding="utf-8") as f:
            blueprint_data = json.load(f)
            
    from security_engine.validators.quality_gate import QualityGate
    from security_engine.validators.security_gate import SecurityGate
    
    q_gate = QualityGate()
    s_gate = SecurityGate()
    
    should_run_quality_gate = bool(blueprint_data) or (project_path / "generation_trace.json").exists()
    if should_run_quality_gate:
        q_result = q_gate.validate(str(project_path), blueprint_data)
        if q_result["status"] == "failed":
            raise ValueError(f"Quality Gate failed: {', '.join(q_result['errors'])}")
        
    if should_run_quality_gate:
        s_result = s_gate.validate(str(project_path), blueprint_data)
        if s_result["status"] == "failed":
            raise ValueError(f"Security Gate failed: {', '.join(s_result['errors'])}")

    # 5. ONLY NOW scan for secrets (path is validated and exists)
    has_secrets, secret_details = scan_project_for_secrets(project_path)
    if has_secrets:
        logger.warning(f"Download blocked for project {project_id}: secrets detected")

        # Better error message
        error_msg = "Projeto contém dados sensíveis e foi bloqueado por segurança. "
        error_msg += "Remova credenciais antes de tentar baixar."

        # In debug mode, show which files contain secrets
        debug_mode = os.getenv("DOWNLOAD_DEBUG", "false").lower() == "true"
        if debug_mode and secret_details:
            error_msg += "\n\nArquivos com problemas:"
            for detail in secret_details[:3]:
                error_msg += f"\n- {detail}"

        raise ValueError(error_msg)

    # 6. Create ZIP in memory
    buffer = io.BytesIO()
    project_name = project.get("name", project_id).replace(" ", "_")

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in project_path.rglob("*"):
            if not file_path.is_file():
                continue

            try:
                arcname = file_path.relative_to(project_path)
            except ValueError:
                continue

            is_allowed, reason = _is_allowed_item(arcname)
            if not is_allowed:
                logger.debug(f"Skipping {arcname}: {reason}")
                continue

            zf.write(file_path, arcname)

        if len(zf.namelist()) == 0:
            zf.writestr("README.txt",
                "Nenhum arquivo permitido encontrado no projeto. "
                "Os arquivos permitidos são: backend/, frontend/, static_site/, docs/, "
                "src/, app/, README.md, .env.example, package.json, requirements.txt, pom.xml")

    # 7. Compute checksum
    buffer.seek(0)
    sha256_hash = hashlib.sha256()
    sha256_hash.update(buffer.read())
    checksum = sha256_hash.hexdigest()

    buffer.seek(0)

    # 8. Generate filename
    filename = f"{project_name}_generated_by_Ldcn.zip"

    return buffer, checksum, filename


def log_event(event_type: str, project_id: str, data: dict):
    """Log events (imported from log_service to avoid circular imports)."""
    try:
        from .log_service import log_event as _log_event
        _log_event(event_type, project_id, data)
    except ImportError:
        logger.info(f"Event: {event_type} - Project: {project_id} - Data: {data}")
