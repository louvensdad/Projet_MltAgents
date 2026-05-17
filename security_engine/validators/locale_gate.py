"""
Locale Validation Gate

Ensures generated projects respect the chosen locale:
- README in the correct language
- docs in the correct language
- generated project without texts in the wrong language
- generated interface respects locale
"""

import os
import re
from typing import List, Optional
from i18n import translate


LOCALE_KEYWORDS = {
    "pt-BR": {
        "patterns": [
            r"\bBem-vindo\b", r"\bUsu[aá]rio\b", r"\bsenha\b",
            r"\bEntrar\b", r"\bCadastrar\b", r"\bSair\b",
            r"\bDashboard\b", r"\bConfigura[çc][ãa]o\b",
            r"\bSalvar\b", r"\bCancelar\b", r"\bExcluir\b",
            r"\b[idí]oma\b", r"\bprojeto\b", r"\bcriado\b",
            r"\bsucesso\b",
        ],
        "anti_patterns": [
            r"\bWelcome\b", r"\bLogin\b", r"\bRegister\b",
            r"\bPassword\b", r"\bLogout\b",
            r"\bBienvenido\b", r"\bIniciar sesi[óo]n\b",
            r"\bBienvenue\b", r"\bConnexion\b",
        ],
    },
    "en-US": {
        "patterns": [
            r"\bWelcome\b", r"\bLogin\b", r"\bRegister\b",
            r"\bPassword\b", r"\bLogout\b",
            r"\bDashboard\b", r"\bSettings\b",
            r"\bSave\b", r"\bCancel\b", r"\bDelete\b",
            r"\bsuccessfully\b", r"\bproject\b",
        ],
        "anti_patterns": [
            r"\bBem-vindo\b", r"\bUsu[aá]rio\b",
            r"\bBienvenido\b", r"\bBienvenue\b",
            r"\bUtilisateur\b", r"\bUsuario\b",
        ],
    },
    "es-ES": {
        "patterns": [
            r"\bBienvenido\b", r"\bUsuario\b", r"\bContraseña\b",
            r"\bIniciar sesi[óo]n\b", r"\bRegistrarse\b",
            r"\bCerrar sesi[óo]n\b",
            r"\bGuardar\b", r"\bCancelar\b", r"\bEliminar\b",
            r"\bCorrectamente\b", r"\bproyecto\b",
        ],
        "anti_patterns": [
            r"\bWelcome\b", r"\bBem-vindo\b", r"\bBienvenue\b",
            r"\bUtilisateur\b",
        ],
    },
    "fr-FR": {
        "patterns": [
            r"\bBienvenue\b", r"\bUtilisateur\b", r"\bMot de passe\b",
            r"\bConnexion\b", r"\bS'inscrire\b", r"\bDéconnexion\b",
            r"\bEnregistrer\b", r"\bAnnuler\b", r"\bSupprimer\b",
            r"\bavec succès\b", r"\bprojet\b",
        ],
        "anti_patterns": [
            r"\bWelcome\b", r"\bBem-vindo\b", r"\bBienvenido\b",
            r"\bUsuario\b",
        ],
    },
}


LOCALE_FILE_PATTERNS = {
    "README.md": ["readme"],
    "docs/ARCHITECTURE_DECISIONS.md": ["docs"],
    "docs/DOCUMENTATION_USED.md": ["docs"],
    "docs/SECURITY.md": ["docs"],
    "docs/UX_AI_DECISIONS.md": ["docs"],
    "validation_report.json": ["validation"],
    "generation_trace.json": ["generation_trace"],
}


class LocaleGateError(Exception):
    """Raised when locale validation fails."""
    pass


class LocaleValidationResult:
    def __init__(self):
        self.passed: bool = True
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.checked_files: List[str] = []

    def add_error(self, msg: str):
        self.passed = False
        self.errors.append(msg)

    def add_warning(self, msg: str):
        self.warnings.append(msg)

    def add_checked(self, filepath: str):
        self.checked_files.append(filepath)

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
            "errors": self.errors,
            "warnings": self.warnings,
            "checked_files": self.checked_files,
        }


