"""
automation.py — Módulo de Automação & Agentes Inteligentes (Expandido)
Funciona para SaaS, API e Site Estático.
"""

# ── Tipos de automação ────────────────────────────────────────────

AUTOMATION_LEVEL_OPTIONS = {
    "1": "none",
    "2": "basic",
    "3": "advanced",
}

AUTOMATION_TYPE_OPTIONS = {
    "1": "email",
    "2": "notifications",
    "3": "form_autoresponse",
    "4": "lead_capture",
    "5": "newsletter",
    "6": "external_api",
    "7": "scheduling",
    "8": "auto_reports",
}

AUTOMATION_TYPE_LABELS = {
    "email":            "📧 Envio de e-mail",
    "notifications":    "💬 Notificações WhatsApp/Telegram",
    "form_autoresponse":"📝 Formulário com resposta automática",
    "lead_capture":     "🎯 Captura de leads",
    "newsletter":       "📰 Newsletter",
    "external_api":     "🔗 Integração com API externa",
    "scheduling":       "📅 Agendamento automático",
    "auto_reports":     "📊 Relatórios automáticos",
}

AGENT_TYPE_OPTIONS = {
    "1": "support_agent",
    "2": "helpdesk_agent",
    "3": "sales_agent",
    "4": "analytics_agent",
    "5": "task_agent",
    "6": "content_agent",
}

AGENT_TYPE_LABELS = {
    "support_agent":   "🤖 Agente de atendimento",
    "helpdesk_agent":  "🎧 Agente de suporte",
    "sales_agent":     "💼 Agente de vendas",
    "analytics_agent": "📈 Agente de análise de dados",
    "task_agent":      "🔄 Agente de automação de tarefas",
    "content_agent":   "📝 Agente de conteúdo/notícias",
}

# Tipos que impactam o site estático
STATIC_SITE_TYPES = {"lead_capture", "newsletter", "form_autoresponse", "content_agent"}


def _parse_multi(raw: str, options: dict) -> list:
    """Converte '1,3,5' em lista de valores do dict."""
    chosen = []
    for part in raw.replace(" ", "").split(","):
        val = options.get(part.strip())
        if val and val not in chosen:
            chosen.append(val)
    return chosen


def collect_automation_block() -> dict:
    """
    Bloco completo de automação — chamado para TODOS os tipos de projeto.
    Retorna dict com todas as escolhas do usuário.
    """
    result = {
        "automation_level": "none",
        "automation_types": [],
        "selected_agents": [],
        "requires_env_setup": False,
    }

    print("\n" + "═" * 44)
    print("  ⚡ AUTOMAÇÃO & AGENTES INTELIGENTES")
    print("═" * 44)

    # 1. Nível
    print("\n[ Automação & Agentes ]")
    print("Deseja adicionar automação?")
    print("  1. Não usar automação")
    print("  2. Automação básica")
    print("  3. Automação avançada com agentes")
    level_raw = input("  Escolha (1-3) [padrão: 1]: ").strip() or "1"
    level = AUTOMATION_LEVEL_OPTIONS.get(level_raw, "none")
    result["automation_level"] = level

    if level == "none":
        print("  ℹ️  Sem automação configurada.")
        return result

    # 2. Tipos de automação
    print("\n[ Tipos de Automação ]")
    print("  Selecione uma ou mais opções separadas por vírgula (ex: 1,3,5):")
    for k, v in AUTOMATION_TYPE_LABELS.items():
        idx = [ki for ki, vi in AUTOMATION_TYPE_OPTIONS.items() if vi == k][0]
        print(f"  {idx}. {v}")

    types_raw = input("\n  Escolha: ").strip() or "1"
    chosen_types = _parse_multi(types_raw, AUTOMATION_TYPE_OPTIONS)
    if not chosen_types:
        chosen_types = ["email"]
        print("  ℹ️  Usando 'Envio de e-mail' como padrão.")

    result["automation_types"] = chosen_types
    print(f"\n  ✅ Automações: {', '.join(AUTOMATION_TYPE_LABELS[t] for t in chosen_types)}")

    # 3. Agentes (só para advanced)
    if level == "advanced":
        print("\n[ Agentes Inteligentes ]")
        print("  Selecione um ou mais (ex: 1,3):")
        for k, label in AGENT_TYPE_LABELS.items():
            idx = [ki for ki, vi in AGENT_TYPE_OPTIONS.items() if vi == k][0]
            print(f"  {idx}. {label}")

        agents_raw = input("\n  Escolha [padrão: 1]: ").strip() or "1"
        chosen_agents = _parse_multi(agents_raw, AGENT_TYPE_OPTIONS)
        if not chosen_agents:
            chosen_agents = ["support_agent"]

        result["selected_agents"] = chosen_agents
        print(f"\n  ✅ Agentes: {', '.join(AGENT_TYPE_LABELS[a] for a in chosen_agents)}")

    result["requires_env_setup"] = True
    return result


