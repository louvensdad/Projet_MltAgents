from __future__ import annotations

from copy import deepcopy
from typing import Any

from backend.config.stack_profiles import STACK_PROFILES

from .template_quality_gate import TemplateQualityGate


def _norm(value: str) -> str:
    return value.strip().lower().replace(" ", "-").replace("_", "-")


def _stack_profile(stack_profile_id: str) -> dict[str, Any]:
    return deepcopy(STACK_PROFILES.get(stack_profile_id, {}))


def _preview_html(template: dict[str, Any]) -> str:
    title = template["name"]
    domain = template["business_domain"].replace("_", " ").title()
    preview_type = template["preview_type"]

    if preview_type == "static_site":
        return f"""
        <div style="padding:24px;border-radius:20px;background:linear-gradient(135deg,#020617,#0f172a);color:#e2e8f0;font-family:Inter,Arial,sans-serif">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <strong style="letter-spacing:.18em;text-transform:uppercase;color:#67e8f9;font-size:11px">{domain}</strong>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(34,197,94,.15);color:#bbf7d0;font-size:12px">SEO-first</span>
          </div>
          <h1 style="font-size:28px;line-height:1.1;margin:0 0 10px 0">{title}</h1>
          <p style="margin:0 0 18px 0;color:#94a3b8">Hero, CTA, proof and content blocks wired for conversion.</p>
          <div style="display:flex;gap:10px;margin-bottom:18px">
            <div style="padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.05)">Primary CTA</div>
            <div style="padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.05)">Newsletter</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div style="height:66px;border-radius:14px;background:rgba(255,255,255,.05)"></div>
            <div style="height:66px;border-radius:14px;background:rgba(255,255,255,.07)"></div>
            <div style="height:66px;border-radius:14px;background:rgba(255,255,255,.05)"></div>
          </div>
        </div>
        """

    if preview_type == "marketplace":
        return f"""
        <div style="padding:24px;border-radius:20px;background:linear-gradient(135deg,#080f1f,#172554);color:#eff6ff;font-family:Inter,Arial,sans-serif">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <strong style="letter-spacing:.18em;text-transform:uppercase;color:#fca5a5;font-size:11px">Marketplace</strong>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(239,68,68,.15);color:#fecaca;font-size:12px">Commerce Flow</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px;height:110px">Catalog</div>
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px;height:110px">Seller Portal</div>
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px;height:110px">Checkout</div>
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px;height:110px">Payments</div>
          </div>
        </div>
        """

    if preview_type == "ai_saas":
        return f"""
        <div style="padding:24px;border-radius:20px;background:linear-gradient(135deg,#0f172a,#111827);color:#e0f2fe;font-family:Inter,Arial,sans-serif">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <strong style="letter-spacing:.18em;text-transform:uppercase;color:#67e8f9;font-size:11px">AI Control Plane</strong>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(14,165,233,.15);color:#bae6fd;font-size:12px">Prompt Master</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px">Agents</div>
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px">Workflow</div>
            <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px">Billing</div>
          </div>
          <div style="height:12px"></div>
          <div style="border-radius:16px;background:rgba(255,255,255,.05);padding:14px">Usage metering, vector memory and traceable prompts.</div>
        </div>
        """

    if preview_type == "dashboard":
        return f"""
        <div style="padding:24px;border-radius:20px;background:linear-gradient(135deg,#020617,#1e293b);color:#f8fafc;font-family:Inter,Arial,sans-serif">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
            <strong style="letter-spacing:.18em;text-transform:uppercase;color:#c4b5fd;font-size:11px">{title}</strong>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(139,92,246,.15);color:#ddd6fe;font-size:12px">Realtime</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div style="border-radius:14px;background:rgba(255,255,255,.05);padding:14px">KPI 1</div>
            <div style="border-radius:14px;background:rgba(255,255,255,.05);padding:14px">KPI 2</div>
            <div style="border-radius:14px;background:rgba(255,255,255,.05);padding:14px">KPI 3</div>
          </div>
          <div style="height:12px"></div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
            <div style="height:54px;border-radius:12px;background:rgba(255,255,255,.05)"></div>
            <div style="height:54px;border-radius:12px;background:rgba(255,255,255,.08)"></div>
            <div style="height:54px;border-radius:12px;background:rgba(255,255,255,.05)"></div>
            <div style="height:54px;border-radius:12px;background:rgba(255,255,255,.08)"></div>
          </div>
        </div>
        """

    return f"""
    <div style="padding:24px;border-radius:20px;background:linear-gradient(135deg,#07111f,#111827);color:#e5eefc;font-family:Inter,Arial,sans-serif">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <strong style="letter-spacing:.18em;text-transform:uppercase;color:#7dd3fc;font-size:11px">{title}</strong>
        <span style="padding:6px 10px;border-radius:999px;background:rgba(6,182,212,.15);color:#cffafe;font-size:12px">Architecture</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
        <div style="height:82px;border-radius:14px;background:rgba(255,255,255,.05);padding:12px">Client</div>
        <div style="height:82px;border-radius:14px;background:rgba(255,255,255,.05);padding:12px">Gateway</div>
        <div style="height:82px;border-radius:14px;background:rgba(255,255,255,.05);padding:12px">Services</div>
        <div style="height:82px;border-radius:14px;background:rgba(255,255,255,.05);padding:12px">Database</div>
        <div style="height:82px;border-radius:14px;background:rgba(255,255,255,.05);padding:12px">Queue</div>
      </div>
    </div>
    """


