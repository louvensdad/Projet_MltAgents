# LDCN Microphone Debug

## Causa raiz

- O problema estava concentrado na camada do app, não no hardware do PC.
- A captura de áudio do LDCN estava acoplada ao fluxo do assistente, sem uma página isolada de diagnóstico.
- Não havia visibilidade clara de:
  - contexto seguro do navegador
  - permissão do microfone
  - lista de dispositivos
  - stream ativo
  - nível real de áudio
  - falha específica do SpeechRecognition

## Navegador testado

- Validação de build e contrato feita no projeto local.
- Teste interativo real no navegador ainda depende de abertura da rota `/debug/microphone` em `localhost` ou `127.0.0.1`.

## Permissão

- A página de debug agora pede permissão explicitamente.
- Se o navegador bloquear, a UI mostra instrução clara para liberar no cadeado da URL.

## Volume

- O novo hook lê volume real via `getUserMedia` + `AudioContext` + `AnalyserNode`.
- A barra de nível de áudio fica visível na página de debug.

## Transcript

- `SpeechRecognition` foi separado do resto do LDCN.
- O debug page mostra transcrição final e parcial.
- Se o áudio entrar mas a transcrição falhar, a página mostra:
  - `O navegador capturou áudio, mas o reconhecimento de fala falhou.`

## Correção aplicada

- Criada a rota isolada `/debug/microphone`.
- Criado o hook `useMicrophoneDiagnostics`.
- `AppShell` passou a não renderizar LDCN nem avatar nessa rota.
- O fluxo de voz do LDCN foi deixado fora desta etapa para evitar conflito até o diagnóstico funcionar.
- O LDCN Voice foi reconectado ao mesmo pipeline de captura e transcrição usado no debug.

## Próximo passo

- Abrir `/debug/microphone` em `localhost` ou `127.0.0.1`.
- Testar:
  - permissao
  - volume
  - dispositivos
  - transcricao
- Se o debug funcionar e o chat do LDCN ainda falhar, o próximo alvo vira apenas a camada de envio ao backend e a fala sintetizada, não mais a captura do microfone.
