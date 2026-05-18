# LDCN Voice Assistant

Data: 2026-05-17

## Resultado

LDCN ganhou modo de voz integrado ao painel global, com reconhecimento por Web Speech API, resposta por `speechSynthesis`, transcricao, estados visuais e fallback para texto.

## Componentes criados

- `frontend/src/components/ldcn/voice/LdcnVoiceOrb.tsx`
- `frontend/src/components/ldcn/voice/LdcnVoicePanel.tsx`
- `frontend/src/components/ldcn/voice/LdcnVoiceWave.tsx`
- `frontend/src/components/ldcn/voice/LdcnMicButton.tsx`
- `frontend/src/components/ldcn/voice/LdcnTranscript.tsx`
- `frontend/src/components/ldcn/voice/LdcnSpeakingIndicator.tsx`
- `frontend/src/components/ldcn/voice/LdcnVoiceSettings.tsx`

## Endpoint

- `POST /api/ldcn/voice`

Payload aceito:

```json
{
  "transcript": "cria um sistema de clinica",
  "page": "/create",
  "project_id": null,
  "stack_id": null,
  "locale": "pt-BR",
  "context": {}
}
```

## Estados de voz

- `idle`
- `listening`
- `transcribing`
- `thinking`
- `speaking`
- `error`

## Intents por voz

O endpoint de voz usa o mesmo classificador do chat e cobre:

- criar projeto
- abrir/usar templates
- escolher stack
- explicar arquitetura
- explicar erro
- validar projeto
- baixar projeto
- revisar seguranca
- melhorar UI
- ativar ou explicar Agent Boost

## Fallback

- Se o navegador nao suporta `SpeechRecognition` ou `webkitSpeechRecognition`, o painel mostra aviso e mantem chat textual funcional.
- Se o backend falhar, o painel mostra erro claro e nao informa que alguma acao foi executada.
- API key e segredos nao sao enviados ao frontend nem persistidos pela memoria LDCN.

## Testes realizados

- `pytest tests/test_ldcn_api.py -q`: 3 passed.
- `pytest -q`: 33 passed.
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed.

## Limitacoes

- Teste real de microfone depende do navegador e de permissao do usuario.
- A auditoria visual por browser/screenshot nao foi executada nesta sessao porque a ferramenta de automacao Browser nao esta exposta.
- A execucao profunda de comandos como gerar projeto ou ativar Agent Boost ainda deve ser conectada por handlers especificos e com confirmacao.
