from __future__ import annotations

from backend.app.ldcn.ldcn_agent_dispatcher import LdcnAgentDispatcher
from backend.app.ldcn.ldcn_context import LdcnContext, LdcnResponse
from backend.app.ldcn.ldcn_intent_classifier import LdcnIntentClassifier
from backend.app.ldcn.ldcn_memory import LdcnMemory
from backend.app.ldcn.ldcn_response_builder import LdcnResponseBuilder
from backend.app.services.gemini_service import chat_with_ldcn, verify_platform_key


class LdcnOrchestrator:
    def __init__(self):
        self.classifier = LdcnIntentClassifier()
        self.dispatcher = LdcnAgentDispatcher()
        self.response_builder = LdcnResponseBuilder()
        self.memory = LdcnMemory()

    def chat(self, context: LdcnContext) -> LdcnResponse:
        memory_snapshot = self.memory.user_snapshot(context.user_id, context.session_id, limit=8)
        context.context.setdefault("conversation_memory", memory_snapshot)
        intent = self.classifier.classify(context.message, context.page)
        agents = self.dispatcher.dispatch(intent, context)
        response = self.response_builder.build(context, intent, agents)
        gemini_reply = self._generate_gemini_reply(context, intent, agents, response.reply, memory_snapshot)
        if gemini_reply:
            response.reply = gemini_reply
        self.memory.remember(
            {
                "message": context.message,
                "page": context.page,
                "project_id": context.project_id,
                "stack_id": context.stack_id,
                "user_id": context.user_id,
                "session_id": context.session_id,
                "intent": intent,
                "agents_used": agents,
                "mode": context.mode,
                "locale": context.locale,
                "context": context.context,
                "reply": response.reply,
            }
        )
        return response

    def _generate_gemini_reply(
        self,
        context: LdcnContext,
        intent: str,
        agents: list[str],
        fallback_reply: str,
        memory_snapshot: dict[str, object],
    ) -> str | None:
        platform = verify_platform_key()
        if not platform.get("platform_key_configured"):
            return None

        system_instruction = (
            "Voce e o Vens, assistente principal de um dashboard de engenharia. "
            "Responda em portugues do Brasil. Seja claro, util, calmo e profissional. "
            "Nao afirme ter sentimentos reais. Simule tom e personalidade apenas para melhorar a experiencia. "
            "Nao invente execucoes que nao ocorreram. Se faltar contexto, faca uma pergunta curta. "
            "Se o usuario pedir conversa, responda de forma natural e direta. "
            "Se a conversa comecar com saudacao ou wake word, responda com uma abertura curta e uma pergunta objetiva. "
            "Se houver contexto suficiente, mantenha a resposta curta e pratica. "
            "Use a memoria do usuario e da sessao para personalizar respostas e lembrar preferencias. "
            "Nunca repita a mesma pergunta que apareceu nos turnos recentes. "
            "Se o usuario disser que nao tem projeto, nao pergunte de novo se ele ja tem projeto; siga direto para nome, objetivo, publico e CTA. "
            "Faça apenas uma pergunta por turno quando faltar informacao."
        )
        prompt = (
            "Contexto atual:\n"
            f"- Intent: {intent}\n"
            f"- Page: {context.page}\n"
            f"- Project ID: {context.project_id or 'N/A'}\n"
            f"- Stack ID: {context.stack_id or 'N/A'}\n"
            f"- Locale: {context.locale}\n"
            f"- Mode: {context.mode}\n"
            f"- Agents used: {', '.join(agents) if agents else 'none'}\n"
            f"- Recent errors: {', '.join(context.recent_errors) if context.recent_errors else 'none'}\n"
            f"- Wizard step: {context.wizard_step or 'N/A'}\n"
            f"- Selected template: {context.selected_template or 'N/A'}\n\n"
            f"Mensagem do usuario:\n{context.message}\n\n"
            f"Perfil do usuario:\n{memory_snapshot.get('profile', {})}\n\n"
            f"Resumo do historico:\n{memory_snapshot.get('summary', '')}\n\n"
            f"Memoria recente resumida:\n{memory_snapshot.get('recent_turns', [])}\n\n"
            "Responda apenas com o texto final da conversa. "
            "Nao cite que voce e um modelo. "
            "Nao mencione JSON, prompts, intents, agentes ou politicas internas."
        )

        result = chat_with_ldcn(
            prompt,
            project_context={
                "name": "Vens Dashboard",
                "stack": context.stack_id or "dashboard",
                "type": context.page,
            },
            system_instruction=system_instruction,
        )
        if result.get("success") and result.get("response"):
            return str(result["response"]).strip()
        return fallback_reply