def _prompt_seed(template: dict[str, Any]) -> str:
    modules = ", ".join(template["modules"])
    files = ", ".join(template["required_files"])
    stack = " + ".join(template["stack"])
    return (
        f"Prompt Master seed for {template['name']}\n"
        f"Stack: {stack}\n"
        f"Architecture: {template['architecture']}\n"
        f"Business domain: {template['business_domain']}\n"
        f"Modules: {modules}\n"
        f"Required files: {files}\n"
        f"Gatekeeper: {template['gatekeeper']}\n"
        f"Rules: no mock preview, no bypass, no orphan generator, no hardcoded routes.\n"
        f"Follow the official pipeline: Prompt Master -> Validator -> Docs -> Gatekeeper -> Project Runner -> Quality Gate -> Security Gate -> Download."
    )


def _blueprint(template: dict[str, Any]) -> dict[str, Any]:
    return {
        "overview": template["description"],
        "project_type": template["project_type"],
        "stack_profile_id": template["stack_profile_id"],
        "architecture": template["architecture"],
        "business_domain": template["business_domain"],
        "modules": template["modules"],
        "features": template["features"],
        "required_files": template["required_files"],
        "security_requirements": template["security_requirements"],
        "quality_gates": [
            "template_quality_gate",
            "prompt_validator",
            "documentation_engine",
            "gatekeeper",
            "security_gate",
            "quality_gate",
        ],
        "architecture_flow": template["architecture_flow"],
        "file_tree": template["file_tree"],
        "stack_profile": template["stack_profile"],
    }


def _default_answers(template: dict[str, Any]) -> dict[str, Any]:
    return {
        "project_name": template["name"],
        "project_description": template["description"],
        "project_type": template["project_type"],
        "stack_profile_id": template["stack_profile_id"],
        "backend_stack": template.get("backend_stack"),
        "frontend_stack": template.get("frontend_stack"),
        "selected_versions": template.get("selected_versions", {}),
        "selected_stack_options": template.get("selected_stack_options", {}),
        "confirmed_entities": template.get("confirmed_entities", []),
        "confirmed_features": template["features"],
        "confirmed_business_rules": template.get("confirmed_business_rules", []),
        "ai_generation_mode": "local_build_90",
    }


