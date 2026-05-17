"""
credentials.py — Módulo de Configuração Segura de Credenciais
Regra de Ouro: NUNCA pedir senha/API key diretamente no terminal.
Gera apenas .env.example com instruções claras no README.
"""

# ── Catálogo de integrações disponíveis ──────────────────────────

INTEGRATIONS_CATALOG = {
    # Notificações
    "telegram": {
        "label": "📱 Telegram Bot",
        "category": "Notificações",
        "env_vars": {
            "TELEGRAM_BOT_TOKEN": "SEU_TOKEN_AQUI  # Obtenha em t.me/BotFather",
            "TELEGRAM_CHAT_ID":   "SEU_CHAT_ID_AQUI",
        },
        "docs_url": "https://core.telegram.org/bots/api",
        "demo_mode": True,
        "demo_note": "Em modo demo, mensagens são apenas logadas no console.",
    },
    "whatsapp": {
        "label": "💬 WhatsApp (Twilio)",
        "category": "Notificações",
        "env_vars": {
            "TWILIO_ACCOUNT_SID": "SEU_ACCOUNT_SID  # console.twilio.com",
            "TWILIO_AUTH_TOKEN":  "SEU_AUTH_TOKEN   # ⚠️ NUNCA commite este valor",
            "TWILIO_FROM_NUMBER": "+14155238886",
            "TWILIO_TO_NUMBER":   "+5511999999999",
        },
        "docs_url": "https://www.twilio.com/docs/whatsapp",
        "demo_mode": True,
        "demo_note": "Em modo demo, notificações são simuladas localmente.",
    },
    # E-mail
    "smtp": {
        "label": "📧 E-mail (SMTP)",
        "category": "E-mail",
        "env_vars": {
            "SMTP_HOST":     "smtp.gmail.com",
            "SMTP_PORT":     "587",
            "SMTP_USER":     "seu@email.com",
            "SMTP_PASSWORD": "SUA_APP_PASSWORD  # ⚠️ Use App Password, não senha real",
            "ADMIN_EMAIL":   "admin@seudominio.com",
        },
        "docs_url": "https://support.google.com/accounts/answer/185833",
        "demo_mode": True,
        "demo_note": "Em modo demo, e-mails são salvos em /logs/emails_demo.txt.",
    },
    "sendgrid": {
        "label": "📧 SendGrid",
        "category": "E-mail",
        "env_vars": {
            "SENDGRID_API_KEY": "SG.SEU_TOKEN_AQUI  # app.sendgrid.com",
            "SENDGRID_FROM":    "noreply@seudominio.com",
            "ADMIN_EMAIL":      "admin@seudominio.com",
        },
        "docs_url": "https://docs.sendgrid.com",
        "demo_mode": True,
        "demo_note": "Em modo demo, e-mails são logados sem envio real.",
    },
    # IA / LLM
    "openai": {
        "label": "🤖 OpenAI (GPT)",
        "category": "IA / LLM",
        "env_vars": {
            "OPENAI_API_KEY": "sk-SEU_TOKEN_AQUI  # ⚠️ Nunca commite esta chave",
            "OPENAI_MODEL":   "gpt-4o",
        },
        "docs_url": "https://platform.openai.com/docs",
        "demo_mode": True,
        "demo_note": "Em modo demo, respostas são mockadas com dados fixos.",
    },
    "gemini": {
        "label": "🤖 Google Gemini",
        "category": "IA / LLM",
        "env_vars": {
            "GEMINI_API_KEY": "SEU_TOKEN_AQUI  # aistudio.google.com",
            "GEMINI_MODEL":   "gemini-2.0-flash",
        },
        "docs_url": "https://ai.google.dev/docs",
        "demo_mode": True,
        "demo_note": "Em modo demo, respostas de IA são simuladas localmente.",
    },
    # Pagamentos
    "stripe": {
        "label": "💳 Stripe (Pagamentos)",
        "category": "Pagamentos",
        "env_vars": {
            "STRIPE_PUBLIC_KEY":  "pk_test_SEU_TOKEN  # dashboard.stripe.com",
            "STRIPE_SECRET_KEY":  "sk_test_SEU_TOKEN  # ⚠️ Apenas no backend",
            "STRIPE_WEBHOOK_SECRET": "whsec_SEU_TOKEN",
        },
        "docs_url": "https://stripe.com/docs",
        "demo_mode": True,
        "demo_note": "Use chaves de teste (pk_test_ / sk_test_) em desenvolvimento.",
    },
    # Storage
    "s3": {
        "label": "☁️  AWS S3 (Storage)",
        "category": "Storage",
        "env_vars": {
            "AWS_ACCESS_KEY_ID":     "SEU_ACCESS_KEY  # aws.amazon.com/iam",
            "AWS_SECRET_ACCESS_KEY": "SEU_SECRET_KEY  # ⚠️ Nunca commite",
            "AWS_BUCKET_NAME":       "nome-do-seu-bucket",
            "AWS_REGION":            "us-east-1",
        },
        "docs_url": "https://docs.aws.amazon.com/s3",
        "demo_mode": True,
        "demo_note": "Em modo demo, arquivos são salvos no diretório /tmp/s3_demo/.",
    },
    # Banco de dados
    "postgres": {
        "label": "🗄️  PostgreSQL",
        "category": "Banco de Dados",
        "env_vars": {
            "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname  # ⚠️ Nunca commite",
            "POSTGRES_USER": "postgres",
            "POSTGRES_PASSWORD": "SUA_SENHA  # ⚠️ Nunca commite",
            "POSTGRES_DB": "nome_do_banco",
        },
        "docs_url": "https://www.postgresql.org/docs/",
        "demo_mode": True,
        "demo_note": "Em modo demo, usa SQLite local automaticamente.",
    },
}

