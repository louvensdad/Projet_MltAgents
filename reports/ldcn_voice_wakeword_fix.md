# LDCN Voice Wake Word Fix

## O que foi corrigido

- A seleção de voz passou a usar um hook dedicado em `frontend/src/ldcn/voice/useLdcnVoiceSelection.ts`.
- O TTS passou a preferir voz masculina quando disponível e a cair para a melhor voz instalada quando não houver opção masculina natural.
- O wake word agora é normalizado por acento e pontuação antes da comparação.
- O avatar passou a reagir a `LDCN`, `Vens`, `Ei LDCN`, `Ei Vens` e `Jarvis`.
- Foi criada a rota de diagnóstico `frontend/src/app/debug/voice/page.tsx`.
- Foi adicionado o adapter de TTS em `backend/app/ldcn/voice/tts_provider.py` para evolução futura sem quebrar o browser TTS.

## Vozes e seleção

- As vozes são carregadas com `speechSynthesis.getVoices()`.
- O hook guarda preferência de:
  - gênero da voz
  - nome da voz
  - rate
  - pitch
  - volume
- Para `pt-BR`, a heurística prioriza:
  - vozes masculinas detectáveis por nome
  - `Microsoft Daniel`
  - outras vozes `pt-BR` com melhor pontuação
- Se não houver voz masculina natural instalada, o UI mostra aviso claro:
  - `Nao encontrei voz masculina natural instalada neste navegador. Usando a melhor voz disponivel.`

## Wake word

- O texto é normalizado com:
  - lowercase
  - remoção de acentos
  - remoção de pontuação
- O detector aceita:
  - `ldcn`
  - `vens`
  - `ei ldcn`
  - `ei vens`
  - `jarvis`
- Quando a palavra vem junto com comando, o prefixo é removido antes do envio ao chat.

## Avatar

- O avatar recebe evento explícito de wake word.
- O estado visual pode ir para:
  - `sleeping`
  - `waking`
  - `listening`
  - `speaking`
- O balão do avatar agora usa respostas específicas para cada nome chamado.

## Testes executados

- `python -m pytest tests/test_ldcn_api.py -q` -> 5 passed
- `cmd /c "rmdir /s /q .next && npm run build"` -> passed

## Observação

- A lista real de vozes e a existência de voz masculina dependem do navegador e das vozes instaladas no sistema do usuário.
- A rota `/debug/voice` foi criada para validar isso em runtime no navegador.

