"""
BaseGatekeeper — Classe base abstrata para todos os gatekeepers.

Cada gatekeeper atua em 4 fases:
1. pre_generation_check  — valida briefing/config antes da geração
2. generation_plan_check — valida blueprint durante planejamento
3. post_generation_check — valida arquivos gerados
4. download_gate_check   — validação final antes do download
"""

import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


class BaseGatekeeper(ABC):
    """Classe base abstrata para todos os gatekeepers de stack."""

    def __init__(self, name: str, stack_id: str):
        self.name = name
        self.stack_id = stack_id
        self.results: Dict[str, Any] = {}

    # ── Métodos abstratos (cada gatekeeper implementa) ─────────────────────

    @abstractmethod
    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Valida briefing e configuração antes da geração iniciar."""
        ...

    @abstractmethod
    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Valida o blueprint/plano de arquitetura durante planejamento."""
        ...

    @abstractmethod
    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Valida profundamente os arquivos gerados."""
        ...

    @abstractmethod
    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Validação final de segurança e completude antes do download."""
        ...

    # ── Execução completa ──────────────────────────────────────────────────

    def run_all_phases(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Executa as 4 fases e consolida os resultados."""
        self.results = {
            "gatekeeper": self.name,
            "stack_id": self.stack_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "phases": {}
        }

        # Fase 1: Pre-generation
        pre = self.pre_generation_check(blueprint)
        self.results["phases"]["pre_generation"] = pre
        if pre.get("status") == "blocked":
            self.results["overall"] = "BLOCKED"
            return self.results

        # Fase 2: Generation plan (roda mesmo com warnings)
        plan = self.generation_plan_check(blueprint)
        self.results["phases"]["generation_plan"] = plan

        # Fase 3: Post-generation
        post = self.post_generation_check(project_path, blueprint)
        self.results["phases"]["post_generation"] = post

        # Fase 4: Download gate
        download = self.download_gate_check(project_path, blueprint)
        self.results["phases"]["download_gate"] = download

        # Consolida status geral
        self.results["overall"] = self._compute_overall_status()
        return self.results

    def _compute_overall_status(self) -> str:
        """Determina o status geral baseado nas 4 fases."""
        phases = self.results.get("phases", {})
        for phase_name, phase_result in phases.items():
            if phase_result.get("status") == "blocked":
                return "BLOCKED"
        for phase_name, phase_result in phases.items():
            if phase_result.get("status") == "failed":
                return "FAILED"
        for phase_name, phase_result in phases.items():
            if phase_result.get("status") == "warning":
                return "WARNING"
        return "PASS"

    # ── Helpers comuns ─────────────────────────────────────────────────────

    def _check_required_files(self, base_path: str, required: List[str], label: str = "") -> Dict[str, Any]:
        """Verifica se arquivos/pastas obrigatórios existem em base_path."""
        missing = []
        found = []
        for rel_path in required:
            full_path = os.path.join(base_path, rel_path)
            if os.path.exists(full_path):
                found.append(rel_path)
            else:
                missing.append(rel_path)

        status = "passed" if not missing else "failed"
        return {
            "check": f"required_files_{label}" if label else "required_files",
            "status": status,
            "found": found,
            "missing": missing,
        }

    def _check_forbidden_files(self, base_path: str, forbidden: List[str], label: str = "") -> Dict[str, Any]:
        """Verifica se arquivos proibidos NÃO existem em base_path."""
        violations = []
        for rel_path in forbidden:
            full_path = os.path.join(base_path, rel_path)
            if os.path.exists(full_path):
                violations.append(rel_path)

        status = "failed" if violations else "passed"
        return {
            "check": f"forbidden_files_{label}" if label else "forbidden_files",
            "status": status,
            "violations": violations,
        }

    def _check_directory_structure(self, base_path: str, expected_dirs: List[str], label: str = "") -> Dict[str, Any]:
        """Verifica se diretórios esperados existem."""
        missing = []
        found = []
        for rel_dir in expected_dirs:
            full_path = os.path.join(base_path, rel_dir)
            if os.path.isdir(full_path):
                found.append(rel_dir)
            else:
                missing.append(rel_dir)

        status = "passed" if not missing else "failed"
        return {
            "check": f"directory_structure_{label}" if label else "directory_structure",
            "status": status,
            "found": found,
            "missing": missing,
        }

    def _check_file_contains(self, file_path: str, patterns: List[str]) -> Dict[str, Any]:
        """Verifica se um arquivo contém determinados padrões de texto."""
        if not os.path.exists(file_path):
            return {
                "check": "file_contains",
                "status": "failed",
                "error": f"Arquivo não encontrado: {file_path}",
                "missing_patterns": patterns,
            }

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception as e:
            return {
                "check": "file_contains",
                "status": "failed",
                "error": f"Erro ao ler arquivo: {e}",
            }

        missing = [p for p in patterns if p.lower() not in content.lower()]
        found = [p for p in patterns if p.lower() in content.lower()]

        status = "passed" if not missing else "warning"
        return {
            "check": "file_contains",
            "status": status,
            "found_patterns": found,
            "missing_patterns": missing,
        }

    def _scan_filenames(self, base_path: str, extensions: List[str]) -> List[str]:
        """Escaneia recursivamente por arquivos com extensões específicas."""
        result = []
        if not os.path.exists(base_path):
            return result
        for root, _, files in os.walk(base_path):
            for f in files:
                if any(f.endswith(ext) for ext in extensions):
                    result.append(os.path.relpath(os.path.join(root, f), base_path))
        return result

    def _scan_dirs(self, base_path: str) -> List[str]:
        """Lista subdiretórios de primeiro nível em base_path."""
        if not os.path.exists(base_path):
            return []
        return [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d))]

    @staticmethod
    def _ok(check_name: str) -> Dict[str, Any]:
        return {"check": check_name, "status": "passed"}

    @staticmethod
    def _warn(check_name: str, message: str) -> Dict[str, Any]:
        return {"check": check_name, "status": "warning", "message": message}

    @staticmethod
    def _fail(check_name: str, message: str) -> Dict[str, Any]:
        return {"check": check_name, "status": "failed", "message": message}

    @staticmethod
    def _block(check_name: str, message: str) -> Dict[str, Any]:
        return {"check": check_name, "status": "blocked", "message": message}

    def _aggregate_checks(self, checks: List[Dict[str, Any]], phase_name: str) -> Dict[str, Any]:
        """Agrega múltiplos checks em um resultado de fase."""
        errors = []
        warnings = []
        passed = 0
        total = len(checks)

        for c in checks:
            status = c.get("status", "passed")
            if status == "blocked":
                return {
                    "phase": phase_name,
                    "status": "blocked",
                    "errors": [c.get("message", str(c))],
                    "warnings": [],
                    "checks": checks,
                }
            elif status in ("failed", "error"):
                errors.append(c.get("message", str(c)))
            elif status == "warning":
                warnings.append(c.get("message", str(c)))
            else:
                passed += 1

        if errors:
            return {
                "phase": phase_name,
                "status": "failed",
                "errors": errors,
                "warnings": warnings,
                "checks": checks,
            }
        elif warnings:
            return {
                "phase": phase_name,
                "status": "warning",
                "errors": [],
                "warnings": warnings,
                "checks": checks,
            }
        else:
            return {
                "phase": phase_name,
                "status": "passed",
                "errors": [],
                "warnings": [],
                "checks": checks,
            }

    # ── Relatórios ─────────────────────────────────────────────────────────

    def generate_report(self, project_path: str, results: Dict[str, Any], language: str = "Português") -> str:
        """Gera validation_report.json e docs/GATEKEEPER_REPORT.md no projeto."""
        # JSON report
        report_json_path = os.path.join(project_path, "validation_report.json")
        try:
            with open(report_json_path, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"[{self.name}] Erro ao gerar validation_report.json: {e}")

        # Markdown report
        docs_dir = os.path.join(project_path, "docs")
        os.makedirs(docs_dir, exist_ok=True)
        report_md_path = os.path.join(docs_dir, "GATEKEEPER_REPORT.md")

        is_pt = language.lower().startswith("port")

        lines = []
        lines.append(f"# {'Relatório do Gatekeeper' if is_pt else 'Gatekeeper Report'}")
        lines.append("")
        lines.append(f"**Gatekeeper:** {self.name}  ")
        lines.append(f"**Stack:** {self.stack_id}  ")
        lines.append(f"**{'Status Geral' if is_pt else 'Overall Status'}:** `{results.get('overall', 'N/A')}`  ")
        lines.append(f"**{'Data' if is_pt else 'Date'}:** {results.get('timestamp', 'N/A')}  ")
        lines.append("")

        phases = results.get("phases", {})
        phase_labels_pt = {
            "pre_generation": "Pré-Geração",
            "generation_plan": "Plano de Geração",
            "post_generation": "Pós-Geração",
            "download_gate": "Portão de Download",
        }
        phase_labels_en = {
            "pre_generation": "Pre-Generation",
            "generation_plan": "Generation Plan",
            "post_generation": "Post-Generation",
            "download_gate": "Download Gate",
        }
        labels = phase_labels_pt if is_pt else phase_labels_en

        for phase_key, phase_result in phases.items():
            phase_label = labels.get(phase_key, phase_key)
            status = phase_result.get("status", "unknown").upper()
            emoji = {"PASSED": "✅", "WARNING": "⚠️", "FAILED": "❌", "BLOCKED": "🚫"}.get(status, "❓")

            lines.append(f"## {emoji} {phase_label}")
            lines.append("")
            lines.append(f"**Status:** `{status}`")
            lines.append("")

            errors = phase_result.get("errors", [])
            if errors:
                lines.append(f"### {'Erros' if is_pt else 'Errors'}")
                for e in errors:
                    lines.append(f"- ❌ {e}")
                lines.append("")

            warnings = phase_result.get("warnings", [])
            if warnings:
                lines.append(f"### {'Avisos' if is_pt else 'Warnings'}")
                for w in warnings:
                    lines.append(f"- ⚠️ {w}")
                lines.append("")

            checks = phase_result.get("checks", [])
            if checks:
                lines.append(f"### {'Verificações' if is_pt else 'Checks'}")
                lines.append("")
                lines.append("| Check | Status | Detalhes |")
                lines.append("|-------|--------|----------|")
                for c in checks:
                    c_name = c.get("check", "?")
                    c_status = c.get("status", "?").upper()
                    detail = c.get("message", c.get("missing", c.get("found", "")))
                    if isinstance(detail, list):
                        detail = ", ".join(detail) if detail else "-"
                    lines.append(f"| {c_name} | `{c_status}` | {detail} |")
                lines.append("")

            if pre := phase_result.get("pre_generation"):
                lines.append(f"- Pre: `{pre}`")
            if post := phase_result.get("post_generation"):
                lines.append(f"- Post: `{post}`")

        lines.append("---")
        lines.append(f"*{'Relatório gerado automaticamente pelo ' if is_pt else 'Report auto-generated by '}SaaS Factory AI Gatekeeper System*")
        lines.append("")

        try:
            with open(report_md_path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
        except Exception as e:
            print(f"[{self.name}] Erro ao gerar GATEKEEPER_REPORT.md: {e}")

        return report_md_path

    def display_status(self, results: Dict[str, Any]):
        """Exibe status formatado no terminal."""
        overall = results.get("overall", "N/A")
        emoji = {"PASS": "✅", "WARNING": "⚠️", "FAILED": "❌", "BLOCKED": "🚫"}.get(overall, "❓")

        print(f"\n{'='*60}")
        print(f"  {emoji} Gatekeeper: {self.name}")
        print(f"  Stack: {self.stack_id}")
        print(f"  Status: {overall}")
        print(f"{'='*60}")

        phase_labels = {
            "pre_generation": "Pre-Generation",
            "generation_plan": "Generation Plan",
            "post_generation": "Post-Generation",
            "download_gate": "Download Gate",
        }

        for phase_key, phase_result in results.get("phases", {}).items():
            status = phase_result.get("status", "?").upper()
            icon = {"PASSED": "✅", "WARNING": "⚠️", "FAILED": "❌", "BLOCKED": "🚫"}.get(status, "❓")
            label = phase_labels.get(phase_key, phase_key)
            errors = phase_result.get("errors", [])
            warns = phase_result.get("warnings", [])

            print(f"  {icon} {label}: {status}", end="")
            if errors:
                print(f" ({len(errors)} erros)", end="")
            if warns:
                print(f" ({len(warns)} avisos)", end="")
            print()

        print(f"{'='*60}\n")
