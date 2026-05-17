"""
main.py — SaaS Factory AI
Fluxo principal: tipo → briefing → automação → integrações → geração → resumo.
REGRAS: Apenas o que o usuário confirmou é gerado.
"""
import sys
import warnings
import os

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

warnings.filterwarnings("ignore", category=FutureWarning)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output", "generated_projects")

LANGUAGES = {"1": "Português", "2": "Inglês", "3": "Francês", "4": "Espanhol"}
STACKS = {
    "1": "Python + FastAPI",
    "2": "Node.js + NestJS",
    "3": "Node.js + Express",
    "4": "PHP + Laravel",
    "5": "Java + Spring Boot",
    "6": "C# + ASP.NET Core",
}

from config.frontend_compatibility import BACKEND_FRONTEND_MATRIX

STYLES = {
    "1": "Futurista", "2": "Minimalista", "3": "Corporativo",
    "4": "Dark Tech", "5": "Luxo Moderno",
}
MOTORS = {"1": "ai", "2": "mock"}
PROJECT_TYPES = {"1": "saas", "2": "api", "3": "static"}


# ── Helpers ───────────────────────────────────────────────────────────────────
def _ask(prompt: str, options: dict = None, default: str = "",
         allow_back: bool = True) -> str:
    """Pede input com suporte a voltar e correção."""
    from briefing.navigator import auto_correct, is_back
    back_hint = " (ou 'voltar')" if allow_back else ""
    def_hint  = f" [padrão: {default}]" if default else ""
    while True:
        raw = input(f"  {prompt}{def_hint}{back_hint}: ").strip()
        if not raw and default:
            raw = default
        if allow_back and is_back(raw):
            return "__BACK__"
        raw = auto_correct(raw)
        if options:
            if raw in options:
                return options[raw]
            match = next((v for k, v in options.items()
                          if v.lower() == raw.lower()), None)
            if match:
                return match
            print(f"  ⚠️  Opção inválida. Válidas: {', '.join(f'{k}={v}' for k,v in options.items())}")
            continue
        if raw:
            return raw
        print("  ⚠️  Este campo é obrigatório.")


def _menu(title: str, options: dict):
    print(f"\n[ {title} ]")
    for k, v in options.items():
        print(f"  {k}. {v}")


def _print_line(label: str, value):
    if isinstance(value, list):
        print(f"  {label}:")
        for item in value:
            print(f"    - {item}")
    else:
        print(f"  {label}: {value}")


def _print_summary(data: dict):
    print("\n" + "═" * 44)
    print("         📋 RESUMO DO PROJETO")
    print("═" * 44)
    for k, v in data.items():
        if not k.startswith("_"):
            _print_line(k, v)
    print("═" * 44)


def _build_design_ux_brief(project_name: str, description: str, project_type: str, brief: dict) -> dict:
    from design_intelligence import infer_design_brief, infer_ux_intelligence

    design_brief = infer_design_brief(
        project_name=project_name,
        description=description,
        project_type=project_type,
        brief=brief,
    )
    ux = infer_ux_intelligence(
        project_name=project_name,
        description=description,
        design_brief=design_brief,
        project_type=project_type,
    )
    return {
        "design_brief": design_brief,
        "ux_rules": ux["ux_rules"],
        "ux_flow": ux["ux_flow"],
        "navigation_flow": ux["navigation_flow"],
        "user_journey": ux["user_journey"],
        "onboarding": ux["onboarding"],
        "interaction_main": ux["interaction_main"],
    }