# Agrupamento por categoria
CATEGORIES_ORDER = [
    "Notificações", "E-mail", "IA / LLM", "Pagamentos", "Storage", "Banco de Dados"
]

# Opcoes usadas pelo bloco principal de automacao/integracoes.
INTEGRATIONS_CATALOG["smtp_sendgrid"] = {
    "label": "E-mail SMTP/SendGrid",
    "category": "E-mail",
    "env_vars": {
        "SMTP_HOST": "",
        "SMTP_PORT": "",
        "SMTP_USER": "",
        "SMTP_PASSWORD": "",
        "SENDGRID_API_KEY": "",
        "SENDGRID_FROM": "",
    },
    "docs_url": "https://docs.sendgrid.com",
    "demo_mode": True,
    "demo_note": "Em modo demo, e-mails sao logados sem envio real.",
}
INTEGRATIONS_CATALOG["google_sheets"] = {
    "label": "Google Sheets",
    "category": "Storage",
    "env_vars": {
        "GOOGLE_SERVICE_ACCOUNT_JSON": "",
        "GOOGLE_SHEET_ID": "",
    },
    "docs_url": "https://developers.google.com/sheets/api",
    "demo_mode": True,
    "demo_note": "Em modo demo, registros ficam apenas no fluxo local.",
}
INTEGRATIONS_CATALOG["custom_api"] = {
    "label": "API externa personalizada",
    "category": "Notificações",
    "env_vars": {
        "EXTERNAL_API_URL": "",
        "EXTERNAL_API_KEY": "",
        "EXTERNAL_API_SECRET": "",
    },
    "docs_url": "https://developer.mozilla.org/docs/Web/HTTP",
    "demo_mode": True,
    "demo_note": "Em modo demo, chamadas externas sao simuladas.",
}


def show_integrations_menu() -> list[str]:
    """Exibe menu de integrações e retorna as chaves escolhidas."""
    print("\n[ Integrações Disponíveis ]")
    print("  Digite os números separados por vírgula (ex: 1,3) ou Enter para nenhuma.")
    print()

    numbered = {}
    i = 1
    for cat in CATEGORIES_ORDER:
        items = {k: v for k, v in INTEGRATIONS_CATALOG.items() if v["category"] == cat}
        if items:
            print(f"  ── {cat} ──")
            for key, info in items.items():
                print(f"  {i:2d}. {info['label']}")
                numbered[str(i)] = key
                i += 1
    print()

    raw = input("  Escolha (ou Enter para nenhuma): ").strip()
    if not raw:
        return []

    chosen = []
    for part in raw.split(","):
        key = numbered.get(part.strip())
        if key and key not in chosen:
            chosen.append(key)

    return chosen


