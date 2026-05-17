"""
ExpressGatekeeper — Validação de projetos Node.js + Express.
Atua em 4 fases: pre_generation, generation_plan, post_generation, download_gate.
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class ExpressGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado em projetos Node.js Express."""

    def __init__(self):
        super().__init__(name="ExpressGatekeeper", stack_id="express")

    # ── Fase 1: Pre-Generation ──────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Versão do Node.js
        node_version = blueprint.get("node_version") or blueprint.get("node") or ""
        if not node_version:
            checks.append(self._warn(
                "node_version_missing",
                "Versão do Node.js não especificada. Recomenda-se Node.js 18 LTS ou superior."
            ))
        else:
            try:
                major = int(str(node_version).lstrip("v").split(".")[0])
                if major < 14:
                    checks.append(self._fail(
                        "node_version_too_old",
                        f"Node.js {node_version} muito antigo para Express moderno. Use Node.js 18+."
                    ))
                elif major < 16:
                    checks.append(self._warn(
                        "node_version_old",
                        f"Node.js {node_version} está fora de LTS. Atualize para 18+."
                    ))
                else:
                    checks.append(self._ok("node_version"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "node_version_parse_failed",
                    f"Não foi possível validar a versão: '{node_version}'."
                ))

        # 2. Estrutura de projeto (não single-file)
        project_structure = (
            blueprint.get("project_structure") or
            blueprint.get("structure") or
            blueprint.get("architecture") or ""
        ).lower()
        if project_structure in ("singlefile", "single-file", "single_file", "monolithic_single"):
            checks.append(self._block(
                "single_file_rejected",
                "Projeto Express não pode ser gerado como arquivo único. Estruture em routes/, controllers/, services/, middlewares/."
            ))
        else:
            checks.append(self._ok("project_structure_valid"))

        # 3. Module system
        use_esm = blueprint.get("esm") or blueprint.get("type") == "module" or blueprint.get("use_esm")
        if str(use_esm).lower() in ("true", "yes", "1", "esm", "module"):
            checks.append(self._ok("esm_configured"))
        else:
            checks.append(self._warn(
                "cjs_default",
                "CommonJS é o padrão. Considere usar ESM (\"type\": \"module\") para compatibilidade futura."
            ))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ─────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        plan_str = str(blueprint).lower()

        # 1. Componentes planejados
        structural_components = {
            "routes": ["route", "router", "routes"],
            "controllers": ["controller", "controllers"],
            "services": ["service", "services"],
            "middlewares": ["middleware", "middlewares", "mid"],
        }
        for comp, aliases in structural_components.items():
            found = any(alias in plan_str for alias in aliases)
            if found:
                checks.append(self._ok(f"component_{comp}_planned"))
            else:
                checks.append(self._warn(
                    f"component_{comp}_missing",
                    f"Componente '{comp}' não planejado. Express sem esta separação pode resultar em código desorganizado."
                ))

        # 2. Validação
        validation_libs = {
            "joi": ["joi", "@hapi/joi"],
            "express-validator": ["express-validator", "express_validator"],
            "zod": ["zod"],
            "yup": ["yup"],
            "class-validator": ["class-validator", "class_validator"],
        }
        has_validation = False
        for lib, aliases in validation_libs.items():
            if any(alias in plan_str for alias in aliases):
                has_validation = True
                checks.append(self._ok(f"validation_{lib}_planned"))
                break
        if not has_validation:
            checks.append(self._warn(
                "validation_missing",
                "Nenhuma biblioteca de validação planejada (Joi, express-validator, Zod, Yup). Essencial para segurança de API."
            ))

        # 3. Segurança
        security_libs = ["helmet", "cors", "rate-limit", "express-rate-limit", "csrf", "xss"]
        found_security = [lib for lib in security_libs if lib in plan_str]
        if len(found_security) < 3:
            checks.append(self._warn(
                "security_incomplete",
                f"Apenas {len(found_security)} middleware(s) de segurança planejados. Recomenda-se helmet, cors, rate-limit no mínimo."
            ))
        else:
            checks.append(self._ok("security_planned"))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ─────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos requeridos
        required_files = [
            "package.json",
            "app.js",  # ou index.js
        ]
        files_check = self._check_required_files(project_path, required_files, "core_files")
        # Allow index.js as alternative
        if files_check.get("missing") and "app.js" in files_check.get("missing", []):
            idx_exists = os.path.exists(os.path.join(project_path, "index.js")) or \
                         os.path.exists(os.path.join(project_path, "src/index.js")) or \
                         os.path.exists(os.path.join(project_path, "src/app.js"))
            if idx_exists:
                files_check["status"] = "passed"
                files_check["found"].append("index.js (alternativo)")
                files_check["missing"] = [m for m in files_check.get("missing", []) if m != "app.js"]
        checks.append(files_check)

        required_dirs = ["src/routes/", "src/controllers/", "src/services/", "src/middlewares/"]
        # Check at project root and src/
        dirs_check_root = self._check_directory_structure(project_path, required_dirs, "core_dirs")
        checks.append(dirs_check_root)

        # 2. Single file detection (BLOCK if >500 lines, warn if >200)
        js_files = self._scan_filenames(project_path, [".js", ".mjs", ".cjs"])
        app_candidates = [f for f in js_files if os.path.basename(f) in ("app.js", "index.js", "server.js", "main.js")]
        for candidate in app_candidates:
            fpath = os.path.join(project_path, candidate)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    line_count = sum(1 for _ in fh)
                if line_count > 500:
                    checks.append(self._block(
                        "single_file_too_large",
                        f"Arquivo '{candidate}' tem {line_count} linhas (limite: 500). Refatore em routes/, controllers/, services/."
                    ))
                elif line_count > 200:
                    checks.append(self._warn(
                        "file_size_warning",
                        f"Arquivo '{candidate}' tem {line_count} linhas (limite desejado: 200). Considere modularizar."
                    ))
                else:
                    checks.append(self._ok("file_size_acceptable"))
            except Exception:
                pass

        # 3. Validação nas routes
        route_files = (
            self._scan_filenames(os.path.join(project_path, "src/routes"), [".js", ".ts"]) +
            self._scan_filenames(os.path.join(project_path, "routes"), [".js", ".ts"])
        )
        validation_in_routes = False
        validation_keywords = ["joi", "express-validator", "validator", "validate", "check(", "validationResult", "zod", "yup"]
        for rf in route_files[:20]:
            rf_path = os.path.join(project_path, rf)
            try:
                with open(rf_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(kw in content for kw in validation_keywords):
                    validation_in_routes = True
                    break
            except Exception:
                pass
        if validation_in_routes:
            checks.append(self._ok("validation_in_routes"))
        else:
            checks.append(self._warn(
                "validation_in_routes_missing",
                "Validação de entrada não encontrada nas rotas. Adicione express-validator ou Joi nos endpoints."
            ))

        # 4. Segurança (helmet, cors)
        main_files = app_candidates if app_candidates else [os.path.join(project_path, f) for f in ["app.js", "index.js", "server.js"]]
        security_middlewares_found = {"helmet": False, "cors": False}
        for mf in main_files:
            if not os.path.exists(mf):
                continue
            try:
                with open(mf, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if "helmet" in content:
                    security_middlewares_found["helmet"] = True
                if "cors" in content:
                    security_middlewares_found["cors"] = True
            except Exception:
                pass

        if security_middlewares_found["helmet"] and security_middlewares_found["cors"]:
            checks.append(self._ok("security_middlewares_configured"))
        else:
            missing_sec = [k for k, v in security_middlewares_found.items() if not v]
            checks.append(self._warn(
                "security_middlewares_missing",
                f"Middlewares de segurança ausentes: {', '.join(missing_sec)}. Configure helmet e cors."
            ))

        # 5. Error handling
        all_js_files = self._scan_filenames(project_path, [".js", ".mjs"])
        has_error_handler = False
        for f in all_js_files[:30]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if "error" in content.lower() and any(
                    kw in content for kw in [
                        "next(error)", "errorHandler", "error_handler",
                        "err.status", "err.statusCode", "err.message"
                    ]
                ):
                    has_error_handler = True
                    break
            except Exception:
                pass
        if has_error_handler:
            checks.append(self._ok("error_handling_present"))
        else:
            checks.append(self._warn(
                "error_handling_missing",
                "Middleware de tratamento de erros não encontrado. Adicione um error handler global (4 parâmetros)."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ───────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. dotenv
        dotenv_config = False
        app_files = [os.path.join(project_path, f) for f in ["app.js", "index.js", "server.js", "main.js", "src/app.js", "src/index.js"]]
        for app_f in app_files:
            if not os.path.exists(app_f):
                continue
            try:
                with open(app_f, "r", encoding="utf-8", errors="ignore") as fh:
                    first_lines = "".join(fh.readline() for _ in range(5))
                if "dotenv" in first_lines.lower() or "require('dotenv')" in first_lines.lower():
                    dotenv_config = True
                    break
            except Exception:
                pass

        if dotenv_config:
            checks.append(self._ok("dotenv_configured"))
        else:
            checks.append(self._warn(
                "dotenv_missing",
                "dotenv não carregado no entrypoint. Configure require('dotenv').config() no início do app."
            ))

        # 2. Segredos hardcoded
        js_files = self._scan_filenames(project_path, [".js", ".mjs", ".cjs"])
        secret_patterns = [
            "password =", "secret =", "api_key =", "token =", "SECRET =",
            "JWT_SECRET", "DB_PASSWORD", "API_KEY",
        ]
        hardcoded_found = []
        for f in js_files[:50]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in secret_patterns:
                    if pat in content:
                        # Check if it's assigned from process.env
                        idx = content.index(pat)
                        context = content[max(0, idx-50):idx+len(pat)+50]
                        if "process.env" not in context and ".env" not in context:
                            hardcoded_found.append(f"{f}:{pat}")
            except (Exception, ValueError):
                pass
        if hardcoded_found:
            checks.append(self._fail(
                "hardcoded_secrets",
                f"Segredos hardcoded em {len(hardcoded_found)} local(is). Use process.env com dotenv."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. Logging
        has_logging = False
        logging_libs = ["winston", "pino", "morgan", "bunyan", "logger"]
        for f in js_files[:30]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(lib in content for lib in logging_libs):
                    has_logging = True
                    break
            except Exception:
                pass
        if has_logging:
            checks.append(self._ok("logging_configured"))
        else:
            checks.append(self._warn(
                "logging_missing",
                "Logging estruturado não configurado. Adicione Winston, Pino ou Morgan para logs HTTP."
            ))

        # 4. HTTP status codes adequados
        status_code_patterns = ["res.status(", "status(200)", "status(201)", "status(400)", "status(401)", "status(403)", "status(404)", "status(500)"]
        proper_status_usage = False
        for f in js_files[:30]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(sc in content for sc in status_code_patterns):
                    proper_status_usage = True
                    break
            except Exception:
                pass
        if proper_status_usage:
            checks.append(self._ok("status_codes_proper"))
        else:
            checks.append(self._warn(
                "status_codes_missing",
                "Códigos de status HTTP explícitos (res.status()) não encontrados. Use códigos apropriados para cada resposta."
            ))

        # 5. .env completeness
        env_file = os.path.join(project_path, ".env")
        env_example = os.path.join(project_path, ".env.example")
        if os.path.exists(env_file):
            try:
                with open(env_file, "r", encoding="utf-8", errors="ignore") as fh:
                    env_content = fh.read()
                has_port = "PORT" in env_content
                has_node_env = "NODE_ENV" in env_content
                if not has_port or not has_node_env:
                    checks.append(self._warn(
                        "env_incomplete",
                        ".env sem variáveis essenciais (PORT, NODE_ENV)."
                    ))
                else:
                    checks.append(self._ok("env_complete"))
            except Exception:
                checks.append(self._warn("env_unreadable", ".env não pôde ser lido."))
        else:
            checks.append(self._warn("env_file_missing", ".env não encontrado."))

        if not os.path.exists(env_example):
            checks.append(self._warn("env_example_missing", ".env.example não encontrado. Forneça um template."))
        else:
            checks.append(self._ok("env_example_present"))

        return self._aggregate_checks(checks, "download_gate")
