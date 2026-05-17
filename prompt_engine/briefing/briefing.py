"""
briefing.py — Módulo de Briefing Inteligente
Regras de OURO:
  1. NUNCA inventar entidades, features, endpoints ou regras
  2. Usar EXATAMENTE o que o usuário confirmou
  3. Se não houver entidades confirmadas, BLOQUEAR geração
"""
from typing import List, Dict, Any
from blueprints.normalizer import extract_entities_from_brief, normalize_entities

UNSURE_KEYWORDS = {"não sei", "nao sei", "qualquer", "tanto faz", "n sei", "naoseis", ""}


def is_unsure(answer: str) -> bool:
    return answer.strip().lower() in UNSURE_KEYWORDS


def ask(prompt: str, default: str = "") -> str:
    """Faz uma pergunta e retorna a resposta. Se vazia, retorna default."""
    resp = input(prompt).strip()
    return resp if resp else default


def confirm(prompt: str) -> bool:
    return input(prompt + " (s/n): ").strip().lower() in ("s", "sim", "yes", "y")


def edit_list(label: str, items: List[str]) -> List[str]:
    """Permite ao usuário editar uma lista de itens (remover, adicionar, manter)."""
    print(f"\n📝 {label}:")
    for i, item in enumerate(items, 1):
        print(f"  {i}. {item}")

    print("\nOpções: [Enter=manter] [r X,Y=remover] [a nome=adicionar] [c=continuar]")
    while True:
        action = input("Ação: ").strip().lower()
        if action == "c" or action == "":
            break
        if action.startswith("r "):
            # Remove items by number or name
            to_remove = [part.strip() for part in action[2:].split(",")]
            new_items = []
            for i, item in enumerate(items, 1):
                if str(i) not in to_remove and item not in to_remove:
                    new_items.append(item)
            items = new_items
            print(f"  Atualizado: {items}")
        elif action.startswith("a "):
            new_item = action[2:].strip()
            if new_item and new_item not in items:
                items.append(new_item)
            print(f"  Atualizado: {items}")
        else:
            print("  Comandos: 'r 1,2' para remover, 'a Nome' para adicionar, 'c' para continuar.")

    return items


def select_language() -> str:
    """Allows user to select the project language."""
    print("\n🌐 Selecione o idioma do projeto:")
    print("  1. Português (docs, UI, mensagens em português)")
    print("  2. English (docs, UI, messages in English)")
    choice = input("Escolha (1-2) [padrão=1]: ").strip()
    return "Portuguese" if choice != "2" else "English"


def extract_entities_interactive(description: str) -> List[str]:
    """
    Extract entities from user description and show for confirmation.
    NEVER invents entities - only suggests what's found in the text.
    """
    print("\n🔍 Analisando descrição para detectar entidades...")

    # Extract candidates from description
    candidates = extract_entities_from_brief(description)

    if candidates:
        print(f"\n📋 Entidades detectadas na descrição:")
        for i, c in enumerate(candidates, 1):
            print(f"  {i}. {c}")
    else:
        print("\n⚠️ Nenhuma entidade detectada automaticamente na descrição.")

    # Ask user for manual input
    print("\nDigite as entidades do seu projeto (separadas por vírgula):")
    print("Exemplo: Usuario, Agendamento, Produto")
    manual = input("Entidades: ").strip()

    if manual:
        entities = [e.strip() for e in manual.split(",") if e.strip()]
    elif candidates:
        entities = candidates
    else:
        print("\n❌ ERRO: Nenhuma entidade foi definida.")
        print("   O projeto NÃO pode ser gerado sem entidades.")
        print("   Por favor, digite pelo menos uma entidade.")
        return extract_entities_interactive(description)  # Retry

    # Show and allow editing
    entities = edit_list("Entidades confirmadas", entities)

    if not entities:
        print("\n❌ ERRO: Nenhuma entidade confirmada. Abortando.")
        return []

    return entities


