# LDCN Avatar Voice Output Fix

## Causa raiz

- A fala do LDCN estava acoplada ao hook do chat.
- O avatar e o chat observavam estados diferentes para `speaking`.
- O navegador podia bloquear `speechSynthesis` por falta de gesto do usuario, mas o fluxo nao exigia desbloqueio explicito.
- Nao existia uma tela de teste de TTS puro para separar problema de browser/TTS do problema de avatar/chat.

## O que foi implementado

- Novo hook dedicado de TTS:
  - `frontend/src/ldcn/voice/useLdcnSpeechSynthesis.ts`
- Novo provider global de voz:
  - `frontend/src/ldcn/voice/LdcnVoiceProvider.tsx`
- `ClientProviders` agora envolve o app com `LdcnVoiceProvider`.
- Nova rota de teste puro:
  - `frontend/src/app/debug/ldcn-voice/page.tsx`
- O chat passou a usar `useLdcnVoice()` em vez de criar `speechSynthesis` local.
- O avatar passou a observar o estado do provider para `speaking` e `error`.
- Cada mensagem do assistente agora tem fallback manual `Ouvir`.
- O painel do chat mostra `Ativar voz do LDCN` enquanto `voiceUnlocked=false`.

## Estado do fluxo

- TTS puro:
  - agora testavel isoladamente em `/debug/ldcn-voice`
- Chat conectado ao TTS:
  - sim, via `useLdcnVoice().speak(reply)`
- Avatar conectado ao TTS:
  - sim, observando `isSpeaking` e `error` do provider
- Desbloqueio por gesto do usuario:
  - sim, via `unlockVoice()`

## Logs temporarios adicionados

- `[LDCN Voice] supported`
- `[LDCN Voice] voices`
- `[LDCN Voice] selectedVoice`
- `[LDCN Voice] unlocked`
- `[LDCN Voice] speak called`
- `[LDCN Voice] onstart`
- `[LDCN Voice] onend`
- `[LDCN Voice] onerror`

## Testes executados

- `python -m pytest tests/test_ldcn_api.py -q` -> 5 passed
- `cmd /c "rmdir /s /q .next && npm run build"` -> passed

## Observacoes

- O build segue com warnings de cache do Next no Windows/OneDrive, mas sem quebrar a entrega.
- A confirmacao final de audio real ainda depende do browser local do usuario em `/debug/ldcn-voice`.