# ── Resumo final expandido ────────────────────────────────────────────────────
def _print_final_summary(project_name: str, stack: str, brief: dict,
                          auto: dict, integrations: dict):
    from briefing.automation import AUTOMATION_TYPE_LABELS, AGENT_TYPE_LABELS
    from briefing.architecture import LABELS as ARCH_LABELS

    level_labels = {"none": "Nenhuma", "basic": "Básica", "advanced": "Avançada com Agentes"}
    INT_LABELS = {
        "smtp_sendgrid": "📧 E-mail SMTP/SendGrid",
        "telegram":      "📱 Telegram Bot",
        "whatsapp":      "💬 WhatsApp API",
        "stripe":        "💳 Stripe/Pagamentos",
        "google_sheets": "📊 Google Sheets",
        "custom_api":    "🔗 API externa personalizada",
    }

    print("\n" + "═" * 44)
    print("       ✅ RESUMO FINAL DO PROJETO")
    print("═" * 44)
    print(f"  Projeto:    {project_name}")
    print(f"  Stack:      {stack}")
    print(f"  Modo:       {brief.get('Modo', 'Guiado')}")

    # Show confirmed entities and features
    print(f"\n  📋 Entidades confirmadas:")
    for e in brief.get("Entidades", []):
        print(f"     • {e}")

    print(f"\n  🔧 Funcionalidades:")
    for f in brief.get("Funcionalidades", []):
        print(f"     • {f}")

    rules = brief.get("Regras de Negócio", [])
    if rules:
        print(f"\n  📏 Regras de Negócio:")
        for r in rules:
            print(f"     • {r}")

    print(f"\n  🌐 Idioma: {brief.get('language', 'Portuguese')}")

    design_brief = brief.get("design_brief", {})
    ux_rules = brief.get("ux_rules", [])
    ux_flow = brief.get("ux_flow", [])
    navigation_flow = brief.get("navigation_flow", [])
    architecture = brief.get("_advanced_architecture_raw", {})

    print(f"\n  🎨 Conceito visual: {design_brief.get('visual_concept', 'não definido')}")
    print(f"  🎯 Público-alvo: {design_brief.get('target_audience', brief.get('Público-alvo', 'não definido'))}")
    if ux_rules:
        print("  🧠 UX aplicada:")
        for rule in ux_rules[:5]:
            print(f"     • {rule}")
    if ux_flow:
        print("  📐 Estrutura de navegação:")
        for step in ux_flow[:3]:
            print(f"     • {step}")
    if navigation_flow:
        print(f"  ↳ Navegação: {', '.join(navigation_flow)}")
    if architecture:
        print("  🏗 Arquitetura:")
        print(f"     • tipo: {ARCH_LABELS.get(architecture.get('architecture_type', 'monolith_modular'), architecture.get('architecture_type', 'monolith_modular'))}")
        print(f"     • segurança: {ARCH_LABELS.get(architecture.get('auth_provider', 'jwt_simple'), architecture.get('auth_provider', 'jwt_simple'))}")
        print(f"     • comunicação: {', '.join(ARCH_LABELS.get(v, v) for v in architecture.get('communication_protocols', ['http_rest']))}")
        print(f"     • monitoramento: {ARCH_LABELS.get(architecture.get('monitoring', 'basic_logs'), architecture.get('monitoring', 'basic_logs'))}")
        print(f"     • testes: {', '.join(ARCH_LABELS.get(v, v) for v in architecture.get('testing_strategy', ['unit_tests', 'integration_tests']))}")
        print(f"     • ferramenta para endpoints: {', '.join(ARCH_LABELS.get(v, v) for v in architecture.get('endpoint_testing_tools', ['swagger_openapi']))}")

    al = auto.get("automation_level", "none")
    print(f"\n  ⚡ Automação: {level_labels.get(al, al)}")
    for t in auto.get("automation_types", []):
        print(f"     • {AUTOMATION_TYPE_LABELS.get(t, t)}")
    for a in auto.get("selected_agents", []):
        print(f"     🤖 {AGENT_TYPE_LABELS.get(a, a)}")

    ints = integrations.get("external_integrations", [])
    print(f"\n  🔗 Integrações: {len(ints)} configurada(s)")
    for i in ints:
        print(f"     • {INT_LABELS.get(i, i)}")
    dm = integrations.get("demo_mode", True)
    print(f"  🔐 Credenciais: {'Modo demo (sem credenciais reais)' if dm else '.env.example gerado — configure antes de rodar'}")
    print(f"  🚀 Automações prontas para execução: {'Sim' if al != 'none' or ints else 'Não'}")
    print(f"  🔌 Integrações ativas: {', '.join(INT_LABELS.get(i, i) for i in ints) if ints else 'Nenhuma'}")

    env_vars = integrations.get("env_variables", [])
    if env_vars:
        print(f"\n  📄 Variáveis de ambiente ({len(env_vars)}):")
        for v in env_vars:
            print(f"     {v}=...")
        print("  ℹ️  Veja .env.example e docs/INTEGRATIONS.md para instruções.")

    print("═" * 44)


