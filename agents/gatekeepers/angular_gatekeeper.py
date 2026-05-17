"""
AngularGatekeeper — Validador de 4 fases para projetos Angular.

Fases:
1. pre_generation_check  — valida briefing/config do Angular antes da geração
2. generation_plan_check — valida blueprint/plano de arquitetura Angular
3. post_generation_check — valida arquivos gerados do projeto Angular
4. download_gate_check   — validação final de segurança e completude
"""

import os
import re
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class AngularGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado para stack Angular (2+)."""

    def __init__(self):
        super().__init__(name="AngularGatekeeper", stack_id="angular")

    # ── Fase 1: Pre-Generation ─────────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        backend = blueprint.get("backend", {})
        frontend = blueprint.get("frontend", {})
        checks: List[Dict[str, Any]] = []

        # 1. Verificar versão do Angular
        angular_version = frontend.get("angular_version", frontend.get("version", ""))
        if angular_version:
            try:
                major = int(str(angular_version).split(".")[0])
                if major < 15:
                    checks.append(self._warn(
                        "angular_version",
                        f"Versão do Angular {angular_version} está desatualizada. "
                        f"Recomendado Angular 15+ para suporte a standalone components e signals."
                    ))
                elif major >= 17:
                    checks.append(self._ok("angular_version"))
                else:
                    checks.append(self._ok("angular_version"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "angular_version",
                    f"Não foi possível interpretar a versão do Angular: '{angular_version}'. "
                    f"Verifique se está no formato X.Y.Z."
                ))
        else:
            checks.append(self._warn(
                "angular_version",
                "Versão do Angular não especificada no blueprint. "
                "Assumindo Angular 17+ como padrão."
            ))

        # 2. Verificar standalone vs module-based
        architecture = frontend.get("architecture", frontend.get("style", "")).lower()
        if "standalone" in architecture:
            checks.append(self._ok("standalone_architecture"))
        elif "module" in architecture or "ngmodule" in architecture:
            checks.append(self._warn(
                "module_based_architecture",
                "Arquitetura baseada em NgModules detectada. Considere migrar para "
                "standalone components — NgModules estão em descontinuação gradual."
            ))
        else:
            checks.append(self._warn(
                "architecture_not_specified",
                "Tipo de arquitetura não especificado (standalone vs module-based). "
                "Recomendado o uso de standalone components para projetos novos."
            ))

        # 3. Verificar state management
        state_mgmt = frontend.get("state_management", frontend.get("store", "")).lower()
        valid_stores = ["ngrx", "ngxs", "akita", "elf", "signals", "rxjs", "none"]
        if any(v in state_mgmt for v in valid_stores):
            checks.append(self._ok("state_management"))
        elif state_mgmt:
            checks.append(self._warn(
                "state_management",
                f"State management '{state_mgmt}' não reconhecido. Opções comuns Angular: "
                f"NgRx, NGXS, Akita, Elf, ou Angular Signals nativos."
            ))
        else:
            checks.append(self._warn(
                "state_management_missing",
                "Gerenciamento de estado não definido. Para aplicações médias/grandes, "
                "especifique NgRx, NGXS ou Signals. Para apps pequenos, indique 'none' ou 'signals'."
            ))

        # 4. Verificar padrões RxJS planejados
        rxjs_patterns = frontend.get("rxjs_patterns", frontend.get("reactive_patterns", []))
        if rxjs_patterns:
            expected_patterns = ["async pipe", "subscription", "takeuntil", "unsubscribe"]
            missing_patterns = [
                p for p in expected_patterns
                if not any(p.lower() in str(pat).lower() for pat in rxjs_patterns)
            ]
            if missing_patterns:
                checks.append(self._warn(
                    "rxjs_patterns",
                    f"Padrões RxJS ausentes no plano: {', '.join(missing_patterns)}. "
                    f"Inclua gerenciamento de subscriptions para evitar memory leaks."
                ))
            else:
                checks.append(self._ok("rxjs_patterns"))
        else:
            checks.append(self._warn(
                "rxjs_patterns_missing",
                "Padrões RxJS não especificados. Todo projeto Angular usa RxJS — "
                "defina estratégia de unsubscribe (takeUntil, async pipe, destroy$)."
            ))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ────────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        plan = frontend.get("plan", frontend.get("architecture_plan", {}))
        planned_items = plan.get("items", plan.get("components", []))
        planned_str = str(plan).lower()
        checks: List[Dict[str, Any]] = []

        # 1. Verificar itens obrigatórios no plano
        required_plan_items = [
            ("angular.json", "Arquivo de configuração angular.json"),
            ("app/core/", "Módulo/diretório core (guards, interceptors, auth)"),
            ("app/shared/", "Módulo/diretório shared (componentes, pipes, diretivas)"),
            ("guards", "Guards de rota (auth, role, etc.)"),
            ("interceptors", "Interceptors HTTP (auth, error, loading)"),
            ("services", "Services com injeção de dependência"),
            ("environments", "Arquivos de environment (dev, prod, staging)"),
        ]
        for item_key, item_desc in required_plan_items:
            if item_key.lower() in planned_str or item_key.lower() in " ".join(planned_items).lower():
                checks.append(self._ok(f"planned_{item_key.replace('/', '_').replace('.', '_')}"))
            else:
                checks.append(self._warn(
                    f"missing_plan_{item_key.replace('/', '_').replace('.', '_')}",
                    f"Item '{item_desc}' não encontrado no plano de geração."
                ))

        # 2. Verificar escolha de formulários
        forms_choice = frontend.get("forms", plan.get("forms", "")).lower()
        if "reactive" in forms_choice or "formgroup" in forms_choice:
            checks.append(self._ok("reactive_forms_planned"))
        elif "template" in forms_choice or "templatedriven" in forms_choice:
            checks.append(self._warn(
                "template_driven_forms",
                "Template-driven forms escolhidos. Reactive forms são recomendados "
                "para formulários complexos e testabilidade."
            ))
        else:
            checks.append(self._warn(
                "forms_not_specified",
                "Estratégia de formulários não especificada. Defina reactive forms "
                "(FormGroup/FormBuilder) ou template-driven forms."
            ))

        # 3. Verificar lazy loading planejado
        if "lazy" in planned_str or "loadchildren" in planned_str or "lazy loading" in planned_str:
            checks.append(self._ok("lazy_loading_planned"))
        else:
            checks.append(self._warn(
                "lazy_loading_missing",
                "Lazy loading não mencionado no plano. Implemente lazy loading para "
                "feature modules melhorar performance de carregamento inicial."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ────────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos obrigatórios
        checks.append(self._check_required_files(project_path, [
            "angular.json", "package.json", "tsconfig.json",
            "src/app/", "src/environments/",
        ], label="angular_core"))

        # 2. Verificar app/core/ existe
        checks.append(self._check_directory_structure(
            os.path.join(project_path, "src", "app"),
            ["core"], label="core_module"
        ))
        core_path = os.path.join(project_path, "src", "app", "core")
        if os.path.isdir(core_path):
            core_dirs = self._scan_dirs(core_path)
            for expected in ["auth", "guards", "interceptors"]:
                if expected in core_dirs:
                    checks.append(self._ok(f"core_{expected}_exists"))
                else:
                    checks.append(self._warn(
                        f"core_{expected}_missing",
                        f"Diretório core/{expected} não encontrado em src/app/core/."
                    ))

        # 3. Verificar app/shared/ existe
        checks.append(self._check_directory_structure(
            os.path.join(project_path, "src", "app"),
            ["shared"], label="shared_module"
        ))
        shared_path = os.path.join(project_path, "src", "app", "shared")
        if os.path.isdir(shared_path):
            shared_dirs = self._scan_dirs(shared_path)
            for expected in ["components", "pipes", "directives"]:
                if expected in shared_dirs:
                    checks.append(self._ok(f"shared_{expected}_exists"))
                else:
                    checks.append(self._warn(
                        f"shared_{expected}_missing",
                        f"Diretório shared/{expected} não encontrado em src/app/shared/."
                    ))

        # 4. Verificar services com RxJS
        service_files = self._scan_filenames(
            os.path.join(project_path, "src", "app"), [".service.ts"]
        )
        if service_files:
            rxjs_imports = ["Observable", "BehaviorSubject", "Subject", "pipe", "map", "switchMap"]
            services_with_rxjs = 0
            for sf in service_files:
                full_path = os.path.join(project_path, "src", "app", sf)
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read().lower()
                    if any(imp.lower() in content for imp in rxjs_imports):
                        services_with_rxjs += 1
                except Exception:
                    pass
            if services_with_rxjs > 0:
                checks.append(self._ok("services_rxjs_usage"))
            else:
                checks.append(self._warn(
                    "services_rxjs_missing",
                    f"{len(service_files)} service(s) encontrados, mas nenhum utiliza "
                    f"padrões RxJS (Observable, BehaviorSubject, pipe)."
                ))
        else:
            checks.append(self._warn(
                "services_missing",
                "Nenhum arquivo .service.ts encontrado. Serviços são fundamentais "
                "para injeção de dependência e lógica de negócio em Angular."
            ))

        # 5. Verificar pelo menos um guard
        guard_files = self._scan_filenames(
            os.path.join(project_path, "src", "app"), [".guard.ts"]
        )
        if guard_files:
            checks.append(self._ok("guards_exist"))
        else:
            checks.append(self._fail(
                "guards_missing",
                "Nenhum arquivo .guard.ts encontrado. Implemente pelo menos um "
                "auth.guard.ts para proteger rotas autenticadas."
            ))

        # 6. Verificar pelo menos um interceptor
        interceptor_files = self._scan_filenames(
            os.path.join(project_path, "src", "app"), [".interceptor.ts"]
        )
        if interceptor_files:
            # Verificar tipos de interceptors
            has_auth = any("auth" in f.lower() for f in interceptor_files)
            has_error = any("error" in f.lower() for f in interceptor_files)
            if not has_auth:
                checks.append(self._warn(
                    "auth_interceptor_missing",
                    "Interceptor de autenticação não encontrado. "
                    "Adicione um auth.interceptor.ts para incluir tokens JWT nas requisições."
                ))
            if not has_error:
                checks.append(self._warn(
                    "error_interceptor_missing",
                    "Interceptor de erro não encontrado. "
                    "Adicione um error.interceptor.ts para tratamento global de erros HTTP."
                ))
            checks.append(self._ok("interceptors_exist"))
        else:
            checks.append(self._fail(
                "interceptors_missing",
                "Nenhum arquivo .interceptor.ts encontrado. Implemente interceptors "
                "para auth (JWT), error handling e loading global."
            ))

        # 7. Verificar reactive forms
        ts_files = self._scan_filenames(
            os.path.join(project_path, "src", "app"), [".ts"]
        )
        reactive_form_imports = ["FormGroup", "FormBuilder", "FormControl", "Validators"]
        reactive_form_count = 0
        for tf in ts_files:
            full_path = os.path.join(project_path, "src", "app", tf)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if any(imp in content for imp in reactive_form_imports):
                    reactive_form_count += 1
                # Bloquear se encontrar formulários sem tratamento de erros
            except Exception:
                pass
        if reactive_form_count > 0:
            checks.append(self._ok("reactive_forms_used"))
        else:
            checks.append(self._warn(
                "reactive_forms_not_found",
                "Nenhum uso de FormGroup, FormBuilder ou FormControl detectado. "
                "Verifique se formulários reativos estão implementados corretamente."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ──────────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Verificar arquivos de environment separados
        env_dir = os.path.join(project_path, "src", "environments")
        if os.path.isdir(env_dir):
            env_files = os.listdir(env_dir)
            has_dev = any("dev" in f.lower() or "development" in f.lower() for f in env_files)
            has_prod = any("prod" in f.lower() or "production" in f.lower() for f in env_files)
            if has_dev and has_prod:
                checks.append(self._ok("environment_files_separated"))
            else:
                missing_env = []
                if not has_dev:
                    missing_env.append("development")
                if not has_prod:
                    missing_env.append("production")
                checks.append(self._fail(
                    "environment_files_incomplete",
                    f"Arquivos de environment incompletos. Faltando: {', '.join(missing_env)}. "
                    f"Arquivos encontrados: {env_files}"
                ))
        else:
            checks.append(self._fail(
                "environment_dir_missing",
                "Diretório src/environments/ não encontrado. "
                "Crie environment.ts e environment.prod.ts separados."
            ))

        # 2. Verificar API keys hardcoded
        env_patterns = [
            r"(?i)api[_-]?key\s*[:=]\s*['\"][^'\"]{8,}['\"]",
            r"(?i)secret\s*[:=]\s*['\"][^'\"]{8,}['\"]",
            r"(?i)token\s*[:=]\s*['\"](?:eyJ|ghp_|sk-)[^'\"]+['\"]",
        ]
        all_ts_files = self._scan_filenames(project_path, [".ts", ".js", ".json"])
        hardcoded_violations = []
        for f in all_ts_files:
            full_path = os.path.join(project_path, f)
            if "node_modules" in full_path or "dist" in full_path:
                continue
            if "environment" in f.lower():
                continue  # environment files will have API keys, that's expected
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in env_patterns:
                    matches = re.findall(pat, content)
                    if matches:
                        # Exclude environment files themselves
                        hardcoded_violations.append(f"{f}: {matches[0][:40]}...")
                        break
            except Exception:
                pass
        if hardcoded_violations:
            checks.append(self._block(
                "hardcoded_secrets",
                f"CRÍTICO: Possíveis secrets hardcoded encontrados em: "
                f"{'; '.join(hardcoded_violations[:5])}. "
                f"Mova TODAS as chaves para environment files ou variáveis de ambiente."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. Verificar DomSanitizer usage warnings
        sanitizer_files = []
        for f in all_ts_files:
            full_path = os.path.join(project_path, f)
            if "node_modules" in full_path:
                continue
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if "bypassSecurityTrustHtml" in content or "bypassSecurityTrustUrl" in content:
                    sanitizer_files.append(f)
            except Exception:
                pass
        if sanitizer_files:
            checks.append(self._warn(
                "domsanitizer_bypass_usage",
                f"DomSanitizer.bypassSecurityTrust* usado em: "
                f"{', '.join(sanitizer_files)}. "
                f"Isso pode expor a aplicação a XSS. Use apenas quando estritamente necessário "
                f"e com sanitização prévia dos inputs."
            ))
        else:
            checks.append(self._ok("domsanitizer_safe"))

        # 4. Verificar configuração de build de produção
        angular_json_path = os.path.join(project_path, "angular.json")
        if os.path.exists(angular_json_path):
            try:
                with open(angular_json_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read().lower()
                has_production_config = "production" in content and "optimization" in content
                has_aot = "aot" in content and "true" in content
                if has_production_config and has_aot:
                    checks.append(self._ok("production_build_configured"))
                else:
                    checks.append(self._warn(
                        "production_build_incomplete",
                        "Configuração de build de produção incompleta no angular.json. "
                        "Verifique se optimization e aot estão habilitados para produção."
                    ))
            except Exception:
                checks.append(self._fail(
                    "angular_json_unreadable",
                    "Não foi possível ler angular.json para verificar build de produção."
                ))
        else:
            checks.append(self._fail(
                "angular_json_missing",
                "angular.json não encontrado — impossível verificar build de produção."
            ))

        return self._aggregate_checks(checks, "download_gate")
