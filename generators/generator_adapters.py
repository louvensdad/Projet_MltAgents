from __future__ import annotations

from typing import Dict

from backend.config.implemented_stacks import IMPLEMENTED_STACKS
from stack_registry.registry import StackRegistry


_STACK_NAMES: Dict[str, str] = {
    "spring_boot": "Java + Spring Boot",
    "fastapi": "Python + FastAPI",
    "nestjs": "Node.js + NestJS",
    "express": "Node.js + Express",
    "laravel": "PHP + Laravel",
    "dotnet": "C# + ASP.NET Core",
    "angular": "Angular",
    "react": "React",
    "nextjs": "Next.js",
    "vue": "Vue",
    "blazor": "Blazor",
    "automation": "Automation",
    "ai_agents": "AI Agents",
    "static_site": "Static Site",
}

STACK_NAMES: Dict[str, str] = {}
STACK_STATUS: Dict[str, str] = {}

for stack_id, data in IMPLEMENTED_STACKS.items():
    canonical = StackRegistry.normalize_stack_id(stack_id)
    STACK_NAMES[canonical] = _STACK_NAMES.get(canonical, data.get("name", canonical))
    STACK_STATUS[canonical] = data.get("status", "planned")

for stack_id, name in _STACK_NAMES.items():
    STACK_NAMES.setdefault(stack_id, name)
    STACK_STATUS.setdefault(stack_id, "planned")