def _generate_docs(blueprint, project_path: str):
    """Generate FEATURES.md and BUSINESS_RULES.md in the selected language."""
    import os
    docs_dir = os.path.join(project_path, "docs")
    os.makedirs(docs_dir, exist_ok=True)

    language = blueprint.language if hasattr(blueprint, 'language') else "Portuguese"

    # FEATURES.md
    features_content = f"# {'Funcionalidades' if language == 'Portuguese' else 'Features'} - {blueprint.project_name}\n\n"
    features_content += f"## {'Lista de Funcionalidades' if language == 'Portuguese' else 'Feature List'}\n\n"
    for feat in blueprint.confirmed_features:
        features_content += f"- {feat}\n"

    if blueprint.confirmed_entities:
        features_content += f"\n## {'Entidades Relacionadas' if language == 'Portuguese' else 'Related Entities'}\n\n"
        for entity in blueprint.confirmed_entities:
            features_content += f"- {entity}\n"

    if blueprint.api_endpoints:
        features_content += f"\n## {'Endpoints da API' if language == 'Portuguese' else 'API Endpoints'}\n\n"
        for ep in blueprint.api_endpoints:
            desc = ep.description if hasattr(ep, 'description') else ep.get('description', '')
            features_content += f"- **{ep.method if hasattr(ep, 'method') else ep.get('method')}** `{ep.path if hasattr(ep, 'path') else ep.get('path')}` - {desc}\n"

    with open(os.path.join(docs_dir, "FEATURES.md"), "w", encoding="utf-8") as f:
        f.write(features_content)

    # BUSINESS_RULES.md
    rules_content = f"# {'Regras de Negócio' if language == 'Portuguese' else 'Business Rules'} - {blueprint.project_name}\n\n"
    if blueprint.confirmed_business_rules:
        for rule in blueprint.confirmed_business_rules:
            rules_content += f"- {rule}\n"
    else:
        rules_content += f"{'Nenhuma regra de negócio específica definida.' if language == 'Portuguese' else 'No specific business rules defined.'}\n"

    with open(os.path.join(docs_dir, "BUSINESS_RULES.md"), "w", encoding="utf-8") as f:
        f.write(rules_content)

    print(f"  ✅ Documentação gerada: docs/FEATURES.md, docs/BUSINESS_RULES.md")


