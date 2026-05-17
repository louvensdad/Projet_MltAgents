"""
GatekeeperRegistry — Mapeia identificadores de stack para os gatekeepers corretos.
Fornece factory method para instanciar o gatekeeper apropriado.
"""

from typing import Dict, Type, Optional

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class GatekeeperRegistry:
    """Registry/factory que mapeia stack_id → classe do gatekeeper."""

    _gatekeepers: Dict[str, Type[BaseGatekeeper]] = {}
    _initialized = False

    @classmethod
    def _ensure_initialized(cls):
        """Lazy-load dos gatekeepers para evitar imports circulares."""
        if cls._initialized:
            return

        # Backend gatekeepers
        from agents.gatekeepers.springboot_gatekeeper import SpringBootGatekeeper
        from agents.gatekeepers.fastapi_gatekeeper import FastAPIGatekeeper
        from agents.gatekeepers.nestjs_gatekeeper import NestJSGatekeeper
        from agents.gatekeepers.express_gatekeeper import ExpressGatekeeper
        from agents.gatekeepers.laravel_gatekeeper import LaravelGatekeeper
        from agents.gatekeepers.dotnet_gatekeeper import DotNetGatekeeper

        # Frontend gatekeepers
        from agents.gatekeepers.angular_gatekeeper import AngularGatekeeper
        from agents.gatekeepers.react_gatekeeper import ReactGatekeeper
        from agents.gatekeepers.nextjs_gatekeeper import NextJSGatekeeper
        from agents.gatekeepers.vue_gatekeeper import VueGatekeeper
        from agents.gatekeepers.blazor_gatekeeper import BlazorGatekeeper

        # Special gatekeepers
        from agents.gatekeepers.static_site_gatekeeper import StaticSiteGatekeeper
        from agents.gatekeepers.automation_gatekeeper import AutomationGatekeeper
        from agents.gatekeepers.ai_agents_gatekeeper import AIAgentsGatekeeper

        # ── Backend stacks ─────────────────────────────────────────────
        cls._gatekeepers["java_springboot"] = SpringBootGatekeeper
        cls._gatekeepers["springboot"] = SpringBootGatekeeper
        cls._gatekeepers["spring_boot"] = SpringBootGatekeeper
        cls._gatekeepers["java"] = SpringBootGatekeeper
        cls._gatekeepers["python_fastapi"] = FastAPIGatekeeper
        cls._gatekeepers["fastapi"] = FastAPIGatekeeper
        cls._gatekeepers["python"] = FastAPIGatekeeper
        cls._gatekeepers["node_nestjs"] = NestJSGatekeeper
        cls._gatekeepers["nestjs"] = NestJSGatekeeper
        cls._gatekeepers["nest"] = NestJSGatekeeper
        cls._gatekeepers["node_express"] = ExpressGatekeeper
        cls._gatekeepers["express"] = ExpressGatekeeper
        cls._gatekeepers["php_laravel"] = LaravelGatekeeper
        cls._gatekeepers["laravel"] = LaravelGatekeeper
        cls._gatekeepers["php"] = LaravelGatekeeper
        cls._gatekeepers["dotnet_aspnetcore"] = DotNetGatekeeper
        cls._gatekeepers["dotnet"] = DotNetGatekeeper
        cls._gatekeepers["aspnet"] = DotNetGatekeeper
        cls._gatekeepers["asp.net"] = DotNetGatekeeper
        cls._gatekeepers["c#"] = DotNetGatekeeper

        # ── Frontend stacks ────────────────────────────────────────────
        cls._gatekeepers["angular"] = AngularGatekeeper
        cls._gatekeepers["react"] = ReactGatekeeper
        cls._gatekeepers["nextjs"] = NextJSGatekeeper
        cls._gatekeepers["next.js"] = NextJSGatekeeper
        cls._gatekeepers["next"] = NextJSGatekeeper
        cls._gatekeepers["vue"] = VueGatekeeper
        cls._gatekeepers["vuejs"] = VueGatekeeper
        cls._gatekeepers["blazor"] = BlazorGatekeeper

        # ── Special stacks ─────────────────────────────────────────────
        cls._gatekeepers["static_site"] = StaticSiteGatekeeper
        cls._gatekeepers["static"] = StaticSiteGatekeeper
        cls._gatekeepers["static site"] = StaticSiteGatekeeper
        cls._gatekeepers["static html"] = StaticSiteGatekeeper
        cls._gatekeepers["automation"] = AutomationGatekeeper
        cls._gatekeepers["ai_agents"] = AIAgentsGatekeeper
        cls._gatekeepers["multi_agent"] = AIAgentsGatekeeper

        cls._initialized = True

    @classmethod
    def get_gatekeeper(cls, stack_id: str) -> Optional[BaseGatekeeper]:
        """Retorna instância do gatekeeper para o stack_id ou None se não encontrado."""
        cls._ensure_initialized()

        # Normaliza o stack_id
        normalized = stack_id.lower().strip().replace(" + ", "_").replace(" ", "_")

        # Busca exata primeiro
        gatekeeper_class = cls._gatekeepers.get(normalized)

        # Fallback: busca parcial (ex: "Python + FastAPI" → contém "fastapi")
        if gatekeeper_class is None:
            for key, gk_class in cls._gatekeepers.items():
                if key in normalized or normalized in key:
                    gatekeeper_class = gk_class
                    break

        if gatekeeper_class:
            return gatekeeper_class()

        print(f"[GatekeeperRegistry] Nenhum gatekeeper encontrado para stack: {stack_id}")
        return None

    @classmethod
    def get_backend_gatekeeper(cls, backend_stack: str) -> Optional[BaseGatekeeper]:
        """Atalho para obter gatekeeper de backend."""
        return cls.get_gatekeeper(backend_stack)

    @classmethod
    def get_frontend_gatekeeper(cls, frontend_stack: str) -> Optional[BaseGatekeeper]:
        """Atalho para obter gatekeeper de frontend."""
        return cls.get_gatekeeper(frontend_stack)

    @classmethod
    def list_all(cls) -> Dict[str, str]:
        """Lista todos os gatekeepers registrados com seus nomes."""
        cls._ensure_initialized()
        seen = set()
        result = {}
        for key, gk_class in cls._gatekeepers.items():
            instance = gk_class()
            if instance.name not in seen:
                result[key] = instance.name
                seen.add(instance.name)
        return result

    @classmethod
    def register(cls, stack_id: str, gatekeeper_class: Type[BaseGatekeeper]):
        """Registra manualmente um gatekeeper customizado."""
        cls._ensure_initialized()
        cls._gatekeepers[stack_id.lower().strip()] = gatekeeper_class
