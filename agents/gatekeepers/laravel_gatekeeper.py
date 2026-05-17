"""
LaravelGatekeeper — Validação de projetos PHP + Laravel.
Atua em 4 fases: pre_generation, generation_plan, post_generation, download_gate.
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class LaravelGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado em projetos PHP Laravel."""

    def __init__(self):
        super().__init__(name="LaravelGatekeeper", stack_id="php_laravel")

    # ── Fase 1: Pre-Generation ──────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Versão do PHP
        php_version = blueprint.get("php_version") or blueprint.get("php") or ""
        if not php_version:
            checks.append(self._warn(
                "php_version_missing",
                "Versão do PHP não especificada. Recomenda-se PHP 8.2+ para Laravel 11+."
            ))
        else:
            try:
                # Parse "8.2" -> (8,2)
                parts = str(php_version).replace("PHP", "").replace("php", "").strip()
                major = float(parts.split(".")[0])
                if major < 8.0:
                    checks.append(self._fail(
                        "php_version_too_old",
                        f"PHP {php_version} não suporta Laravel 10+. Use PHP 8.2+."
                    ))
                elif major < 8.1:
                    checks.append(self._warn(
                        "php_version_old",
                        f"PHP {php_version} está no limite de compatibilidade. Atualize para 8.2+."
                    ))
                else:
                    checks.append(self._ok("php_version"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "php_version_parse_failed",
                    f"Não foi possível validar a versão do PHP: '{php_version}'."
                ))

        # 2. Banco de dados
        db = (blueprint.get("database") or blueprint.get("db") or "").lower()
        if not db:
            checks.append(self._warn(
                "database_missing",
                "Banco de dados não especificado. Laravel suporta MySQL, PostgreSQL, SQLite e SQL Server."
            ))
        elif db not in ("mysql", "postgresql", "postgres", "sqlite", "sqlsrv", "mariadb"):
            checks.append(self._warn(
                "database_unknown",
                f"Banco '{db}' não é típico para Laravel. Recomendados: MySQL, PostgreSQL, SQLite."
            ))
        else:
            checks.append(self._ok("database_compatible"))

        # 3. Complexidade
        complexity = (blueprint.get("complexity") or blueprint.get("tier") or "").upper()
        if not complexity:
            checks.append(self._warn(
                "complexity_missing",
                "Nível de complexidade não definido. O gatekeeper ajustará verificações para MVP como padrão."
            ))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ─────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        plan_str = str(blueprint).lower()

        # 1. Componentes planejados
        laravel_components = [
            "controllers", "models", "migrations", "policies",
            "formrequests", "queues", "jobs", "services",
        ]
        for comp in laravel_components:
            found = comp.rstrip("s") in plan_str or comp in plan_str
            if comp == "formrequests":
                found = "form request" in plan_str or "formrequest" in plan_str or "form_request" in plan_str

            if found:
                checks.append(self._ok(f"component_{comp}_planned"))
            else:
                if comp in ("controllers", "models", "migrations"):
                    checks.append(self._warn(
                        f"component_{comp}_missing",
                        f"Componente essencial '{comp}' não planejado. Laravel depende desta camada."
                    ))
                else:
                    checks.append(self._warn(
                        f"component_{comp}_missing",
                        f"Componente '{comp}' não encontrado no plano. Considere incluir para boas práticas Laravel."
                    ))

        # 2. Services layer (vs fat controllers)
        if "service" not in plan_str and "services" not in plan_str:
            checks.append(self._warn(
                "services_layer_missing",
                "Camada de Services não planejada. Evite controllers gordos — delegue lógica de negócio para Services."
            ))
        else:
            checks.append(self._ok("services_layer_planned"))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ─────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos requeridos
        required_files = [
            "composer.json",
            "app/Http/Controllers/",
            "app/Models/",
            "database/migrations/",
            "routes/",
            ".env.example",
        ]
        files_check = self._check_required_files(project_path, required_files, "core_files")
        checks.append(files_check)

        # 2. Artisan
        artisan = os.path.join(project_path, "artisan")
        if os.path.exists(artisan):
            checks.append(self._ok("artisan_present"))
        else:
            checks.append(self._warn("artisan_missing", "Arquivo artisan não encontrado. Pode indicar que o projeto não foi inicializado com composer create-project."))

        # 3. Policies
        policies_dir = os.path.join(project_path, "app/Policies")
        if os.path.isdir(policies_dir) and os.listdir(policies_dir):
            php_files = self._scan_filenames(policies_dir, [".php"])
            if php_files:
                checks.append(self._ok("policies_present"))
            else:
                checks.append(self._warn(
                    "policies_missing",
                    "Diretório Policies existe mas está vazio. Crie policies para autorização (Gate::policy)."
                ))
        else:
            checks.append(self._warn(
                "policies_missing",
                "Nenhuma Policy encontrada em app/Policies. Policies são essenciais para autorização no Laravel."
            ))

        # 4. Form Requests
        form_requests_dir = os.path.join(project_path, "app/Http/Requests")
        if os.path.isdir(form_requests_dir) and os.listdir(form_requests_dir):
            checks.append(self._ok("form_requests_present"))
        else:
            # Check inline validation in controllers
            controller_dir = os.path.join(project_path, "app/Http/Controllers")
            php_files = self._scan_filenames(project_path, [".php"])
            has_validation = False
            for f in php_files[:30]:
                fpath = os.path.join(project_path, f)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read().lower()
                    if any(kw in content for kw in ["validate(", "$request->validate", "validator::make", "formrequest"]):
                        has_validation = True
                        break
                except Exception:
                    pass
            if has_validation:
                checks.append(self._ok("validation_in_controllers"))
            else:
                checks.append(self._warn(
                    "validation_missing",
                    "Validação de requisição não encontrada. Use Form Requests ou $request->validate()."
                ))

        # 5. Services layer
        services_dir = os.path.join(project_path, "app/Services")
        if os.path.isdir(services_dir) and os.listdir(services_dir):
            checks.append(self._ok("services_layer_present"))
        else:
            checks.append(self._warn(
                "services_layer_missing",
                "Camada app/Services/ não encontrada ou vazia. Extraia lógica de negócio dos controllers para Services."
            ))

        # 6. Enterprise checks (Horizon, Queues, Events, Notifications)
        complexity = (blueprint.get("complexity") or blueprint.get("tier") or "").upper()
        if complexity in ("ENTERPRISE", "STANDARD"):
            php_files = self._scan_filenames(project_path, [".php"])
            php_all_content = ""
            for f in php_files[:40]:
                fpath = os.path.join(project_path, f)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                        php_all_content += fh.read().lower()
                except Exception:
                    pass

            enterprise_checks = {
                "horizon": "horizon" in php_all_content or os.path.exists(os.path.join(project_path, "config/horizon.php")),
                "queues": "shouldqueue" in php_all_content or "dispatch(" in php_all_content,
                "events": "event(" in php_all_content or "event::" in php_all_content or "shoulddispatchaftercommit" in php_all_content,
                "notifications": "notification" in php_all_content,
            }
            for feature, found in enterprise_checks.items():
                if found:
                    checks.append(self._ok(f"enterprise_{feature}_present"))
                else:
                    if feature in ("horizon", "queues"):
                        checks.append(self._warn(
                            f"enterprise_{feature}_missing",
                            f"Feature enterprise '{feature}' não encontrada. Considere configurar {feature.title()}."
                        ))
                    else:
                        checks.append(self._ok(f"enterprise_{feature}_optional"))
        else:
            checks.append(self._ok("enterprise_not_required"))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ───────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. .env properly structured
        env_file = os.path.join(project_path, ".env")
        if os.path.exists(env_file):
            try:
                with open(env_file, "r", encoding="utf-8", errors="ignore") as fh:
                    env_content = fh.read()

                env_essentials = ["APP_NAME", "APP_ENV", "APP_KEY", "DB_CONNECTION", "DB_HOST", "DB_DATABASE"]
                missing_essentials = [v for v in env_essentials if v not in env_content]
                if missing_essentials:
                    checks.append(self._warn(
                        "env_essentials_missing",
                        f"Variáveis essenciais ausentes no .env: {', '.join(missing_essentials)}."
                    ))
                else:
                    checks.append(self._ok("env_essentials_complete"))

                # APP_KEY não pode ser vazia ou placeholder
                app_key_line = [l for l in env_content.split("\n") if l.startswith("APP_KEY=")]
                if app_key_line:
                    key_value = app_key_line[0].split("=", 1)[1].strip()
                    if not key_value or key_value == "base64:" or "your_key" in key_value.lower() or "changeme" in key_value.lower():
                        checks.append(self._warn(
                            "app_key_placeholder",
                            "APP_KEY é um placeholder. Execute 'php artisan key:generate' para gerar uma chave real."
                        ))
                    else:
                        checks.append(self._ok("app_key_valid"))
                else:
                    checks.append(self._warn("app_key_missing", "APP_KEY não encontrada no .env."))
            except Exception:
                checks.append(self._warn("env_read_error", ".env não pôde ser lido."))
        else:
            checks.append(self._warn("env_missing", ".env não encontrado."))

        # 2. .env.example present
        env_example = os.path.join(project_path, ".env.example")
        if os.path.exists(env_example):
            checks.append(self._ok("env_example_present"))
        else:
            checks.append(self._warn("env_example_missing", ".env.example não encontrado."))

        # 3. CSRF protection
        verify_csrf = os.path.join(project_path, "app/Http/Middleware/VerifyCsrfToken.php")
        if os.path.exists(verify_csrf):
            checks.append(self._ok("csrf_middleware_present"))
        else:
            checks.append(self._warn(
                "csrf_middleware_missing",
                "VerifyCsrfToken middleware não encontrado. CSRF protection pode estar desabilitada."
            ))

        # 4. Queue worker config
        queue_config = os.path.join(project_path, "config/queue.php")
        horizon_config = os.path.join(project_path, "config/horizon.php")
        has_queue_config = os.path.exists(queue_config)
        has_horizon_config = os.path.exists(horizon_config)

        if has_queue_config or has_horizon_config:
            checks.append(self._ok("queue_config_present"))
        else:
            checks.append(self._warn(
                "queue_config_missing",
                "Configuração de filas (config/queue.php) não encontrada. Configure database/redis queue driver."
            ))

        # 5. Hardcoded secrets
        php_files = self._scan_filenames(project_path, [".php"])
        secret_patterns = [
            "DB_PASSWORD", "MAIL_PASSWORD", "AWS_SECRET", "API_KEY",
            "APP_KEY", "JWT_SECRET", "PASSPORT_SECRET",
        ]
        hardcoded_found = []
        for f in php_files[:50]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in secret_patterns:
                    if pat in content:
                        # Check context: is it from env()?
                        idx = content.index(pat)
                        context_before = content[max(0, idx-80):idx]
                        if "env(" not in context_before and "env(" not in content[idx:idx+30]:
                            # Exception for config files that read from env
                            if "config/" not in f:
                                hardcoded_found.append(f"{os.path.basename(f)}:{pat}")
            except (Exception, ValueError):
                pass
        if hardcoded_found:
            checks.append(self._fail(
                "hardcoded_secrets",
                f"Possíveis segredos hardcoded em {len(hardcoded_found)} local(is). Use env() helper do Laravel."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 6. Debug mode check
        env_path = os.path.join(project_path, ".env")
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as fh:
                    env_content = fh.read()
                app_debug_line = [l for l in env_content.split("\n") if l.startswith("APP_DEBUG=")]
                if app_debug_line:
                    debug_value = app_debug_line[0].split("=", 1)[1].strip().lower()
                    if debug_value == "true":
                        checks.append(self._warn(
                            "debug_mode_enabled",
                            "APP_DEBUG=true no .env. Desative em produção para evitar vazamento de informações."
                        ))
                    else:
                        checks.append(self._ok("debug_mode_disabled"))
            except Exception:
                pass
        else:
            checks.append(self._ok("debug_mode_not_checked"))

        return self._aggregate_checks(checks, "download_gate")
