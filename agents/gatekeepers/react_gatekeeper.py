"""
ReactGatekeeper — Validador de 4 fases para projetos React.

Fases:
1. pre_generation_check  — valida briefing/config do React antes da geração
2. generation_plan_check — valida blueprint/plano de arquitetura React
3. post_generation_check — valida arquivos gerados do projeto React
4. download_gate_check   — validação final de segurança e completude
"""

import os
import re
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class ReactGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado para stack React (17, 18, 19)."""

    def __init__(self):
        super().__init__(name="ReactGatekeeper", stack_id="react")

    # ── Fase 1: Pre-Generation ─────────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        checks: List[Dict[str, Any]] = []

        # 1. Verificar versão do React
        react_version = frontend.get("react_version", frontend.get("version", ""))
        if react_version:
            try:
                major = int(str(react_version).split(".")[0])
                if major < 17:
                    checks.append(self._warn(
                        "react_version_old",
                        f"React {react_version} está muito desatualizado. "
                        f"Recomendado React 18+ para Concurrent Features e Server Components."
                    ))
                elif major == 17:
                    checks.append(self._warn(
                        "react_version_17",
                        "React 17 detectado. Considere migrar para React 18+ "
                        "para aproveitar automatic batching, Suspense e Concurrent Mode."
                    ))
                elif major >= 19:
                    checks.append(self._ok("react_version_modern"))
                else:
                    checks.append(self._ok("react_version"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "react_version_unparseable",
                    f"Não foi possível interpretar a versão do React: '{react_version}'."
                ))
        else:
            checks.append(self._warn(
                "react_version_unspecified",
                "Versão do React não especificada. Assumindo React 18 como padrão."
            ))

        # 2. Verificar state management
        state_mgmt = frontend.get("state_management", frontend.get("store", "")).lower()
        known_state = ["redux", "zustand", "context", "jotai", "recoil", "mobx", "valtio", "none"]
        if any(k in state_mgmt for k in known_state):
            if "context" in state_mgmt and "redux" not in state_mgmt:
                checks.append(self._warn(
                    "context_only_state",
                    "Apenas Context API como state management. Para aplicações com "
                    "estado complexo/médio, considere Zustand ou Redux Toolkit."
                ))
            else:
                checks.append(self._ok("state_management"))
        elif state_mgmt:
            checks.append(self._warn(
                "state_management_unknown",
                f"State management '{state_mgmt}' não reconhecido. "
                f"Opções comuns: Redux Toolkit, Zustand, Jotai, Context API, MobX."
            ))
        else:
            checks.append(self._warn(
                "state_management_missing",
                "Gerenciamento de estado não definido. Especifique Redux Toolkit, "
                "Zustand, Context API ou 'none' para projetos sem estado global."
            ))

        # 3. Verificar routing library
        routing = frontend.get("routing", frontend.get("router", "")).lower()
        if "react" in routing and "router" in routing:
            checks.append(self._ok("routing_library"))
        elif routing:
            checks.append(self._warn(
                "routing_library_unknown",
                f"Biblioteca de roteamento '{routing}' não reconhecida. "
                f"O padrão React é React Router v6+."
            ))
        else:
            checks.append(self._warn(
                "routing_missing",
                "Biblioteca de roteamento não especificada. "
                "React Router v6+ é o padrão recomendado para SPA React."
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
            ("components", "Estrutura de componentes (atomic ou feature-based)"),
            ("hooks", "Hooks customizados (useAuth, useFetch, useLocalStorage)"),
            ("api_layer", "Camada de API (axios wrapper, fetch wrapper, React Query)"),
            ("state_management", "Configuração de state management"),
            ("routing", "Configuração de rotas com React Router"),
        ]
        for item_key, item_desc in required_plan_items:
            if item_key.lower() in planned_str:
                checks.append(self._ok(f"planned_{item_key}"))
            else:
                checks.append(self._warn(
                    f"missing_plan_{item_key}",
                    f"Item '{item_desc}' não encontrado no plano de geração."
                ))

        # 2. Verificar error boundaries
        if "error" in planned_str and ("boundary" in planned_str or "boundaries" in planned_str):
            checks.append(self._ok("error_boundaries_planned"))
        else:
            checks.append(self._warn(
                "error_boundaries_missing",
                "Error boundaries não mencionadas no plano. "
                "Implemente pelo menos um ErrorBoundary no nível raiz da aplicação."
            ))

        # 3. Verificar lazy loading / Suspense
        if "lazy" in planned_str or "suspense" in planned_str or "code split" in planned_str:
            checks.append(self._ok("lazy_loading_planned"))
        else:
            checks.append(self._warn(
                "lazy_loading_missing",
                "Lazy loading / Suspense não mencionado no plano. "
                "Use React.lazy() e Suspense para code-splitting de rotas e componentes pesados."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ────────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos obrigatórios
        app_entry = "src/App.jsx" if os.path.exists(os.path.join(project_path, "src/App.jsx")) else "src/App.tsx"
        checks.append(self._check_required_files(project_path, [
            "package.json", app_entry, "src/components/",
            "src/hooks/", "public/",
        ], label="react_core"))

        # Verifica API layer (src/services/ ou src/api/)
        has_api = (
            os.path.isdir(os.path.join(project_path, "src", "services")) or
            os.path.isdir(os.path.join(project_path, "src", "api"))
        )
        if has_api:
            checks.append(self._ok("api_layer_exists"))
        else:
            checks.append(self._warn(
                "api_layer_missing",
                "Camada de API não encontrada. Crie src/services/ ou src/api/ "
                "com um wrapper axios/fetch centralizado."
            ))

        # 2. Verificar pelo menos 3 componentes
        component_files = self._scan_filenames(
            os.path.join(project_path, "src", "components"),
            [".jsx", ".tsx"]
        )
        if len(component_files) >= 3:
            checks.append(self._ok("min_components"))
        else:
            checks.append(self._fail(
                "insufficient_components",
                f"Apenas {len(component_files)} componente(s) encontrado(s) em "
                f"src/components/. Mínimo esperado: 3."
            ))

        # 3. Verificar custom hooks
        hooks_dir = os.path.join(project_path, "src", "hooks")
        if os.path.isdir(hooks_dir):
            hook_files = self._scan_filenames(hooks_dir, [".js", ".jsx", ".ts", ".tsx"])
            custom_hooks = [h for h in hook_files if "use" in os.path.basename(h)[:4].lower()]
            if custom_hooks:
                checks.append(self._ok("custom_hooks_exist"))
                # Verificar hooks comuns
                hook_names = [os.path.basename(h).split(".")[0] for h in custom_hooks]
                common_hooks = ["useAuth", "useFetch", "useApi", "useLocalStorage", "useForm"]
                missing_common = [ch for ch in common_hooks if not any(ch.lower() in hn.lower() for hn in hook_names)]
                if missing_common and len(custom_hooks) < 3:
                    checks.append(self._warn(
                        "limited_hooks",
                        f"Apenas {len(custom_hooks)} hook(s) encontrado(s). "
                        f"Considere adicionar hooks comuns como: {', '.join(missing_common[:3])}."
                    ))
            else:
                checks.append(self._warn(
                    "hooks_not_custom",
                    f"Arquivos em src/hooks/ não seguem convenção de nomenclatura 'use*'. "
                    f"Hooks React devem começar com 'use' (ex: useAuth, useFetch)."
                ))
        else:
            checks.append(self._fail(
                "hooks_dir_missing",
                "Diretório src/hooks/ não encontrado. "
                "Custom hooks são essenciais para lógica reutilizável em React."
            ))

        # 4. Verificar routing configurado
        if app_entry:
            app_path = os.path.join(project_path, app_entry)
            route_check = self._check_file_contains(app_path, [
                "BrowserRouter", "createBrowserRouter", "Route", "RouterProvider",
                "react-router-dom",
            ])
            if route_check.get("status") == "passed":
                checks.append(self._ok("routing_configured"))
            else:
                checks.append(self._warn(
                    "routing_not_found",
                    "React Router não detectado no entry point. "
                    "Verifique se BrowserRouter/RouterProvider está configurado em App."
                ))

        # 5. Verificar state management configurado
        store_indicators = ["createStore", "configureStore", "create(",
                            "Provider", "createContext", "zustand"]
        store_files = []
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            found = self._scan_filenames(
                os.path.join(project_path, "src"), [ext]
            )
            for f in found:
                full_path = os.path.join(project_path, "src", f)
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                    if any(ind in content for ind in store_indicators):
                        store_files.append(f)
                        break
                except Exception:
                    pass
        if store_files:
            checks.append(self._ok("state_management_setup"))
        else:
            checks.append(self._warn(
                "state_management_not_detected",
                "Nenhum indicador de state management detectado (Redux store, "
                "Zustand create, Context Provider). Verifique a configuração."
            ))

        # 6. Verificar tamanho de componentes (sem arquivos 500+ linhas)
        oversized = []
        for f in component_files:
            full_path = os.path.join(project_path, "src", "components", f)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    line_count = sum(1 for _ in fh)
                if line_count > 500:
                    oversized.append(f"{f} ({line_count} linhas)")
            except Exception:
                pass
        if oversized:
            checks.append(self._fail(
                "oversized_components",
                f"Componentes com mais de 500 linhas detectados: "
                f"{'; '.join(oversized)}. Refatore em componentes menores."
            ))
        else:
            checks.append(self._ok("component_size_ok"))

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
                if "REACT_APP_" in env_content or "VITE_" in env_content:
                    checks.append(self._ok("env_structured"))
                else:
                    checks.append(self._warn(
                        "env_no_prefix",
                        "Variáveis no .env sem prefixo REACT_APP_ ou VITE_. "
                        "Create React App requer REACT_APP_; Vite requer VITE_."
                    ))
            except Exception:
                checks.append(self._fail("env_unreadable", "Não foi possível ler arquivo .env."))
        else:
            checks.append(self._fail(
                "env_missing",
                "Arquivo .env ou .env.example não encontrado. "
                "Crie .env com variáveis de ambiente e .env.example como template."
            ))

        # 2. Verificar API keys hardcoded
        secret_patterns = [
            r"(?i)(?:REACT_APP_|VITE_)?API[_-]?KEY\s*=\s*['\"][^'\"]{8,}['\"]",
            r"(?i)(?:REACT_APP_|VITE_)?SECRET\s*=\s*['\"][^'\"]{8,}['\"]",
            r"(?i)token\s*[:=]\s*['\"](?:eyJ|ghp_|sk-)[^'\"]+['\"]",
        ]
        src_files = self._scan_filenames(os.path.join(project_path, "src"), [".js", ".jsx", ".ts", ".tsx"])
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
                "hardcoded_secrets_src",
                f"CRÍTICO: Possíveis secrets no código fonte: "
                f"{'; '.join(violations[:5])}. Use apenas variáveis de ambiente (process.env)."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. Verificar CORS awareness (API URLs baseadas em env)
        api_files = []
        for f in src_files:
            full_path = os.path.join(project_path, "src", f)
            if "api" in f.lower() or "service" in f.lower() or "axios" in f.lower() or "fetch" in f.lower():
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                    if "process.env" in content or "import.meta.env" in content:
                        api_files.append(f)
                except Exception:
                    pass
        if api_files:
            checks.append(self._ok("cors_aware_api_calls"))
        else:
            checks.append(self._warn(
                "cors_unaware_api",
                "Nenhuma chamada de API encontrada usando variáveis de ambiente. "
                "Use process.env.REACT_APP_API_URL ou import.meta.env.VITE_API_URL "
                "para base URLs e evitar problemas de CORS em produção."
            ))

        # 4. Verificar build script
        checks.append(self._check_file_contains(
            os.path.join(project_path, "package.json"),
            ['"build"', '"react-scripts build"', '"vite build"']
        ))

        # 5. Verificar acessibilidade básica
        component_files = self._scan_filenames(
            os.path.join(project_path, "src", "components"), [".jsx", ".tsx"]
        )
        aria_found = 0
        alt_found = 0
        for cf in component_files:
            full_path = os.path.join(project_path, "src", "components", cf)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if "aria-" in content.lower():
                    aria_found += 1
                if 'alt="' in content or "alt='" in content or "alt={" in content:
                    alt_found += 1
            except Exception:
                pass
        if aria_found == 0 and alt_found == 0:
            checks.append(self._warn(
                "accessibility_missing",
                "Nenhum atributo aria-* ou alt em imagens detectado nos componentes. "
                "Adicione atributos básicos de acessibilidade (aria-label, alt em <img>)."
            ))
        else:
            checks.append(self._ok("accessibility_basics"))

        return self._aggregate_checks(checks, "download_gate")