def extract_features_interactive(description: str, entities: List[str]) -> List[str]:
    """Extract features from description and allow user to confirm/edit."""
    print("\n🔍 Quais funcionalidades o projeto deve ter?")
    print("Exemplos: cadastro, login, listagem, edição, exclusão")

    manual = input("Funcionalidades (separadas por vírgula): ").strip()
    if manual:
        features = [f.strip() for f in manual.split(",") if f.strip()]
    else:
        # Infer basic CRUD from entities
        features = ["Cadastro", "Listagem", "Edição", "Exclusão"]
        print(f"💡 Sugestão básica: {features}")

    features = edit_list("Funcionalidades confirmadas", features)
    return features


def extract_business_rules(description: str, features: List[str]) -> List[str]:
    """Extract business rules from user."""
    print("\n📏 Existem regras de negócio específicas? (deixe vazio se não houver)")
    print("Exemplo: Apenas admin pode deletar, Usuário não pode agendar no passado")

    manual = input("Regras de negócio (separadas por vírgula): ").strip()
    if manual:
        rules = [r.strip() for r in manual.split(",") if r.strip()]
    else:
        rules = []
        print("  (Nenhuma regra de negócio definida)")

    return rules


# ── REMOVED: Default entities dictionaries ──
# Entities must now come from user input ONLY


def _print_summary(brief: dict):
    """Print final summary before generation confirmation."""
    print("\n" + "=" * 50)
    print("       📋 RESUMO FINAL — CONFIRMAÇÃO")
    print("=" * 50)
    for k, v in brief.items():
        if isinstance(v, list):
            print(f"  {k}:")
            for item in v:
                print(f"    - {item}")
        else:
            print(f"  {k}: {v}")
    print("=" * 50)


def briefing_saas(project_name: str, idea: str) -> dict:
    """Coleta o briefing para SaaS com modo assistido."""
    print("\n[ Modo SaaS Completo ]")

    language = select_language()

    brief = {
        "Tipo": "SaaS Completo",
        "Nome": project_name,
        "Ideia": idea,
        "language": language,
        "stack": "FastAPI",  # default, user can change
        "architecture": "Clean Code + separação de camadas",
    }

    # Extract entities from user input ONLY
    entities = extract_entities_interactive(idea)
    if not entities:
        return {}
    brief["Entidades"] = entities

    # Extract features
    features = extract_features_interactive(idea, entities)
    brief["Funcionalidades"] = features

    # Extract business rules
    rules = extract_business_rules(idea, features)
    brief["Regras de Negócio"] = rules

    # Auth and other settings
    brief["Autenticação"] = "JWT + Refresh Token"
    brief["Segurança"] = ["bcrypt", "validação de input", "rate limit", "proteção básica OWASP"]
    brief["Banco de Dados"] = "SQLite (dev) / PostgreSQL (produção)"
    brief["Testes"] = "pytest (meta 80%+ de cobertura)"

    return brief


def briefing_api(project_name: str, idea: str) -> dict:
    """Coleta o briefing para API Backend."""
    print("\n[ Modo API Backend ]")

    language = select_language()

    brief = {
        "Tipo": "API Backend",
        "Nome": project_name,
        "Ideia": idea,
        "language": language,
        "stack": "FastAPI",
        "architecture": "Clean Code (Controller → Service → Repository)",
    }

    # Extract entities from user input ONLY
    entities = extract_entities_interactive(idea)
    if not entities:
        return {}
    brief["Entidades"] = entities

    # Extract features
    features = extract_features_interactive(idea, entities)
    brief["Funcionalidades"] = features

    # Extract business rules
    rules = extract_business_rules(idea, features)
    brief["Regras de Negócio"] = rules

    # Auth and other settings
    brief["Autenticação"] = "JWT (ativado por padrão)"
    brief["Segurança"] = ["bcrypt", "validação de input", "headers de segurança"]
    brief["Banco de Dados"] = "SQLite (dev)"
    brief["Testes"] = "pytest básico"

    return brief


