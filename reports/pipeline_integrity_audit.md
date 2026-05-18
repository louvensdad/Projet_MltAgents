# Pipeline Integrity Audit

Data: 2026-05-17

## Fluxo oficial validado

Fluxo atual em `POST /api/generate`:

`Wizard/Create -> PromptGeneratorEngine -> PromptValidator -> Documentation Engine -> Stack Agent -> Gatekeeper -> Agent Pipeline -> Blueprint -> Generator -> Quality Gate -> Security Gate -> Registry -> Checkout/Download`

## Correcoes aplicadas

- `ProjectRunner` agora executa fiscal de stack antes do gatekeeper.
- `Pipeline` agora recebe agentes globais de governanca antes dos agentes produtivos.
- `BackendGeneratorFactory` deixou de ser `NoOp` e agora gera scaffold real por stack.
- `PromptMasterContract` agora expõe `confirmed_entities`, `confirmed_features`, arquitetura, auth, database e versoes para o runner.
- `PathGuard` corrigido para resolver `generated_projects/` na raiz do repo, nao em `backend/generated_projects`.
- `Pipeline` agora injeta `templates/` e `prompt_engine/` no import path para resolver `blueprints` e `briefing`.

## Proibicoes verificadas

| Regra | Status |
|---|---|
| generator direto sem gatekeeper | ok no `/api/generate`; `/api/create` ainda e rota separada de criacao simplificada |
| rota antiga de geracao | ok: `/api/v1/generate` retorna 410 |
| mock escondido | corrigido o `NoOp` de backend; modo AI local ainda e declarado como `local_build_90` |
| pipeline paralelo | atencao: `orchestrator/pipeline.py` ainda existe como legado |
| stack sem Prompt Master | corrigido via `StackFiscalBase` |

