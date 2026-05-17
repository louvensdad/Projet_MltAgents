"""
NextJSGatekeeper — Validador de 4 fases para projetos Next.js.

Fases:
1. pre_generation_check  — valida briefing/config Next.js antes da geração
2. generation_plan_check — valida blueprint/plano de arquitetura Next.js
3. post_generation_check — valida arquivos gerados do projeto Next.js
4. download_gate_check   — validação final de segurança e completude
"""

import os
import re
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class NextJSGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado para stack Next.js (13+ com App Router)."""

    def __init__(self):
        super().__init__(name="NextJSGatekeeper", stack_id="nextjs")

    # ── Fase 1: Pre-Generation ─────────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        checks: List[Dict[str, Any]] = []

        # 1. Verificar versão do Next.js
        next_version = frontend.get("nextjs_version", frontend.get("version", ""))
        if next_version:
            try:
                major = int(str(next_version).split(".")[0])
                if major < 13:
                    checks.append(self._warn(
                        "nextjs_version_old",
                        f"Next.js {next_version} usa Pages Router legado. "
                        f"Next.js 13+ com App Router é o padrão moderno recomendado."
                    ))
                elif major == 13:
                    checks.append(self._warn(
                        "nextjs_13_transitional",
                        "Next.js 13 detectado. App Router estava em fase experimental "
                        "em algumas versões 13.x. Considere Next.js 14+ para estabilidade."
                    ))
                else:
                    checks.append(self._ok("nextjs_version_modern"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "nextjs_version_unparseable",
                    f"Não foi possível interpretar a versão do Next.js: '{next_version}'."
                ))
        else:
            checks.append(self._warn(
                "nextjs_version_unspecified",
                "Versão do Next.js não especificada. Assumindo Next.js 14+ com App Router."
            ))

        # 2. App Router vs Pages Router
        router_choice = frontend.get("router", frontend.get("routing", "")).lower()
        if "app" in router_choice:
            checks.append(self._ok("app_router_selected"))
        elif "pages" in router_choice:
            checks.append(self._warn(
                "pages_router_legacy",
                "Pages Router selecionado. App Router é recomendado para novos projetos "
                "por oferecer Server Components, layouts aninhados e streaming nativamente."
            ))
        else:
            # Tenta inferir pela versão
            if next_version and str(next_version).startswith("1") and int(str(next_version).split(".")[0]) >= 13:
                checks.append(self._ok("app_router_assumed"))
            else:
                checks.append(self._warn(
                    "router_not_specified",
                    "Router não especificado (App Router ou Pages Router). "
                    "Especifique App Router para projetos novos Next.js 13+."
                ))

        # 3. Verificar estratégia SSR/SSG/ISR
        rendering = frontend.get("rendering", frontend.get("ssr_strategy", "")).lower()
        rendering_modes = ["ssr", "ssg", "isr", "static", "server", "incremental"]
        if any(mode in rendering for mode in rendering_modes):
            checks.append(self._ok("rendering_strategy"))
        else:
            checks.append(self._warn(
                "rendering_strategy_missing",
                "Estratégia de renderização não definida (SSR, SSG, ISR). "
                "Defina qual estratégia usar por rota para otimizar performance e SEO."
            ))

        # 4. Verificar requisitos SEO
        seo = frontend.get("seo", frontend.get("seo_requirements", ""))
        if seo:
            seo_str = str(seo).lower()
            if "metadata" in seo_str or "meta" in seo_str:
                checks.append(self._ok("seo_metadata_planned"))
            else:
                checks.append(self._warn(
                    "seo_metadata_missing",
                    "SEO mencionado mas sem referência a metadata. "
                    "Use a API metadata do Next.js (generateMetadata, Metadata object)."
                ))
            if "sitemap" in seo_str or "robots" in seo_str:
                checks.append(self._ok("seo_sitemap_planned"))
            else:
                checks.append(self._warn(
                    "seo_sitemap_missing",
                    "Sitemap/robots.txt não mencionados. "
                    "Gere sitemap.xml e robots.ts para indexação correta."
                ))
        else:
            checks.append(self._warn(
                "seo_not_defined",
                "Requisitos de SEO não especificados. Next.js é frequentemente "
                "escolhido por SEO — defina metadata, sitemap, e canonical URLs."
            ))

        return self._aggregate_checks(checks, "pre_generation")

    # ── Fase 2: Generation Plan ────────────────────────────────────────────

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        plan = frontend.get("plan", frontend.get("architecture_plan", {}))
        planned_str = str(plan).lower()
        checks: List[Dict[str, Any]] = []

        # 1. Verificar itens estruturais
        required_plan_items = [
            ("layouts", "Layouts aninhados (layout.tsx raiz e por rota)"),
            ("loading", "Estados de loading (loading.tsx, Suspense)"),
            ("error_boundaries", "Error boundaries (error.tsx, global-error.tsx)"),
            ("api_routes", "API routes (app/api/ ou pages/api/)"),
            ("middleware", "Middleware (middleware.ts para auth, redirects, i18n)"),
        ]
        for item_key, item_desc in required_plan_items:
            if item_key.lower() in planned_str:
                checks.append(self._ok(f"planned_{item_key}"))
            else:
                checks.append(self._warn(
                    f"missing_plan_{item_key}",
                    f"Item '{item_desc}' não encontrado no plano de geração."
                ))

        # 2. Server/Client component split
        if "server component" in planned_str or "use client" in planned_str or "use server" in planned_str:
            checks.append(self._ok("component_split_defined"))
        else:
            checks.append(self._warn(
                "component_split_missing",
                "Separação entre Server e Client Components não definida. "
                "Defina quais componentes são server-only e quais precisam de 'use client'."
            ))

        # 3. Data fetching strategy
        data_fetching = plan.get("data_fetching", frontend.get("data_fetching", ""))
        fetch_strategies = ["server", "server action", "route handler", "fetch", "swr", "react query", "tanstack"]
        fetch_str = str(data_fetching).lower()
        if any(s in fetch_str for s in fetch_strategies):
            checks.append(self._ok("data_fetching_strategy"))
        else:
            checks.append(self._warn(
                "data_fetching_missing",
                "Estratégia de data fetching não definida. "
                "Especifique: Server Components (fetch direto), Server Actions (mutations), "
                "ou Route Handlers (API endpoints)."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ────────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        is_app_router = os.path.isdir(os.path.join(project_path, "app"))

        # 1. Arquivos obrigatórios
        config_file = None
        for candidate in ["next.config.mjs", "next.config.js", "next.config.ts"]:
            if os.path.exists(os.path.join(project_path, candidate)):
                config_file = candidate
                break
        required_files = ["package.json", "public/"]
        if config_file:
            required_files.append(config_file)
            checks.append(self._ok("next_config_exists"))
        else:
            checks.append(self._fail(
                "next_config_missing",
                "Arquivo next.config.(m)js/ts não encontrado."
            ))
        if is_app_router:
            required_files.append("app/")
        else:
            required_files.append("pages/")
        checks.append(self._check_required_files(project_path, required_files, label="nextjs_core"))

        # 2. App Router: verificar arquivos essenciais
        if is_app_router:
            app_dir = os.path.join(project_path, "app")
            # layout.tsx
            has_layout = any(
                f.startswith("layout.") for f in os.listdir(app_dir)
                if os.path.isfile(os.path.join(app_dir, f))
            )
            if has_layout:
                checks.append(self._ok("app_layout_exists"))
            else:
                checks.append(self._fail(
                    "app_layout_missing",
                    "Arquivo app/layout.tsx não encontrado. "
                    "Todo App Router precisa de um layout raiz obrigatório."
                ))

            # page.tsx
            has_page = any(
                f.startswith("page.") for f in os.listdir(app_dir)
                if os.path.isfile(os.path.join(app_dir, f))
            )
            if has_page:
                checks.append(self._ok("app_page_exists"))
            else:
                checks.append(self._fail(
                    "app_page_missing",
                    "Arquivo app/page.tsx não encontrado. "
                    "A rota raiz '/' precisa de um page.tsx."
                ))

            # loading.tsx ou error.tsx
            loading_files = self._scan_filenames(app_dir, ["loading.tsx", "loading.jsx"])
            error_files = self._scan_filenames(app_dir, ["error.tsx", "error.jsx"])
            if loading_files or error_files:
                checks.append(self._ok("loading_or_error_exists"))
            else:
                checks.append(self._warn(
                    "loading_error_missing",
                    "Nenhum loading.tsx ou error.tsx encontrado. "
                    "Adicione estados de loading e tratamento de erro por rota."
                ))

        # 3. Verificar 'use client' / 'use server' directives
        directive_found = False
        all_tsx = self._scan_filenames(project_path, [".tsx", ".jsx"])
        for f in all_tsx:
            full_path = os.path.join(project_path, f)
            if "node_modules" in full_path or ".next" in full_path:
                continue
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    first_line = fh.readline().strip()
                if first_line in ('"use client"', "'use client'", '"use server"', "'use server'"):
                    directive_found = True
                    break
            except Exception:
                pass
        if directive_found:
            checks.append(self._ok("directives_present"))
        elif is_app_router:
            checks.append(self._warn(
                "directives_missing",
                "Nenhuma diretiva 'use client' ou 'use server' encontrada. "
                "Componentes com hooks/eventos precisam de 'use client' explícito no App Router."
            ))

        # 4. Metadata/SEO no layout
        if is_app_router:
            layout_files = self._scan_filenames(os.path.join(project_path, "app"), ["layout.tsx", "layout.jsx"])
            metadata_found = False
            for lf in layout_files:
                full_path = os.path.join(project_path, "app", lf)
                metadata_check = self._check_file_contains(full_path, [
                    "Metadata", "generateMetadata", "title:", "description:",
                    "openGraph", "metadata",
                ])
                if metadata_check.get("status") == "passed":
                    metadata_found = True
                    break
            if metadata_found:
                checks.append(self._ok("metadata_in_layout"))
            else:
                checks.append(self._warn(
                    "metadata_missing_in_layout",
                    "Metadata/SEO não configurada no layout raiz. "
                    "Exporte um objeto Metadata ou função generateMetadata."
                ))

        # 5. API routes
        api_dir_app = os.path.join(project_path, "app", "api")
        api_dir_pages = os.path.join(project_path, "pages", "api")
        if os.path.isdir(api_dir_app) or os.path.isdir(api_dir_pages):
            api_files = self._scan_filenames(
                api_dir_app if os.path.isdir(api_dir_app) else api_dir_pages,
                [".ts", ".tsx", ".js", ".jsx"]
            )
            if api_files:
                checks.append(self._ok("api_routes_exist"))
            else:
                checks.append(self._warn(
                    "api_routes_empty",
                    "Diretório API routes existe mas está vazio. "
                    "Adicione pelo menos um route handler."
                ))
        else:
            checks.append(self._warn(
                "api_routes_missing",
                "Nenhum diretório de API routes encontrado (app/api/ ou pages/api/)."
            ))

        # 6. Middleware
        middleware_candidates = ["middleware.ts", "middleware.js", "src/middleware.ts", "src/middleware.js"]
        middleware_found = any(
            os.path.exists(os.path.join(project_path, m)) for m in middleware_candidates
        )
        if middleware_found:
            checks.append(self._ok("middleware_exists"))
        else:
            checks.append(self._warn(
                "middleware_missing",
                "middleware.ts não encontrado. Middleware é essencial para "
                "autenticação, redirects, rewrites e proteção de rotas."
            ))

        # 7. Image optimization
        image_check = self._check_file_contains(
            os.path.join(project_path, "next.config.mjs" if config_file and "mjs" in config_file else "next.config.js"),
            ["images", "remotePatterns", "imageSizes"]
        )
        if image_check.get("status") == "passed":
            checks.append(self._ok("image_optimization_configured"))
        else:
            checks.append(self._warn(
                "image_optimization_missing",
                "Configuração de imagens não encontrada no next.config. "
                "Configure remotePatterns para domínios de imagens externas."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ──────────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Verificar .env.local
        env_local = os.path.join(project_path, ".env.local")
        env_example = os.path.join(project_path, ".env.example")
        env_target = env_local if os.path.exists(env_local) else env_example
        if os.path.exists(env_target):
            try:
                with open(env_target, "r", encoding="utf-8", errors="ignore") as f:
                    env_content = f.read()
                if "NEXT_PUBLIC_" in env_content:
                    checks.append(self._ok("env_next_public_prefix"))
                else:
                    checks.append(self._warn(
                        "env_no_next_public",
                        "Variáveis públicas devem usar prefixo NEXT_PUBLIC_ "
                        "para serem acessíveis no client-side."
                    ))
                if not os.path.exists(env_local):
                    checks.append(self._warn(
                        "env_local_missing",
                        ".env.local não encontrado. Crie para secrets locais. "
                        "Use .env.example como template (sem valores reais)."
                    ))
            except Exception:
                checks.append(self._fail("env_unreadable", "Não foi possível ler arquivo .env."))
        else:
            checks.append(self._fail(
                "env_files_missing",
                "Nenhum arquivo .env.local ou .env.example encontrado."
            ))

        # 2. Verificar secrets hardcoded
        secret_patterns = [
            r"(?i)(?:NEXT_PUBLIC_)?SECRET\s*=\s*['\"][^'\"]{8,}['\"]",
            r"(?i)DATABASE_URL\s*=\s*['\"]postgres",
            r"(?i)JWT_SECRET\s*=\s*['\"][^'\"]{8,}['\"]",
            r"(?i)token\s*[:=]\s*['\"](?:eyJ|ghp_|sk-)[^'\"]+['\"]",
        ]
        src_files = self._scan_filenames(project_path, [".ts", ".tsx", ".js", ".jsx"])
        violations = []
        for f in src_files:
            if "node_modules" in f or ".next" in f:
                continue
            full_path = os.path.join(project_path, f)
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
                f"CRÍTICO: Secrets hardcoded detectados em: {', '.join(violations[:5])}. "
                f"Use variáveis de ambiente (process.env) exclusivamente."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. Verificar CSP headers
        middleware_found = False
        for mw in ["middleware.ts", "middleware.js", "src/middleware.ts", "src/middleware.js"]:
            if os.path.exists(os.path.join(project_path, mw)):
                middleware_found = True
                mw_path = os.path.join(project_path, mw)
                csp_check = self._check_file_contains(mw_path, [
                    "Content-Security-Policy", "CSP", "X-Frame-Options",
                    "X-Content-Type-Options",
                ])
                if csp_check.get("status") == "passed":
                    checks.append(self._ok("csp_headers"))
                else:
                    checks.append(self._warn(
                        "csp_headers_missing",
                        "Middleware existe mas sem headers de segurança (CSP, X-Frame-Options, etc.). "
                        "Adicione headers de segurança para proteção contra XSS e clickjacking."
                    ))
                break
        if not middleware_found:
            checks.append(self._warn(
                "security_headers_missing",
                "Middleware não encontrado — impossível verificar headers de segurança. "
                "Crie middleware.ts com CSP e outros security headers."
            ))

        # 4. Verificar build output
        build_exists = os.path.isdir(os.path.join(project_path, ".next"))
        if build_exists:
            checks.append(self._ok("build_output_exists"))
        else:
            checks.append(self._warn(
                "build_output_missing",
                "Diretório .next/ não encontrado. Execute 'next build' para "
                "verificar se o projeto compila sem erros."
            ))

        # 5. Verificar ISR/SSG cache settings
        next_config_files = [f for f in ["next.config.mjs", "next.config.js", "next.config.ts"]
                            if os.path.exists(os.path.join(project_path, f))]
        if next_config_files:
            config_path = os.path.join(project_path, next_config_files[0])
            cache_check = self._check_file_contains(config_path, [
                "revalidate", "staleTimes", "cache",
            ])
            if cache_check.get("status") == "passed":
                checks.append(self._ok("cache_settings"))
            else:
                checks.append(self._warn(
                    "cache_settings_missing",
                    "Configurações de cache/revalidação não encontradas no next.config. "
                    "Defina revalidate times para páginas ISR/SSG."
                ))

        return self._aggregate_checks(checks, "download_gate")
