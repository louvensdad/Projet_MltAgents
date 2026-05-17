"""
NestJSGatekeeper — Validação de projetos Node.js + NestJS.
Atua em 4 fases: pre_generation, generation_plan, post_generation, download_gate.
"""

import os
import json
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class NestJSGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado em projetos Node.js NestJS."""

    def __init__(self):
        super().__init__(name="NestJSGatekeeper", stack_id="nestjs")

    # ── Fase 1: Pre-Generation ──────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Versão do Node.js
        node_version = blueprint.get("node_version") or blueprint.get("node") or ""
        if not node_version:
            checks.append(self._warn(
                "node_version_missing",
                "Versão do Node.js não especificada. Recomenda-se Node.js 18 LTS ou 20 LTS para NestJS."
            ))
        else:
            try:
                major = int(str(node_version).lstrip("v").split(".")[0])
                if major < 16:
                    checks.append(self._fail(
                        "node_version_unsupported",
                        f"Node.js {node_version} não suporta NestJS. Use Node.js 18+."
                    ))
                elif major < 18:
                    checks.append(self._warn(
                        "node_version_eol",
                        f"Node.js {node_version} está próximo do fim de suporte. Atualize para 18+."
                    ))
                else:
                    checks.append(self._ok("node_version"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "node_version_parse_failed",
                    f"Não foi possível validar a versão do Node.js: '{node_version}'."
                ))

        # 2. TypeScript obrigatório
        use_typescript = blueprint.get("typescript") or blueprint.get("ts") or ""
        if str(use_typescript).lower() in ("false", "no", "0"):
            checks.append(self._block(
                "typescript_required",
                "NestJS exige TypeScript. Não é possível gerar projeto NestJS sem TypeScript."
            ))
        else:
            checks.append(self._ok("typescript_enabled"))

        # 3. Transporte para microservices
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices" or arch == "event_driven":
            transport = (blueprint.get("transport") or blueprint.get("microservices_transport") or "").lower()
            valid_transports = {"tcp", "redis", "rmq", "rabbitmq", "kafka", "grpc", "nats", "mqtt"}
            if not transport:
                checks.append(self._warn(
                    "microservices_transport_missing",
                    "Transporte para microservices não especificado. Opções NestJS: TCP, Redis, RabbitMQ (RMQ), Kafka, gRPC, NATS, MQTT."
                ))
            elif transport not in valid_transports:
                checks.append(self._warn(
                    "microservices_transport_unknown",
                    f"Transporte '{transport}' não reconhecido. Transportes NestJS válidos: TCP, Redis, RMQ, Kafka, gRPC, NATS, MQTT."
                ))
            else:
                checks.append(self._ok("microservices_transport_valid"))
        else:
            checks.append(self._ok("microservices_not_applicable"))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ─────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        plan_str = str(blueprint).lower()

        # 1. Componentes arquiteturais planejados
        nest_components = {
            "modules": ["module", "modules", "@module"],
            "controllers": ["controller", "@controller"],
            "services": ["service", "@injectable"],
            "dtos": ["dto", "dto", "data transfer"],
            "guards": ["guard", "@injectable guard", "canactivate"],
            "interceptors": ["interceptor", "nestinterceptor"],
            "pipes": ["pipe", "validationpipe", "pipe transform"],
        }

        for comp_name, aliases in nest_components.items():
            found = any(alias in plan_str for alias in aliases)
            if found:
                checks.append(self._ok(f"component_{comp_name}_planned"))
            else:
                # Controllers e modules são essenciais
                if comp_name in ("modules", "controllers"):
                    checks.append(self._warn(
                        f"component_{comp_name}_missing",
                        f"Componente essencial '{comp_name}' não encontrado no plano. NestJS exige esta camada."
                    ))
                else:
                    checks.append(self._warn(
                        f"component_{comp_name}_missing",
                        f"Componente '{comp_name}' não planejado. Considere adicionar para completude."
                    ))

        # 2. Microservices: gateway e transporte
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices":
            if "gateway" not in plan_str and "api-gateway" not in plan_str:
                checks.append(self._warn(
                    "microservices_gateway_missing",
                    "API Gateway não planejado para microservices. NestJS pode atuar como gateway com proxy."
                ))
            else:
                checks.append(self._ok("microservices_gateway_planned"))

            transport = (blueprint.get("transport") or "").lower()
            if transport and transport not in plan_str:
                checks.append(self._warn(
                    "microservices_transport_not_in_plan",
                    f"Transporte '{transport}' especificado mas não referenciado no plano de geração."
                ))
            else:
                checks.append(self._ok("microservices_transport_planned"))
        else:
            checks.append(self._ok("microservices_not_applicable"))

        # 3. ORM
        orm_indicators = ["prisma", "typeorm", "mikro-orm", "sequelize", "@nestjs/typeorm"]
        has_orm = any(indicator in plan_str for indicator in orm_indicators)
        if not has_orm:
            checks.append(self._warn(
                "orm_missing",
                "Nenhum ORM planejado (Prisma, TypeORM, MikroORM). NestJS se integra bem com Prisma e TypeORM."
            ))
        else:
            checks.append(self._ok("orm_planned"))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ─────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos requeridos
        required_files = [
            "package.json",
            "tsconfig.json",
            "nest-cli.json",
            "src/main.ts",
        ]
        files_check = self._check_required_files(project_path, required_files, "core_files")
        checks.append(files_check)

        required_dirs = ["src/modules/"]
        dirs_check = self._check_directory_structure(project_path, required_dirs, "core_dirs")
        checks.append(dirs_check)

        # 2. Decorator @Module
        ts_files = self._scan_filenames(project_path, [".ts"])
        module_decorators = 0
        for f in ts_files[:40]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if "@Module(" in content:
                    module_decorators += 1
            except Exception:
                pass

        if module_decorators == 0:
            checks.append(self._fail(
                "module_decorators_missing",
                "Nenhum decorator @Module() encontrado. NestJS exige módulos declarados com @Module()."
            ))
        elif module_decorators == 1:
            checks.append(self._warn(
                "single_module_only",
                "Apenas 1 @Module() encontrado (provavelmente AppModule). Considere modularizar o domínio."
            ))
        else:
            checks.append(self._ok("module_decorators_present"))

        # 3. Guards e Interceptors
        ts_content_all = ""
        for f in ts_files[:30]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    ts_content_all += fh.read().lower()
            except Exception:
                pass

        if "guard" in ts_content_all or "canactivate" in ts_content_all:
            checks.append(self._ok("guards_present"))
        else:
            checks.append(self._warn(
                "guards_missing",
                "Nenhum guard encontrado. Adicione guards para autenticação/autorização (ex: JwtAuthGuard)."
            ))

        if "interceptor" in ts_content_all:
            checks.append(self._ok("interceptors_present"))
        else:
            checks.append(self._warn(
                "interceptors_missing",
                "Nenhum interceptor encontrado. Interceptors são úteis para logging, transformação e cache."
            ))

        # 4. ORM/DB config
        package_json = os.path.join(project_path, "package.json")
        if os.path.exists(package_json):
            try:
                with open(package_json, "r", encoding="utf-8") as fh:
                    pkg = json.load(fh)
                deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                orm_packages = {"@prisma/client", "@nestjs/typeorm", "typeorm", "mikro-orm", "sequelize"}
                has_orm_pkg = any(pkg_name in deps for pkg_name in orm_packages)
                if has_orm_pkg:
                    checks.append(self._ok("orm_package_installed"))
                else:
                    checks.append(self._warn(
                        "orm_package_missing",
                        "Nenhum pacote ORM nas dependências. Instale @nestjs/typeorm ou @prisma/client."
                    ))
            except Exception:
                checks.append(self._warn("package_json_read_error", "Não foi possível ler package.json."))

        # Prisma schema
        prisma_schema = os.path.join(project_path, "prisma/schema.prisma")
        if os.path.exists(prisma_schema):
            checks.append(self._ok("prisma_schema_present"))
        else:
            # Check TypeORM config alternatives
            if not any("typeorm" in f.lower() for f in ts_files[:20]):
                checks.append(self._warn(
                    "db_schema_missing",
                    "Nem Prisma schema.prisma nem configuração TypeORM encontrados. Configure a camada de banco de dados."
                ))

        # 5. Env validation
        env_validation = False
        env_indicators = ["class-validator", "joi", "@hapi/joi", "env.validation", "env.schema", "configmodule", "@nestjs/config"]
        for f in ts_files[:20]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(indicator in content for indicator in env_indicators):
                    env_validation = True
                    break
            except Exception:
                pass

        # Also check package.json for Joi/class-validator
        if not env_validation and os.path.exists(package_json):
            try:
                with open(package_json, "r", encoding="utf-8") as fh:
                    pkg = json.load(fh)
                deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                if any(p in deps for p in ["class-validator", "joi"]):
                    env_validation = True
            except Exception:
                pass

        if env_validation:
            checks.append(self._ok("env_validation_configured"))
        else:
            checks.append(self._warn(
                "env_validation_missing",
                "Validação de variáveis de ambiente não configurada. Use class-validator com @nestjs/config ou Joi."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ───────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Estrutura de arquivos .env
        env_file = os.path.join(project_path, ".env")
        env_example = os.path.join(project_path, ".env.example")
        env_template = os.path.join(project_path, ".env.template")

        has_env_template = os.path.exists(env_example) or os.path.exists(env_template)
        if os.path.exists(env_file):
            try:
                with open(env_file, "r", encoding="utf-8", errors="ignore") as fh:
                    env_content = fh.read()
                has_port = "PORT" in env_content
                has_db = any(d in env_content for d in ["DATABASE_URL", "DB_HOST", "DB_"])
                if not has_port or not has_db:
                    checks.append(self._warn(
                        "env_structure_incomplete",
                        ".env sem variáveis essenciais (PORT, DATABASE_URL)."
                    ))
                else:
                    checks.append(self._ok("env_structure_complete"))
            except Exception:
                checks.append(self._warn("env_unreadable", ".env não pôde ser lido."))
        else:
            checks.append(self._warn("env_file_missing", ".env não encontrado."))

        if not has_env_template:
            checks.append(self._warn(
                "env_template_missing",
                ".env.example ou .env.template não encontrado. Forneça um template de configuração."
            ))
        else:
            checks.append(self._ok("env_template_present"))

        # 2. Health check endpoint
        ts_files = self._scan_filenames(project_path, [".ts"])
        health_found = any("health" in os.path.basename(f).lower() for f in ts_files)
        if not health_found:
            checks.append(self._warn(
                "health_check_missing",
                "Nenhum health check endpoint encontrado. Adicione @nestjs/terminus para health checks."
            ))
        else:
            checks.append(self._ok("health_check_present"))

        # 3. Logging (Winston/Pino)
        package_json = os.path.join(project_path, "package.json")
        if os.path.exists(package_json):
            try:
                with open(package_json, "r", encoding="utf-8") as fh:
                    pkg = json.load(fh)
                deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                if any(logger in deps for logger in ["winston", "pino", "nestjs-pino", "nest-winston"]):
                    checks.append(self._ok("logging_configured"))
                else:
                    checks.append(self._warn(
                        "logging_missing",
                        "Logger de produção não configurado. Instale nestjs-pino ou nest-winston."
                    ))
            except Exception:
                checks.append(self._warn("package_json_read_error", "package.json ilegível."))
        else:
            checks.append(self._warn("package_json_missing", "package.json não encontrado."))

        # 4. Microservices: verificar message patterns e transport
        arch = (blueprint.get("architecture") or blueprint.get("arch") or "").lower().replace(" ", "_")
        if arch == "microservices":
            ts_content_all = ""
            for f in ts_files[:40]:
                fpath = os.path.join(project_path, f)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                        ts_content_all += fh.read().lower()
                except Exception:
                    pass

            if "@messagepattern" in ts_content_all:
                checks.append(self._ok("message_patterns_present"))
            else:
                checks.append(self._warn(
                    "message_patterns_missing",
                    "Microservices NestJS sem @MessagePattern(). Defina padrões de mensagem para comunicação."
                ))

            transport = (blueprint.get("transport") or "").lower()
            transport_package_map = {
                "redis": "redis",
                "kafka": "kafkajs",
                "rmq": "amqplib",
                "rabbitmq": "amqplib",
                "nats": "nats",
                "mqtt": "mqtt",
                "grpc": "grpc",
            }
            expected_pkg = transport_package_map.get(transport)
            if expected_pkg:
                if os.path.exists(package_json):
                    try:
                        with open(package_json, "r", encoding="utf-8") as fh:
                            pkg = json.load(fh)
                        deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                        if expected_pkg in deps:
                            checks.append(self._ok("transport_package_installed"))
                        else:
                            checks.append(self._warn(
                                "transport_package_missing",
                                f"Pacote de transporte '{expected_pkg}' não instalado para microservices."
                            ))
                    except Exception:
                        pass
        else:
            checks.append(self._ok("microservices_not_applicable"))

        # 5. Segredos hardcoded
        secret_patterns = ["secret:", "secret=", "password:", "apiKey:", "JWT_SECRET", "API_KEY"]
        hardcoded_found = []
        for f in ts_files[:50]:
            fpath = os.path.join(project_path, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in secret_patterns:
                    if pat in content:
                        # Verify it's not from .env or process.env
                        if ".env" not in content[max(0, content.index(pat)-50):content.index(pat)] \
                           and "process.env" not in content[max(0, content.index(pat)-100):content.index(pat)]:
                            hardcoded_found.append(f"{f}:{pat}")
            except (Exception, ValueError):
                pass
        if hardcoded_found:
            checks.append(self._fail(
                "hardcoded_secrets",
                f"Valores sensíveis hardcoded em {len(hardcoded_found)} local(is). Use process.env ou @nestjs/config."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        return self._aggregate_checks(checks, "download_gate")
