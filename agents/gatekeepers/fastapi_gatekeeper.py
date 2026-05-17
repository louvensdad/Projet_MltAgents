"""
FastAPIGatekeeper — Validação de projetos Python + FastAPI.
Atua em 4 fases: pre_generation, generation_plan, post_generation, download_gate.
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class FastAPIGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado em projetos Python FastAPI."""

    def __init__(self):
        super().__init__(name="FastAPIGatekeeper", stack_id="python_fastapi")

    # ── Fase 1: Pre-Generation ──────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Versão do Python
        python_version = blueprint.get("python_version") or blueprint.get("python") or ""
        if not python_version:
            checks.append(self._warn(
                "python_version_missing",
                "Versão do Python não especificada. Recomenda-se Python 3.11+ para FastAPI."
            ))
        elif python_version.startswith("2.") or python_version in ("3.6", "3.7", "3.8"):
            checks.append(self._warn(
                "python_version_eol",
                f"Python {python_version} está fora de suporte. Use Python 3.11+ para compatibilidade com FastAPI."
            ))
        else:
            checks.append(self._ok("python_version"))

        # 2. Validade da arquitetura
        valid_archs = {"monolith", "modular_monolith", "microservices", "event_driven"}
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if not arch or arch not in valid_archs:
            checks.append(self._fail(
                "architecture_valid",
                f"Arquitetura inválida ou ausente: '{arch}'. Válidas: monolith, modular_monolith, microservices, event_driven."
            ))
        else:
            checks.append(self._ok("architecture_valid"))

        # 3. Async patterns
        use_async = (blueprint.get("async") or blueprint.get("async_mode") or blueprint.get("use_async"))
        if isinstance(use_async, bool) and use_async:
            checks.append(self._ok("async_enabled"))
        elif str(use_async).lower() in ("true", "yes", "1", "async"):
            checks.append(self._ok("async_enabled"))
        elif arch == "microservices" or arch == "event_driven":
            checks.append(self._warn(
                "async_recommended",
                f"Arquitetura '{arch}' se beneficia de endpoints assíncronos (async def). Verifique se está habilitado."
            ))
        else:
            checks.append(self._ok("async_not_required"))

        # 4. Workers / filas
        has_workers = (
            blueprint.get("workers") or
            blueprint.get("celery") or
            blueprint.get("task_queue") or
            blueprint.get("background_tasks")
        )
        if has_workers or arch == "event_driven":
            broker_configured = (
                blueprint.get("broker") or
                blueprint.get("redis") or
                blueprint.get("rabbitmq") or
                blueprint.get("celery_broker")
            )
            if not broker_configured:
                checks.append(self._warn(
                    "worker_broker_missing",
                    "Workers/tarefas assíncronas configuradas, mas nenhum broker (Celery/Redis/RabbitMQ) especificado."
                ))
            else:
                checks.append(self._ok("worker_broker_configured"))
        else:
            checks.append(self._ok("workers_not_required"))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ─────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        plan_str = str(blueprint).lower()

        # 1. Componentes planejados
        required_components = ["router", "service", "schema", "model", "dependency", "middleware"]
        for comp in required_components:
            # Verifica variações
            found = any(
                term in plan_str
                for term in [
                    comp, comp + "s",
                    # Aliases comuns
                    *({"dependencies", "dep", "inject"} if comp == "dependency" else []),
                    *({"middleware", "middlewares", "mid"} if comp == "middleware" else []),
                ]
            )
            if found:
                checks.append(self._ok(f"component_{comp}_planned"))
            else:
                checks.append(self._warn(
                    f"component_{comp}_missing",
                    f"Componente '{comp}' não encontrado no plano de geração. Pode faltar na arquitetura FastAPI."
                ))

        # 2. Microservices: comunicação assíncrona
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices":
            async_comms = {"kafka", "rabbitmq", "redis", "nats", "grpc", "pubsub", "message broker"}
            if not any(ac in plan_str for ac in async_comms):
                checks.append(self._warn(
                    "microservices_async_communication",
                    "Arquitetura microservices detectada, mas nenhum mecanismo de comunicação assíncrona (Kafka, RabbitMQ, Redis Pub/Sub) planejado."
                ))
            else:
                checks.append(self._ok("microservices_async_communication"))
        else:
            checks.append(self._ok("microservices_not_applicable"))

        # 3. Compatibilidade de banco de dados
        db = (blueprint.get("database") or blueprint.get("db") or "").lower()
        valid_dbs = {"postgresql", "postgres", "mysql", "mariadb", "sqlite", "mongodb"}
        if db and db not in valid_dbs:
            checks.append(self._warn(
                "database_compatibility",
                f"Banco '{db}' incomum com FastAPI. Recomendados: PostgreSQL, MySQL, SQLite ou MongoDB."
            ))
        elif not db:
            checks.append(self._warn(
                "database_missing",
                "Nenhum banco de dados especificado. Recomenda-se PostgreSQL com asyncpg ou SQLAlchemy async."
            ))
        else:
            checks.append(self._ok("database_compatibility"))

        # 4. Driver async para banco
        if db and db in {"postgresql", "postgres"}:
            if "asyncpg" not in plan_str and "async" in plan_str:
                checks.append(self._warn(
                    "async_driver_missing",
                    "FastAPI com async ativo, mas driver asyncpg não especificado para PostgreSQL. Considere usar asyncpg."
                ))
            else:
                checks.append(self._ok("async_driver"))
        elif db and db == "mongodb":
            if "motor" not in plan_str and "async" in plan_str:
                checks.append(self._warn(
                    "async_mongodb_driver",
                    "MongoDB selecionado com async — utilize Motor (driver async) em vez de PyMongo."
                ))
            else:
                checks.append(self._ok("async_mongodb_driver"))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ─────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Diretórios e arquivos requeridos
        required_dirs = ["routers/", "services/", "schemas/", "models/"]
        dirs_check = self._check_directory_structure(project_path, required_dirs, "core_dirs")
        checks.append(dirs_check)

        # Procurar diretórios alternativos (src/app/...)
        alt_root = os.path.join(project_path, "app")
        if not os.path.isdir(os.path.join(project_path, "routers")) and os.path.isdir(alt_root):
            alt_dirs_check = self._check_directory_structure(alt_root, required_dirs, "core_dirs_alt")
            checks.append(alt_dirs_check)

        required_files = ["main.py", "requirements.txt", "tests/"]
        files_check = self._check_required_files(project_path, required_files, "core_files")
        checks.append(files_check)

        # 2. Async def verification
        py_files = self._scan_filenames(project_path, [".py"])
        has_async = False
        async_files = []
        for f in py_files[:50]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    for line in fh:
                        if "async def" in line:
                            has_async = True
                            async_files.append(f)
                            break
            except Exception:
                pass
        use_async = str(blueprint.get("async", "")).lower() in ("true", "yes", "1")
        if use_async and not has_async:
            checks.append(self._warn(
                "async_endpoints_missing",
                "Modo async configurado, mas nenhum 'async def' encontrado nos endpoints."
            ))
        elif has_async:
            checks.append(self._ok("async_endpoints_present"))
        else:
            checks.append(self._ok("async_not_required_post"))

        # 3. Dependency injection patterns
        if py_files:
            di_found = any(
                "depends" in f.lower() or "dependency" in f.lower()
                for f in py_files
            )
            dep_pattern = self._check_file_contains(
                os.path.join(project_path, "main.py") if os.path.exists(os.path.join(project_path, "main.py"))
                else (py_files[0] if py_files else ""),
                ["Depends", "dependency"]
            ) if py_files else {"status": "warning", "missing_patterns": ["Depends"]}

            if not di_found:
                checks.append(self._warn(
                    "dependency_injection_missing",
                    "Padrão de injeção de dependência (Depends) não detectado. Essencial para FastAPI."
                ))
            else:
                checks.append(self._ok("dependency_injection_present"))

        # 4. Swagger/OpenAPI
        main_py = os.path.join(project_path, "main.py")
        if os.path.exists(main_py):
            swagger_check = self._check_file_contains(main_py, ["FastAPI", "docs_url", "openapi"])
            if swagger_check.get("status") == "passed":
                checks.append(self._ok("swagger_configured"))
            else:
                checks.append(self._warn(
                    "swagger_missing",
                    "Swagger/OpenAPI docs podem não estar configurados. O FastAPI gera /docs automaticamente, mas verifique se não foram desabilitados."
                ))
        else:
            checks.append(self._warn("main_py_missing", "main.py não encontrado."))

        # 5. Error handling middleware
        if py_files:
            error_patterns = ["HTTPException", "exception_handler", "error_handler", "RequestValidationError"]
            has_error_handling = any(
                any(ep in open(os.path.join(project_path, f), "r", encoding="utf-8", errors="ignore").read().lower()
                    for ep in error_patterns)
                for f in py_files[:30]
                if os.path.exists(os.path.join(project_path, f))
            )
            if not has_error_handling:
                checks.append(self._warn(
                    "error_handling_missing",
                    "Tratamento de erros (HTTPException, exception handlers) não detectado. Adicione handlers de erro globais."
                ))
            else:
                checks.append(self._ok("error_handling_present"))

        # 6. Arquivos proibidos
        forbidden = ["pom.xml", "build.gradle", "composer.json", "package.json"]
        forbidden_check = self._check_forbidden_files(project_path, forbidden, "fastapi")
        checks.append(forbidden_check)

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ───────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Variáveis de ambiente e segredos
        env_file = os.path.join(project_path, ".env")
        env_example = os.path.join(project_path, ".env.example")

        if os.path.exists(env_file):
            try:
                with open(env_file, "r", encoding="utf-8", errors="ignore") as fh:
                    env_content = fh.read()
                secrets_in_env = [
                    line for line in env_content.split("\n")
                    if "=" in line and not line.strip().startswith("#")
                    and any(kw in line.lower() for kw in ["password", "secret", "key", "token"])
                ]
                if secrets_in_env and not all("changeme" in s.lower() or "your_" in s.lower() or "example" in s.lower() for s in secrets_in_env):
                    checks.append(self._warn(
                        "env_secrets_populated",
                        ".env contém valores que parecem reais (não são placeholders). Verifique se são valores de exemplo."
                    ))
                else:
                    checks.append(self._ok("env_secrets_placeholders"))
            except Exception:
                checks.append(self._warn("env_unreadable", "Não foi possível ler .env."))
        else:
            checks.append(self._warn(
                "env_file_missing",
                "Arquivo .env não encontrado. Use python-dotenv para gerenciar configurações."
            ))

        if not os.path.exists(env_example):
            checks.append(self._warn(
                "env_example_missing",
                ".env.example não encontrado. Forneça um template de variáveis de ambiente."
            ))
        else:
            checks.append(self._ok("env_example_present"))

        # 2. Hardcoded secrets no código
        py_files = self._scan_filenames(project_path, [".py"])
        secret_patterns = [
            "password = \"", "password = '",
            "secret_key = \"", "secret_key = '",
            "api_key = \"", "api_key = '",
            "SECRET_KEY = \"", "SECRET_KEY = '",
        ]
        hardcoded_found = []
        for f in py_files[:50]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in secret_patterns:
                    if pat in content:
                        hardcoded_found.append(f"{f}:{pat}")
            except Exception:
                pass
        if hardcoded_found:
            checks.append(self._fail(
                "hardcoded_secrets",
                f"Possíveis segredos hardcoded em {len(hardcoded_found)} arquivo(s). Use variáveis de ambiente via os.getenv()."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. CORS
        main_py = os.path.join(project_path, "main.py")
        if os.path.exists(main_py):
            cors_check = self._check_file_contains(main_py, ["CORSMiddleware", "allow_origins", "allow_credentials"])
            if cors_check.get("status") != "passed":
                checks.append(self._warn(
                    "cors_not_configured",
                    "CORSMiddleware não configurado no main.py. Adicione para permitir requisições cross-origin."
                ))
            else:
                checks.append(self._ok("cors_configured"))
        else:
            checks.append(self._warn("main_py_cors", "main.py não encontrado para verificar CORS."))

        # 4. Logging
        log_files = [f for f in py_files if "log" in os.path.basename(f).lower()]
        has_logging = False
        for f in (log_files + py_files[:10]):
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if "logging" in content or "logger" in content or "loguru" in content:
                    has_logging = True
                    break
            except Exception:
                pass
        if not has_logging:
            checks.append(self._warn(
                "logging_missing",
                "Configuração de logging não encontrada. Adicione logging configurado (built-in logging ou loguru)."
            ))
        else:
            checks.append(self._ok("logging_configured"))

        # 5. Workers: Celery config
        has_workers = str(blueprint.get("workers", "")).lower() in ("true", "yes", "1") or \
                      blueprint.get("celery") is not None
        if has_workers:
            worker_files = [f for f in py_files if "celery" in f.lower() or "worker" in f.lower() or "task" in f.lower()]
            if not worker_files:
                checks.append(self._warn(
                    "celery_config_missing",
                    "Workers configurados, mas nenhum arquivo Celery (celery.py, tasks.py) encontrado."
                ))
            else:
                # Verificar broker URL
                celery_found = False
                for wf in worker_files[:10]:
                    wf_path = os.path.join(project_path, wf)
                    try:
                        with open(wf_path, "r", encoding="utf-8", errors="ignore") as fh:
                            if any(kw in fh.read().lower() for kw in ["broker_url", "redis://", "amqp://"]):
                                celery_found = True
                                break
                    except Exception:
                        pass
                if celery_found:
                    checks.append(self._ok("celery_broker_configured"))
                else:
                    checks.append(self._warn(
                        "celery_broker_missing",
                        "Celery configurado mas broker_url não encontrado. Configure Redis ou RabbitMQ como broker."
                    ))

            # Verificar queue names
            queue_found = any(
                "queue" in open(os.path.join(project_path, f), "r", encoding="utf-8", errors="ignore").read().lower()
                for f in worker_files[:5]
                if os.path.exists(os.path.join(project_path, f))
            )
            if not queue_found:
                checks.append(self._warn(
                    "celery_queue_names",
                    "Filas Celery sem nomes explícitos. Defina queue names para roteamento adequado de tarefas."
                ))
            else:
                checks.append(self._ok("celery_queue_names"))
        else:
            checks.append(self._ok("workers_not_applicable"))

        return self._aggregate_checks(checks, "download_gate")
