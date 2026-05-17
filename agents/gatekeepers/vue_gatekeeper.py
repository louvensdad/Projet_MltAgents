"""
VueGatekeeper — Validador de 4 fases para projetos Vue.js.

Fases:
1. pre_generation_check  — valida briefing/config Vue.js antes da geração
2. generation_plan_check — valida blueprint/plano de arquitetura Vue.js
3. post_generation_check — valida arquivos gerados do projeto Vue.js
4. download_gate_check   — validação final de segurança e completude
"""

import os
import re
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class VueGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado para stack Vue.js (3.x)."""

    def __init__(self):
        super().__init__(name="VueGatekeeper", stack_id="vue")

    # ── Fase 1: Pre-Generation ─────────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        checks: List[Dict[str, Any]] = []

        # 1. Verificar versão do Vue
        vue_version = frontend.get("vue_version", frontend.get("version", ""))
        if vue_version:
            try:
                major = int(str(vue_version).split(".")[0])
                if major < 3:
                    checks.append(self._block(
                        "vue_version_unsupported",
                        f"Vue {vue_version} não é suportado. "
                        f"Vue 2 chegou ao EOL em 2023-12-31. Use Vue 3.x obrigatoriamente."
                    ))
                elif major == 3:
                    checks.append(self._ok("vue_version_3"))
                else:
                    checks.append(self._ok("vue_version_modern"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "vue_version_unparseable",
                    f"Não foi possível interpretar a versão do Vue: '{vue_version}'."
                ))
        else:
            checks.append(self._warn(
                "vue_version_unspecified",
                "Versão do Vue não especificada. Assumindo Vue 3.4+ com Composition API."
            ))

        # 2. Composition API vs Options API
        api_style = frontend.get("api_style", frontend.get("style", "")).lower()
        if "composition" in api_style or "<script setup>" in api_style:
            checks.append(self._ok("composition_api"))
        elif "options" in api_style:
            checks.append(self._warn(
                "options_api_selected",
                "Options API selecionada. Composition API com <script setup> é o padrão "
                "recomendado para Vue 3, oferecendo melhor reuso de lógica e TypeScript."
            ))
        else:
            checks.append(self._warn(
                "api_style_unspecified",
                "Estilo de API não especificado (Composition vs Options). "
                "Recomendado Composition API com <script setup> para novos projetos."
            ))

        # 3. Verificar state management (Pinia)
        state_mgmt = frontend.get("state_management", frontend.get("store", "")).lower()
        if "pinia" in state_mgmt:
            checks.append(self._ok("pinia_state_management"))
        elif "vuex" in state_mgmt:
            checks.append(self._warn(
                "vuex_deprecated",
                "Vuex detectado. Vuex 4 é funcional, mas Pinia é o state management "
                "oficial recomendado pela equipe Vue para novos projetos."
            ))
        elif state_mgmt:
            checks.append(self._warn(
                "state_management_unknown",
                f"State management '{state_mgmt}' não reconhecido. "
                f"Pinia é a escolha oficial para Vue 3."
            ))
        else:
            checks.append(self._warn(
                "state_management_missing",
                "Gerenciamento de estado não definido. Especifique Pinia para Vue 3."
            ))

        # 4. Verificar Vue Router
        routing = frontend.get("routing", frontend.get("router", "")).lower()
        if "vue" in routing and "router" in routing:
            checks.append(self._ok("vue_router_selected"))
        elif routing:
            checks.append(self._warn(
                "routing_unknown",
                f"Roteamento '{routing}' não reconhecido. Vue Router 4 é o padrão para Vue 3."
            ))
        else:
            checks.append(self._warn(
                "routing_missing",
                "Vue Router não especificado. Todo SPA Vue precisa de Vue Router 4."
            ))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ────────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        plan = frontend.get("plan", frontend.get("architecture_plan", {}))
        planned_str = str(plan).lower()
        checks: List[Dict[str, Any]] = []

        # 1. Verificar itens estruturais no plano
        required_plan_items = [
            ("components", "Estrutura de componentes (Views, Components, Layouts)"),
            ("composables", "Composables (useAuth, useApi, useFetch, etc.)"),
            ("stores", "Stores Pinia (auth store, user store, app store)"),
            ("api_layer", "Camada de API (axios wrapper, fetch wrapper)"),
            ("router", "Configuração do Vue Router (rotas, guards, meta)"),
        ]
        for item_key, item_desc in required_plan_items:
            if item_key.lower() in planned_str:
                checks.append(self._ok(f"planned_{item_key}"))
            else:
                checks.append(self._warn(
                    f"missing_plan_{item_key}",
                    f"Item '{item_desc}' não encontrado no plano de geração."
                ))

        # 2. Verificar estrutura de componentes adequada
        component_structure = plan.get("component_structure", "").lower()
        if component_structure:
            valid_structures = ["atomic", "feature", "views", "layout", "bem"]
            if any(s in component_structure for s in valid_structures):
                checks.append(self._ok("component_structure_defined"))
            else:
                checks.append(self._warn(
                    "component_structure_vague",
                    f"Estrutura de componentes '{component_structure}' não clara. "
                    f"Defina organização clara: views/, components/, layouts/."
                ))
        else:
            checks.append(self._warn(
                "component_structure_missing",
                "Estrutura de componentes não definida. "
                "Organize em views/ (páginas), components/ (reutilizáveis), layouts/."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ────────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos obrigatórios
        checks.append(self._check_required_files(project_path, [
            "package.json", "vite.config.js", "vite.config.ts",
            "src/main.js", "src/main.ts", "src/App.vue",
            "src/router/", "src/stores/", "src/components/",
        ], label="vue_core"))

        # Verificar main entry point (cobre .js e .ts)
        main_exists = (
            os.path.exists(os.path.join(project_path, "src", "main.js")) or
            os.path.exists(os.path.join(project_path, "src", "main.ts"))
        )
        if main_exists:
            checks.append(self._ok("main_entry_exists"))
        else:
            checks.append(self._fail(
                "main_entry_missing",
                "Arquivo src/main.js ou src/main.ts não encontrado."
            ))

        # 2. Verificar Pinia stores
        stores_dir = os.path.join(project_path, "src", "stores")
        if os.path.isdir(stores_dir):
            store_files = self._scan_filenames(stores_dir, [".js", ".ts"])
            pinia_stores = []
            for sf in store_files:
                full_path = os.path.join(stores_dir, sf)
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read().lower()
                    if "definestore" in content or "pinia" in content or "createstore" in content:
                        pinia_stores.append(sf)
                except Exception:
                    pass
            if pinia_stores:
                checks.append(self._ok("pinia_stores_configured"))
            else:
                checks.append(self._fail(
                    "pinia_stores_missing",
                    "Diretório src/stores/ existe mas sem stores Pinia. "
                    "Use defineStore() para criar stores de estado global."
                ))
        else:
            checks.append(self._fail(
                "stores_dir_missing",
                "Diretório src/stores/ não encontrado. "
                "Crie stores Pinia para gerenciamento de estado."
            ))

        # 3. Verificar Vue Router
        router_dir = os.path.join(project_path, "src", "router")
        if os.path.isdir(router_dir):
            router_files = self._scan_filenames(router_dir, [".js", ".ts"])
            router_configured = False
            for rf in router_files:
                full_path = os.path.join(router_dir, rf)
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read().lower()
                    if "createrouter" in content and "vue-router" in content:
                        router_configured = True
                        break
                except Exception:
                    pass
            if router_configured:
                checks.append(self._ok("vue_router_configured"))
            else:
                checks.append(self._fail(
                    "vue_router_not_configured",
                    "Diretório src/router/ existe mas createRouter não encontrado. "
                    "Configure Vue Router com createRouter() e hist\u00f3ria."
                ))
        else:
            checks.append(self._fail(
                "router_dir_missing",
                "Diretório src/router/ não encontrado. "
                "Crie router/index.(ts|js) com Vue Router 4."
            ))

        # 4. Verificar composables
        composables_dir = os.path.join(project_path, "src", "composables")
        hooks_dir = os.path.join(project_path, "src", "hooks")
        composables_path = composables_dir if os.path.isdir(composables_dir) else hooks_dir
        if os.path.isdir(composables_path):
            comp_files = self._scan_filenames(composables_path, [".js", ".ts"])
            composables_with_use = [f for f in comp_files if "use" in os.path.basename(f).lower()[:4]]
            if composables_with_use:
                checks.append(self._ok("composables_exist"))
            else:
                checks.append(self._warn(
                    "composables_not_found",
                    f"Arquivos em {os.path.basename(composables_path)}/ não seguem "
                    f"convenção 'use*' (ex: useAuth, useApi)."
                ))
        else:
            checks.append(self._warn(
                "composables_dir_missing",
                "Diretório src/composables/ (ou src/hooks/) não encontrado. "
                "Composables são o padrão Vue 3 para lógica reutilizável."
            ))

        # 5. Verificar uso de Composition API
        vue_files = self._scan_filenames(
            os.path.join(project_path, "src"), [".vue"]
        )
        composition_count = 0
        for vf in vue_files:
            full_path = os.path.join(project_path, "src", vf)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                # Verifica <script setup> ou Composition API patterns
                if "<script setup" in content or "defineProps" in content or "ref(" in content or "computed(" in content:
                    composition_count += 1
            except Exception:
                pass
        if composition_count > 0:
            checks.append(self._ok("composition_api_used"))
        else:
            checks.append(self._warn(
                "composition_api_not_detected",
                "Nenhum uso de Composition API detectado (<script setup>, ref(), computed()). "
                "Verifique se os componentes estão usando o padrão moderno do Vue 3."
            ))

        # 6. Verificar estrutura .vue SFCs
        if vue_files:
            # Verificar se App.vue tem estrutura correta de SFC
            app_vue = os.path.join(project_path, "src", "App.vue")
            if os.path.exists(app_vue):
                try:
                    with open(app_vue, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    has_template = "<template>" in content
                    has_script = "<script" in content
                    has_style = "<style" in content
                    if has_template and has_script:
                        checks.append(self._ok("sfc_structure_correct"))
                        if not has_style:
                            checks.append(self._warn(
                                "sfc_no_style",
                                "App.vue não possui bloco <style>. "
                                "Considere adicionar estilos scoped ou global."
                            ))
                    else:
                        checks.append(self._warn(
                            "sfc_structure_incomplete",
                            "App.vue não segue estrutura SFC completa "
                            "(precisa de <template> + <script>)."
                        ))
                except Exception:
                    pass
        else:
            checks.append(self._warn(
                "no_vue_files",
                "Nenhum arquivo .vue encontrado em src/. "
                "Componentes Vue devem ser Single File Components (.vue)."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ──────────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Verificar .env estruturado
        env_path = os.path.join(project_path, ".env")
        env_example_path = os.path.join(project_path, ".env.example")
        if os.path.exists(env_path) or os.path.exists(env_example_path):
            target_env = env_path if os.path.exists(env_path) else env_example_path
            try:
                with open(target_env, "r", encoding="utf-8", errors="ignore") as f:
                    env_content = f.read()
                if "VITE_" in env_content:
                    checks.append(self._ok("env_vite_prefix"))
                else:
                    checks.append(self._warn(
                        "env_no_vite_prefix",
                        "Variáveis no .env sem prefixo VITE_. "
                        "Vite só expõe variáveis com prefixo VITE_ ao client-side."
                    ))
                if not os.path.exists(env_path) and os.path.exists(env_example_path):
                    checks.append(self._warn(
                        "env_local_missing",
                        ".env não encontrado (apenas .env.example). "
                        "Crie .env com valores reais para desenvolvimento."
                    ))
            except Exception:
                checks.append(self._fail("env_unreadable", "Não foi possível ler arquivo .env."))
        else:
            checks.append(self._fail(
                "env_missing",
                "Nenhum arquivo .env ou .env.example encontrado."
            ))

        # 2. Verificar API keys hardcoded
        secret_patterns = [
            r"(?i)(?:VITE_)?API[_-]?KEY\s*=\s*['\"][^'\"]{8,}['\"]",
            r"(?i)(?:VITE_)?SECRET\s*=\s*['\"][^'\"]{8,}['\"]",
            r"(?i)token\s*[:=]\s*['\"](?:eyJ|ghp_|sk-)[^'\"]+['\"]",
        ]
        src_files = self._scan_filenames(os.path.join(project_path, "src"), [".js", ".ts", ".vue"])
        violations = []
        for f in src_files:
            full_path = os.path.join(project_path, "src", f)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pat in secret_patterns:
                    if re.search(pat, content):
                        violations.append(f)
                        break
            except Exception:
                pass
        if violations:
            checks.append(self._block(
                "hardcoded_secrets",
                f"CRÍTICO: Secrets hardcoded em: {', '.join(violations[:5])}. "
                f"Use import.meta.env.VITE_* exclusivamente."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. Verificar build configuration
        vite_config_paths = [
            os.path.join(project_path, "vite.config.ts"),
            os.path.join(project_path, "vite.config.js"),
        ]
        vite_config = None
        for vcp in vite_config_paths:
            if os.path.exists(vcp):
                vite_config = vcp
                break
        if vite_config:
            build_check = self._check_file_contains(vite_config, [
                "build", "outDir", "rollupOptions", "minify",
            ])
            if build_check.get("status") == "passed":
                checks.append(self._ok("build_configuration"))
            else:
                checks.append(self._warn(
                    "build_config_simple",
                    "vite.config sem configuração explícita de build. "
                    "Considere definir outDir, minify, e rollupOptions para produção."
                ))
        else:
            checks.append(self._fail(
                "vite_config_missing",
                "vite.config.ts/js não encontrado."
            ))

        # 4. Verificar modo de produção
        if vite_config:
            production_check = self._check_file_contains(vite_config, [
                "mode", "production", "define", "env",
            ])
            if production_check.get("status") != "failed":
                checks.append(self._ok("production_mode_configurable"))
            else:
                checks.append(self._warn(
                    "production_mode_default",
                    "Configuração de modo de produção não explícita. "
                    "Vite usará 'production' por padrão no build."
                ))

        return self._aggregate_checks(checks, "download_gate")
