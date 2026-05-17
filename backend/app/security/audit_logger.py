import os
import json
from datetime import datetime
from pathlib import Path

# Pasta de logs configurada para o ambiente
LOG_DIR = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'logs')))
LOG_FILE = LOG_DIR / "audit.log"

# Garantir que o diretório exista
os.makedirs(LOG_DIR, exist_ok=True)

class AuditLogger:
    """
    Sistema de log de auditoria oficial da plataforma.
    NUNCA deve logar segredos, senhas ou tokens completos.
    """
    
    ALLOWED_ACTIONS = {
        "login_success",
        "login_failed",
        "password_reset_requested",
        "password_reset_completed",
        "password_reset_failed",
        "project_generated",
        "payment_confirmed",
        "download_requested",
        "download_success",
        "ai_boost_used",
        "upgrade_requested",
        "docs_updated",
        "blocked_attempt",
        "system_error"
    }

    @staticmethod
    def log(action: str, user_id: str, details: str = "", ip_address: str = "unknown"):
        if action not in AuditLogger.ALLOWED_ACTIONS:
            # Forçar categorização rígida para auditoria
            action = "system_error"
            details = f"Ação desconhecida interceptada: {details}"
            
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Mascarar potenciais tokens acidentais na string details
        masked_details = AuditLogger._mask_secrets(details)
        
        log_entry = {
            "timestamp": timestamp,
            "action": action,
            "user_id": user_id,
            "ip_address": ip_address,
            "details": masked_details
        }
        
        # Append to log file
        try:
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            # Falha de log não deve derrubar o sistema em runtime (fail open ou closed depends on compliance)
            # Para SaaS Factory manteremos operando mas printando
            print(f"CRITICAL: Falha ao escrever audit log: {e}")

    @staticmethod
    def _mask_secrets(text: str) -> str:
        """Máscara básica para evitar que senhas/tokens entrem no log via `details`."""
        if not text:
            return text
            
        # Oculta palavras parecidas com JWTs (Bearer xyz...)
        import re
        text = re.sub(r'(?i)Bearer\s+[A-Za-z0-9\-\_\.]{15,}', 'Bearer ***', text)
        text = re.sub(r'(?i)password[=:\s]+[^\s,\]\}]+', 'password=***', text)
        return text
