"""
DotNetGatekeeper — Validação de projetos C# + ASP.NET Core.
Atua em 4 fases: pre_generation, generation_plan, post_generation, download_gate.
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class DotNetGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado em projetos .NET / ASP.NET Core."""

    def __init__(self):
        super().__init__(name="DotNetGatekeeper", stack_id="dotnet")

    # ── Fase 1: Pre-Generation ──────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Versão do .NET
        dotnet_version = blueprint.get("dotnet_version") or blueprint.get("dotnet") or blueprint.get("net_version") or ""
        if not dotnet_version:
            checks.append(self._warn(
                "dotnet_version_missing",
                "Versão do .NET não especificada. Recomenda-se .NET 8 (LTS) ou .NET 9."
            ))
        else:
            try:
                version_str = str(dotnet_version).replace("v", "").replace("net", "").replace(".NET", "").strip()
                major = int(version_str.split(".")[0])
                if major < 6:
                    checks.append(self._fail(
                        "dotnet_version_out_of_support",
                        f".NET {dotnet_version} está fora de suporte. Use .NET 8 LTS ou superior."
                    ))
                elif major == 6:
                    checks.append(self._warn(
                        "dotnet_version_eol",
                        f".NET 6 perde suporte em novembro 2024. Migre para .NET 8 LTS."
                    ))
                elif major == 7:
                    checks.append(self._warn(
                        "dotnet_version_non_lts",
                        f".NET 7 não é LTS. Use .NET 8 LTS para suporte de longo prazo."
                    ))
                else:
                    checks.append(self._ok("dotnet_version"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "dotnet_version_parse_failed",
                    f"Não foi possível validar versão: '{dotnet_version}'."
                ))

        # 2. Arquitetura
        valid_archs = {"monolith", "modular_monolith", "microservices", "event_driven", "clean_architecture", "ddd"}
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if not arch or arch not in valid_archs:
            checks.append(self._warn(
                "architecture_unknown",
                f"Arquitetura '{arch}' não validada. ASP.NET Core suporta: monolith, modular_monolith, microservices, event_driven, clean_architecture, ddd."
            ))
        else:
            checks.append(self._ok("architecture_valid"))

        # 3. .NET flavor
        use_minimal_api = (blueprint.get("minimal_api") or blueprint.get("use_minimal_api") or "")
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower()
        if str(use_minimal_api).lower() in ("true", "yes", "1") and arch in ("microservices", "event_driven"):
            checks.append(self._warn(
                "minimal_api_microservices",
                "Minimal APIs em microservices são viáveis, mas considere controllers para cenários mais complexos."
            ))
        else:
            checks.append(self._ok("api_style_valid"))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ─────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        plan_str = str(blueprint).lower()

        # 1. Componentes planejados
        dotnet_components = [
            "controllers", "services", "repositories", "dtos",
            "ef core", "swagger", "jwt", "appsettings",
        ]
        for comp in dotnet_components:
            found = comp in plan_str
            if comp == "ef core":
                found = "ef core" in plan_str or "entity framework" in plan_str or "entityframework" in plan_str
            if comp == "jwt":
                found = "jwt" in plan_str or "authentication" in plan_str or "token" in plan_str
            if comp == "appsettings":
                found = "appsettings" in plan_str or "configuration" in plan_str

            if found:
                checks.append(self._ok(f"component_{comp}_planned"))
            else:
                if comp in ("controllers", "services", "appsettings"):
                    checks.append(self._warn(
                        f"component_{comp}_missing",
                        f"Componente essencial '{comp}' não encontrado no plano de geração."
                    ))
                else:
                    checks.append(self._warn(
                        f"component_{comp}_missing",
                        f"Componente '{comp}' não planejado. Recomendado para projetos ASP.NET Core robustos."
                    ))

        # 2. Microservices: YARP/API Gateway
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices":
            if not any(gw in plan_str for gw in ["yarp", "ocelot", "gateway", "api gateway"]):
                checks.append(self._warn(
                    "microservices_gateway_missing",
                    "API Gateway não planejado para microservices .NET. Considere YARP (Microsoft) ou Ocelot."
                ))
            else:
                checks.append(self._ok("microservices_gateway_planned"))

            if not any(mq in plan_str for mq in ["rabbitmq", "kafka", "azure service bus", "masstransit", "nservicebus"]):
                checks.append(self._warn(
                    "microservices_messaging_missing",
                    "Mensageria não planejada para microservices. Considere MassTransit com RabbitMQ ou Azure Service Bus."
                ))
            else:
                checks.append(self._ok("microservices_messaging_planned"))
        else:
            checks.append(self._ok("microservices_not_applicable"))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ─────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos requeridos
        csproj_files = self._scan_filenames(project_path, [".csproj"])
        if not csproj_files:
            checks.append(self._fail(
                "csproj_missing",
                "Nenhum arquivo .csproj encontrado. Projeto .NET incompleto."
            ))
        else:
            checks.append(self._ok("csproj_present"))

        required_dirs = ["Controllers/", "Services/", "Repositories/", "DTOs/"]
        dirs_check = self._check_directory_structure(project_path, required_dirs, "core_dirs")
        checks.append(dirs_check)

        required_files = ["appsettings.json", "Program.cs"]
        files_check = self._check_required_files(project_path, required_files, "core_files")
        checks.append(files_check)

        # 2. Swagger configurado
        program_cs = os.path.join(project_path, "Program.cs")
        if os.path.exists(program_cs):
            swagger_check = self._check_file_contains(program_cs, ["Swagger", "SwaggerGen", "SwaggerUI", "Swashbuckle", "OpenApi"])
            if swagger_check.get("status") == "passed":
                checks.append(self._ok("swagger_configured"))
            else:
                checks.append(self._warn(
                    "swagger_missing",
                    "Swagger/Swashbuckle não configurado no Program.cs. Adicione AddSwaggerGen() e UseSwagger() para documentação OpenAPI."
                ))
        else:
            checks.append(self._warn("program_cs_missing", "Program.cs não encontrado."))

        # 3. JWT Authentication
        if os.path.exists(program_cs):
            jwt_check = self._check_file_contains(program_cs, [
                "AddAuthentication", "JwtBearer", "AddJwtBearer",
                "TokenValidationParameters", "IssuerSigningKey"
            ])
            if jwt_check.get("status") == "passed":
                checks.append(self._ok("jwt_authentication_configured"))
            else:
                # Check appsettings too
                appsettings = os.path.join(project_path, "appsettings.json")
                jwt_in_config = False
                if os.path.exists(appsettings):
                    jwt_config_check = self._check_file_contains(appsettings, ["Jwt", "JWT", "jwt"])
                    if jwt_config_check.get("status") == "passed":
                        jwt_in_config = True

                if jwt_in_config:
                    checks.append(self._warn(
                        "jwt_config_only",
                        "JWT configurado apenas em appsettings.json. Configure AddAuthentication().AddJwtBearer() no Program.cs."
                    ))
                else:
                    checks.append(self._warn(
                        "jwt_authentication_missing",
                        "Autenticação JWT não configurada. Adicione AddAuthentication().AddJwtBearer() no Program.cs."
                    ))
        else:
            checks.append(self._warn("program_cs_missing", "Program.cs não encontrado para verificar JWT."))

        # 4. EF Core DbContext
        cs_files = self._scan_filenames(project_path, [".cs"])
        db_context_found = any(
            "DbContext" in f or "dbcontext" in f.lower() or "ApplicationDbContext" in f
            for f in cs_files
        )
        if db_context_found:
            # Verify AddDbContext in Program.cs
            if os.path.exists(program_cs):
                db_check = self._check_file_contains(program_cs, ["AddDbContext", "UseSqlServer", "UseNpgsql", "UseMySQL", "UseSqlite"])
                if db_check.get("status") == "passed":
                    checks.append(self._ok("efcore_dbcontext_configured"))
                else:
                    checks.append(self._warn(
                        "efcore_not_registered",
                        "DbContext encontrado mas não registrado no Program.cs com AddDbContext()."
                    ))
            else:
                checks.append(self._ok("dbcontext_found"))
        else:
            checks.append(self._warn(
                "dbcontext_missing",
                "Nenhum DbContext encontrado. Configure Entity Framework Core com um DbContext."
            ))

        # 5. Microservices: Docker, YARP, Messaging
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices":
            # Docker
            dockerfile = os.path.join(project_path, "Dockerfile")
            docker_compose = os.path.join(project_path, "docker-compose.yml")
            if os.path.exists(dockerfile) or os.path.exists(docker_compose):
                checks.append(self._ok("microservices_docker_present"))
            else:
                checks.append(self._warn(
                    "microservices_docker_missing",
                    "Dockerfile ou docker-compose.yml não encontrados para microservices. Essencial para containerização."
                ))

            # YARP / API Gateway
            cs_content_all = ""
            for f in cs_files[:30]:
                fpath = os.path.join(project_path, f)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                        cs_content_all += fh.read().lower()
                except Exception:
                    pass

            if any(gw in cs_content_all for gw in ["yarp", "ocelot"]):
                checks.append(self._ok("api_gateway_configured"))
            else:
                checks.append(self._warn(
                    "api_gateway_missing",
                    "Nenhum API Gateway (YARP/Ocelot) configurado nos microservices."
                ))

            # Messaging
            if any(mq in cs_content_all for mq in ["masstransit", "rabbitmq", "kafka", "servicebus"]):
                checks.append(self._ok("messaging_configured"))
            else:
                checks.append(self._warn(
                    "messaging_missing",
                    "Mensageria (MassTransit, RabbitMQ, Kafka) não configurada para comunicação entre microservices."
                ))
        else:
            checks.append(self._ok("microservices_not_applicable"))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ───────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. appsettings secrets
        appsettings = os.path.join(project_path, "appsettings.json")
        appsettings_dev = os.path.join(project_path, "appsettings.Development.json")

        for config_file in [appsettings, appsettings_dev]:
            if not os.path.exists(config_file):
                continue
            try:
                with open(config_file, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                secret_indicators = ["password", "secret", "apikey", "api_key", "connectionstring"]
                found_secrets = [s for s in secret_indicators if s in content]
                if found_secrets:
                    base = os.path.basename(config_file)
                    checks.append(self._warn(
                        f"secrets_in_{base}",
                        f"Possíveis segredos em {base}: {', '.join(found_secrets)}. Use User Secrets ou Azure Key Vault."
                    ))
                else:
                    checks.append(self._ok(f"{os.path.basename(config_file)}_clean"))
            except Exception:
                checks.append(self._warn(f"config_read_error", f"Não foi possível ler {os.path.basename(config_file)}."))

        # 2. Health checks
        program_cs = os.path.join(project_path, "Program.cs")
        health_configured = False
        if os.path.exists(program_cs):
            health_check = self._check_file_contains(program_cs, ["AddHealthChecks", "MapHealthChecks", "health"])
            if health_check.get("status") == "passed":
                health_configured = True

        # Also check custom health check files
        cs_files = self._scan_filenames(project_path, [".cs"])
        if not health_configured:
            health_configured = any("health" in f.lower() for f in cs_files)

        if health_configured:
            checks.append(self._ok("health_checks_configured"))
        else:
            checks.append(self._warn(
                "health_checks_missing",
                "Health checks não configurados. Adicione AddHealthChecks() e MapHealthChecks() no Program.cs."
            ))

        # 3. CORS
        if os.path.exists(program_cs):
            cors_check = self._check_file_contains(program_cs, ["AddCors", "UseCors", "WithOrigins", "AllowAnyOrigin"])
            if cors_check.get("status") == "passed":
                checks.append(self._ok("cors_configured"))
            else:
                checks.append(self._warn(
                    "cors_not_configured",
                    "CORS não configurado no Program.cs. Adicione AddCors() e UseCors() com políticas adequadas."
                ))
        else:
            checks.append(self._warn("program_cs_cors", "Program.cs não encontrado para verificar CORS."))

        # 4. Logging
        if os.path.exists(program_cs):
            logging_check = self._check_file_contains(program_cs, ["AddLogging", "Serilog", "Logger", "logging"])
            if logging_check.get("status") == "passed":
                checks.append(self._ok("logging_configured"))
            else:
                fallback_logging = any("serilog" in f.lower() or "logging" in f.lower() for f in cs_files)
                if fallback_logging:
                    checks.append(self._ok("logging_fallback_found"))
                else:
                    checks.append(self._warn(
                        "logging_not_configured",
                        "Logging estruturado não configurado. Considere Serilog para logs de produção."
                    ))
        else:
            checks.append(self._warn("program_cs_logging", "Program.cs não encontrado para verificar logging."))

        # 5. Microservices: container orchestration
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices":
            dc_path = os.path.join(project_path, "docker-compose.yml")
            k8s_files = self._scan_filenames(project_path, [".yaml", ".yml"])
            k8s_found = any("deployment" in f.lower() or "service" in f.lower() or "k8s" in f.lower() or "kubernetes" in f.lower() for f in k8s_files)

            if os.path.exists(dc_path):
                checks.append(self._ok("docker_compose_present"))
            elif k8s_found:
                checks.append(self._ok("kubernetes_manifests_present"))
            else:
                checks.append(self._warn(
                    "orchestration_missing",
                    "Nenhuma configuração de orquestração (docker-compose.yml ou Kubernetes manifests) encontrada para microservices."
                ))
        else:
            checks.append(self._ok("microservices_orchestration_not_applicable"))

        # 6. Hardcoded secrets no código
        secret_patterns = [
            "password = \"", "Password = \"",
            "secret = \"", "Secret = \"",
            "apikey = \"", "ApiKey = \"",
            "connectionstring = \"",
        ]
        hardcoded_found = []
        for f in cs_files[:50]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in secret_patterns:
                    if pat.lower() in content.lower():
                        # Ignore if reading from IConfiguration
                        idx = content.lower().index(pat.lower())
                        context = content[max(0, idx-80):idx].lower()
                        if "configuration[" not in context and "getconnectionstring" not in context and "getvalue" not in context:
                            hardcoded_found.append(f"{os.path.basename(f)}:{pat}")
            except (Exception, ValueError):
                pass
        if hardcoded_found:
            checks.append(self._fail(
                "hardcoded_secrets",
                f"Segredos hardcoded em {len(hardcoded_found)} local(is). Use IConfiguration/User Secrets/Azure Key Vault."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        return self._aggregate_checks(checks, "download_gate")
