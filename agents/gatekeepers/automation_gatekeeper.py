"""
AutomationGatekeeper — Valida projetos de automação, CI/CD e DevOps.

Atua em 4 fases:
1. pre_generation_check  — Valida tipo de automação, plataforma CI/CD e ambiente
2. generation_plan_check — Valida plano de pipeline, deploy, environments, secrets
3. post_generation_check — Verifica configs CI, scripts de deploy, monitoramento
4. download_gate_check   — Bloqueia credenciais hardcoded, valida segurança
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class AutomationGatekeeper(BaseGatekeeper):
    """Gatekeeper para projetos de automação, CI/CD, deployment e DevOps."""

    VALID_AUTOMATION_TYPES = ["ci_cd", "deployment", "scheduling",
                               "monitoring", "backup"]
    VALID_CI_PLATFORMS = ["github actions", "gitlab ci", "jenkins",
                           "circleci", "travis ci", "azure devops",
                           "bitbucket pipelines", "drone ci", "argo workflows",
                           "tekton", "teamcity", "custom"]
    VALID_ENVIRONMENTS = ["cloud", "on-premise", "hybrid"]

    def __init__(self):
        super().__init__(name="AutomationGatekeeper", stack_id="automation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 1: PRE-GENERATION CHECK
    # ══════════════════════════════════════════════════════════════════════

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida tipo de automação, plataforma CI/CD e ambiente alvo.
        """
        checks: List[Dict[str, Any]] = []

        # ── Tipo de automação ──────────────────────────────────────────────
        automation_type = blueprint.get("automation_type", "").strip().lower()
        if not automation_type:
            checks.append(self._warn(
                "automation_type_check",
                "Tipo de automação não especificado. "
                "Defina: ci_cd, deployment, scheduling, monitoring ou backup."
            ))
        elif automation_type not in self.VALID_AUTOMATION_TYPES:
            checks.append(self._warn(
                "automation_type_check",
                f"Tipo de automação '{automation_type}' não reconhecido. "
                f"Tipos válidos: {', '.join(self.VALID_AUTOMATION_TYPES)}."
            ))
        else:
            checks.append(self._ok("automation_type_check"))

        # ── Plataforma CI/CD ───────────────────────────────────────────────
        ci_platform = blueprint.get("ci_platform", "").strip().lower()
        if not ci_platform:
            checks.append(self._warn(
                "ci_platform_check",
                "Plataforma CI/CD não especificada. "
                "Exemplos: GitHub Actions, GitLab CI, Jenkins."
            ))
        else:
            matched = any(p in ci_platform or ci_platform in p
                          for p in self.VALID_CI_PLATFORMS)
            if matched:
                checks.append(self._ok("ci_platform_check"))
            else:
                checks.append(self._warn(
                    "ci_platform_check",
                    f"Plataforma CI/CD '{ci_platform}' não reconhecida. "
                    f"Plataformas suportadas: {', '.join(self.VALID_CI_PLATFORMS)}."
                ))

        # ── Ambiente alvo ──────────────────────────────────────────────────
        target_env = blueprint.get("target_environment", "").strip().lower()
        if not target_env:
            checks.append(self._warn(
                "target_environment_check",
                "Ambiente alvo não especificado. Defina: cloud, on-premise ou hybrid."
            ))
        elif target_env not in self.VALID_ENVIRONMENTS:
            checks.append(self._warn(
                "target_environment_check",
                f"Ambiente '{target_env}' não reconhecido. "
                f"Use: cloud, on-premise ou hybrid."
            ))
        else:
            checks.append(self._ok("target_environment_check"))

        return self._aggregate_checks(checks, "pre_generation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 2: GENERATION PLAN CHECK
    # ══════════════════════════════════════════════════════════════════════

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida que o plano cobre: estágios do pipeline, estratégia de deploy,
        separação de ambientes, gestão de secrets, monitoramento e alertas.
        """
        checks: List[Dict[str, Any]] = []
        plan = blueprint.get("generation_plan", blueprint)
        plan_str = str(plan).lower()

        # ── Estágios do pipeline CI/CD ─────────────────────────────────────
        pipeline_stages = ["build", "test", "lint", "deploy", "publish",
                            "scan", "release", "rollback"]
        found_stages = [s for s in pipeline_stages if s in plan_str]
        if len(found_stages) >= 3:
            checks.append(self._ok("pipeline_stages_check"))
        elif len(found_stages) > 0:
            checks.append(self._warn(
                "pipeline_stages_check",
                f"Estágios do pipeline parcialmente definidos: {', '.join(found_stages)}. "
                f"Inclua build, test e deploy no mínimo."
            ))
        else:
            checks.append(self._fail(
                "pipeline_stages_check",
                "Estágios do pipeline CI/CD não definidos. "
                "Defina build, test, lint, deploy e rollback."
            ))

        # ── Estratégia de deploy ───────────────────────────────────────────
        deploy_strategies = ["blue-green", "canary", "rolling", "recreate",
                              "blue/green", "blue_green"]
        found_strategies = [s for s in deploy_strategies if s in plan_str]
        if found_strategies:
            checks.append(self._ok("deployment_strategy_check"))
        else:
            checks.append(self._warn(
                "deployment_strategy_check",
                "Estratégia de deploy não definida. "
                "Escolha: blue-green, canary, rolling ou recreate."
            ))

        # ── Separação de ambientes ─────────────────────────────────────────
        env_keywords = ["dev", "staging", "prod", "production",
                         "development", "environment"]
        found_envs = [e for e in env_keywords if e in plan_str]
        if len(found_envs) >= 3:
            checks.append(self._ok("environment_separation_check"))
        elif len(found_envs) > 0:
            checks.append(self._warn(
                "environment_separation_check",
                f"Ambientes parcialmente definidos: {', '.join(found_envs)}. "
                f"Separe dev, staging e production com configs distintas."
            ))
        else:
            checks.append(self._fail(
                "environment_separation_check",
                "Separação de ambientes não definida. "
                "Crie ambientes dev, staging e production isolados."
            ))

        # ── Gestão de secrets ──────────────────────────────────────────────
        secret_keywords = ["secret", "vault", "encrypted", "env", "sops",
                            "sealed secret", "kms", "aws secrets", "azure key vault",
                            "github secret", "gitlab variable"]
        found_secrets = [s for s in secret_keywords if s in plan_str]
        if len(found_secrets) >= 2:
            checks.append(self._ok("secrets_management_check"))
        elif len(found_secrets) > 0:
            checks.append(self._warn(
                "secrets_management_check",
                f"Gestão de secrets parcial. Termos encontrados: {', '.join(found_secrets)}. "
                f"Use Vault, GitHub Secrets ou variáveis de ambiente criptografadas."
            ))
        else:
            checks.append(self._fail(
                "secrets_management_check",
                "Gestão de secrets não planejada. "
                "Nunca hardcode credenciais. Use Vault, SOPS ou secrets nativos da plataforma."
            ))

        # ── Monitoramento e alertas ────────────────────────────────────────
        monitoring_keywords = ["monitor", "prometheus", "grafana", "datadog",
                                "alert", "pagerduty", "opsgenie", "slack",
                                "webhook", "health check", "uptime", "logging"]
        found_monitoring = [m for m in monitoring_keywords if m in plan_str]
        if len(found_monitoring) >= 3:
            checks.append(self._ok("monitoring_alerting_check"))
        elif len(found_monitoring) > 0:
            checks.append(self._warn(
                "monitoring_alerting_check",
                f"Monitoramento parcial: {', '.join(found_monitoring)}. "
                f"Inclua métricas (Prometheus), dashboards (Grafana) e alertas (Slack/email)."
            ))
        else:
            checks.append(self._fail(
                "monitoring_alerting_check",
                "Monitoramento e alertas não planejados. "
                "Configure Prometheus, Grafana e canais de notificação."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 3: POST-GENERATION CHECK
    # ══════════════════════════════════════════════════════════════════════

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica arquivos gerados: configs CI/CD, scripts de deploy,
        separação de ambientes, monitoramento e backup.
        """
        checks: List[Dict[str, Any]] = []

        # ── Arquivos de configuração CI/CD ─────────────────────────────────
        ci_configs_found = []
        ci_patterns = [
            (".github/workflows/", "GitHub Actions workflow"),
            (".gitlab-ci.yml", "GitLab CI config"),
            ("Jenkinsfile", "Jenkins pipeline"),
            (".circleci/config.yml", "CircleCI config"),
            (".travis.yml", "Travis CI config"),
            (".drone.yml", "Drone CI config"),
            ("azure-pipelines.yml", "Azure DevOps pipeline"),
        ]
        for pattern, label in ci_patterns:
            full = os.path.join(project_path, pattern)
            if os.path.exists(full) or any(
                pattern.rstrip("/") in os.path.relpath(os.path.join(r, f), project_path)
                for r, _, files in os.walk(project_path) for f in files
            ):
                ci_configs_found.append(label)

        # Also scan for directories like .github/workflows
        gh_workflows = os.path.join(project_path, ".github", "workflows")
        if os.path.isdir(gh_workflows):
            wf_files = [f for f in os.listdir(gh_workflows) if f.endswith(".yml") or f.endswith(".yaml")]
            if wf_files and "GitHub Actions workflow" not in ci_configs_found:
                ci_configs_found.append("GitHub Actions workflow")

        if ci_configs_found:
            checks.append(self._ok("ci_config_files_check"))
            checks.append({
                "check": "ci_config_files_check",
                "status": "passed",
                "found_ci_configs": ci_configs_found,
            })
        else:
            checks.append(self._warn(
                "ci_config_files_check",
                "Nenhum arquivo de configuração CI/CD encontrado. "
                "Crie .github/workflows/, .gitlab-ci.yml ou Jenkinsfile."
            ))

        # ── Scripts de deploy ──────────────────────────────────────────────
        deploy_indicators = self._scan_filenames(project_path,
                                                  [".sh", ".ps1", ".yaml", ".yml", ".tf", ".json"])
        deploy_keywords = ["deploy", "docker-compose", "dockerfile", "helm",
                            "kubernetes", "k8s", "terraform", "ansible"]
        deploy_files = []
        for f_path in deploy_indicators:
            fname = os.path.basename(f_path).lower()
            if any(kw in fname for kw in deploy_keywords):
                deploy_files.append(f_path)

        # Also check for directories
        deploy_dirs = [d for d in self._scan_dirs(project_path)
                        if "deploy" in d.lower() or "scripts" in d.lower()]

        if deploy_files or deploy_dirs:
            checks.append({
                "check": "deployment_scripts_check",
                "status": "passed",
                "found_deploy_artifacts": deploy_files + deploy_dirs,
            })
        else:
            checks.append(self._warn(
                "deployment_scripts_check",
                "Scripts de deploy não encontrados. "
                "Crie Dockerfile, docker-compose.yml, scripts/ ou deploy/."
            ))

        # ── Configs de ambiente separadas ──────────────────────────────────
        env_indicators = self._scan_filenames(project_path,
                                               [".env", ".yaml", ".yml", ".json", ".toml", ".ini"])
        env_patterns = ["dev", "staging", "prod", "production", "development",
                         ".env.dev", ".env.staging", ".env.prod"]
        env_files = []
        for f_path in env_indicators:
            fname = os.path.basename(f_path).lower()
            if any(ep in fname for ep in env_patterns):
                env_files.append(f_path)

        if len(env_files) >= 2:
            checks.append({
                "check": "environment_configs_check",
                "status": "passed",
                "found_env_configs": env_files,
            })
        elif len(env_files) == 1:
            checks.append(self._warn(
                "environment_configs_check",
                f"Apenas um arquivo de ambiente encontrado: {env_files[0]}. "
                f"Crie configs para dev, staging e production."
            ))
        else:
            checks.append(self._fail(
                "environment_configs_check",
                "Configurações de ambiente não separadas. "
                "Crie arquivos .env.dev, .env.staging e .env.prod."
            ))

        # ── Configs de monitoramento ───────────────────────────────────────
        monitoring_files = self._scan_filenames(project_path,
                                                 [".yml", ".yaml", ".json", ".conf"])
        monitoring_patterns = ["prometheus", "grafana", "alertmanager",
                                "datadog", "loki", "tempo", "mimir"]
        mon_found = []
        for f_path in monitoring_files:
            fname = os.path.basename(f_path).lower()
            if any(mp in fname for mp in monitoring_patterns):
                mon_found.append(f_path)

        if mon_found:
            checks.append({
                "check": "monitoring_configs_check",
                "status": "passed",
                "found_monitoring": mon_found,
            })
        else:
            checks.append(self._warn(
                "monitoring_configs_check",
                "Configurações de monitoramento não encontradas. "
                "Crie prometheus.yml, dashboards Grafana e alertmanager.yml."
            ))

        # ── Scripts de backup ──────────────────────────────────────────────
        automation_type = blueprint.get("automation_type", "").lower()
        if automation_type == "backup":
            backup_indicators = self._scan_filenames(project_path, [".sh", ".ps1", ".py", ".yaml", ".yml"])
            backup_keywords = ["backup", "restore", "snapshot", "dump", "recovery"]
            backup_found = [f for f in backup_indicators
                            if any(bk in os.path.basename(f).lower() for bk in backup_keywords)]
            if backup_found:
                checks.append({
                    "check": "backup_scripts_check",
                    "status": "passed",
                    "found_backup_scripts": backup_found,
                })
            else:
                checks.append(self._warn(
                    "backup_scripts_check",
                    "Scripts de backup não encontrados. "
                    "Crie scripts de backup/restore para o projeto de automação de backup."
                ))
        else:
            checks.append(self._ok("backup_scripts_check"))

        # ── Referências de secrets (variáveis de ambiente, vault, etc.) ────
        all_text_files = self._scan_filenames(project_path,
                                               [".yml", ".yaml", ".sh", ".ps1", ".py",
                                                ".json", ".tf", ".hcl", ".conf", ".toml"])
        secret_references = ["${{ secrets.", "${{ env.", "${SECRET_", "${VAULT_",
                              "vault:", "fromSecret", "getSecret", "secretKeyRef",
                              "aws secretsmanager", "azure key vault"]
        found_secret_refs = []
        for f_path in all_text_files:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for ref in secret_references:
                    if ref in content:
                        found_secret_refs.append(f"{f_path} → {ref}")
                        break
            except Exception:
                pass

        if found_secret_refs:
            checks.append({
                "check": "secret_references_check",
                "status": "passed",
                "found_secret_refs": found_secret_refs[:10],
            })
        else:
            checks.append(self._warn(
                "secret_references_check",
                "Nenhuma referência a secrets encontrada. "
                "Use ${{ secrets.TOKEN }} (GitHub Actions), vault paths ou env vars."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 4: DOWNLOAD GATE CHECK
    # ══════════════════════════════════════════════════════════════════════

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validação final de segurança: bloqueia credenciais hardcoded,
        verifica controles de acesso, rollback, notificações e timeouts.
        """
        checks: List[Dict[str, Any]] = []

        # ── BLOCK: credenciais hardcoded ───────────────────────────────────
        all_files = self._scan_filenames(project_path, [
            ".yml", ".yaml", ".sh", ".ps1", ".py", ".js", ".ts",
            ".json", ".tf", ".hcl", ".conf", ".toml", ".ini", ".env",
            ".xml", ".gradle", ".properties",
        ])

        credential_patterns = [
            # Tokens e senhas hardcoded
            (r"password\s*[=:]\s*['\"][^'\"]+['\"]", "senha hardcoded"),
            (r"api_key\s*[=:]\s*['\"][^'\"]+['\"]", "API key hardcoded"),
            (r"secret\s*[=:]\s*['\"][^'\"]{8,}['\"]", "secret hardcoded"),
            (r"token\s*[=:]\s*['\"](ghp_|gho_|ghu_|ghs_|github_pat_)[^'\"]+['\"]", "GitHub token hardcoded"),
            (r"token\s*[=:]\s*['\"](AKIA|ASIA)[A-Z0-9]{16}['\"]", "AWS access key hardcoded"),
            (r"connectionString\s*[=:]\s*['\"][^'\"]+['\"]", "connection string hardcoded"),
            (r"private_key\s*[=:]\s*['\"]-----BEGIN", "chave privada hardcoded"),
            (r"PRIVATE KEY-----", "chave privada PEM"),
            # Texto simples (case-insensitive check via scan)
        ]
        import re
        violations = []
        for f_path in all_files:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()

                # Skip known example/template files
                if f_path.endswith(".md") or "example" in f_path.lower() or "sample" in f_path.lower():
                    continue

                for pattern, label in credential_patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        # Extract line of match for reporting
                        line_match = re.search(pattern, content, re.IGNORECASE)
                        line_no = content[:line_match.start()].count("\n") + 1 if line_match else 0
                        violations.append(f"{f_path}:{line_no} → {label}")
                        break  # One violation per file is enough for reporting
            except Exception:
                pass

        if violations:
            checks.append(self._block(
                "no_hardcoded_credentials",
                f"Credenciais hardcoded detectadas: {'; '.join(violations[:10])}. "
                f"Substitua por variáveis de ambiente ou secrets manager."
            ))
        else:
            checks.append(self._ok("no_hardcoded_credentials"))

        # ── Controles de acesso em pipelines ───────────────────────────────
        pipeline_files = self._scan_filenames(project_path, [".yml", ".yaml"])
        access_patterns = ["permissions:", "read-all", "write-all",
                            "contents: read", "contents: write",
                            "environment:", "protection",
                            "required_reviewers", "approval"]
        access_ok = False
        for f_path in pipeline_files:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if any(pattern in content for pattern in access_patterns):
                    access_ok = True
                    break
            except Exception:
                pass

        if access_ok:
            checks.append(self._ok("access_controls_check"))
        else:
            checks.append(self._warn(
                "access_controls_check",
                "Controles de acesso não explícitos nos pipelines. "
                "Defina permissions, branch protection e approval gates."
            ))

        # ── Estratégia de rollback documentada ─────────────────────────────
        rollback_files = self._scan_filenames(project_path, [".md", ".txt", ".sh", ".yml", ".yaml", ".ps1"])
        rollback_keywords = ["rollback", "revert", "roll back", "undo deploy",
                              "previous version", "restore snapshot"]
        rollback_ok = False
        for f_path in rollback_files:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(kw in content for kw in rollback_keywords):
                    rollback_ok = True
                    break
            except Exception:
                pass

        if rollback_ok:
            checks.append(self._ok("rollback_strategy_check"))
        else:
            checks.append(self._warn(
                "rollback_strategy_check",
                "Estratégia de rollback não documentada. "
                "Documente como reverter deploys em caso de falha."
            ))

        # ── Canais de notificação ──────────────────────────────────────────
        notification_indicators = self._scan_filenames(project_path,
                                                        [".yml", ".yaml", ".sh", ".conf", ".json", ".md"])
        notification_keywords = ["slack", "webhook", "email", "smtp", "discord",
                                  "teams", "pagerduty", "opsgenie", "notification"]
        notif_ok = False
        for f_path in notification_indicators:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(kw in content for kw in notification_keywords):
                    notif_ok = True
                    break
            except Exception:
                pass

        if notif_ok:
            checks.append(self._ok("notification_channels_check"))
        else:
            checks.append(self._warn(
                "notification_channels_check",
                "Canais de notificação não configurados. "
                "Configure Slack, email ou webhooks para alertas de pipeline."
            ))

        # ── Timeouts em jobs agendados ─────────────────────────────────────
        scheduling_enabled = "schedule" in str(blueprint).lower() or \
                              "cron" in str(blueprint).lower() or \
                              any("schedule" in f.lower()
                                  for f in self._scan_filenames(project_path, [".yml", ".yaml"]))
        if scheduling_enabled:
            cron_files = self._scan_filenames(project_path, [".yml", ".yaml"])
            timeout_ok = False
            for f_path in cron_files:
                full = os.path.join(project_path, f_path)
                try:
                    with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                    if "timeout" in content.lower():
                        timeout_ok = True
                        break
                except Exception:
                    pass

            if timeout_ok:
                checks.append(self._ok("job_timeouts_check"))
            else:
                checks.append(self._warn(
                    "job_timeouts_check",
                    "Jobs agendados sem timeout definido. "
                    "Configure timeout-minutes para evitar execuções penduradas."
                ))
        else:
            checks.append(self._ok("job_timeouts_check"))

        # ── Tags específicas em imagens Docker ─────────────────────────────
        docker_files = self._scan_filenames(project_path, [""])
        docker_compose_or_files = [f for f in docker_files
                                    if f.endswith("docker-compose.yml")
                                    or f.endswith("docker-compose.yaml")
                                    or f.endswith("Dockerfile")]
        latest_tag_violations = []
        for f_path in docker_compose_or_files:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if ":latest" in content and "production" in str(blueprint).lower():
                    latest_tag_violations.append(f_path)
            except Exception:
                pass

        if latest_tag_violations:
            checks.append(self._warn(
                "docker_image_tags_check",
                f"Tags :latest em produção detectadas em: {', '.join(latest_tag_violations)}. "
                f"Use tags específicas (versão semver ou SHA) em produção."
            ))
        else:
            checks.append(self._ok("docker_image_tags_check"))

        return self._aggregate_checks(checks, "download_gate")