def _create_payload(template: dict[str, Any], overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    answers = dict(_default_answers(template))
    overrides = overrides or {}
    for key in ("project_name", "project_description", "backend_stack", "frontend_stack", "ai_generation_mode"):
        value = overrides.get(key)
        if value:
            answers[key] = value

    selected_versions = dict(answers.get("selected_versions") or {})
    selected_versions.update(overrides.get("selected_versions") or {})

    selected_stack_options = dict(answers.get("selected_stack_options") or {})
    selected_stack_options.update(overrides.get("selected_stack_options") or {})

    project_name = str(answers.get("project_name") or template["name"])

    return {
        "project_type": template["project_type"],
        "stack_profile_id": template["stack_profile_id"],
        "project_name": project_name,
        "project_description": str(answers.get("project_description") or template["description"]),
        "backend_stack": answers.get("backend_stack") or template.get("backend_stack"),
        "frontend_stack": answers.get("frontend_stack") or template.get("frontend_stack"),
        "selected_versions": selected_versions,
        "selected_stack_options": selected_stack_options,
        "confirmed_entities": answers.get("confirmed_entities") or template.get("confirmed_entities", []),
        "confirmed_features": template["features"],
        "confirmed_business_rules": answers.get("confirmed_business_rules") or template.get("confirmed_business_rules", []),
        "template_id": template["id"],
        "template_name": template["name"],
        "template_category": template["category"],
        "ai_generation_mode": answers.get("ai_generation_mode") or "local_build_90",
    }


def _public_summary(template: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": template["id"],
        "slug": template["slug"],
        "name": template["name"],
        "category": template["category"],
        "level": template["level"],
        "stack": template["stack"],
        "architecture": template["architecture"],
        "description": template["description"],
        "business_domain": template["business_domain"],
        "modules": template["modules"],
        "features": template["features"],
        "required_files": template["required_files"],
        "gatekeeper": template["gatekeeper"],
        "preview_type": template["preview_type"],
        "generation_supported": template["generation_supported"],
        "status": template["status"],
        "quality_score": template["quality_score"],
        "complexity": template["complexity"],
        "stack_profile_id": template["stack_profile_id"],
        "preview_html": template["preview_html"],
        "image": template["image"],
        "demo_images": template["demo_images"],
        "demo_data": template["demo_data"],
        "blueprint": template["blueprint"],
        "prompt_master_seed": template["prompt_master_seed"],
        "stack_profile": template["stack_profile"],
    }


def _enrich_template(template: dict[str, Any]) -> dict[str, Any]:
    enriched = deepcopy(template)
    enriched["slug"] = template["id"]
    enriched["stack_profile"] = _stack_profile(template["stack_profile_id"])
    enriched["blueprint"] = _blueprint(enriched)
    enriched["prompt_master_seed"] = _prompt_seed(enriched)
    enriched["preview_html"] = _preview_html(enriched)
    enriched["default_answers"] = _default_answers(enriched)
    enriched["create_payload"] = _create_payload(enriched)
    enriched["required_questions"] = [
        {"key": "project_name", "label": "Project name", "required": True},
        {"key": "project_description", "label": "Project description", "required": True},
    ]

    quality = TemplateQualityGate().evaluate(enriched)
    enriched["quality_gate"] = quality
    enriched["quality_score"] = quality["score"]
    enriched["status"] = quality["status"]
    enriched["architecture_label"] = {
        "microservices": "Microservices",
        "modular_monolith": "Modular Monolith",
        "fullstack_modular": "Fullstack Modular",
        "ai_platform": "AI Platform",
        "seo_first": "SEO First",
        "realtime": "Realtime",
    }.get(enriched["architecture"], enriched["architecture"].replace("_", " ").title())
    enriched["wizard_route"] = f"/create/{enriched['stack_profile_id']}"
    return enriched


def _template_catalog() -> list[dict[str, Any]]:
    raw_templates = [
        {
            "id": "banking-api-platform",
            "name": "Banking API Platform",
            "category": "enterprise_backend",
            "level": "enterprise",
            "stack": ["spring_boot", "postgresql", "kafka", "redis", "docker"],
            "architecture": "microservices",
            "description": "Core bancario com autenticação, auditoria, eventos, filas e observabilidade pronta para compliance.",
            "business_domain": "banking",
            "modules": ["accounts", "transactions", "audit", "auth", "notifications"],
            "features": ["JWT", "RBAC", "audit_logs", "event_streaming", "rate_limit"],
            "required_files": ["src/main/java", "src/main/resources", "Dockerfile", "docker-compose.yml", "README.md"],
            "gatekeeper": "SpringBootGatekeeper",
            "preview_type": "backend_architecture",
            "demo_data": {"nodes": ["Client", "Gateway", "Accounts", "Transactions", "Audit", "Database", "Queue", "Monitoring"]},
            "generation_supported": True,
            "project_type": "backend",
            "backend_stack": "Spring Boot",
            "frontend_stack": None,
            "stack_profile_id": "spring_boot",
            "complexity": "high",
            "selected_versions": {"Java": "21", "Spring Boot": "3.3"},
            "selected_stack_options": {"Architecture": ["microservices"], "Messaging": ["kafka"], "Database": ["postgresql"]},
            "confirmed_entities": ["Account", "Transaction", "AuditEvent", "User"],
            "security_requirements": ["jwt", "rbac", "audit_logs", "rate_limit", "observability"],
            "architecture_flow": ["Client", "Gateway", "Auth Service", "Accounts", "Transactions", "Audit", "PostgreSQL", "Kafka", "Redis", "Monitoring"],
            "file_tree": ["src/main/java/com/banking", "src/main/resources", "src/test/java", "docker-compose.yml", "README.md"],
            "preview_summary": "Banking microservices with gateway, audit and event streaming.",
            "image": "/templates/banking-api-platform/cover.svg",
            "demo_images": [
                "/templates/banking-api-platform/dashboard.svg",
                "/templates/banking-api-platform/architecture.svg",
            ],
        },
        {
            "id": "erp-suite",
            "name": "ERP Suite",
            "category": "enterprise_backend",
            "level": "enterprise",
            "stack": ["spring_boot", "react", "postgresql", "redis", "docker"],
            "architecture": "modular_monolith",
            "description": "ERP modular com usuários, estoque, financeiro, vendas e relatórios com uma base monolítica disciplinada.",
            "business_domain": "erp",
            "modules": ["users", "inventory", "finance", "sales", "reports"],
            "features": ["RBAC", "dashboard", "exports", "workflow_automation", "caching"],
            "required_files": ["apps/api", "apps/web", "Dockerfile", "compose.yml", "README.md"],
            "gatekeeper": "SpringBootGatekeeper",
            "preview_type": "dashboard",
            "demo_data": {"kpis": ["Revenue", "Open Invoices", "Stock Alerts", "Orders"], "bars": [90, 65, 40, 78]},
            "generation_supported": True,
            "project_type": "backend",
            "backend_stack": "Spring Boot",
            "frontend_stack": "React",
            "stack_profile_id": "spring_boot",
            "complexity": "high",
            "selected_versions": {"Java": "21", "Spring Boot": "3.3"},
            "selected_stack_options": {"Architecture": ["modular monolith"], "Frontend": ["react"], "Database": ["postgresql"]},
            "confirmed_entities": ["User", "InventoryItem", "Invoice", "SaleOrder"],
            "security_requirements": ["rbac", "audit_logs", "observability", "rate_limit"],
            "architecture_flow": ["Frontend", "API", "Modules", "Database", "Redis", "Monitoring"],
            "file_tree": ["apps/api", "apps/web", "src/modules", "docs", "README.md"],
            "preview_summary": "ERP control center with finance and stock KPIs.",
            "image": "/templates/erp-suite/cover.svg",
            "demo_images": [
                "/templates/erp-suite/dashboard.svg",
                "/templates/erp-suite/architecture.svg",
            ],
        },
        {
            "id": "marketplace-platform",
            "name": "Marketplace Platform",
            "category": "commerce",
            "level": "enterprise",
            "stack": ["nestjs", "nextjs", "postgresql", "redis", "docker"],
            "architecture": "fullstack_modular",
            "description": "Marketplace com catálogo, sellers, checkout, pagamentos e pedidos em uma base modular fullstack.",
            "business_domain": "commerce",
            "modules": ["catalog", "sellers", "checkout", "payments", "orders"],
            "features": ["search", "cart", "payment_webhooks", "seller_portal", "analytics"],
            "required_files": ["apps/api", "apps/web", "packages/shared", "Dockerfile", "README.md"],
            "gatekeeper": "NestJSGatekeeper",
            "preview_type": "marketplace",
            "demo_data": {"products": ["Laptop", "Keyboard", "Headset", "Mouse"], "sellers": 12},
            "generation_supported": True,
            "project_type": "backend",
            "backend_stack": "NestJS",
            "frontend_stack": "Next.js",
            "stack_profile_id": "nestjs",
            "complexity": "high",
            "selected_versions": {"Node": "20", "NestJS": "10", "Next.js": "14"},
            "selected_stack_options": {"Architecture": ["modular monolith"], "Frontend": ["nextjs"], "Database": ["postgresql"]},
            "confirmed_entities": ["Product", "Seller", "Order", "Payment"],
            "security_requirements": ["jwt", "rbac", "rate_limit", "webhook_validation"],
            "architecture_flow": ["Client", "API Gateway", "Catalog", "Payments", "Orders", "PostgreSQL", "Redis", "Monitoring"],
            "file_tree": ["apps/api", "apps/web", "packages/ui", "docs", "README.md"],
            "preview_summary": "Commerce showcase with checkout and seller operations.",
            "image": "/templates/marketplace-platform/cover.svg",
            "demo_images": [
                "/templates/marketplace-platform/store.svg",
                "/templates/marketplace-platform/checkout.svg",
            ],
        },
        {
            "id": "ai-saas-control-plane",
            "name": "AI SaaS Control Plane",
            "category": "ai_products",
            "level": "enterprise",
            "stack": ["fastapi", "redis", "vector-db", "react", "docker"],
            "architecture": "ai_platform",
            "description": "SaaS de IA com agentes, prompts, workflows, billing e uso rastreável para operação premium.",
            "business_domain": "ai_saas",
            "modules": ["agents", "prompts", "workflows", "billing", "usage"],
            "features": ["prompt_master", "agent_boost", "traceability", "vector_memory", "usage_metering"],
            "required_files": ["app", "workers", "frontend", "Dockerfile", "README.md"],
            "gatekeeper": "FastAPIGatekeeper",
            "preview_type": "ai_saas",
            "demo_data": {"agents": ["Prompt", "Architecture", "Security", "Docs"], "metrics": [72, 88, 65]},
            "generation_supported": True,
            "project_type": "backend",
            "backend_stack": "FastAPI",
            "frontend_stack": "React",
            "stack_profile_id": "fastapi",
            "complexity": "high",
            "selected_versions": {"Python": "3.12", "FastAPI": "latest", "React": "18"},
            "selected_stack_options": {"Architecture": ["async api"], "Workers": ["celery"], "Database": ["postgresql"]},
            "confirmed_entities": ["Agent", "Workflow", "Prompt", "UsageEvent"],
            "security_requirements": ["jwt", "rate_limit", "observability", "secret_scanner"],
            "architecture_flow": ["Client", "API", "Agents", "Redis", "Vector DB", "Workers", "PostgreSQL", "Monitoring"],
            "file_tree": ["app", "workers", "frontend", "tests", "README.md"],
            "preview_summary": "Agent control plane with workflow and usage tracking.",
            "image": "/templates/ai-saas-control-plane/cover.svg",
            "demo_images": [
                "/templates/ai-saas-control-plane/agents.svg",
                "/templates/ai-saas-control-plane/workflow.svg",
            ],
        },
        {
            "id": "static-brand-site",
            "name": "Static Brand Site",
            "category": "marketing",
            "level": "ready",
            "stack": ["static_site", "nextjs", "seo", "analytics", "docker"],
            "architecture": "seo_first",
            "description": "Landing page premium com SEO, analytics, conteúdo, animações e formulários.",
            "business_domain": "marketing",
            "modules": ["hero", "services", "faq", "contact", "blog", "analytics"],
            "features": ["seo", "cms", "newsletter", "forms", "motion"],
            "required_files": ["app", "components", "content", "public", "README.md"],
            "gatekeeper": "StaticSiteGatekeeper",
            "preview_type": "static_site",
            "demo_data": {"sections": ["Hero", "Features", "FAQ", "Contact", "Blog"], "cta": "Start now"},
            "generation_supported": True,
            "project_type": "frontend",
            "backend_stack": None,
            "frontend_stack": "Next.js",
            "stack_profile_id": "static_site",
            "complexity": "medium",
            "selected_versions": {"HTML": "5", "CSS": "3", "JavaScript": "ES2023"},
            "selected_stack_options": {"Sections": ["hero", "services", "faq", "contact"], "SEO": ["metadata", "sitemap"]},
            "confirmed_entities": ["LandingPage", "ContentBlock", "ContactForm"],
            "security_requirements": ["csp", "form_validation", "link_protection"],
            "architecture_flow": ["Browser", "Static Assets", "Forms", "Analytics"],
            "file_tree": ["app", "components", "content", "public", "README.md"],
            "preview_summary": "SEO-first landing page with conversion blocks.",
            "image": "/templates/static-brand-site/cover.svg",
            "demo_images": [
                "/templates/static-brand-site/landing.svg",
                "/templates/static-brand-site/mobile.svg",
            ],
        },
        {
            "id": "realtime-analytics-platform",
            "name": "Realtime Analytics Platform",
            "category": "data",
            "level": "enterprise",
            "stack": ["fastapi", "websocket", "redis", "postgresql", "docker"],
            "architecture": "realtime",
            "description": "Plataforma de analytics em tempo real com eventos, dashboards, relatórios e alertas.",
            "business_domain": "analytics",
            "modules": ["events", "dashboards", "reports", "alerts", "streaming"],
            "features": ["websocket_streams", "realtime_metrics", "alerts", "exports", "observability"],
            "required_files": ["app", "workers", "frontend", "Dockerfile", "README.md"],
            "gatekeeper": "FastAPIGatekeeper",
            "preview_type": "dashboard",
            "demo_data": {"events_per_minute": 1240, "alerts": 8, "charts": ["throughput", "latency", "errors"]},
            "generation_supported": True,
            "project_type": "backend",
            "backend_stack": "FastAPI",
            "frontend_stack": "React",
            "stack_profile_id": "fastapi",
            "complexity": "high",
            "selected_versions": {"Python": "3.12", "FastAPI": "latest", "React": "18"},
            "selected_stack_options": {"Realtime": ["websocket"], "Cache": ["redis"], "Database": ["postgresql"]},
            "confirmed_entities": ["Event", "Metric", "Alert", "Report"],
            "security_requirements": ["rate_limit", "auth", "observability", "audit_log"],
            "architecture_flow": ["Client", "Gateway", "API", "Redis", "Queue", "Workers", "PostgreSQL", "Dashboard"],
            "file_tree": ["app", "workers", "frontend", "tests", "README.md"],
            "preview_summary": "Realtime stream with alerts and dashboard KPIs.",
            "image": "/templates/realtime-analytics-platform/cover.svg",
            "demo_images": [
                "/templates/realtime-analytics-platform/dashboard.svg",
                "/templates/realtime-analytics-platform/alerts.svg",
            ],
        },
    ]

    return [_enrich_template(template) for template in raw_templates]


class TemplateRegistry:
    def __init__(self) -> None:
        self._templates = _template_catalog()
        self._by_id = {template["id"]: template for template in self._templates}
        self._by_slug = {template["slug"]: template for template in self._templates}
        self._by_normalized = {_norm(template["id"]): template for template in self._templates}

    def list_templates(self) -> list[dict[str, Any]]:
        return [deepcopy(template) for template in self._templates]

    def list_public_templates(self) -> list[dict[str, Any]]:
        return [self._summary(template) for template in self._templates]

    def get_template(self, template_id: str) -> dict[str, Any]:
        template = self._resolve(template_id)
        return deepcopy(template)

    def get_preview(self, template_id: str) -> dict[str, Any]:
        template = self._resolve(template_id)
        return {
            "template_id": template["id"],
            "preview_type": template["preview_type"],
            "preview_html": template["preview_html"],
            "image": template["image"],
            "demo_images": deepcopy(template["demo_images"]),
            "demo_data": deepcopy(template["demo_data"]),
            "summary": template["preview_summary"],
            "template": self._summary(template),
        }

    def get_blueprint(self, template_id: str) -> dict[str, Any]:
        template = self._resolve(template_id)
        return {
            "template_id": template["id"],
            "blueprint": deepcopy(template["blueprint"]),
            "prompt_master_seed": template["prompt_master_seed"],
            "stack_profile": deepcopy(template["stack_profile"]),
            "template": self._summary(template),
        }

    def prepare_generation(self, template_id: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        template = self._resolve(template_id)
        payload = payload or {}
        default_answers = deepcopy(template["default_answers"])
        default_answers.update({k: v for k, v in payload.items() if v not in (None, "", [], {})})

        required_questions_missing = []
        for field in template["required_questions"]:
            key = field["key"]
            if not default_answers.get(key):
                required_questions_missing.append(key)

        create_payload = _create_payload(template, default_answers)
        complete = len(required_questions_missing) == 0 and template["generation_supported"]

        return {
            "template_id": template["id"],
            "template": self._summary(template),
            "stack_id": template["stack_profile_id"],
            "project_type": template["project_type"],
            "generation_supported": template["generation_supported"],
            "prompt_master": {
                "seed": template["prompt_master_seed"],
                "stack": template["stack"],
                "architecture": template["architecture"],
                "gatekeeper": template["gatekeeper"],
                "quality_requirements": template["security_requirements"],
            },
            "blueprint": deepcopy(template["blueprint"]),
            "stack_profile": deepcopy(template["stack_profile"]),
            "default_answers": default_answers,
            "required_questions_missing": required_questions_missing,
            "create_payload": create_payload,
            "direct_generate": complete,
            "redirect_url": f"{template['wizard_route']}?template_id={template['id']}",
            "next_route": create_payload if complete else {"route": template["wizard_route"], "template_id": template["id"]},
        }

    def list_featured(self) -> list[dict[str, Any]]:
        return [self._summary(template) for template in self._templates if template["status"] == "ready"][:4]

    def list_by_category(self) -> list[dict[str, Any]]:
        grouped: dict[str, list[dict[str, Any]]] = {}
        for template in self._templates:
            grouped.setdefault(template["category"], []).append(self._summary(template))
        return [
            {
                "category": category,
                "description": f"Templates reais para {category.replace('_', ' ')}.",
                "templates": templates,
            }
            for category, templates in grouped.items()
        ]

    def stats(self) -> dict[str, Any]:
        return {
            "total": len(self._templates),
            "ready": sum(1 for template in self._templates if template["status"] == "ready"),
            "partial": sum(1 for template in self._templates if template["status"] == "partial"),
            "planned": sum(1 for template in self._templates if template["status"] == "planned"),
        }

    def _resolve(self, template_id: str) -> dict[str, Any]:
        normalized = _norm(template_id)
        template = self._by_id.get(template_id) or self._by_slug.get(template_id) or self._by_normalized.get(normalized)
        if not template:
            raise KeyError(f"Template '{template_id}' not found")
        return template

    def _summary(self, template: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": template["id"],
            "slug": template["slug"],
            "stack_id": template["stack_profile_id"],
            "project_type": template["project_type"],
            "name": template["name"],
            "category": template["category"],
            "level": template["level"],
            "architecture": template["architecture"],
            "business_domain": template["business_domain"],
            "stack": template["stack"],
            "modules": template["modules"],
            "features": template["features"],
            "required_files": template["required_files"],
            "gatekeeper": template["gatekeeper"],
            "preview_type": template["preview_type"],
            "preview_summary": template["preview_summary"],
            "status": template["status"],
            "quality_score": template["quality_score"],
            "complexity": template["complexity"],
            "generation_supported": template["generation_supported"],
            "preview_html": template["preview_html"],
            "image": template["image"],
            "demo_images": deepcopy(template["demo_images"]),
            "demo_data": deepcopy(template["demo_data"]),
            "default_answers": deepcopy(template["default_answers"]),
            "blueprint": deepcopy(template["blueprint"]),
            "prompt_master_seed": template["prompt_master_seed"],
            "stack_profile_id": template["stack_profile_id"],
            "stack_profile": deepcopy(template["stack_profile"]),
            "wizard_route": template["wizard_route"],
        }