def generate_env_example(integrations: list[str], project_name: str,
                          automation: dict = None) -> str:
    """Gera o conteúdo do .env.example de forma segura."""
    pn_lower = project_name.lower().replace(" ", "_")
    lines = [
        f"# .env.example — {project_name}",
        "# ═══════════════════════════════════════════════════════",
        "# ⚠️  IMPORTANTE:",
        "#   1. Copie este arquivo para .env",
        "#   2. Preencha apenas os valores que você usa",
        "#   3. NUNCA commite o .env no Git",
        "#   4. Adicione .env no seu .gitignore",
        "# ═══════════════════════════════════════════════════════",
        "",
        "# ── App ─────────────────────────────────────────────────",
        f"APP_NAME={project_name}",
        f"APP_ENV=development  # development | production",
        f"APP_PORT=8000",
        "AUTOMATION_ENABLED=true  # true = engine de automação ativa",
        f"DEMO_MODE=true  # true = sem integrações reais",
        "",
        "# ── Banco de Dados (padrão: SQLite local) ───────────────",
        f"DATABASE_URL=sqlite:///./{pn_lower}.db",
        "",
        "# ── Autenticação ─────────────────────────────────────────",
        "SECRET_KEY=GERE_UMA_CHAVE_SEGURA_AQUI  # python -c \"import secrets; print(secrets.token_hex(32))\"",
        "ALGORITHM=HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES=30",
        "",
    ]

    if integrations:
        lines.append("# ── Integrações ─────────────────────────────────────────")
        for key in integrations:
            info = INTEGRATIONS_CATALOG.get(key, {})
            if not info:
                continue
            lines.append(f"\n# {info['label']}")
            lines.append(f"# Docs: {info['docs_url']}")
            if info.get("demo_note"):
                lines.append(f"# Demo: {info['demo_note']}")
            for var in info.get("env_vars", {}).keys():
                lines.append(f"{var}=")

    lines += [
        "",
        "# ─────────────────────────────────────────────────────────",
        "# Gerado por SaaS Factory AI — Configuração Segura",
    ]
    return "\n".join(lines)


def generate_integrations_doc(integrations: list[str], project_name: str,
                               automation: dict = None) -> str:
    """Gera docs/INTEGRATIONS.md com instruções detalhadas."""
    if not integrations:
        return f"""# Integrações — {project_name}

Nenhuma integração configurada neste projeto.

O sistema opera em **modo demo** por padrão.
Para adicionar integrações, edite o `.env` e consulte este documento.
"""

    lines = [
        f"# Integrações — {project_name}",
        "",
        "> ⚠️ **Segurança:** Nunca commite o arquivo `.env`. Adicione ao `.gitignore`.",
        "",
        "## Integrações Configuradas",
        "",
    ]

    for key in integrations:
        info = INTEGRATIONS_CATALOG.get(key, {})
        if not info:
            continue
        lines += [
            f"### {info['label']}",
            "",
            f"- **Categoria:** {info['category']}",
            f"- **Documentação:** [{info['docs_url']}]({info['docs_url']})",
            f"- **Modo Demo:** {info['demo_note']}",
            "",
            "**Variáveis de ambiente necessárias:**",
            "```env",
        ]
        for var in info.get("env_vars", {}).keys():
            lines.append(f"{var}=")
        lines += ["```", ""]

    lines += [
        "## Como Configurar",
        "",
        "1. Copie `.env.example` para `.env`:",
        "   ```bash",
        "   cp .env.example .env",
        "   ```",
        "2. Edite o `.env` com seus valores reais.",
        "3. **Nunca** commite o `.env` no Git.",
        "4. Adicione `.env` ao `.gitignore` se ainda não estiver.",
        "",
        "## Modo Demo",
        "",
        "O sistema funciona sem integrações reais.",
        "Defina `DEMO_MODE=true` no `.env` para usar mocks locais.",
        "Defina `AUTOMATION_ENABLED=true` para ativar a engine de automação.",
        "A engine persiste leads em `data/leads.json` e registra eventos em `logs/automation.log`.",
        "",
        "---",
        "*Gerado por SaaS Factory AI*",
    ]
    return "\n".join(lines)


def generate_gitignore() -> str:
    return """# Segurança — nunca commite credenciais
.env
*.env
.env.local
.env.production

# Python
__pycache__/
*.py[cod]
*.egg-info/
venv/
.venv/
dist/
*.db
*.sqlite3

# Node
node_modules/
dist/
coverage/

# IDE
.vscode/
.idea/
*.swp

# Logs
logs/
*.log
"""


def collect_integrations() -> dict:
    """
    Ponto de entrada principal para coleta de integrações.
    Retorna dict com as integrações escolhidas.
    """
    print("\n" + "─" * 42)
    print("  🔐 CONFIGURAÇÃO SEGURA DE CREDENCIAIS")
    print("─" * 42)
    print("  ℹ️  Nunca pediremos senhas ou tokens aqui.")
    print("  ℹ️  Apenas geraremos .env.example com instruções.")
    print()

    chosen = show_integrations_menu()

    if chosen:
        labels = [INTEGRATIONS_CATALOG[k]["label"] for k in chosen]
        print(f"\n  ✅ Integrações selecionadas: {', '.join(labels)}")
    else:
        print("  ℹ️  Nenhuma integração. Projeto rodará em modo demo.")

    demo_mode = not bool(chosen)
    return {
        "integrations": chosen,
        "demo_mode": demo_mode,
        "env_vars_needed": [
            var
            for key in chosen
            for var in INTEGRATIONS_CATALOG.get(key, {}).get("env_vars", {}).keys()
        ],
    }