# ── Fluxos por tipo ───────────────────────────────────────────────────────────
def _flow_saas_or_api(project_type: str):
    label = "SaaS Completo" if project_type == "saas" else "API Backend"
    print(f"\n{'═'*44}")
    print(f"  🏗️  {label}")
    print(f"{'═'*44}")

    # Dados básicos
    project_name = _ask("Nome do projeto", allow_back=False)
    while not project_name or project_name == "__BACK__":
        project_name = input("  Nome do projeto: ").strip()

    user_idea = input("  Descrição da ideia: ").strip() or "Sistema SaaS completo"

    _menu("Idioma do Projeto", LANGUAGES)
    project_language = _ask("Escolha", options=LANGUAGES, default="1")
    if project_language == "__BACK__":
        project_language = "Português"

    _menu("Stack do Backend", STACKS)
    backend_stack = _ask("Escolha", options=STACKS, default="1")
    if backend_stack == "__BACK__":
        backend_stack = "Python + FastAPI"
        
    # Map stack to profile ID
    stack_id_map = {
        "Python + FastAPI": "fastapi",
        "Node.js + NestJS": "nestjs",
        "Node.js + Express": "express",
        "PHP + Laravel": "laravel",
        "Java + Spring Boot": "springboot",
        "C# + ASP.NET Core": "dotnet"
    }
    stack_profile_id = stack_id_map.get(backend_stack, "fastapi")

    _menu("Frontend", {"1": "Sim", "2": "Não, somente backend/API"})
    wants_frontend_raw = _ask("Deseja gerar frontend?", options={"1": "Sim", "2": "Não, somente backend/API"}, default="1")
    wants_frontend = (wants_frontend_raw == "Sim")
    
    frontend_stack = None
    frontend_compatible = True
    if wants_frontend:
        recommended = BACKEND_FRONTEND_MATRIX.get(backend_stack, [])
        options_map = {str(i+1): name for i, name in enumerate(recommended)}
        _menu(f"Frontend recomendado para {backend_stack}", options_map)
        choice = _ask("Escolha frontend (ou digite outro nome para forçar)", default="1")
        if choice in options_map.values():
            frontend_stack = choice
        else:
            frontend_stack = choice
            frontend_compatible = False
            print("\n  ⚠️  AVISO: Essa combinação não é recomendada pela matriz de compatibilidade.")
            confirm = input("  Deseja continuar mesmo assim? (s/n): ").strip().lower()
            if confirm not in ("s", "sim", "y", "yes"):
                print("  ❌ Geração cancelada.")
                return

    _menu("Motor de Geração", {
        "1": "Premium (Gemini API — melhor qualidade, maior custo)",
        "2": "Econômico (Gemini API — bom custo-benefício)",
        "3": "Mock/Local (sem custo, ideal para teste)"
    })
    motor = _ask("Escolha", options={"1": "premium", "2": "economy", "3": "mock"}, default="3")
    use_ai = (motor != "mock")
    ai_generation_mode = motor

    # Use the new briefing module with proper entity extraction
    from briefing.briefing import run_briefing
    brief = run_briefing("1" if project_type == "saas" else "2", project_name, user_idea)
    if not brief:
        return

    # ── BLOCO OBRIGATÓRIO: AUTOMAÇÃO & AGENTES ──────────────────────
    from briefing.automation import collect_automation, format_automation_for_summary
    auto = brief.get("_automation_raw", {})
    if not auto:
        auto = collect_automation(None)
    integrations = brief.get("_integrations_raw", {})

    # ── Architecture ────────────────────────────────────────────────
    from briefing.architecture import format_architecture_for_summary
    architecture = brief.get("_advanced_architecture_raw", {})

    designux = _build_design_ux_brief(project_name, user_idea, project_type, brief)
    brief.update(designux)

    from briefing.automation import format_automation_for_summary
    auto_summary = format_automation_for_summary(auto, integrations)
    brief.update(auto_summary)

    brief["automation_level"] = auto.get("automation_level", "none") if auto else "none"
    brief["automation_types"] = auto.get("automation_types", []) if auto else []
    brief["selected_agents"] = auto.get("selected_agents", []) if auto else []
    brief["external_integrations"] = integrations.get("external_integrations", []) if integrations else []
    brief["requires_env_setup"] = (auto.get("requires_env_setup", False) if auto else False) or bool(integrations.get("external_integrations", [])) if integrations else False
    brief["_advanced_architecture_raw"] = architecture
    brief["Arquitetura"] = format_architecture_for_summary(architecture).get("Arquitetura", "") if architecture else ""
    
    brief["backend_stack"] = backend_stack
    brief["stack_profile_id"] = stack_profile_id
    brief["selected_stack_options"] = [] # In CLI mode, options are inferred by AI. GUI will pass them explicitly.
    brief["frontend_enabled"] = wants_frontend
    if wants_frontend:
        brief["frontend_stack"] = frontend_stack
        brief["frontend_backend_compatibility"] = frontend_compatible

    if "Segurança" not in brief:
        brief["Segurança"] = ["validação de input", "autenticação básica"]

    # Confirmação FINAL com Checklist Rigoroso
    _print_summary(brief)
    
    print("\n" + "═" * 44)
    print("      🔒 CHECKLIST DE SEGURANÇA E FIDELIDADE")
    print("═" * 44)
    print(f"  [1] Tipo de Projeto: {project_type}")
    print(f"  [2] Stack Backend:   {backend_stack}")
    print(f"  [3] Frontend:        {frontend_stack if wants_frontend else 'Nenhum (Somente API)'}")
    print(f"  [4] Idioma:          {project_language}")
    print(f"  [5] Entidades:       {len(brief.get('confirmed_entities', []))} confirmadas")
    print(f"  [6] Funcionalidades: {len(brief.get('confirmed_features', []))} confirmadas")
    print(f"  [7] Banco de Dados:  {brief.get('database', 'No definido')}")
    print(f"  [8] Segurança:       {', '.join(brief.get('security', [])) if brief.get('security') else 'No definida'}")
    
    if not brief.get('confirmed_entities') or not brief.get('confirmed_features'):
        print("\n  ❌ ERRO: Entidades ou Funcionalidades esto vazias. O Fidelity Gate bloquearia isso.")
        print("  ❌ Gerao bloqueada.")
        return

    print("\n  Para avanar, digite EXATAMENTE a frase abaixo:")
    print("  'Confirmo que estas escolhas estão corretas'")
    
    confirm_raw = input("\n  Assinatura de Confirmao: ").strip()
    if confirm_raw != "Confirmo que estas escolhas estão corretas":
        print("\n  ❌ Gerao cancelada por falta de confirmao exata.")
        return

    print("\n  🚀 Iniciando gerao sob vigilncia dos Gates...\n")

    from agents.core.project_runner import run_project
    payload = {
        "project_type": project_type,
        "project_name": project_name,
        "user_idea": user_idea,
        "project_language": project_language,
        "backend_stack": backend_stack,
        "use_ai": use_ai,
        "ai_generation_mode": ai_generation_mode,
        "allow_mock_fallback": True,
        "brief": brief,
        "automation": auto,
        "integrations": integrations,
        "advanced_architecture": architecture,
        "design_brief": brief.get("design_brief", {}),
        "ux_rules": brief.get("ux_rules", []),
        "ux_flow": brief.get("ux_flow", [])
    }

    try:
        result = run_project(payload)

        if result["status"] == "error":
            print(f"\n  ❌ Erros na geração:")
            for err in result.get("errors", []):
                print(f"    - {err}")
            return

        if result.get("blueprint_path"):
            print(f"\n  ✅ Blueprint: {result['blueprint_path']}")

        backend_path = result.get("path")
        if backend_path:
            is_node = any(s in backend_stack.lower() for s in ["nestjs", "express"])
            stack_label = backend_stack.split("+")[-1].strip()
            print(f"\n  ✅ Backend {stack_label} gerado em: {backend_path}")
            print("  ▶️  Como rodar:")
            if is_node:
                print("     npm install && npm run start:dev")
                print("     npm run test")
            else:
                print("     python -m venv venv && venv\\Scripts\\activate")
                print("     pip install -r requirements.txt")
                print("     uvicorn app.main:app --reload")
                print("     pytest")

            # ── POST-GENERATION VALIDATION ────────────────────────
            print("\n  🔍 Validando fidelidade ao briefing...")
            try:
                # Need to import blueprint data for validation
                import json
                if result.get("blueprint_path") and os.path.exists(result["blueprint_path"]):
                    with open(result["blueprint_path"], "r", encoding="utf-8") as f:
                        bp_data = json.load(f)
                    from blueprints.blueprint_builder import check_brief_fidelity
                    from blueprints.blueprint_schema import BlueprintData
                    bp = BlueprintData(**bp_data)
                    validation = check_brief_fidelity(backend_path, bp)
                    if validation["valid"]:
                        print("  ✅ Projeto 100% fiel ao briefing!")
                    else:
                        print("  ❌ ERRO: Projeto incompleto ou divergindo do briefing:")
                        for err in validation["errors"]:
                            print(f"     - {err}")
                else:
                    print("  ⚠️  Blueprint não encontrado para validação.")
            except Exception as ve:
                print(f"  ⚠️  Erro na validação pós-geração: {ve}")

            # Generate docs
            try:
                if result.get("blueprint_path") and os.path.exists(result["blueprint_path"]):
                    import json
                    with open(result["blueprint_path"], "r", encoding="utf-8") as f:
                        bp_data = json.load(f)
                    from blueprints.blueprint_schema import BlueprintData
                    bp = BlueprintData(**bp_data)
                    _generate_docs(bp, backend_path)
            except Exception as de:
                print(f"  ⚠️  Erro ao gerar documentação: {de}")

    except Exception as e:
        print(f"\n  ❌ Pipeline falhou: {e}")
        return

    _print_final_summary(project_name, backend_path.split("/")[-1] if backend_path else backend_stack, brief, auto, integrations)


