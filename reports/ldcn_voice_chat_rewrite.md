# LDCN Voice + Chat Rewrite

## O que foi refeito

- Separei o módulo em camadas menores:
  - `frontend/src/ldcn/voice/useSpeechRecognition.ts`
  - `frontend/src/ldcn/voice/useSpeechSynthesis.ts`
  - `frontend/src/ldcn/voice/useAudioLevel.ts`
  - `frontend/src/ldcn/chat/useVoiceTurnManager.ts`
  - `frontend/src/ldcn/chat/conversationMemory.ts`
  - `frontend/src/ldcn/chat/antiLoopGuard.ts`
  - `frontend/src/ldcn/chat/contextCollector.ts`
  - `frontend/src/ldcn/chat/useLdcnChat.ts`
- Reescrevi o painel do LDCN para usar os novos blocos de voz e chat.
- Mantive o resto do sistema fora do escopo.

## State machine

- Estados de voz:
  - `idle`
  - `listening`
  - `transcribing`
  - `thinking`
  - `speaking`
  - `error`
- Regra principal:
  - quando o assistente fala, o microfone fica desligado.

## Anti-loop

- Bloqueio de transcript muito curto.
- Bloqueio de transcript igual ao último do usuário.
- Bloqueio de resposta igual ao último reply do assistente.
- Bloqueio de request duplicado no mesmo turno.
- `speechSynthesis.cancel()` antes de nova fala.
- Reconhecimento para quando o TTS entra em cena.

## Contexto

- O payload agora leva:
  - `conversation_id`
  - `turn_id`
  - `route`
  - `page_title`
  - `active_project_id`
  - `active_stack_id`
  - `wizard_step`
  - `last_error`
  - `last_generation_result`
  - `locale`
  - `history`
- O backend agora responde com `actions` além de `suggested_actions` e `ui_actions`.

## Backend

- Atualizei:
  - `backend/app/ldcn/schemas.py`
  - `backend/app/ldcn/intent_classifier.py`
  - `backend/app/ldcn/agent_dispatcher.py`
  - `backend/app/ldcn/response_builder.py`
  - `backend/app/ldcn/orchestrator.py`
- Intents cobertos:
  - `create_project`
  - `continue_wizard`
  - `explain_page`
  - `fix_error`
  - `download_project`
  - `use_template`
  - `validate_project`
  - `choose_stack`
  - `generate_project`
  - `activate_agent_boost`
  - `improve_ui`
  - `navigate`
  - `small_talk`
  - `unknown`

## Testes executados

- `python -m pytest tests/test_ldcn_api.py -q`
- `cmd /c npm.cmd run build`

## Problemas restantes

- O navegador real ainda pode variar bastante na qualidade do SpeechRecognition dependendo da engine instalada.
- O `speechSynthesis` continua sujeito às vozes disponíveis no sistema do usuário.
- O cache do Next em Windows/OneDrive ainda mostra warnings de snapshot, mas o build finalizou com sucesso.

