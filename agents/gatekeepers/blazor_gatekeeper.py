"""
BlazorGatekeeper — Validador de 4 fases para projetos Blazor.

Fases:
1. pre_generation_check  — valida briefing/config Blazor antes da geração
2. generation_plan_check — valida blueprint/plano de arquitetura Blazor
3. post_generation_check — valida arquivos gerados do projeto Blazor
4. download_gate_check   — validação final de segurança e completude
"""

import os
import re
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class BlazorGatekeeper(BaseGatekeeper):
    """Gatekeeper especializado para stack Blazor (.NET 6, 7, 8, 9)."""

    def __init__(self):
        super().__init__(name="BlazorGatekeeper", stack_id="blazor")

    # ── Fase 1: Pre-Generation ─────────────────────────────────────────────

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        frontend = blueprint.get("frontend", {})
        backend = blueprint.get("backend", {})
        checks: List[Dict[str, Any]] = []

        # 1. Verificar versão do .NET
        dotnet_version = (
            frontend.get("dotnet_version") or
            backend.get("dotnet_version") or
            blueprint.get("dotnet_version", "")
        )
        if dotnet_version:
            try:
                major = int(str(dotnet_version).split(".")[0])
                if major < 6:
                    checks.append(self._block(
                        "dotnet_version_unsupported",
                        f".NET {dotnet_version} não é suportado. "
                        f".NET 6+ é o mínimo. Versões anteriores estão fora de suporte."
                    ))
                elif major == 6:
                    checks.append(self._warn(
                        "dotnet_6_eol",
                        ".NET 6 detectado. O suporte terminou em Novembro 2024. "
                        "Considere migrar para .NET 8 LTS ou .NET 9."
                    ))
                elif major == 7:
                    checks.append(self._warn(
                        "dotnet_7_eol",
                        ".NET 7 detectado. É uma versão STS (Standard Term Support) "
                        "já fora de suporte. Migre para .NET 8 LTS."
                    ))
                elif major >= 8:
                    checks.append(self._ok("dotnet_version_modern"))
            except (ValueError, IndexError):
                checks.append(self._warn(
                    "dotnet_version_unparseable",
                    f"Não foi possível interpretar a versão do .NET: '{dotnet_version}'."
                ))
        else:
            checks.append(self._warn(
                "dotnet_version_unspecified",
                "Versão do .NET não especificada. Assumindo .NET 8 LTS como padrão."
            ))

        # 2. Verificar Blazor Server vs WebAssembly vs Hybrid
        hosting = frontend.get("hosting_model", frontend.get("render_mode", "")).lower()
        valid_hosting = ["server", "webassembly", "wasm", "hybrid", "maui", "auto", "ssr"]
        if any(h in hosting for h in valid_hosting):
            if "server" in hosting and "webassembly" not in hosting and "wasm" not in hosting:
                checks.append(self._warn(
                    "blazor_server_only",
                    "Blazor Server selecionado. Considere Blazor WebAssembly ou "
                    "Auto render mode (.NET 8+) para melhor escalabilidade e offline support."
                ))
            elif "auto" in hosting:
                checks.append(self._ok("blazor_auto_render_mode"))
            else:
                checks.append(self._ok("blazor_hosting_model"))
        elif hosting:
            checks.append(self._warn(
                "hosting_model_unknown",
                f"Modelo de hospedagem '{hosting}' não reconhecido. "
                f"Opções: Blazor Server, Blazor WebAssembly, Blazor Auto (.NET 8+), MAUI Hybrid."
            ))
        else:
            checks.append(self._warn(
                "hosting_model_missing",
                "Modelo de hospedagem não especificado. "
                "Defina: Blazor Server, WebAssembly, Auto render mode, ou Hybrid/MAUI."
            ))

        # 3. Verificar autenticação planejada
        auth = frontend.get("authentication", frontend.get("auth", "")).lower()
        valid_auth = ["individual", "azure ad", "azure b2c", "identity", "jwt", "cookie", "windows", "none"]
        if any(a in auth for a in valid_auth):
            checks.append(self._ok("authentication_planned"))
        elif auth:
            checks.append(self._warn(
                "authentication_unknown",
                f"Autenticação '{auth}' não reconhecida. "
                f"Opções Blazor: Individual Accounts, Azure AD/B2C, Windows Auth, Identity."
            ))
        else:
            checks.append(self._warn(
                "authentication_missing",
                "Autenticação não especificada. Defina se o projeto terá auth e qual tipo. "
                "Se nenhum, indique 'none' explicitamente."
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
            ("components", "Componentes Razor (.razor) com estrutura clara"),
            ("layouts", "Layouts (MainLayout, NavMenu, layouts aninhados)"),
            ("services", "Serviços com injeção de dependência (DI)"),
            ("auth", "Configuração de autenticação (AuthenticationStateProvider)"),
            ("pages", "Páginas com @page directive e roteamento"),
        ]
        for item_key, item_desc in required_plan_items:
            if item_key.lower() in planned_str:
                checks.append(self._ok(f"planned_{item_key}"))
            else:
                checks.append(self._warn(
                    f"missing_plan_{item_key}",
                    f"Item '{item_desc}' não encontrado no plano de geração."
                ))

        # 2. Verificar render mode especificado
        render_mode = (
            frontend.get("render_mode") or
            frontend.get("hosting_model") or
            plan.get("render_mode", "")
        ).lower()
        valid_modes = ["server", "webassembly", "wasm", "auto", "ssr", "interactive"]
        if any(m in render_mode for m in valid_modes):
            checks.append(self._ok("render_mode_defined"))
        else:
            checks.append(self._warn(
                "render_mode_missing",
                "Render mode não especificado no plano. "
                ".NET 8+: defina @rendermode InteractiveServer, InteractiveWebAssembly, "
                "ou InteractiveAuto para cada componente/página."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ── Fase 3: Post-Generation ────────────────────────────────────────────

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Arquivos obrigatórios
        csproj_files = self._scan_filenames(project_path, [".csproj"])
        checks.append(self._check_required_files(project_path, [
            "Program.cs", "_Imports.razor", "App.razor", "wwwroot/",
        ], label="blazor_core"))

        if not csproj_files:
            checks.append(self._fail(
                "csproj_missing",
                "Arquivo .csproj não encontrado. Projeto .NET deve ter um arquivo de projeto."
            ))
        else:
            checks.append(self._ok("csproj_exists"))

        # Verificar Components/ ou Pages/
        has_components = os.path.isdir(os.path.join(project_path, "Components"))
        has_pages = os.path.isdir(os.path.join(project_path, "Pages"))
        if has_components or has_pages:
            checks.append(self._ok("components_or_pages_exists"))
        else:
            checks.append(self._fail(
                "components_pages_missing",
                "Nem Components/ nem Pages/ encontrado. "
                "Blazor precisa de um diretório de componentes Razor."
            ))

        # Verificar Shared/ ou Layouts/
        has_shared = os.path.isdir(os.path.join(project_path, "Shared"))
        has_layouts = os.path.isdir(os.path.join(project_path, "Layouts"))
        if has_shared or has_layouts:
            checks.append(self._ok("shared_or_layouts_exists"))
        else:
            checks.append(self._warn(
                "shared_layouts_missing",
                "Nem Shared/ nem Layouts/ encontrado. "
                "Crie um diretório para layouts e componentes compartilhados."
            ))

        # 2. Verificar layout file (MainLayout.razor)
        razor_files = self._scan_filenames(project_path, [".razor"])
        layout_files = [f for f in razor_files if "layout" in f.lower() or "mainlayout" in f.lower()]
        if layout_files:
            checks.append(self._ok("layout_file_exists"))
            # Verificar estrutura do layout
            for lf in layout_files:
                full_path = os.path.join(project_path, lf)
                layout_check = self._check_file_contains(full_path, ["@Body", "NavMenu", "NavLink"])
                if layout_check.get("status") == "passed":
                    break
            else:
                checks.append(self._warn(
                    "layout_structure_simple",
                    "Layout encontrado mas sem @Body, NavMenu ou NavLink. "
                    "Verifique a estrutura mínima do layout."
                ))
        else:
            checks.append(self._fail(
                "mainlayout_missing",
                "MainLayout.razor não encontrado. "
                "Todo projeto Blazor precisa de um layout principal."
            ))

        # 3. Verificar pelo menos 3 Razor components
        component_files = [f for f in razor_files
                          if "layout" not in f.lower() and "app.razor" not in f.lower()
                          and "_imports" not in f.lower()]
        if len(component_files) >= 3:
            checks.append(self._ok("min_razor_components"))
        elif len(component_files) > 0:
            checks.append(self._warn(
                "insufficient_components",
                f"Apenas {len(component_files)} componente(s) Razor encontrado(s). Mínimo esperado: 3."
            ))
        else:
            checks.append(self._fail(
                "no_razor_components",
                "Nenhum componente .razor encontrado além dos arquivos base."
            ))

        # 4. Verificar serviços registrados no Program.cs (DI)
        program_path = os.path.join(project_path, "Program.cs")
        if os.path.exists(program_path):
            di_check = self._check_file_contains(program_path, [
                "AddScoped", "AddSingleton", "AddTransient",
                "builder.Services",
            ])
            if di_check.get("status") == "passed":
                checks.append(self._ok("di_services_registered"))
            else:
                checks.append(self._warn(
                    "di_services_missing",
                    "Nenhum registro de serviço DI (AddScoped/AddSingleton/AddTransient) "
                    "encontrado em Program.cs."
                ))
        else:
            checks.append(self._fail(
                "program_cs_missing",
                "Program.cs não encontrado — impossível verificar DI."
            ))

        # 5. Verificar autenticação configurada (se planejada)
        auth_planned = str(blueprint.get("frontend", {}).get("authentication", "")).lower()
        if auth_planned and "none" not in auth_planned:
            if os.path.exists(program_path):
                auth_check = self._check_file_contains(program_path, [
                    "AddAuthentication", "AuthenticationStateProvider",
                    "AddAuthorization", "UseAuthentication", "AuthorizeRouteView",
                    "AuthorizeView",
                ])
                if auth_check.get("status") == "passed":
                    checks.append(self._ok("authentication_configured"))
                else:
                    checks.append(self._warn(
                        "authentication_not_configured",
                        f"Autenticação '{auth_planned}' planejada mas não configurada. "
                        f"Verifique Program.cs e App.razor para AddAuthentication e AuthorizeRouteView."
                    ))
            # Verificar páginas de auth
            auth_pages = ["Login", "Logout", "Register", "Authentication"]
            auth_files = [f for f in razor_files if any(ap.lower() in f.lower() for ap in auth_pages)]
            if auth_files:
                checks.append(self._ok("auth_pages_exist"))
            else:
                checks.append(self._warn(
                    "auth_pages_missing",
                    "Páginas de autenticação (Login, Register) não encontradas. "
                    "Crie componentes para fluxo de login/registro."
                ))

        # 6. Verificar uso de parâmetros de componente
        param_usage = 0
        for rf in component_files[:20]:  # Limitar para performance
            full_path = os.path.join(project_path, rf)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if "[Parameter]" in content and "EventCallback" in content:
                    param_usage += 1
            except Exception:
                pass
        if param_usage > 0:
            checks.append(self._ok("component_parameters_used"))
        elif component_files:
            checks.append(self._warn(
                "component_parameters_missing",
                "Nenhum [Parameter] com EventCallback detectado nos componentes. "
                "Componentes Blazor devem usar parâmetros para comunicação pai-filho."
            ))

        return self._aggregate_checks(checks, "post_generation")

    # ── Fase 4: Download Gate ──────────────────────────────────────────────

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []

        # 1. Verificar appsettings estruturados
        appsettings_files = [
            "appsettings.json",
            "appsettings.Development.json",
            "appsettings.Production.json",
        ]
        found_settings = []
        missing_settings = []
        for af in appsettings_files:
            if os.path.exists(os.path.join(project_path, af)):
                found_settings.append(af)
            elif af == "appsettings.json":
                missing_settings.append(af)
            else:
                # Ambiente opcional
                pass

        if "appsettings.json" in found_settings:
            as_path = os.path.join(project_path, "appsettings.json")
            try:
                import json
                with open(as_path, "r", encoding="utf-8", errors="ignore") as f:
                    settings = json.load(f)
                has_logging = "Logging" in settings
                has_allowed_hosts = "AllowedHosts" in settings
                if has_logging and has_allowed_hosts:
                    checks.append(self._ok("appsettings_structured"))
                else:
                    missing_keys = []
                    if not has_logging:
                        missing_keys.append("Logging")
                    if not has_allowed_hosts:
                        missing_keys.append("AllowedHosts")
                    checks.append(self._warn(
                        "appsettings_incomplete",
                        f"appsettings.json incompleto. Chaves faltando: {', '.join(missing_keys)}."
                    ))
            except Exception:
                checks.append(self._fail(
                    "appsettings_unreadable",
                    "Não foi possível ler appsettings.json como JSON válido."
                ))
        else:
            checks.append(self._fail(
                "appsettings_missing",
                "appsettings.json não encontrado. Essencial para configuração .NET."
            ))

        # 2. Verificar secrets hardcoded
        secret_patterns = [
            r"(?i)ConnectionString\s*=\s*\"[^\"]{10,}\"",
            r"(?i)ApiKey\s*=\s*\"[^\"]{8,}\"",
            r"(?i)JwtKey\s*=\s*\"[^\"]{8,}\"",
            r"(?i)Password\s*=\s*\"[^\"]{3,}\"",
        ]
        cs_files = self._scan_filenames(project_path, [".cs", ".razor", ".json"])
        violations = []
        for f in cs_files:
            if "appsettings" in f.lower() or "bin" in f or "obj" in f:
                continue  # appsettings contém configs, mas verificar se não tem secrets reais
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
                f"CRÍTICO: Possíveis secrets hardcoded: {', '.join(violations[:5])}. "
                f"Use User Secrets (dev) e Azure Key Vault / appsettings com variáveis de ambiente (prod)."
            ))
        else:
            checks.append(self._ok("no_hardcoded_secrets"))

        # 3. Verificar segurança Blazor (Antiforgery, JSInterop)
        if os.path.exists(os.path.join(project_path, "Program.cs")):
            security_check = self._check_file_contains(
                os.path.join(project_path, "Program.cs"),
                ["Antiforgery", "AddAntiforgery", "X-Frame-Options",
                 "app.UseHttpsRedirection", "app.UseAuthentication",
                 "builder.WebHost.UseKestrel"]
            )
            if security_check.get("status") == "passed":
                checks.append(self._ok("blazor_security_configured"))
            else:
                checks.append(self._warn(
                    "blazor_security_incomplete",
                    "Segurança Blazor não totalmente configurada. "
                    "Adicione: UseHttpsRedirection, Antiforgery, e configure "
                    "Kestrel com HTTPS."
                ))

        # Verificar JSInterop warnings
        js_interop_files = []
        for f in cs_files:
            full_path = os.path.join(project_path, f)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if "JSInvokable" in content or "IJSRuntime" in content:
                    js_interop_files.append(f)
            except Exception:
                pass
        if js_interop_files:
            checks.append(self._warn(
                "jsinterop_usage",
                f"JSInterop usado em: {', '.join(js_interop_files[:5])}. "
                f"JSInterop é seguro quando usado corretamente, mas valide inputs "
                f"do JavaScript e evite expor dados sensíveis via JSInterop."
            ))

        # 4. Verificar HTTPS configurado
        if os.path.exists(os.path.join(project_path, "Program.cs")):
            https_check = self._check_file_contains(
                os.path.join(project_path, "Program.cs"),
                ["UseHttpsRedirection", "HttpsRedirection", "https", "HSTS",
                 "UseHsts"]
            )
            if https_check.get("status") == "passed":
                checks.append(self._ok("https_configured"))
            else:
                checks.append(self._fail(
                    "https_not_configured",
                    "Redirecionamento HTTPS não configurado. "
                    "Adicione app.UseHttpsRedirection() e HSTS em produção."
                ))

        # Verificar launchSettings.json para HTTPS
        launch_settings_path = os.path.join(project_path, "Properties", "launchSettings.json")
        if os.path.exists(launch_settings_path):
            try:
                import json
                with open(launch_settings_path, "r", encoding="utf-8", errors="ignore") as f:
                    launch = json.load(f)
                profiles = launch.get("profiles", {})
                has_https = any(
                    "https" in str(p.get("applicationUrl", "")).lower()
                    for p in profiles.values()
                )
                if has_https:
                    checks.append(self._ok("launchsettings_https"))
                else:
                    checks.append(self._warn(
                        "launchsettings_no_https",
                        "launchSettings.json não contém perfil HTTPS. "
                        "Configure applicationUrl com https://localhost."
                    ))
            except Exception:
                checks.append(self._warn(
                    "launchsettings_unreadable",
                    "Não foi possível ler Properties/launchSettings.json."
                ))
        else:
            checks.append(self._warn(
                "launchsettings_missing",
                "Properties/launchSettings.json não encontrado. "
                "Configure perfis de execução com HTTPS."
            ))

        return self._aggregate_checks(checks, "download_gate")
