# LDCN Timeout Fix

## Causa do timeout

O fluxo de `POST /api/ldcn/chat` estava bloqueando a resposta final porque:

- os especialistas eram executados em serie;
- o dispatcher esperava todos os agentes terminarem;
- o LLM nao tinha deadline operacional claro no fluxo do LDCN;
- o frontend mantinha o estado de analise sem um corte consistente quando a resposta demorava.

## Agentes lentos

Os agentes mais sensiveis ao travamento sao os especialistas acionados em lote no `LdcnMasterAgent`, principalmente quando um deles entra em espera longa ou falha sem retorno rapido. O caso critico validado foi `SecurityAgent` atrasando o fechamento da resposta.

## Timeout aplicado

- resposta inicial imediata na UI: placeholder `Entendi. Estou analisando isso com os agentes certos.`
- timeout por agente: `5s`
- timeout de LLM: `12s`
- fallback do backend: `13s`
- timeout de loading no frontend: `15s`
- resposta parcial ativada quando um agente trava, falha ou quando o LLM excede o budget

## Fallback criado

Foi criado fallback local contextual para quando o modelo excede o tempo ou falha:

`O modo IA premium demorou. Vou continuar no modo local com base no contexto da tela.`

O fallback usa o contexto disponivel:

- `intent`
- `route`
- `last_error`
- `stack atual`
- `last_action`
- `wizard_step`
- `conversation_summary`

Exemplo esperado:

- `Static Site Wizard` => revisar campos, gerar Prompt Master ou tentar a geracao novamente
- `Validation Center` => revisar validacao, focar no erro atual ou checar seguranca

## Payload do LLM

O prompt foi reduzido para evitar timeout por excesso de contexto:

- ultimas `6` mensagens
- resumo curto da conversa
- ultima acao
- stack atual
- tokens menores, especialmente em `source=voice`

## AI Health

Endpoint criado:

- `GET /api/ldcn/ai-health`

Retorna:

- `provider`
- `model`
- `key_present`
- `last_latency_ms`
- `last_error`
- `mock_enabled`

## Logs adicionados

- `ldcn.request.start`
- `intent.done`
- `agent.started`
- `agent.timeout`
- `llm.started`
- `llm.timeout`
- `fallback.used`
- `response.sent`

## Testes executados

Cobertura adicionada para:

- timeout de LLM com resposta parcial
- fallback contextual de wizard
- fallback util quando o provider falha
- agente travado com partial results
- budget global excedido com fallback
- contrato do endpoint `ai-health`

Comando usado:

```powershell
pytest tests/test_ldcn_api.py
```