def collect_integrations_block() -> dict:
    """
    Bloco de configuração segura de integrações externas.
    NUNCA pede credenciais — apenas registra o que gerar no .env.example.
    """
    INTEGRATION_OPTIONS = {
        "1": "smtp_sendgrid",
        "2": "telegram",
        "3": "whatsapp",
        "4": "stripe",
        "5": "google_sheets",
        "6": "custom_api",
    }
    INTEGRATION_LABELS = {
        "smtp_sendgrid": "📧 E-mail SMTP/SendGrid",
        "telegram":      "📱 Telegram Bot",
        "whatsapp":      "💬 WhatsApp API",
        "stripe":        "💳 Stripe/Pagamentos",
        "google_sheets": "📊 Google Sheets",
        "custom_api":    "🔗 API externa personalizada",
    }

    result = {
        "external_integrations": [],
        "env_variables": [],
        "demo_mode": True,
    }

    print("\n" + "═" * 44)
    print("  🔐 CONFIGURAÇÃO SEGURA DE INTEGRAÇÕES")
    print("═" * 44)
    print("\n[ Configuração Segura de Integrações ]")
    print("  ⚠️  Nunca pediremos API key, token ou senha aqui.")
    print("  ℹ️  Apenas geraremos .env.example e INTEGRATIONS.md.")

    wants = input("\n  Deseja preparar integrações externas? (s/n) [padrão: n]: ").strip().lower()
    if wants not in ("s", "sim", "yes", "y"):
        print("  ℹ️  Sem integrações. Projeto em modo demo completo.")
        return result

    print("\n[ Selecione as integrações: ]")
    for k, label in INTEGRATION_LABELS.items():
        idx = [ki for ki, vi in INTEGRATION_OPTIONS.items() if vi == k][0]
        print(f"  {idx}. {label}")

    raw = input("\n  Escolha (ex: 1,3) ou Enter para nenhuma: ").strip()
    if not raw:
        return result

    chosen = _parse_multi(raw, INTEGRATION_OPTIONS)
    result["external_integrations"] = chosen
    result["demo_mode"] = False

    # Mapear variáveis de ambiente necessárias
    ENV_MAP = {
        "smtp_sendgrid": ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD",
                          "SENDGRID_API_KEY", "SENDGRID_FROM", "ADMIN_EMAIL"],
        "telegram":      ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
        "whatsapp":      ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER", "TWILIO_TO_NUMBER"],
        "stripe":        ["STRIPE_PUBLIC_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        "google_sheets": ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_SHEET_ID"],
        "custom_api":    ["EXTERNAL_API_URL", "EXTERNAL_API_KEY", "EXTERNAL_API_SECRET"],
    }
    for key in chosen:
        for var in ENV_MAP.get(key, []):
            if var not in result["env_variables"]:
                result["env_variables"].append(var)

    labels = [INTEGRATION_LABELS[k] for k in chosen]
    print(f"\n  ✅ Integrações: {', '.join(labels)}")
    print(f"  ℹ️  Variáveis a configurar: {len(result['env_variables'])}")
    return result


def format_automation_for_summary(auto: dict, integrations: dict) -> dict:
    """Formata automação e integrações para o resumo final."""
    level_labels = {"none": "Nenhuma", "basic": "Básica", "advanced": "Avançada com Agentes"}
    result = {}

    level = auto.get("automation_level", "none")
    result["Automação"] = level_labels.get(level, level)

    types = auto.get("automation_types", [])
    if types:
        result["Tipos de Automação"] = [AUTOMATION_TYPE_LABELS.get(t, t) for t in types]

    agents = auto.get("selected_agents", [])
    if agents:
        result["Agentes IA"] = [AGENT_TYPE_LABELS.get(a, a) for a in agents]

    ints = integrations.get("external_integrations", [])
    INTEGRATION_LABELS = {
        "smtp_sendgrid": "📧 E-mail SMTP/SendGrid",
        "telegram":      "📱 Telegram Bot",
        "whatsapp":      "💬 WhatsApp API",
        "stripe":        "💳 Stripe/Pagamentos",
        "google_sheets": "📊 Google Sheets",
        "custom_api":    "🔗 API externa personalizada",
    }
    if ints:
        result["Integrações Externas"] = [INTEGRATION_LABELS.get(i, i) for i in ints]
        result["Segurança de Credenciais"] = ".env.example gerado — sem credenciais reais"
    else:
        result["Integrações"] = "Nenhuma (modo demo ativo)"

    env_vars = integrations.get("env_variables", [])
    if env_vars:
        result["Variáveis de Ambiente"] = f"{len(env_vars)} variáveis (ver .env.example)"

    return result


# Compatibilidade com imports antigos usados por briefing.briefing.
def collect_automation() -> dict:
    return collect_automation_block()


def format_automation_summary(auto: dict, integrations: dict = None) -> dict:
    return format_automation_for_summary(auto, integrations or {})