def check_locale_in_file(filepath: str, locale: str) -> List[str]:
    """
    Check if a file contains the expected locale patterns
    and does NOT contain anti-patterns (wrong locale texts).
    """
    errors = []
    if not os.path.exists(filepath):
        return []

    locale_config = LOCALE_KEYWORDS.get(locale)
    if not locale_config:
        return []

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return [f"Could not read {filepath}"]

    # Check for expected locale patterns
    has_pattern = False
    for pattern in locale_config["patterns"]:
        if re.search(pattern, content):
            has_pattern = True
            break

    if not has_pattern and len(content) > 50:
        errors.append(
            f"{filepath}: No {locale} language patterns detected. "
            f"Expected patterns for {locale} not found."
        )

    # Check for anti-patterns (wrong language)
    for pattern in locale_config["anti_patterns"]:
        if re.search(pattern, content):
            errors.append(
                f"{filepath}: Contains text in a language other than {locale}. "
                f"Found: '{pattern}'"
            )

    return errors


def validate_project_locale(
    project_path: str,
    chosen_locale: str,
    check_generated_interface: bool = True,
) -> LocaleValidationResult:
    """
    Validate that all generated project files respect the chosen locale.

    Args:
        project_path: Root path of the generated project
        chosen_locale: e.g. "pt-BR", "en-US", "es-ES", "fr-FR"
        check_generated_interface: Whether to check generated frontend files too

    Returns:
        LocaleValidationResult with pass/fail, errors, and warnings
    """
    result = LocaleValidationResult()

    if chosen_locale not in LOCALE_KEYWORDS:
        result.add_error(f"Unsupported locale: {chosen_locale}")
        return result

    if not os.path.isdir(project_path):
        result.add_error(f"Project path does not exist: {project_path}")
        return result

    # Check key files
    for filename in LOCALE_FILE_PATTERNS:
        filepath = os.path.join(project_path, filename)
        if os.path.exists(filepath):
            result.add_checked(filepath)
            file_errors = check_locale_in_file(filepath, chosen_locale)
            for err in file_errors:
                result.add_error(err)
        else:
            result.add_warning(f"Expected file missing: {filename}")

    # Check generated interface files (frontend)
    if check_generated_interface:
        frontend_dir = os.path.join(project_path, "frontend")
        if os.path.isdir(frontend_dir):
            for root, dirs, files in os.walk(frontend_dir):
                for f in files:
                    if f.endswith((".tsx", ".jsx", ".ts", ".js", ".vue", ".html")):
                        filepath = os.path.join(root, f)
                        result.add_checked(filepath)
                        file_errors = check_locale_in_file(filepath, chosen_locale)
                        for err in file_errors:
                            # Only add as warning for non-critical files
                            result.add_warning(f"[interface] {err}")

        # Also check generated backend templates
        backend_dir = os.path.join(project_path, "backend")
        if os.path.isdir(backend_dir):
            for root, dirs, files in os.walk(backend_dir):
                for f in files:
                    if f.endswith((".html", ".py", ".txt", ".md")):
                        filepath = os.path.join(root, f)
                        result.add_checked(filepath)
                        file_errors = check_locale_in_file(filepath, chosen_locale)
                        for err in file_errors:
                            result.add_warning(f"[backend] {err}")

    return result


def check_readme_locale(readme_path: str, expected_locale: str) -> bool:
    """Quick check if README is in the expected locale."""
    if not os.path.exists(readme_path):
        return False
    errors = check_locale_in_file(readme_path, expected_locale)
    return len(errors) == 0


def get_generated_text(key: str, locale: str = "en-US") -> str:
    """Get localized text for generated project using i18n engine."""
    return translate(key, locale)
