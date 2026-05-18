# LDCN Jarvis Architecture Rebuild

## Arquitetura criada

- `LDCN Interface`
  - `frontend/src/components/ldcn/LdcnAssistant.tsx`
  - `frontend/src/components/ldcn/LdcnChatPanel.tsx`
  - `frontend/src/components/ldcn/LdcnMessage.tsx`
  - `frontend/src/app/debug/ldcn-voice/page.tsx`
- `Voice Provider`
  - `frontend/src/ldcn/voice/LdcnVoiceProvider.tsx`
  - `frontend/src/ldcn/voice/useLdcnSpeechSynthesis.ts`
- `LDCN Master Agent`
  - `backend/app/ldcn/master_agent.py`
- `Agent Dispatcher`
  - `backend/app/ldcn/agent_dispatcher.py`
- `Specialist Agents`
  - `backend/app/ldcn/specialist_agents.py`
- `Response Builder`
  - `backend/app/ldcn/response_builder.py`
- `Memory`
  - `backend/app/ldcn/memory.py`
- `Premium Voice`
  - `backend/app/ldcn/voice/voice_config.py`
  - `backend/app/ldcn/voice/elevenlabs_client.py`
  - `backend/app/ldcn/voice/tts_service.py`

## Endpoints

- `POST /api/ldcn/chat`
  - aceita `query` e `message`
  - aceita `source`, `route`, `context`, `locale`
- `POST /api/ldcn/voice`
  - contrato legado de transcript preservado
- `POST /api/ldcn/webhook`
  - entrada externa estilo widget/provedor
- `POST /api/ldcn/tts`
  - tenta ElevenLabs pelo backend
  - cai para fallback browser no frontend quando premium nao estiver configurado

## Agentes conectados

- `ProjectCreationAgent`
- `PromptMasterAgent`
- `TemplateAgent`
- `StackAgent`
- `ArchitectureAgent`
- `GatekeeperAgent`
- `DownloadAgent`
- `SecurityAgent`
- `UIUXAgent`
- `DocumentationAgent`
- `AgentBoostAgent`
- `ErrorFixAgent`

## Voz configurada

- Provider premium previsto:
  - `ELEVENLABS_API_KEY`
  - `ELEVENLABS_VOICE_ID`
  - `ELEVENLABS_MODEL_ID`
  - `LDCN_VOICE_PROVIDER=elevenlabs`
  - `LDCN_VOICE_FALLBACK=browser`
- O frontend nao recebe API key.
- O LDCN agora tenta `POST /api/ldcn/tts` antes de usar `speechSynthesis`.
- `speechSynthesis` virou fallback, nao voz principal.

## Fallback e anti-loop

- A voz so dispara automaticamente depois de `voiceUnlocked=true`.
- Cada resposta do assistente tem botao manual `Ouvir`.
- O avatar nao fala nem cria `speechSynthesis`.
- O avatar apenas observa `isSpeaking` e `error` do provider global.

## Testes realizados

- `python -m pytest tests/test_ldcn_api.py -q` -> `7 passed`
- `npm run build` no frontend -> `passed`
- Cobertura adicionada para:
  - contrato de chat
  - contrato de voice
  - webhook
  - fallback de tts

## Limitacoes restantes

- O TTS premium real depende de chave valida do ElevenLabs no ambiente.
- A confirmacao final de audio natural ainda exige teste no navegador local em `/debug/ldcn-voice`.
- O widget conversational da ElevenLabs nao foi embutido; o caminho implementado foi TTS via backend com fallback local, que e o mais controlavel para o produto atual.

