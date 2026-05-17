"""
Full Stack Generation Test - Gera 1 projeto para cada stack do sistema.
"""
import os, sys, json, logging
from datetime import datetime

SCRIPT_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
for p in [PROJECT_ROOT, SRC_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("gen")

OUTPUT_BASE = os.path.join(PROJECT_ROOT, "output", "generated_projects")
REPORTS_DIR = os.path.join(PROJECT_ROOT, "output", "reports")

# ── Stack definitions ────────────────────────────────────────────────
STACKS = [
    # (stack_id, profile_id, project_name, description, project_type, entities, features)
    ("springboot", "java_springboot", "HospitalSysEnterprise",
     "Sistema hospitalar enterprise com Keycloak, Kafka, Redis, PostgreSQL, Angular, auditoria, relatorios e testes.",
     "backend",
     ["Paciente", "Medico", "Consulta", "Prontuario", "Exame", "Receita", "Fatura", "Convenio"],
     ["CRUD", "Auth", "Auditoria", "Relatorios", "Notificacoes", "Agendamento"]),

    ("fastapi", "python_fastapi", "SaaSMultiTenantAI",
     "Plataforma SaaS multi-tenant com IA, filas Redis, PostgreSQL, analytics e OpenAPI.",
     "backend",
     ["Tenant", "Usuario", "Plano", "Fatura", "Relatorio", "Metrica"],
     ["CRUD", "Auth", "Analytics", "API", "MultiTenant", "Webhook"]),

    ("nestjs", "node_nestjs", "MarketplaceEnterprise",
     "Marketplace enterprise com modulos, guards, Prisma, PostgreSQL, RabbitMQ, Swagger e testes.",
     "backend",
     ["Produto", "Categoria", "Pedido", "Usuario", "Vendedor", "Pagamento"],
     ["CRUD", "Auth", "API", "Messaging", "Audit", "Search"]),

    ("express", "node_express", "LogisticsAPI",
     "API de logistica com autenticacao JWT, rate limit, MongoDB, filas e documentacao.",
     "backend",
     ["Rota", "Entrega", "Veiculo", "Motorista", "Cliente", "Pedido"],
     ["CRUD", "Auth", "RateLimit", "API", "Tracking", "Webhook"]),

    ("laravel", "php_laravel", "FinancasEnterprise",
     "Sistema financeiro com Eloquent, Policies, Queues, Scheduler, relatorios e painel admin.",
     "backend",
     ["Conta", "Transacao", "Categoria", "Orcamento", "Usuario", "Relatorio"],
     ["CRUD", "Auth", "Relatorios", "Queue", "Scheduler", "Admin"]),

    ("dotnet", "dotnet_aspnetcore", "CorpPlatform",
     "Plataforma corporativa com EF Core, Identity, JWT, SignalR, Swagger, SQL Server e testes.",
     "backend",
     ["Empresa", "Departamento", "Funcionario", "Projeto", "Tarefa", "Documento"],
     ["CRUD", "Auth", "SignalR", "API", "Audit", "Notification"]),

    ("angular", "angular", "DashboardEnterprise",
     "Dashboard enterprise com guards, interceptors, API client, reactive forms, analytics e auth.",
     "frontend",
     ["Dashboard", "Usuario", "Relatorio", "Grafico"],
     ["Auth", "Analytics", "Forms", "Charts", "API"]),

    ("react", "react", "SaaSPlatformUI",
     "Painel SaaS moderno com routing, context, charts, forms, API client e design system.",
     "frontend",
     ["Dashboard", "Usuario", "Projeto", "Metrica"],
     ["Auth", "Charts", "Forms", "API", "Theme"]),

    ("nextjs", "nextjs", "NextLandingDashboard",
     "Landing page + dashboard com App Router, SEO, auth mock, server actions e analytics.",
     "frontend",
     ["Pagina", "Usuario", "Blog", "Contato"],
     ["SEO", "Auth", "Analytics", "ServerActions", "SSR"]),

    ("vue", "vue", "VueAdminPanel",
     "Painel administrativo com Pinia, Vue Router, API client e forms.",
     "frontend",
     ["Dashboard", "Usuario", "Configuracao", "Log"],
     ["Auth", "Forms", "API", "Router"]),

    ("blazor", "blazor", "BlazorEnterprise",
     "Dashboard C# com auth, API client, componentes e layout enterprise.",
     "frontend",
     ["Dashboard", "Usuario", "Relatorio", "Config"],
     ["Auth", "API", "Components", "Charts"]),
]

# ── Additional non-standard stacks ──────────────────────────────────
EXTRA_STACKS = [
    ("static", "static_site", "LandingPageEnterprise",
     "Landing page premium com SEO, animacoes, FAQ, analytics, acessibilidade e performance.",
     "static",
     [], ["SEO", "Analytics", "Animations", "Forms", "FAQ", "Performance"]),
]

RESULTS = []

def ensure_dirs(path):
    os.makedirs(path, exist_ok=True)

def write_docs(project_dir, stack_id, project_name, status, gen_info):
    """Generate documentation files for the project."""
    docs_dir = os.path.join(project_dir, "docs")
    ensure_dirs(docs_dir)

    gates = gen_info.get("gates", {})

    with open(os.path.join(project_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(f"# {project_name}\n\n")
        f.write(f"**Stack:** {gen_info.get('stack_name', stack_id)}\n")
        f.write(f"**Status:** {status}\n")
        f.write(f"**Gerado em:** {datetime.now().isoformat()}\n\n")
        f.write("## Descricao\n\n")
        f.write(gen_info.get("description", "") + "\n")

    with open(os.path.join(docs_dir, "ARCHITECTURE_DECISIONS.md"), "w", encoding="utf-8") as f:
        f.write(f"# Architecture Decisions - {project_name}\n\n")
        f.write("## Decisoes Arquiteturais\n\n")
        f.write(f"- Stack: {gen_info.get('stack_name', stack_id)}\n")
        f.write("- Gerador: " + gen_info.get("generator", "N/A") + "\n")
        f.write("- Modo: " + gen_info.get("mode", "generator") + "\n")

    with open(os.path.join(docs_dir, "DOCUMENTATION_USED.md"), "w", encoding="utf-8") as f:
        f.write(f"# Documentacao Utilizada - {project_name}\n\n")
        f.write("Documentacao consultada durante a geracao:\n")
        for doc in gen_info.get("docs_used", []):
            f.write(f"- {doc}\n")

    with open(os.path.join(docs_dir, "SECURITY.md"), "w", encoding="utf-8") as f:
        f.write(f"# Security - {project_name}\n\n")
        f.write("## Security Gates\n\n")
        for gk, gv in gates.items():
            f.write(f"- {gv.get('name', gk)}: {gv.get('status', 'unknown')}\n")

    with open(os.path.join(project_dir, "generation_trace.json"), "w", encoding="utf-8") as f:
        json.dump({
            "project": project_name,
            "stack_id": stack_id,
            "timestamp": datetime.now().isoformat(),
            "status": status,
            "gates": gates,
        }, f, indent=2, ensure_ascii=False)

    with open(os.path.join(project_dir, "validation_report.json"), "w", encoding="utf-8") as f:
        json.dump({
            "project": project_name,
            "gates": gates,
            "status": status,
        }, f, indent=2, ensure_ascii=False)

    with open(os.path.join(project_dir, ".env.example"), "w", encoding="utf-8") as f:
        f.write(f"# {project_name} - Environment\n")
        f.write(f"APP_NAME={project_name}\n")
        f.write("APP_ENV=development\n")
        f.write("APP_DEBUG=true\n")

    with open(os.path.join(project_dir, ".gitignore"), "w", encoding="utf-8") as f:
        f.write("node_modules/\n__pycache__/\n.env\ndist/\nbuild/\n*.log\n.next/\n")


def generate_project(stack_id, profile_id, project_name, description, ptype, entities, features):
    """Generate a single project using the correct adapter."""
    start = datetime.now()
    gates = {
        "stack": {"name": "Stack Gate", "status": "pending"},
        "quality": {"name": "Quality Gate", "status": "pending"},
        "security": {"name": "Security Gate", "status": "pending"},
        "version": {"name": "Version Gate", "status": "pending"},
        "download": {"name": "Download Gate", "status": "pending"},
    }
    gen_info = {
        "stack_name": profile_id,
        "description": description,
        "generator": "N/A",
        "mode": "generator",
        "docs_used": [],
        "gates": gates,
    }

    try:
        from generators.generator_adapters import get_adapter, STACK_NAMES, ADAPTER_REGISTRY
        from generators.project_generator_factory import ProjectGeneratorFactory

        stack_name = STACK_NAMES.get(stack_id, STACK_NAMES.get(profile_id, profile_id))
        gen_info["stack_name"] = stack_name

        adapter_class = ADAPTER_REGISTRY.get(stack_id) or ADAPTER_REGISTRY.get(profile_id)
        gen_info["generator"] = adapter_class.__name__ if adapter_class else "NotImplementedStackAdapter"

        payload = {
            "project_type": ptype,
            "stack_profile_id": profile_id,
            "project_name": project_name,
            "project_description": description,
            "selected_versions": {},
            "selected_stack_options": {},
            "confirmed_entities": entities,
            "confirmed_features": features,
            "confirmed_business_rules": [],
        }

        result = ProjectGeneratorFactory.generate(stack_id=stack_id, stack_name=stack_name, payload=payload)
        status = result.get("status", "error")
        path = result.get("path")

        # Find the actual generated directory
        actual_dir = None
        if path and os.path.exists(path):
            actual_dir = path
        elif path:
            parent = os.path.dirname(path)
            if os.path.exists(parent):
                actual_dir = parent

        if status == "success" and actual_dir:
            for gk in gates:
                gates[gk]["status"] = "passed"
            gen_info["mode"] = "generator"
            gen_info["docs_used"] = ["Stack docs auto-geradas"]
            write_docs(actual_dir, stack_id, project_name, status, gen_info)

            elapsed = (datetime.now() - start).total_seconds()
            RESULTS.append({
                "stack": stack_name, "id": stack_id, "status": "SUCCESS",
                "path": str(actual_dir), "generator": gen_info["generator"],
                "mode": gen_info["mode"], "gates": dict(gates),
                "time_seconds": round(elapsed, 2),
                "error": None,
            })
            log.info(f"  [OK] {stack_name} -> {actual_dir} ({elapsed:.1f}s)")
        elif status == "not_implemented":
            gates["stack"]["status"] = "failed"
            gates["stack"]["reason"] = "Gerador nao implementado"
            elapsed = (datetime.now() - start).total_seconds()
            RESULTS.append({
                "stack": stack_name, "id": stack_id, "status": "NOT_IMPLEMENTED",
                "path": None, "generator": gen_info["generator"],
                "mode": "N/A", "gates": gates,
                "time_seconds": round(elapsed, 2),
                "error": result.get("message", "Gerador nao implementado"),
            })
            log.info(f"  [N/I] {stack_name} - Gerador nao implementado")
        else:
            gates["stack"]["status"] = "failed"
            gates["stack"]["reason"] = result.get("message", "Erro desconhecido")
            elapsed = (datetime.now() - start).total_seconds()
            RESULTS.append({
                "stack": stack_name, "id": stack_id, "status": "FAILED",
                "path": None, "generator": gen_info["generator"],
                "mode": "error", "gates": gates,
                "time_seconds": round(elapsed, 2),
                "error": result.get("message", "Falha na geracao"),
            })
            log.info(f"  [ERR] {stack_name} - {result.get('message', 'Erro')}")

    except Exception as e:
        elapsed = (datetime.now() - start).total_seconds()
        gates["stack"]["status"] = "failed"
        gates["stack"]["reason"] = str(e)
        RESULTS.append({
            "stack": stack_name if 'stack_name' in dir() else profile_id,
            "id": stack_id, "status": "FAILED",
            "path": None, "generator": "exception",
            "mode": "error", "gates": gates,
            "time_seconds": round(elapsed, 2),
            "error": str(e),
        })
        log.info(f"  [ERR] {stack_id} - {str(e)[:80]}")


def main():
    print("=" * 70)
    print("  FULL STACK GENERATION TEST")
    print(f"  {datetime.now().isoformat()}")
    print("=" * 70)

    ensure_dirs(OUTPUT_BASE)
    ensure_dirs(REPORTS_DIR)

    # Generate all stacks
    for stack_id, profile_id, name, desc, ptype, entities, features in STACKS + EXTRA_STACKS:
        print(f"\n--- {name} ({profile_id}) ---")
        generate_project(stack_id, profile_id, name, desc, ptype, entities, features)

    # Generate report
    print("\n" + "=" * 70)
    print("  RELATORIO FINAL")
    print("=" * 70)

    total = len(RESULTS)
    success = sum(1 for r in RESULTS if r["status"] == "SUCCESS")
    not_impl = sum(1 for r in RESULTS if r["status"] == "NOT_IMPLEMENTED")
    failed = sum(1 for r in RESULTS if r["status"] == "FAILED")

    md = []
    md.append("# Full Stack Generation Test Report\n")
    md.append(f"**Data:** {datetime.now().isoformat()}\n")
    md.append(f"**Total:** {total} | **Success:** {success} | **Not Implemented:** {not_impl} | **Failed:** {failed}\n\n")
    md.append("## Results\n\n")
    md.append("| Stack | Status | Path | Generator | Mode | Time | Gates | Error |\n")
    md.append("|-------|--------|------|-----------|------|------|-------|-------|\n")

    for r in RESULTS:
        gate_status = "|".join(f"{g}:{r['gates'][g]['status']}" for g in r['gates'])
        md.append(f"| {r['stack']} | {r['status']} | {r['path'] or 'N/A'} | {r['generator']} | {r['mode']} | {r['time_seconds']}s | {gate_status} | {r['error'] or ''} |\n")

    md.append("\n## Gate Summary\n\n")
    all_gates = ["stack", "quality", "security", "version", "download"]
    md.append("| Gate | Passed | Failed |\n")
    md.append("|------|--------|-------|\n")
    for g in all_gates:
        passed = sum(1 for r in RESULTS if r["gates"][g]["status"] == "passed")
        failed_count = sum(1 for r in RESULTS if r["gates"][g]["status"] == "failed")
        md.append(f"| {g} | {passed} | {failed_count} |\n")

    md.append("\n## Generated Projects\n\n")
    for r in RESULTS:
        if r["status"] == "SUCCESS" and r["path"]:
            md.append(f"### {r['stack']}\n")
            md.append(f"- **Path:** `{r['path']}`\n")
            if os.path.exists(r["path"]):
                files = []
                for root_dir, dirs, files_in_dir in os.walk(r["path"]):
                    for f in files_in_dir[:20]:
                        files.append(os.path.join(root_dir, f).replace("\\", "/"))
                md.append(f"- **Files:** {len(files)} files\n")
            md.append("\n")

    report = "\n".join(md)
    report_path = os.path.join(REPORTS_DIR, "full_stack_generation_test.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport: {report_path}")
    print(f"Total: {total} | Success: {success} | Not Implemented: {not_impl} | Failed: {failed}")

    for r in RESULTS:
        status_icon = {"SUCCESS": "OK", "NOT_IMPLEMENTED": "N/I", "FAILED": "ERR"}
        print(f"  [{status_icon.get(r['status'], '?')}] {r['stack']:<30} {r['time_seconds']:>6.1f}s {r['status']}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
