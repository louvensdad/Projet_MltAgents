# LDCN/Vens Jarvis Voice Fix

## Root Causes

### 1. Conversation loop
- O frontend tinha dois fluxos de fala concorrentes: `LdcnAssistant` e `LdcnVoicePanel`.
- O TTS do assistente era disparado sem um turno único, enquanto o reconhecimento de voz permanecia ativo.
- A fala sintetizada podia voltar para o STT como novo input, gerando eco e repeticao.
- Nao havia um `turn_id` claro para bloquear reprocessamento da propria resposta.

### 2. Microfone ruim
- O fluxo antigo dependia quase so do `SpeechRecognition`, sem medicao real de volume.
- Nao havia calibracao nem metrica visual para o usuario saber se o microfone estava captando.
- O reconhecimento podia ficar com multiplas instancias e sem cleanup consistente.
- A pausa por silencio era fraca e nao havia um encerramento previsivel de comando curto.

## State Machine Created

Arquivo criado:
- `frontend/src/ldcn/state/LdcnStateMachine.ts`

Estados:
- `sleeping`
- `idle`
- `waking`
- `listening`
- `transcribing`
- `thinking`
- `speaking`
- `waiting_confirmation`
- `executing_action`
- `success`
- `warning`
- `error`

Regras principais:
- `sleeping -> waking -> listening -> transcribing -> thinking -> speaking -> idle`
- `thinking -> waiting_confirmation`
- `executing_action -> success`
- `any -> error`

## Context Integrated

Arquivo criado:
- `frontend/src/ldcn/context/LdcnContextProvider.tsx`

O provider passou a coletar:
- rota atual
- pagina atual
- etapa do wizard
- stack selecionada
- ultimo erro
- ultimo projeto gerado
- template selecionado
- status do backend
- status do download
- modo Local/Agent Boost
- idioma
- historico da conversa da sessao

O payload do assistente agora inclui:
- `message`
- `route`
- `page_context`
- `conversation_history`
- `last_error`
- `active_project`
- `locale`

## Voice Layer

Arquivo criado:
- `frontend/src/ldcn/voice/useVoiceRecognition.ts`

Melhorias aplicadas:
- `startListening()` e `stopListening()`
- `transcript` e `interimTranscript`
- `volumeLevel` em tempo real
- estado de permissao do microfone
- cleanup de instancias
- reconhecimento `continuous = false`
- `interimResults = true`
- parada por silencio
- seguranca para nao abrir multiplas instancias

## Orchestration Layer

Backend criado/refatorado em:
- `backend/app/ldcn/schemas.py`
- `backend/app/ldcn/intent_classifier.py`
- `backend/app/ldcn/agent_dispatcher.py`
- `backend/app/ldcn/response_builder.py`
- `backend/app/ldcn/memory.py`
- `backend/app/ldcn/orchestrator.py`

Endpoint mantido e normalizado:
- `POST /api/ldcn/chat`

Intentos principais:
- `create_project`
- `continue_wizard`
- `explain_current_page`
- `fix_error`
- `download_project`
- `use_template`
- `validate_project`
- `choose_stack`
- `generate_project`
- `activate_agent_boost`
- `navigate`
- `small_talk`
- `unknown`

## Agent Wiring

Agentes conectados pelo dispatcher:
- `PromptMasterAgent`
- `ArchitectureAgent`
- `DownloadAgent`
- `TemplateAgent`
- `SecurityAgent`
- `UIUXAgent`
- `GenerationAgent`
- `GatekeeperAgent`
- `EngineeringAnalyzerAgent`
- `QualityAgent`
- `StackRegistryAgent`

## UI and Avatar

Mudancas principais:
- o avatar agora obedece ao estado da maquina, nao a animacoes soltas
- `sleeping -> idle` no boot
- wake word continua funcionando como modo avancado
- o modo seguro continua com push-to-talk
- TTS pausa o microfone durante a fala
- o painel de voz mostra volume em tempo real
- o fallback textual continua funcional

## Tests Run

Executados com sucesso:
- `python -m pytest tests/test_ldcn_api.py`
- `python -m pytest`
- `cmd /c npm run build` no frontend

Resultado:
- `34` testes Python passaram
- build do frontend concluiu com sucesso
- restam apenas warnings de `react-hooks/exhaustive-deps` no hook de wake word do avatar, sem falha funcional

## Notes

- O fluxo de voz agora evita reprocessar a propria fala do assistente.
- O contexto global ficou mais rico e previsivel.
- O fallback por texto continua disponivel se STT/TTS falhar.
