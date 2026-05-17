import os
import re
from pathlib import Path
from typing import Dict, List, Optional


class SecretScanner:
    """
    Escaneia projetos em busca de segredos com classificação:
    - safe_placeholder
    - env_reference
    - real_secret
    """

    ENV_REFERENCE_PATTERN = re.compile(r"os\.(?:getenv|environ\.get)\(\s*[\"'][A-Z0-9_]+[\"']")
    ENV_ASSIGNMENT_PATTERN = re.compile(r"^\s*([A-Z0-9_]+)\s*=\s*(.*)$")

    REAL_SECRET_PATTERNS = [
        re.compile(r"sk_live_[a-zA-Z0-9]{24,}"),
        re.compile(r"AIza[0-9A-Za-z\-_]{30,}"),
        re.compile(r"xoxb-[0-9A-Za-z-]{10,}"),
        re.compile(r"ghp_[A-Za-z0-9]{36,}"),
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        re.compile(r"AKIA[0-9A-Z]{16}"),
    ]

    INTEGRATION_ALLOWLIST = {
        "integrations/email_service.py",
        "integrations/telegram_service.py",
        "integrations/whatsapp_service.py",
    }

    SAFE_PLACEHOLDERS = {
        "",
        "change-me",
        "change_me",
        "replace-me",
        "replace_me",
        "your-api-key",
        "your-api-key-here",
        "your_email_api_key_here",
        "your-email-api-key-here",
    }

    @staticmethod
    def _mask_line(line: str) -> str:
        stripped = line.strip()
        if "=" not in stripped:
            return stripped[:80]

        key, _, value = stripped.partition("=")
        value = value.strip().strip('"').strip("'")
        if not value:
            return f"{key.strip()}="
        if len(value) <= 6:
            return f"{key.strip()}=***"
        return f"{key.strip()}={value[:2]}***{value[-2:]}"

    @staticmethod
    def _is_placeholder(value: str) -> bool:
        normalized = value.strip().strip('"').strip("'").lower()
        return normalized in SecretScanner.SAFE_PLACEHOLDERS or normalized.startswith("your_")

    @staticmethod
    def _classify_line(line: str, file_rel_path: str = "") -> Optional[Dict[str, str]]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            return None
        lowered = stripped.lower()
        if lowered in {"your_email_api_key_here", "your-api-key-here", "your-api-key"}:
            return {"type": "safe_placeholder", "reason": "Placeholder permitido."}

        integration_path = file_rel_path.replace("\\", "/").lower()
        if integration_path in SecretScanner.INTEGRATION_ALLOWLIST and "os.getenv(" in stripped:
            return {"type": "env_reference", "reason": "Arquivo de integração com leitura via env var."}

        if SecretScanner.ENV_REFERENCE_PATTERN.search(stripped):
            return {"type": "env_reference", "reason": "Leitura via os.getenv/os.environ.get."}

        for pattern in SecretScanner.REAL_SECRET_PATTERNS:
            if pattern.search(stripped):
                return {"type": "real_secret", "reason": f"Padrão de segredo real detectado: {pattern.pattern}"}

        env_match = SecretScanner.ENV_ASSIGNMENT_PATTERN.match(stripped)
        if env_match:
            key = env_match.group(1).upper()
            raw_value = env_match.group(2).strip().strip('"').strip("'")

            if SecretScanner._is_placeholder(raw_value):
                return {"type": "safe_placeholder", "reason": "Placeholder permitido."}

            if key in {"EMAIL_API_KEY", "SMTP_PASSWORD"}:
                if not raw_value:
                    return {"type": "safe_placeholder", "reason": "Exemplo vazio permitido."}
                if len(raw_value) >= 16:
                    return {"type": "real_secret", "reason": f"Valor real detectado para {key}."}
                return {"type": "safe_placeholder", "reason": f"Valor curto para {key}, tratado como placeholder."}

        # Generic long token assignments for sensitive names
        generic = re.search(r"(?i)(api[_-]?key|token|secret|password)\s*[=:]\s*[\"']?([A-Za-z0-9_\-+/=]{24,})", stripped)
        if generic:
            value = generic.group(2)
            if not SecretScanner._is_placeholder(value):
                return {"type": "real_secret", "reason": "Token longo com nome sensível."}

        return None

    @staticmethod
    def scan_string(content: str, file_rel_path: str = "") -> List[Dict[str, str]]:
        findings: List[Dict[str, str]] = []
        if not content:
            return findings

        debug_mode = os.getenv("DOWNLOAD_DEBUG", "false").lower() == "true"

        for line_number, line in enumerate(content.splitlines(), start=1):
            classified = SecretScanner._classify_line(line, file_rel_path=file_rel_path)
            if not classified:
                continue

            finding = {
                "type": classified["type"],
                "reason": classified["reason"],
                "line": line_number,
                "masked_line": SecretScanner._mask_line(line),
            }
            findings.append(finding)

            if debug_mode:
                print(
                    f"[DOWNLOAD_DEBUG] arquivo={file_rel_path or '<string>'} "
                    f"linha={finding['masked_line']} tipo={finding['type']} motivo={finding['reason']}"
                )

        return findings

    @staticmethod
    def scan_project_directory(project_path: str) -> List[Dict[str, str]]:
        findings: List[Dict[str, str]] = []

        env_path = os.path.join(project_path, ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for idx, line in enumerate(f.read().splitlines(), start=1):
                    if not line.strip() or line.strip().startswith("#") or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    if value.strip():
                        findings.append(
                            {
                                "file": ".env",
                                "line": idx,
                                "masked_line": f"{key.strip()}=<filled>",
                                "type": "real_secret",
                                "reason": "Arquivo .env real detectado com valores preenchidos.",
                            }
                        )

        allowed_exts = {".py", ".ts", ".js", ".json", ".yml", ".yaml", ".java", ".cs", ".php", ".env", ".example"}

        for root, dirs, files in os.walk(project_path):
            dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "venv", "__pycache__", "vendor", "bin", "obj"}]

            for file in files:
                if Path(file).suffix not in allowed_exts and not file.endswith(".env.example"):
                    continue

                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, project_path)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        for item in SecretScanner.scan_string(f.read(), file_rel_path=rel_path):
                            findings.append({"file": rel_path, **item})
                except UnicodeDecodeError:
                    continue

        return findings