def briefing_static(project_name: str, description: str) -> dict:
    """Coleta o briefing para site estático."""
    print("\n[ Modo Site Estático ]")

    language = select_language()

    brief = {
        "Tipo": "Site Estático",
        "Nome": project_name,
        "Descrição": description,
        "language": language,
        "stack": "Static HTML/CSS/JS",
        "architecture": "Single Page",
    }

    sections_raw = input("\nQuais seções? (ex: Hero, Sobre, Contato / vazio = padrão): ").strip()
    if sections_raw:
        brief["Seções"] = [s.strip() for s in sections_raw.split(",") if s.strip()]
    else:
        brief["Seções"] = ["Hero", "Sobre", "Serviços", "Depoimentos", "Contato", "Footer"]

    brief["Design"] = "Futurista + responsivo mobile/desktop"
    brief["Segurança"] = ["sem credenciais no frontend", "sanitização de inputs", "CSP básica"]
    brief["Testes"] = ["security-checklist", "ui-checklist", "accessibility-checklist"]

    return brief


def run_briefing(project_type: str, project_name: str, idea: str, nav=None) -> dict:
    """
    Orquestrador principal do briefing.
    Retorna o brief final após confirmação do usuário.
    REGRA: NUNCA gerar sem confirmação explícita.
    """
    if project_type == "1":
        brief = briefing_saas(project_name, idea)
    elif project_type == "2":
        brief = briefing_api(project_name, idea)
    else:
        brief = briefing_static(project_name, idea)

    if not brief:
        print("\n❌ Briefing cancelado: nenhuma entidade confirmada.")
        return {}

    # Validação mínima: nunca sair sem segurança
    if "Segurança" not in brief:
        brief["Segurança"] = ["validação de input", "autenticação básica"]

    # ── Bloco de Automação & Agentes ─────────────────────────────
    # Só pergunta para SaaS e API (não faz sentido para site estático)
    if project_type in ("1", "2"):
        from briefing.automation import collect_automation, format_automation_summary
        from briefing.architecture import collect_architecture_block, format_architecture_for_summary
        _nav = nav or _SimpleNav()
        auto = collect_automation(_nav)
        if auto == "__BACK__":
            print("  ↩️  Voltando ao briefing...")
            auto = {"automation_level": "none", "automation_types": [], "agents": []}
        brief.update(format_automation_summary(auto))
        brief["_automation_raw"] = auto

        arch = collect_architecture_block("generic", project_type)
        brief["_architecture_raw"] = arch
        brief.update(format_architecture_for_summary(arch.get("advanced_architecture", {})))

    # ── PRE-GENERATION VALIDATION ────────────────────────────────
    _print_summary(brief)

    print("\n🔒 VERIFICAÇÃO FINAL:")
    print(f"  - Entidades: {brief.get('Entidades', [])}")
    print(f"  - Funcionalidades: {brief.get('Funcionalidades', [])}")
    print(f"  - Regras de Negócio: {brief.get('Regras de Negócio', [])}")
    print(f"  - Idioma: {brief.get('language', 'Portuguese')}")
    print(f"  - Stack: {brief.get('stack', 'N/A')}")
    print(f"  - Arquitetura: {brief.get('architecture', 'N/A')}")

    if not confirm("\nConfirmar e gerar projeto?"):
        print("\n❌ Geração cancelada pelo usuário. Nenhum arquivo foi criado.")
        return {}

    print("\n🚀 Iniciando geração...\n")
    return brief


class _SimpleNav:
    """Nav mínimo para quando o briefing é chamado sem um Navigator externo."""
    def ask(self, key, prompt, options=None, default="", required=True, correct=True):
        hint = f" [padrão: {default}]" if default else ""
        raw = input(f"{prompt}{hint}: ").strip() or default
        if options and raw in options:
            return options[raw]
        return raw

    def show_history(self):
        pass
