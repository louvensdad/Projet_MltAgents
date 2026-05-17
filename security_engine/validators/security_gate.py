import os
from typing import Dict, Any

from backend.app.security.secret_scanner import SecretScanner
from backend.app.security.path_guard import PathGuard


class SecurityGate:
    """
    Segurança máxima antes de liberar o download:
    - bloquear .env real e segredos reais
    - permitir placeholders/env references
    - verificar isolamento do projeto
    """

    def __init__(self):
        pass

    def validate(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        if not os.path.exists(project_path):
            return {"status": "failed", "errors": ["Caminho do projeto no encontrado."]}

        errors = []
        notes = []

        try:
            abs_path = os.path.abspath(project_path)
            if not PathGuard.is_within_generated_projects(abs_path):
                errors.append("Security Gate: Caminho de download inválido/inseguro. O projeto DEVE estar restrito a generated_projects.")
            if "agents" in abs_path or "generators" in abs_path:
                errors.append("Security Gate: Caminho de download contém diretório interno proibido.")
        except Exception as e:
            errors.append(f"Security Gate: Path Traversal bloqueado. {e}")

        scanner_findings = SecretScanner.scan_project_directory(project_path)
        real_findings = [f for f in scanner_findings if f.get("type") == "real_secret"]
        safe_findings = [f for f in scanner_findings if f.get("type") in {"safe_placeholder", "env_reference"}]

        if safe_findings:
            notes.append(f"Security Gate: {len(safe_findings)} referência(s) segura(s) detectada(s) (env_reference/safe_placeholder).")

        if real_findings:
            for finding in real_findings:
                file_path = finding.get("file", "<desconhecido>")
                line_no = finding.get("line", 0)
                reason = finding.get("reason", "segredo real")
                errors.append(f"Security Gate: Segredo real detectado em {file_path}:{line_no}. {reason}")

        forbidden_factory_files = ["project_runner.py", "zip_service.py", "main.py", "security_gate.py"]
        for root, _, files in os.walk(project_path):
            for f in files:
                if f in forbidden_factory_files and root == os.path.abspath(project_path):
                    if f in ["project_runner.py", "zip_service.py"]:
                        errors.append(f"Security Gate: Arquivo interno da Factory ({f}) detectado no projeto gerado. VAZAMENTO BLOQUEADO.")

        if errors:
            return {"status": "failed", "errors": errors, "notes": notes}

        return {"status": "passed", "errors": [], "notes": notes}
