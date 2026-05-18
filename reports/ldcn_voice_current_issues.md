# LDCN Voice Current Issues

## Problemas encontrados na implementação anterior

- O reconhecimento de voz dependia de um fluxo único e misturava captura, estado do avatar e envio ao backend.
- O TTS podia disparar em cima de estado de escuta ativo, criando risco de loop entre fala e STT.
- O microfone não tinha um ciclo claro de permissão, nível de áudio e cleanup.
- O chat e a voz compartilhavam lógica demais, o que dificultava controlar duplicação de requests e transcrições repetidas.
- O contexto enviado ao backend era montado de forma dispersa e sem um coletor único.
- Não havia um guard central para bloquear transcript repetido, resposta ecoada ou request duplicado.

## Impacto

- Usuário precisava falar mais alto do que o normal para obter resposta consistente.
- O assistente podia reagir à própria fala.
- A experiência ficava amadora e pouco previsível.

