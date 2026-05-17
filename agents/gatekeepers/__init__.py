"""
Stack Gatekeeper Agents — Guardian agents specialized by language, architecture, and project type.
Each gatekeeper validates at 4 phases: pre-generation, generation plan, post-generation, and download gate.
"""

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper
from agents.gatekeepers.gatekeeper_registry import GatekeeperRegistry

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

__all__ = [
    "BaseGatekeeper",
    "GatekeeperRegistry",
    # Backend
    "SpringBootGatekeeper",
    "FastAPIGatekeeper",
    "NestJSGatekeeper",
    "ExpressGatekeeper",
    "LaravelGatekeeper",
    "DotNetGatekeeper",
    # Frontend
    "AngularGatekeeper",
    "ReactGatekeeper",
    "NextJSGatekeeper",
    "VueGatekeeper",
    "BlazorGatekeeper",
    # Special
    "StaticSiteGatekeeper",
    "AutomationGatekeeper",
    "AIAgentsGatekeeper",
]
