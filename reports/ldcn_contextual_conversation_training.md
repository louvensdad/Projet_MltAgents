# LDCN Contextual Conversation Training

## Prompt criado

- criado `backend/app/ldcn/prompts/ldcn_system_prompt.md`
- define personalidade, regras de resposta, uso de contexto real e limite de resposta para voz

## Memoria criada

- criada memoria por `conversation_id` em `backend/app/ldcn/memory/session_memory.py`
- guarda:
  - ultimos turnos da conversa
  - resumo
  - objetivo principal
  - decisoes tomadas
  - campos coletados
  - pendencias
  - ultimo erro
  - ultima acao
- filtro de dados sensiveis preservado no armazenamento

## Contexto conectado

- `frontend/src/ldcn/chat/contextCollector.ts` agora envia:
  - `conversation_id`
  - `query`
  - `source`
  - `route`
  - `page`
  - `page_title`
  - `wizard_step`
  - `active_stack_id`
  - `active_project_id`
  - `last_error`
  - `last_generation_result`
  - `locale`
  - `history`
  - `history_summary`

## State machine

- criado `backend/app/ldcn/ldcn_conversation_state.py`
- estados:
  - `greeting`
  - `discovering_need`
  - `collecting_requirements`
  - `recommending_stack`
  - `filling_wizard`
  - `validating`
  - `generating`
  - `troubleshooting`
  - `explaining`
  - `idle`

## Intents

- ampliado `backend/app/ldcn/intent_classifier.py`
- novas leituras relevantes:
  - `continue_project`
  - `explain_screen`
- mantido o endpoint unico `/api/ldcn/chat` para texto e voz

## Knowledge base / RAG local

- criada base local em `backend/app/ldcn/knowledge_base/`
- documentos:
  - `stacks.md`
  - `routes.md`
  - `agents.md`
  - `generation_pipeline.md`
  - `templates.md`
  - `troubleshooting.md`
- `master_agent` injeta snippets relevantes por intencao e rota

## Testes de conversa

- fluxo contextual coberto:
  - "Quero criar um sistema de clinica"
  - "Quero enterprise"
  - "Pode preencher"
- esperado:
  - contexto de clinica preservado
  - arquitetura enterprise sugerida
  - acao de `prefill_wizard` retornada

## Testes de voz

- voz usa o mesmo cerebro do chat
- resposta de voz fica curta por `source == voice`
- erro atual e lido de `last_error`

## Problemas restantes

- a conversa ainda e heuristica/deterministica, nao um modelo treinado do zero
- a qualidade final depende da riqueza do contexto enviado pela tela ativa
- a validacao de fluidez por voz real continua dependendo de browser manual
