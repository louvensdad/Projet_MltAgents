# LDCN Global Orchestrator

Data: 2026-05-17

## Resultado

LDCN foi integrado como assistente global do SaaS Factory AI, com chat contextual, endpoint backend, dispatch deterministico de agentes internos e acoes de UI para navegacao, prefill, validacao e download.

## Arquivos criados

- `backend/app/ldcn/ldcn_orchestrator.py`
- `backend/app/ldcn/ldcn_router.py`
- `backend/app/ldcn/ldcn_context.py`
- `backend/app/ldcn/ldcn_memory.py`
- `backend/app/ldcn/ldcn_agent_dispatcher.py`
- `backend/app/ldcn/ldcn_intent_classifier.py`
- `backend/app/ldcn/ldcn_response_builder.py`
- `frontend/src/components/ldcn/LdcnAssistant.tsx`
- `frontend/src/components/ldcn/LdcnChatPanel.tsx`
- `frontend/src/components/ldcn/LdcnFloatingOrb.tsx`
- `frontend/src/components/ldcn/LdcnMessage.tsx`
- `frontend/src/components/ldcn/LdcnActionButtons.tsx`
- `frontend/src/components/ldcn/LdcnContextBar.tsx`
- `tests/test_ldcn_api.py`

## Endpoints

- `POST /api/ldcn/chat`
- `POST /api/ldcn/voice`

## Intents suportadas

- `create_project`
- `choose_stack`
- `explain_architecture`
- `fix_error`
- `validate_project`
- `use_template`
- `generate_prompt_master`
- `download_project`
- `improve_ui`
- `security_review`
- `billing_agent_boost`
- `general_help`

## Agentes conectados por dispatch

- PromptMasterAgent
- ArchitectureAgent
- StackAgent
- StackRegistryAgent
- SecurityAgent
- QualityAgent
- TemplateAgent
- UIUXAgent
- DownloadAgent
- EngineeringAnalyzerAgent
- DevOpsAgent
- PerformanceAgent
- DocumentationAgent
- agentes fiscais por stack: SpringBootAgent, FastAPIAgent, StaticSiteAgent, NestJSAgent, ExpressAgent, LaravelAgent, DotnetAgent, AngularAgent, ReactAgent, NextJSAgent, VueAgent, BlazorAgent, AutomationAgent, AIAgentsAgent

## Paginas integradas

O LDCN foi injetado no `AppShell`, portanto aparece nas rotas internas:

- Dashboard `/`
- Create `/create`
- Wizard `/wizard` e `/wizard/[slug]`
- Templates `/templates`
- Projects `/projects`
- Downloads `/downloads`
- Settings `/settings`
- AI Models `/ai-models`
- Validation Center `/validation-center`

Rotas de auth ficam sem o assistente: `/login`, `/forgot-password`, `/reset-password/[token]`.

## Testes realizados

- `pytest tests/test_ldcn_api.py -q`: 3 passed.
- `pytest -q`: 33 passed.
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed.

## Limitacoes

- O dispatch atual e local/deterministico. Agent Boost pode ser conectado posteriormente no backend sem expor API key no frontend.
- `prefill_wizard` salva payload em `sessionStorage`; paginas de wizard precisam consumir `ldcn_wizard_prefill` para preenchimento automatico profundo.
- Acoes destrutivas ou com custo devem manter `requires_confirmation=true` antes da execucao.
