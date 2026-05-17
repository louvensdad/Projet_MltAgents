"""
SpringBootGatekeeper — Validação de projetos Java + Spring Boot.
Atua em 4 fases: pre_generation, generation_plan, post_generation, download_gate.
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class SpringBootGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado em projetos Java Spring Boot."""

    def __init__(self):
        super().__init__(name="SpringBootGatekeeper", stack_id="spring_boot")

    # ── Fase 1: Pre-Generation ──────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Validar arquitetura
        valid_archs = {"monolith", "modular_monolith", "microservices", "event_driven"}
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if not arch or arch not in valid_archs:
            checks.append(self._fail(
                "architecture_valid",
                f"Arquitetura inválida ou ausente: '{arch}'. Use uma das seguintes: monolith, modular_monolith, microservices, event_driven."
            ))
        else:
            checks.append(self._ok("architecture_valid"))

        # 2. Microservices + MVP -> bloqueia
        complexity = (blueprint.get("complexity") or blueprint.get("tier") or "").upper()
        if arch == "microservices" and complexity == "MVP":
            checks.append(self._block(
                "microservices_mvp_conflict",
                "Arquitetura enterprise avançada incompatível com complexidade MVP."
            ))
        else:
            checks.append(self._ok("microservices_mvp_conflict"))

        # 3. Versão do Java
        java_version = blueprint.get("java_version") or blueprint.get("java") or ""
        if not java_version:
            checks.append(self._warn(
                "java_version_missing",
                "Versão do Java não especificada. Recomenda-se Java 17 ou 21 (LTS)."
            ))
        elif java_version not in ("8", "11", "17", "21"):
            checks.append(self._warn(
                "java_version_unsupported",
                f"Versão do Java '{java_version}' pode não ser LTS. Recomenda-se 17 ou 21."
            ))
        else:
            checks.append(self._ok("java_version"))

        # 4. Compatibilidade com frontend
        frontend = (blueprint.get("frontend") or "").lower()
        if frontend:
            incompatible_frontends = {"blazor", "asp.net", "razor"}
            if any(inc in frontend for inc in incompatible_frontends):
                checks.append(self._warn(
                    "frontend_compatibility",
                    f"Frontend '{frontend}' pode conflitar com Spring Boot backend. Prefira React, Angular, Vue ou Next.js."
                ))
            else:
                checks.append(self._ok("frontend_compatibility"))
        else:
            checks.append(self._ok("frontend_compatibility"))

        # 5. Validar briefing tem entidades e funcionalidades
        briefing = blueprint.get("briefing") or blueprint.get("brief") or {}
        entities = briefing.get("entities") or briefing.get("entidades") or blueprint.get("entities") or []
        features = briefing.get("features") or briefing.get("funcionalidades") or blueprint.get("features") or []
        if not entities:
            checks.append(self._warn(
                "briefing_entities",
                "Nenhuma entidade de negócio definida no briefing. O projeto pode ficar sem modelos."
            ))
        else:
            checks.append(self._ok("briefing_entities"))
        if not features:
            checks.append(self._warn(
                "briefing_features",
                "Nenhuma funcionalidade definida no briefing. O escopo do projeto está vazio."
            ))
        else:
            checks.append(self._ok("briefing_features"))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ─────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")

        # 1. Verificar serviços planejados para microservices
        if arch == "microservices":
            required_services = ["api-gateway", "discovery", "auth", "business"]
            plan_services = (
                blueprint.get("services") or
                blueprint.get("microservices") or
                blueprint.get("modules") or
                []
            )
            plan_str = str(plan_services).lower()
            for svc in required_services:
                if svc not in plan_str:
                    checks.append(self._warn(
                        f"microservice_missing_{svc}",
                        f"Serviço '{svc}' não encontrado no plano de arquitetura para microservices."
                    ))
                else:
                    checks.append(self._ok(f"microservice_{svc}_present"))
        else:
            checks.append(self._ok("microservices_not_applicable"))

        # 2. Event Driven — Kafka/RabbitMQ
        if arch == "event_driven":
            plan_str = str(blueprint).lower()
            has_broker = "kafka" in plan_str or "rabbitmq" in plan_str or "rabbit" in plan_str
            if not has_broker:
                checks.append(self._warn(
                    "event_driven_broker",
                    "Arquitetura event_driven detectada, mas nenhum message broker (Kafka/RabbitMQ) encontrado no plano."
                ))
            else:
                checks.append(self._ok("event_driven_broker"))
        else:
            checks.append(self._ok("event_driven_not_applicable"))

        # 3. Compatibilidade de banco de dados
        db = (blueprint.get("database") or blueprint.get("db") or "").lower()
        valid_dbs = {"postgresql", "postgres", "mysql", "mariadb", "h2", "oracle"}
        if db and db not in valid_dbs:
            checks.append(self._warn(
                "database_compatibility",
                f"Banco de dados '{db}' não é comum em projetos Spring Boot. Recomendado: PostgreSQL, MySQL, H2 ou Oracle."
            ))
        elif not db:
            checks.append(self._warn(
                "database_missing",
                "Nenhum banco de dados especificado. Recomenda-se PostgreSQL ou MySQL."
            ))
        else:
            checks.append(self._ok("database_compatibility"))

        # 4. Estratégia de autenticação
        auth = (blueprint.get("auth") or blueprint.get("authentication") or "").lower()
        if not auth:
            checks.append(self._warn(
                "auth_strategy_missing",
                "Estratégia de autenticação não definida. Recomenda-se JWT, OAuth2 ou Keycloak para Spring Boot."
            ))
        else:
            valid_auth = {"jwt", "oauth2", "oauth", "keycloak", "session", "basic"}
            if any(a in auth for a in valid_auth):
                checks.append(self._ok("auth_strategy"))
            else:
                checks.append(self._warn(
                    "auth_strategy_unknown",
                    f"Estratégia de autenticação '{auth}' não reconhecida. Opções comuns: JWT, OAuth2, Keycloak."
                ))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ─────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")

        # 1. Arquivos requeridos (todos os tipos)
        required_common = [
            "pom.xml",  # ou build.gradle
            "src/main/java",
            "src/test/java",
            "application.yml",  # ou application.properties
            "README.md",
            "docs/",
        ]
        pom_exists = os.path.exists(os.path.join(project_path, "pom.xml"))
        gradle_exists = os.path.exists(os.path.join(project_path, "build.gradle"))
        app_yml = os.path.exists(os.path.join(project_path, "application.yml"))
        app_props = os.path.exists(os.path.join(project_path, "application.properties"))
        src_main_java = os.path.exists(os.path.join(project_path, "src/main/java"))

        if not pom_exists and not gradle_exists:
            checks.append(self._fail(
                "build_file_missing",
                "Nenhum arquivo de build encontrado (pom.xml ou build.gradle). Projeto Spring Boot incompleto."
            ))
        else:
            checks.append(self._ok("build_file_present"))

        if not src_main_java:
            checks.append(self._fail(
                "src_main_java_missing",
                "Diretório src/main/java não encontrado. Estrutura Maven/Gradle ausente."
            ))
        else:
            checks.append(self._ok("src_main_java_present"))

        if not app_yml and not app_props:
            checks.append(self._warn(
                "config_file_missing",
                "application.yml ou application.properties não encontrado. Configuração do Spring Boot ausente."
            ))
        else:
            checks.append(self._ok("config_file_present"))

        # 2. Estrutura específica por arquitetura
        if arch == "microservices":
            ms_dirs = ["api-gateway/", "discovery-service/", "auth-service/"]
            ms_dirs_check = self._check_directory_structure(project_path, ms_dirs, "microservices_dirs")
            checks.append(ms_dirs_check)

            docker_compose = "docker-compose.yml"
            dc_check = self._check_required_files(project_path, [docker_compose], "docker_compose")
            checks.append(dc_check)
        else:
            # Monolith / Modular Monolith — checar camadas
            java_files = self._scan_filenames(os.path.join(project_path, "src/main/java"), [".java"])
            java_names = {os.path.basename(f).lower() for f in java_files}

            layers = {
                "dto": any("dto" in n or "request" in n or "response" in n for n in java_names),
                "service": any("service" in n for n in java_names),
                "repository": any("repository" in n or "dao" in n for n in java_names),
                "controller": any("controller" in n or "resource" in n for n in java_names),
            }
            for layer, found in layers.items():
                if found:
                    checks.append(self._ok(f"layer_{layer}_present"))
                else:
                    checks.append(self._warn(
                        f"layer_{layer}_missing",
                        f"Camada '{layer}' não encontrada nos arquivos Java. Verifique se a estrutura está completa."
                    ))

        # 3. Arquivos proibidos
        forbidden = ["requirements.txt", "package.json", "composer.json", "Gemfile"]
        forbidden_check = self._check_forbidden_files(project_path, forbidden, "springboot")
        checks.append(forbidden_check)

        # 4. Scaneamento de estrutura de serviços (microservices)
        if arch == "microservices":
            # Verificar health checks nos services
            java_files = self._scan_filenames(project_path, [".java"])
            health_count = sum(1 for f in java_files if "health" in f.lower())
            if health_count == 0:
                checks.append(self._warn(
                    "microservices_health_checks",
                    "Nenhum health check encontrado nos microservices. Adicione Spring Actuator health endpoints."
                ))
            else:
                checks.append(self._ok("microservices_health_checks"))

            # Verificar docker-compose com múltiplos serviços
            dc_path = os.path.join(project_path, "docker-compose.yml")
            if os.path.exists(dc_path):
                dc_check_detail = self._check_file_contains(dc_path, ["service", "image", "port"])
                if dc_check_detail.get("status") == "passed":
                    checks.append(self._ok("docker_compose_valid"))
                else:
                    checks.append(dc_check_detail)
        else:
            # Verificar docker-compose.yml existe opcionalmente
            dc_path = os.path.join(project_path, "docker-compose.yml")
            if os.path.exists(dc_path):
                checks.append(self._ok("docker_compose_optional_present"))
            else:
                checks.append(self._ok("docker_compose_not_required"))

        # 5. Convenções de pacote Java
        java_files = self._scan_filenames(os.path.join(project_path, "src/main/java"), [".java"])
        if java_files:
            package_issues = []
            for f in java_files[:30]:  # Amostra
                try:
                    fpath = os.path.join(project_path, "src/main/java", f)
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                        first_line = fh.readline()
                    if not first_line.strip().startswith("package "):
                        package_issues.append(f)
                except Exception:
                    pass
            if package_issues:
                checks.append(self._warn(
                    "java_package_convention",
                    f"{len(package_issues)} arquivos Java sem declaração de package. Convenção de pacotes não seguida."
                ))
            else:
                checks.append(self._ok("java_package_convention"))
        else:
            checks.append(self._warn(
                "java_files_missing",
                "Nenhum arquivo .java encontrado em src/main/java. O projeto pode estar vazio."
            ))

        # 6. Migrations (Flyway/Liquibase)
        flyway_dir = os.path.join(project_path, "src/main/resources/db/migration")
        liquibase_file = os.path.join(project_path, "src/main/resources/db/changelog")
        has_migrations = os.path.exists(flyway_dir) or os.path.exists(liquibase_file)
        if not has_migrations:
            checks.append(self._warn(
                "migrations_missing",
                "Nenhuma migration encontrada (Flyway db/migration ou Liquibase changelog). Adicione migrations para versionamento do banco."
            ))
        else:
            checks.append(self._ok("migrations_present"))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ───────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")

        # 1. Verificar segredos hardcoded
        secrets_patterns = [
            "password=", "secret=", "api_key=", "apikey=", "token=",
            "private_key", "-----BEGIN", "client_secret",
        ]
        yaml_files = self._scan_filenames(os.path.join(project_path, "src/main/resources"), [".yml", ".yaml", ".properties"])
        hardcoded_secrets = []
        for f in yaml_files[:20]:
            fpath = os.path.join(project_path, "src/main/resources", f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                for pat in secrets_patterns:
                    if pat.lower() in content:
                        hardcoded_secrets.append(f"{f}:{pat}")
            except Exception:
                pass
        if hardcoded_secrets:
            checks.append(self._fail(
                "hardcoded_secrets",
                f"Possíveis segredos hardcoded encontrados em {len(hardcoded_secrets)} local(is). Use variáveis de ambiente ou Spring Cloud Config."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 2. Isolamento de rede no docker-compose
        dc_path = os.path.join(project_path, "docker-compose.yml")
        if os.path.exists(dc_path):
            try:
                with open(dc_path, "r", encoding="utf-8", errors="ignore") as fh:
                    dc_content = fh.read().lower()
                has_network = "network" in dc_content
                if not has_network:
                    checks.append(self._warn(
                        "docker_network_isolation",
                        "docker-compose.yml sem configuração de redes (networks). Adicione isolamento de rede entre serviços."
                    ))
                else:
                    checks.append(self._ok("docker_network_isolation"))
            except Exception:
                checks.append(self._warn("docker_compose_unreadable", "Não foi possível ler docker-compose.yml."))
        else:
            checks.append(self._ok("docker_compose_none"))

        # 3. Observabilidade (Actuator, logs, metrics)
        pom_exists = os.path.exists(os.path.join(project_path, "pom.xml"))
        actuator_found = False
        if pom_exists:
            pom_check = self._check_file_contains(
                os.path.join(project_path, "pom.xml"),
                ["spring-boot-starter-actuator", "micrometer"]
            )
            if pom_check.get("status") == "passed":
                actuator_found = True
        if not actuator_found:
            checks.append(self._warn(
                "actuator_missing",
                "Spring Boot Actuator não configurado. Adicione spring-boot-starter-actuator para health checks e métricas."
            ))
        else:
            checks.append(self._ok("actuator_present"))

        # Verificar logging config
        logback = os.path.exists(os.path.join(project_path, "src/main/resources/logback-spring.xml"))
        log4j = os.path.exists(os.path.join(project_path, "src/main/resources/log4j2.xml"))
        if not logback and not log4j:
            checks.append(self._warn(
                "logging_config_missing",
                "Configuração de logging ausente (logback-spring.xml ou log4j2.xml). Logs podem não estar estruturados."
            ))
        else:
            checks.append(self._ok("logging_config_present"))

        # 4. Microservices: cada serviço com seu próprio database config
        if arch == "microservices":
            ms_dirs = [d for d in self._scan_dirs(project_path) if os.path.isdir(os.path.join(project_path, d))]
            ms_with_db = 0
            ms_total = 0
            for ms_dir in ms_dirs:
                ms_path = os.path.join(project_path, ms_dir)
                yml_files = self._scan_filenames(ms_path, [".yml", ".yaml", ".properties"])
                has_db_config = False
                for yf in yml_files:
                    yf_path = os.path.join(ms_path, yf)
                    try:
                        with open(yf_path, "r", encoding="utf-8", errors="ignore") as fh:
                            content = fh.read().lower()
                        if any(kw in content for kw in ["datasource", "jdbc", "spring.data", "database"]):
                            has_db_config = True
                            break
                    except Exception:
                        pass
                if has_db_config:
                    ms_with_db += 1
                ms_total += 1
            if ms_total > 0 and ms_with_db < ms_total:
                checks.append(self._warn(
                    "microservices_db_config",
                    f"Apenas {ms_with_db}/{ms_total} microservices possuem configuração de banco de dados. Cada serviço deve ser independente."
                ))
            elif ms_total > 0:
                checks.append(self._ok("microservices_db_config"))
        else:
            checks.append(self._ok("microservices_db_not_applicable"))

        return self._aggregate_checks(checks, "download_gate")
