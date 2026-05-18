from __future__ import annotations

from typing import Any, Dict, Type

from stack_registry.registry import StackRegistry

from agents.stack.ai_agents_agent import AIAgentsAgent
from agents.stack.angular_agent import AngularAgent
from agents.stack.automation_agent import AutomationAgent
from agents.stack.blazor_agent import BlazorAgent
from agents.stack.dotnet_agent import DotnetAgent
from agents.stack.express_agent import ExpressAgent
from agents.stack.fast_a_p_i_agent import FastAPIAgent
from agents.stack.laravel_agent import LaravelAgent
from agents.stack.nest_j_s_agent import NestJSAgent
from agents.stack.next_j_s_agent import NextJSAgent
from agents.stack.react_agent import ReactAgent
from agents.stack.spring_boot_agent import SpringBootAgent
from agents.stack.static_site_agent import StaticSiteAgent
from agents.stack.vue_agent import VueAgent


STACK_AGENT_REGISTRY: Dict[str, Type] = {
    "static_site": StaticSiteAgent,
    "spring_boot": SpringBootAgent,
    "fastapi": FastAPIAgent,
    "nestjs": NestJSAgent,
    "express": ExpressAgent,
    "laravel": LaravelAgent,
    "dotnet": DotnetAgent,
    "angular": AngularAgent,
    "react": ReactAgent,
    "nextjs": NextJSAgent,
    "vue": VueAgent,
    "blazor": BlazorAgent,
    "automation": AutomationAgent,
    "ai_agents": AIAgentsAgent,
}


def run_stack_agent(stack_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
    canonical = StackRegistry.normalize_stack_id(stack_id)
    agent_class = STACK_AGENT_REGISTRY.get(canonical)
    if not agent_class:
        context.setdefault("stack_agent_errors", []).append(f"Stack agent ausente para {canonical}.")
        return context
    agent = agent_class()
    return agent.execute(context)
