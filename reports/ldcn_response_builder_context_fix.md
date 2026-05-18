# LDCN Response Builder Context Fix

## Problema encontrado

- `backend/app/ldcn/response_builder.py` estava acumulando papel demais
- a conversa era montada por `if intent == ...` com frases fixas
- memoria e contexto entravam de forma superficial
- o tom tendia a repetir "Boa", "Fechado" e variantes
- nao havia trilha clara entre modo local e modo Agent Boost

## Arquitetura nova

Fluxo atual:

1. `IntentClassifier`
2. `SessionMemory`
3. `AgentDispatcher`
4. `LdcnConversationPlanner`
5. `LdcnContextSummarizer`
6. `LdcnNaturalReplyEngine`
7. `LdcnResponseBuilder`

## Arquivos alterados

- `backend/app/ldcn/response_builder.py`
- `backend/app/ldcn/master_agent.py`
- `backend/app/ldcn/memory/session_memory.py`
- `backend/app/ldcn/natural_reply_engine.py`
- `backend/app/ldcn/conversation_planner.py`
- `backend/app/ldcn/context_summarizer.py`
- `backend/app/ldcn/prompts/ldcn_conversation_prompt.md`
- `tests/test_ldcn_api.py`

## Modos

### Local

- usa templates contextuais
- usa `memory_snapshot`
- usa `conversation_state`
- evita repeticao via similaridade com a resposta anterior
- mantem respostas de voz curtas
- se um LLM local estiver configurado, pode usar `OpenAI/LM Studio` antes de cair no deterministico puro

### LLM / Agent Boost

- usa `OpenAI/LM Studio` quando `AI_PROVIDER` e `OPENAI_API_KEY` estiverem configurados
- usa `Gemini` quando o modo Agent Boost estiver disponivel
- injeta prompt de conversa, historico, resumo, contexto de pagina, agentes e especialistas
- se falhar, volta para o modo local

## Memoria usada na resposta

Snapshot relevante:

- `goal`
- `domain`
- `selected_stack`
- `last_decision`
- `pending_question`
- `known_entities`
- `known_features`
- `last_error`
- `last_user_intent`

## Testes de conversa

- `test_ldcn_remembers_clinic_context`
- `test_ldcn_voice_reply_is_short`
- `test_ldcn_does_not_repeat_previous_reply`
- `test_ldcn_uses_last_error`
- `test_ldcn_actions_match_intent`
- `test_ldcn_unknown_intent_asks_natural_question`

## Antes

- respostas por intent
- pouca continuidade
- repeticao frequente
- voz e chat pareciam soltos

## Depois

- resposta gerada por plano + contexto + memoria
- continuidade de dominio preservada
- voz curta
- repeticao reduzida
- fallback deterministico ainda existe, mas com contexto real
- o motor nao depende mais exclusivamente do Agent Boost para sair do modo de frases fixas