def _flow_static():
    print(f"\n{'═'*44}")
    print("  🌐 SITE RÁPIDO ESTÁTICO")
    print(f"{'═'*44}")

    project_name = input("  Nome do site: ").strip() or "MeuSite"
    description = input("  Descrição do site: ").strip() or "Um site moderno e profissional."

    _menu("Idioma", LANGUAGES)
    language = _ask("Escolha", options=LANGUAGES, default="1")
    if language == "__BACK__":
        language = "Português"

    _menu("Estilo Visual", STYLES)
    style = _ask("Escolha", options=STYLES, default="1")
    if style == "__BACK__":
        style = "Futurista"

    # Use the new briefing module
    from briefing.briefing import run_briefing
    brief = run_briefing("3", project_name, description)
    if not brief:
        return

    # Automação & Integrações
    from briefing.automation import collect_automation, format_automation_for_summary
    auto = brief.get("_automation_raw", {})
    if not auto:
        auto = collect_automation(None)
    integrations = brief.get("_integrations_raw", {})

    designux = _build_design_ux_brief(project_name, description, "static", brief)
    brief.update(designux)

    auto_summary = format_automation_for_summary(auto, integrations)
    brief.update(auto_summary)
    brief["automation_level"] = auto.get("automation_level", "none") if auto else "none"
    brief["automation_types"] = auto.get("automation_types", []) if auto else []
    brief["selected_agents"] = auto.get("selected_agents", []) if auto else []
    brief["external_integrations"] = integrations.get("external_integrations", []) if integrations else []
    brief["requires_env_setup"] = (auto.get("requires_env_setup", False) if auto else False) or bool(integrations.get("external_integrations", [])) if integrations else False

    _print_summary(brief)
    confirm_raw = input("\n  Confirmar e gerar projeto? (s/n): ").strip().lower()
    if confirm_raw not in ("s", "sim", "y", "yes"):
        print("\n  ❌ Geração cancelada.")
        return

    print("\n  🚀 Iniciando geração...\n")

    from agents.core.project_runner import run_project
    payload = {
        "project_type": "static",
        "project_name": project_name,
        "user_idea": description,
        "project_language": language,
        "style": style,
        "brief": brief,
        "automation": auto,
        "integrations": integrations
    }

    try:
        result = run_project(payload)
        if result["status"] == "error":
            print(f"\n  ❌ Erros na geração:")
            for err in result.get("errors", []):
                print(f"    - {err}")
            return

        site_path = result.get("path")
        if site_path:
            print(f"\n  ✅ Site Estático gerado em: {site_path}")

    except Exception as e:
        print(f"\n  ❌ Falha: {e}")
        return

    _print_final_summary(project_name, "HTML/CSS/JS Estático", brief, auto, integrations)


# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    print("=" * 44)
    print("      🏭 SaaS Factory AI")
    print("=" * 44)
    print("  💡 Digite 'voltar' em qualquer etapa para retornar.\n")
    print("  🔒 REGRA: Apenas o confirmado pelo usuário será gerado.\n")

    _menu("Tipo de Projeto", {
        "1": "SaaS completo",
        "2": "API backend",
        "3": "Site rápido estático"
    })
    project_type_raw = input("  Escolha (1-3) [padrão: 1]: ").strip() or "1"
    project_type = PROJECT_TYPES.get(project_type_raw, "saas")

    if project_type == "static":
        _flow_static()
    else:
        _flow_saas_or_api(project_type)


if __name__ == "__main__":
    main()
