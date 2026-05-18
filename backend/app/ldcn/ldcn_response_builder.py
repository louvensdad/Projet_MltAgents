from __future__ import annotations

from backend.app.ldcn.ldcn_context import LdcnAction, LdcnContext, LdcnResponse


class LdcnResponseBuilder:
    def build(self, context: LdcnContext, intent: str, agents: list[str]) -> LdcnResponse:
        reply = self._reply(context, intent)
        suggested_actions, ui_actions = self._actions(context, intent)
        return LdcnResponse(
            success=True,
            reply=reply,
            intent=intent,
            agents_used=agents,
            suggested_actions=suggested_actions,
            ui_actions=ui_actions,
            context_summary={
                "page": context.page,
                "project_id": context.project_id,
                "stack_id": context.stack_id,
                "mode": context.mode,
                "wizard_step": context.wizard_step,
                "selected_template": context.selected_template,
                "recent_errors": context.recent_errors[:3],
            },
        )

    def _reply(self, context: LdcnContext, intent: str) -> str:
        message = context.message or ""
        text = message.lower().strip()
        memory = context.context.get("conversation_memory", {}) if isinstance(context.context, dict) else {}
        recent_turns = memory.get("recent_turns", []) if isinstance(memory, dict) else []
        last_turn = recent_turns[-1] if recent_turns else {}
        last_message = str(last_turn.get("message", "")).lower()
        stage = self._dialog_stage(recent_turns)
        topic = self._conversation_topic(text, last_message)

        if self._is_negative_confirmation(text):
            return self._first_question(topic)

        if self._is_simple_affirmation(text) and intent == "create_project":
            return (
                "Perfeito. Me diga só o nome, o objetivo principal e o público da landing page, "
                "que eu monto a estrutura certa."
            )

        if intent == "create_project":
            domain = self._domain_hint(message)
            if stage == "awaiting_name":
                if self._looks_like_name(text):
                    return "Perfeito. Agora me diga o objetivo principal da landing page."
                return self._first_question(topic)
            if stage == "awaiting_goal":
                if self._looks_like_goal(text):
                    return "Ótimo. Agora me diga o público principal da landing page."
                return "Certo. Agora me diga o objetivo principal da landing page."
            if topic == "landing_page":
                return f"Entendi. Isso parece {domain}. {self._first_question(topic)}"
            return (
                f"Entendi. Isso parece {domain}. "
                "Vamos começar do zero: qual nome do projeto e qual é o objetivo principal dele?"
            )
        if intent == "choose_stack":
            return "Posso comparar as stacks pelo tipo de produto, escala, time e prazo. Para SaaS com painel e API, FastAPI ou Spring Boot costumam ser boas escolhas; para experiencia web rica, Next.js ajuda no frontend."
        if intent == "explain_architecture":
            return "Vou organizar a arquitetura por camadas: interface, API, dominio, dados, seguranca, observabilidade e entrega. Posso abrir o projeto e explicar os pontos fortes e riscos."
        if intent == "fix_error":
            if context.recent_errors:
                return f"Encontrei erro recente no contexto: {context.recent_errors[0]}. Vou orientar a correcao sem assumir que a acao ja foi executada."
            return "Posso analisar o erro, identificar a etapa do pipeline e acionar o agente certo. Envie a mensagem de erro ou abra a tela onde ele ocorreu."
        if intent == "validate_project":
            return "Vou direcionar a validacao para QualityAgent, SecurityAgent e fiscal da stack. A validacao deve bloquear projeto vazio, stack errada, segredo real e download inconsistente."
        if intent == "use_template":
            return "Posso recomendar um template, abrir o preview, explicar a arquitetura e preparar o wizard com os dados do template escolhido."
        if intent == "generate_prompt_master":
            return "Vou estruturar um Prompt Master com objetivo, publico, entidades, regras, stack, seguranca, testes e criterios de aceite."
        if intent == "download_project":
            return "Vou verificar projeto, path registrado, ZIP e erros conhecidos de download. Se houver falha, eu explico a causa antes de sugerir a correcao."
        if intent == "improve_ui":
            return "Posso revisar UI e UX por densidade, responsividade, estados vazios, loading, navegacao e consistencia visual do produto."
        if intent == "security_review":
            return "Vou acionar a revisao de seguranca. Eu nao exponho segredos e nao trato .env.example ou os.getenv como vazamento real."
        if intent == "billing_agent_boost":
            return "Agent Boost pode usar modelo externo pelo backend, sem expor API key no frontend. Acoes com custo precisam de confirmacao antes."
        if intent == "general_help":
            return self._general_help_reply(context, recent_turns, text)
        return "Ola, eu sou o Vens. Posso te ajudar a criar, revisar ou melhorar seu projeto."

    def _is_negative_confirmation(self, text: str) -> bool:
        tokens = {"nao", "não", "nop", "negativo", "sem projeto", "sem um projeto", "nao tenho", "não tenho"}
        if any(token in text for token in tokens):
            return True
        return False

    def _is_simple_affirmation(self, text: str) -> bool:
        tokens = {"sim", "isso", "certo", "ok", "beleza", "quero", "vamos", "pode"}
        return text in tokens or any(token == text for token in tokens)

    def _is_greeting_or_wake(self, text: str) -> bool:
        tokens = {"oi", "ola", "ola!", "bom dia", "boa tarde", "boa noite", "vens", "ldcn"}
        return text in tokens or any(token == text for token in tokens)

    def _conversation_topic(self, current_text: str, last_message: str) -> str:
        text = f"{current_text} {last_message}"
        if any(token in text for token in ("landing page", "pagina", "página", "site", "home page")):
            return "landing_page"
        if any(token in text for token in ("saas", "app", "sistema", "projeto", "produto")):
            return "project"
        return "general"

    def _first_question(self, topic: str) -> str:
        if topic == "landing_page":
            return "Sem problema. Vamos criar do zero. Qual nome da landing page?"
        return "Sem problema. Vamos criar do zero. Qual nome do projeto e qual é o objetivo principal dele?"

    def _dialog_stage(self, recent_turns: list[dict]) -> str:
        for turn in reversed(recent_turns):
            reply = str(turn.get("reply", "")).lower()
            if not reply:
                continue
            if "qual nome da landing page" in reply or "qual nome do projeto" in reply:
                return "awaiting_name"
            if "objetivo principal" in reply:
                return "awaiting_goal"
            if "público principal" in reply or "publico principal" in reply:
                return "awaiting_audience"
        return "start"

    def _looks_like_name(self, text: str) -> bool:
        if self._is_negative_confirmation(text):
            return False
        if any(token in text for token in ("quero", "preciso", "para ", "porque", "como", "qual", "meu objetivo", "objetivo")):
            return False
        return len(text.split()) <= 5 and len(text) > 1

    def _looks_like_goal(self, text: str) -> bool:
        if self._is_negative_confirmation(text):
            return False
        return any(token in text for token in ("vender", "venda", "captar", "leads", "agendar", "apresentar", "mostrar", "converter", "divulgar"))

    def _general_help_reply(self, context: LdcnContext, recent_turns: list[dict], text: str) -> str:
        if self._is_greeting_or_wake(text):
            if recent_turns:
                last_user_message = ""
                for turn in reversed(recent_turns):
                    candidate = str(turn.get("message", "")).strip()
                    if candidate:
                        last_user_message = candidate
                        break
                if last_user_message:
                    return "Entendi. Quer seguir de onde paramos ou mudar de assunto?"
            return "Oi, sou o Vens. O que você quer criar ou revisar hoje?"

        if context.page == "/":
            return "Posso te acompanhar. O que você quer construir agora?"
        if context.page.startswith("/create"):
            return "Certo. Me diga o nome do projeto e o objetivo principal."
        if context.page.startswith("/wizard"):
            return "Estou com você no wizard. O que você quer ajustar primeiro?"
        return "Claro. Me conta o que você quer fazer e eu sigo com você."

    def _actions(self, context: LdcnContext, intent: str) -> tuple[list[LdcnAction], list[LdcnAction]]:
        if intent == "create_project":
            stack = self._recommended_stack(context.message, context.stack_id)
            href = f"/wizard/{stack.replace('_', '-')}" if stack else "/wizard"
            action = LdcnAction(type="navigate", label=f"Abrir wizard {self._stack_label(stack)}", href=href)
            prefill = LdcnAction(
                type="prefill_wizard",
                label="Preencher wizard com essa ideia",
                payload={"idea": context.message, "recommended_stack": stack, "mode": "guided"},
            )
            return [action, prefill], [action]
        if intent == "choose_stack":
            return [LdcnAction(type="navigate", label="Comparar stacks", href="/create")], []
        if intent == "use_template":
            return [LdcnAction(type="navigate", label="Abrir templates", href="/templates")], []
        if intent == "download_project":
            href = f"/downloads/{context.project_id}" if context.project_id else "/downloads"
            return [LdcnAction(type="open_download", label="Abrir downloads", href=href)], []
        if intent == "validate_project":
            return [LdcnAction(type="run_validation", label="Validar projeto", payload={"project_id": context.project_id or ""})], []
        if intent == "security_review":
            return [LdcnAction(type="navigate", label="Abrir Security Status", href="/security-status")], []
        if intent == "billing_agent_boost":
            return [LdcnAction(type="navigate", label="Abrir AI Models", href="/ai-models")], []
        return [LdcnAction(type="navigate", label="Abrir Create Project", href="/create")], []

    def _recommended_stack(self, message: str, current_stack: str | None) -> str:
        if current_stack:
            return current_stack.replace("-", "_")
        text = message.lower()
        if any(word in text for word in ("clínica", "clinica", "erp", "gestão", "gestao", "financeiro")):
            return "spring_boot"
        if any(word in text for word in ("ia", "agent", "automação", "automacao", "api")):
            return "fastapi"
        if any(word in text for word in ("site", "landing", "institucional")):
            return "static_site"
        return "fastapi"

    def _stack_label(self, stack: str) -> str:
        labels = {"spring_boot": "Spring Boot", "fastapi": "FastAPI", "static_site": "Static Site"}
        return labels.get(stack, stack.replace("_", " ").title())

    def _domain_hint(self, message: str) -> str:
        text = message.lower()
        if "clínica" in text or "clinica" in text:
            return "um sistema de clinica com pacientes, agenda, profissionais, financeiro e painel administrativo"
        if "venda" in text or "roupa" in text or "e-commerce" in text:
            return "um e-commerce com catalogo, pedidos, checkout, clientes e relatorios"
        if "saas" in text:
            return "um SaaS com autenticacao, painel, dados de negocio e fluxo de assinatura"
        return "um produto digital que precisa de requisitos, arquitetura e stack bem definidos"
