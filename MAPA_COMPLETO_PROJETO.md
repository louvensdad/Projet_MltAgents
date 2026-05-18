# Mapa completo do projeto - SaaS Factory AI

Gerado em: 2026-05-17  
Raiz analisada: `C:\Users\louvens\OneDrive\Projet_MltAgents`

## 1. Visao geral

O projeto e uma plataforma multiagente para criar aplicacoes e sites a partir de um wizard. A ideia central e:

1. O usuario preenche um fluxo no frontend.
2. O frontend envia um payload para a API FastAPI.
3. O backend normaliza stack, valida prompt, busca contexto de documentacao e registra o projeto.
4. O runner multiagente aciona agentes, geradores e gatekeepers.
5. Artefatos sao gravados em `generated_projects/`.
6. O projeto fica disponivel para preview, checkout quando necessario, download e evolucao via AI Boost.

Stack principal do proprio produto:

- Frontend: Next.js 14, React 18, TypeScript, TailwindCSS, Framer Motion, lucide-react.
- Backend: Python, FastAPI, Pydantic, Uvicorn.
- IA: Gemini/OpenAI como dependencias, com modo local/fallback e AI Boost.
- Persistencia local: JSON em `backend/data/` e `data/`.
- Geracao: geradores internos para stacks backend/frontend/static site.
- Infra: Dockerfile, docker-compose com API, frontend e Postgres.

## 2. Tamanho e estrutura

Contagem por extensao, considerando arquivos rastreados por `rg --files`:

| Extensao | Quantidade |
|---|---:|
| `.tsx` | 180 |
| `.py` | 176 |
| `.ts` | 65 |
| `.md` | 54 |
| `.json` | 20 |
| `.svg` | 18 |
| `.html` | 4 |
| `.css` | 2 |
| `.txt` | 2 |
| `.bat` | 2 |
| `.jsonl` | 2 |
| outros | 6 |

Pastas principais:

| Pasta | Papel |
|---|---|
| `frontend/` | Aplicacao Next.js, paginas, wizards, componentes, design-system e chamadas API. |
| `backend/` | API FastAPI, rotas, servicos, seguranca, status do sistema e dados locais. |
| `agents/` | Agentes principais, agentes core, gatekeepers e agentes por stack. |
| `generators/` | Fabricas e geradores para backend, frontend, config e static site. |
| `prompt_engine/` | Prompt Master, validacao, templates e briefing. |
| `knowledge_engine/` | Documentacao, cache, comparacao e modo educacional. |
| `security_engine/` | Validadores/gates de seguranca, qualidade, fidelidade, stack e locale. |
| `stack_registry/` | Registry JSON das stacks suportadas. |
| `templates/` e `public/templates/` | Blueprints e previews visuais de templates. |
| `generated_projects/` | Saida dos projetos gerados. |
| `reports/` | Auditorias e relatorios tecnicos ja existentes. |
| `docs/` | Documentacao manual do projeto. |
| `tests/` e `backend/tests/` | Testes Python e testes de rotas/servicos. |
| `data/` | Submissoes e leads em JSONL. |
| `infra/` | Documentacao/base de infraestrutura. |

Observacao: `frontend/`, `generated_projects/`, `backups/` e `output/` concentram muitos arquivos gerados ou dependencias/cache. O mapa logico do produto esta principalmente em `backend/`, `frontend/src/`, `agents/`, `generators/`, `prompt_engine/`, `security_engine/` e `stack_registry/`.

## 3. Como executar

Backend local:

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8001
```

Frontend local:

```bash
cd frontend
npm install
npm run dev
```

Docker Compose:

```bash
docker compose up --build
```

Servicos no `docker-compose.yml`:

- `api`: build na raiz, porta `8001:8001`, monta `generated_projects`, `data` e `backend/logs`.
- `frontend`: build em `frontend/`, porta `4321:4321`, usa `NEXT_PUBLIC_API_URL=http://localhost:8001`.
- `db`: Postgres 15, porta host `9876`, banco `saas_factory`.

Configuracao de API no frontend:

- `frontend/src/lib/config.ts`
- `API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"`

## 4. Backend FastAPI

Entrada principal:

- `backend/app/main.py`

Responsabilidades:

- Cria app FastAPI com titulo `SaaS Factory AI - Enterprise API`.
- Configura CORS por `ALLOWED_ORIGINS`, default `http://localhost:3000`.
- Registra roteadores de create, auth, generate, downloads, payments, AI Boost, templates, system, projects/upgrades e prompt.
- Expoe WebSocket em `/ws/live/{project_id}`.
- Mantem endpoints legados `api/v1` para stacks, comparacao e educacao.

Rotas registradas:

| Arquivo | Prefixo | Funcao |
|---|---|---|
| `backend/app/routes/auth.py` | `/api/auth` | Login, esqueci senha, reset de senha, usuario atual. |
| `backend/app/routes/create.py` | `/api` | Listagem/validacao/criacao por stack. |
| `backend/app/routes/generate.py` | `/api` | Health e geracao oficial em `/api/generate`. |
| `backend/app/routes/downloads.py` | `/api/downloads` | Lista, prepara e baixa projetos gerados. |
| `backend/app/routes/payments.py` | `/api/payments` | Checkout mock, confirmacao mock e status. |
| `backend/app/routes/ai_boost.py` | `/api/ai-boost` | Planos, permissao, ativacao, uso e acoes de IA. |
| `backend/app/routes/templates.py` | `/api` | Marketplace de templates, preview, blueprint e preparo de geracao. |
| `backend/app/routes/system.py` | `/api` | Status, IA, documentacao, seguranca, billing, settings, geradores, atividade, recomendacoes e validacao. |
| `backend/app/routes/upgrades.py` | `/api/projects` | Projetos, detalhes, live preview, delete e upgrades. |
| `backend/app/routes/prompt_routes.py` | `/api/prompt` | Stacks de prompt, profile, build, validate e template. |

Endpoints principais:

- `GET /health`
- `GET /api/health`
- `POST /api/generate`
- `GET /api/create/stacks`
- `GET /api/create/stack/{raw_id}`
- `POST /api/create/validate`
- `POST /api/create`
- `GET /api/projects`
- `GET /api/projects/{project_id}`
- `GET /api/projects/{project_id}/details`
- `GET /api/projects/{project_id}/live`
- `DELETE /api/projects/{project_id}`
- `GET /api/downloads/{project_id}`
- `POST /api/downloads/{project_id}/prepare`
- `GET /api/downloads/{project_id}/download`
- `POST /api/prompt/build`
- `POST /api/prompt/validate`
- `GET /api/templates`
- `POST /api/templates/{template_id}/prepare-generation`
- `GET /api/system/status`
- `GET /api/ai/status`
- `GET /api/ai-models`
- `GET /api/activity`
- `GET /api/recommendations`
- `GET /api/validation/summary`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `WS /ws/live/{project_id}`

Observacao: o frontend usa `EventSource` para `/api/activity/stream`, mas no arquivo de rotas encontrado nao apareceu endpoint correspondente. Isso deve ser revisado se o painel de atividade em tempo real for requisito.

## 5. Fluxo oficial de geracao

Entrada oficial:

- `POST /api/generate`
- Implementacao: `backend/app/routes/generate.py`

Fluxo resumido:

1. Recebe payload do wizard/template.
2. `_merge_answer_payload` junta `answers` no payload principal.
3. `_normalize_stack_id` converte aliases para IDs canonicos.
4. `_build_prompt_answers` transforma respostas de wizard em contrato para Prompt Engine.
5. `PromptGeneratorEngine(stack_id)` valida campos obrigatorios.
6. `engine.finalize()` gera Prompt Master.
7. `_load_documentation_context(stack_id)` busca documentacao via `knowledge_engine`.
8. `register_project()` salva projeto em `backend/data/projects.json`.
9. Resolve path seguro via `PathGuard`.
10. Publica eventos WebSocket iniciais por `streamer.broadcast_sync`.
11. Chama `agents.core.project_runner.run_project(payload)`.
12. Atualiza registro do projeto com status, paths, preview, checkout/download.
13. Publica eventos finais no WebSocket.
14. Responde com `project_id`, `redirect_url`, `download_url`, `checkout_url`, status de prompt e documentacao.

Decisao de pagamento:

- `static_site` fica como `free`.
- Outras stacks podem exigir checkout se `payment_status` nao for `paid` ou `free`.
- Se pagamento e necessario, `redirect_url` aponta para `/projects/{project_id}/checkout`.
- Se download esta liberado, `redirect_url` aponta para `/downloads/{project_id}`.

## 6. Runner multiagente

Entrada:

- `agents/core/project_runner.py`

Funcoes principais:

- Normaliza `project_type`, `project_name`, `backend_stack`, `project_id` e paths.
- Define modo de IA com `AIRouter`.
- Injeta informacoes do Prompt Master no `brief`.
- Aplica regras especificas para `static_site`, `spring_boot` e `fastapi`.
- Seleciona caminho de geracao static site ou backend.
- Executa gatekeepers antes/depois da geracao.
- Roda gates de qualidade, fidelidade, stack e seguranca.
- Grava artefatos como:
  - `generation_trace.json`
  - `docs/AI_USAGE.md`
  - `docs/PROMPT_MASTER.md`
  - `prompt_master.json`
  - `prompt_trace.json`
  - `docs/DOCUMENTATION_CONTEXT.md`
  - `docs/GENERATION_QUALITY.md`
  - `docs/UX_AI_DECISIONS.md`

Pipeline sequencial:

- `agents/core/pipeline.py`
- Classe `Pipeline`
- Executa agentes sequencialmente e depois constroi blueprint e backend.

Agentes principais:

- `ProductAgent`
- `DesignAgent`
- `UXAgent`
- `ArchitectAgent`
- `BackendAgent`
- `FrontendAgent`
- `SecurityAgent`
- `TestAgent`
- `DevOpsAgent`
- `ReviewerAgent`

Agentes core adicionais:

- Architecture, AntiPattern, Backend, Database, DevOps, Documentation, EngineeringGatekeeper, Frontend, Infra, Observability, Performance, Refactor, Scalability, Security.

Agentes por stack:

- Docker, FastAPI, Kubernetes, NestJS, NextJS, Spring Boot.

## 7. Geradores

Fabricas e geradores encontrados:

- `generators/project_generator_factory.py`
  - Valida payload contra `StackRegistry`.
  - Retorna rota de geracao por stack, generator e gatekeeper.
- `generators/backend/backend_generator_factory.py`
  - Fabrica de geradores backend.
- `generators/frontend/factory.py`
  - Fabrica de geradores frontend.
- `generators/static/static_site_generator.py`
  - Gera sites estaticos.
- `generators/config/config_generator.py`
  - Aplica configuracoes e integracoes ao projeto gerado.
- `generation_engine/artifact_builder.py`
  - Monta metadados de artefatos, preview e download.

Saidas padrao:

- `generated_projects/{nome_normalizado}_{project_id}`
- `blueprint.json`
- `blueprint.md`
- arquivos de codigo por stack
- docs e traces de geracao

## 8. Stacks suportadas

Registry:

- `stack_registry/registry.py`
- Arquivos JSON em `stack_registry/stacks/`

Stacks encontradas:

- `ai_agents`
- `angular`
- `automation`
- `blazor`
- `dotnet`
- `express`
- `fastapi`
- `laravel`
- `nestjs`
- `nextjs`
- `react`
- `spring_boot`
- `static_site`
- `vue`

O registry normaliza aliases como:

- `springboot`, `java_springboot` -> `spring_boot`
- `fast_api`, `python_fastapi` -> `fastapi`
- `nest_js`, `node_nestjs` -> `nestjs`
- `next.js`, `next_js` -> `nextjs`
- `static`, `static-site`, `static site` -> `static_site`
- `ai-agents`, `agentes_ia` -> `ai_agents`

## 9. Gatekeepers e validadores

Gatekeepers por stack:

- `ai_agents`
- `automation`
- `angular`
- `blazor`
- `dotnet`
- `express`
- `fastapi`
- `laravel`
- `nestjs`
- `nextjs`
- `react`
- `springboot`
- `static_site`
- `vue`

Registro:

- `agents/gatekeepers/gatekeeper_registry.py`

Fases usadas no runner:

- pre-generation check
- post-generation check
- download gate check
- consolidated report

Validadores de seguranca/qualidade:

- `security_engine/validators/backend_validator.py`
- `fidelity_gate.py`
- `locale_gate.py`
- `quality_gate.py`
- `security_gate.py`
- `stack_compatibility_gate.py`
- `stack_gate.py`

Camada de seguranca do backend:

- `audit_logger.py`
- `auth_guard.py`
- `cors_policy.py`
- `csrf_protection.py`
- `headers.py`
- `input_sanitizer.py`
- `jwt_manager.py`
- `password_hasher.py`
- `path_guard.py`
- `permissions.py`
- `rate_limiter.py`
- `secret_scanner.py`

## 10. Prompt Engine e Knowledge Engine

Prompt Engine:

- `prompt_engine/prompt_generator.py`
- `prompt_engine/master_builder.py`
- `prompt_engine/validator.py`
- templates em `prompt_engine/templates/` e `prompt_engine/prompt_templates/`
- briefing em `prompt_engine/briefing/`

Responsabilidade:

- Construir o Prompt Master como fonte unica de verdade.
- Validar campos obrigatorios por stack.
- Gerar texto/contrato para guiar a geracao.
- Separar templates por stack.

Knowledge Engine:

- `knowledge_engine/docs_registry.py`
- `docs_fetcher.py`
- `docs_cache.py`
- `docs_update_manager.py`
- `comparison_engine.py`
- `educational_mode.py`

Responsabilidade:

- Buscar/cachear contexto de documentacao por stack.
- Comparar opcoes arquiteturais.
- Explicar topicos educacionais via endpoints `api/v1`.

## 11. Frontend Next.js

Entrada:

- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/AppShell.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/components/ClientProviders.tsx`

Rotas/paginas principais:

- `/`
- `/activity`
- `/ai-models`
- `/billing`
- `/create`
- `/create/[stackId]`
- `/documentation`
- `/downloads`
- `/downloads/[id]`
- `/forgot-password`
- `/generators`
- `/live/[projectId]`
- `/login`
- `/projects`
- `/projects/[id]`
- `/projects/[id]/ai-boost`
- `/projects/[id]/checkout`
- `/projects/[id]/details`
- `/projects/[id]/upgrade`
- `/recommendations`
- `/reset-password/[token]`
- `/security-status`
- `/settings`
- `/static-site`
- `/system`
- `/templates`
- `/templates/[slug]`
- `/validation-center`
- `/wizard`
- `/wizard/[slug]`

Wizards:

- Wizard generico em `frontend/src/components/wizard/steps/Step1...Step10`.
- Wizard core em `frontend/src/wizards/core/`.
- Static Site Wizard em `frontend/src/wizards/static-site/`.
- Spring Boot Wizard em `frontend/src/wizards/springboot/`.
- FastAPI Wizard em `frontend/src/wizards/fastapi/`.

Componentes relevantes:

- `components/generation/LiveGenerationModal.tsx`
- `components/live-builder/*`
- `components/visual-builder/*`
- `components/templates/*`
- `components/ai-models/*`
- `components/recommendation/*`
- `components/project-health/*`
- `components/premium/*`
- `components/common/*`

Estado/contextos:

- `WizardContext`
- `ThemeContext`
- `PreferencesContext`
- `LiveBuilderContext`

Internacionalizacao:

- `frontend/src/i18n/`
- Dicionarios: `pt-BR`, `en-US`, `es-ES`, `fr-FR`

## 12. Comunicacao frontend -> backend

Base URL:

- `frontend/src/lib/config.ts`
- Default: `http://127.0.0.1:8001`
- Env: `NEXT_PUBLIC_API_URL`

Cliente generico:

- `frontend/src/lib/api.ts`
- `apiGet(path, fallback)`
- `apiPost(path, body)`
- Timeout de 10s e 1 retry para GET.
- Fallback offline com dados mock em `frontend/src/mock/dashboard-data.ts`.

Auth:

- `frontend/src/lib/auth.ts`
- Chama:
  - `POST /api/auth/login`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

Chamadas importantes:

| Frontend | Backend |
|---|---|
| Static Site Wizard | `POST /api/prompt/build`, `POST /api/generate`, `GET /api/health` |
| Spring Boot Wizard | `POST /api/prompt/build`, `POST /api/generate` |
| FastAPI Wizard | `POST /api/prompt/build`, `POST /api/generate` |
| Create Form | `POST /api/create` |
| Create stack page | `GET /api/v1/stacks/{stackId}/schema`, `POST /api/v1/stacks/{stackId}/validate` |
| Templates | `GET /api/templates`, `POST /api/templates/{id}/prepare-generation`, `POST /api/generate` |
| Projects | `GET /api/projects`, `DELETE /api/projects/{id}`, `GET /api/downloads/{id}` |
| Downloads | `GET /api/downloads/{id}`, `GET /api/downloads/{id}/download` |
| Live page | `GET /api/projects/{id}/live`, `WS /ws/live/{id}` |
| AI Boost | `/api/ai-boost/*` |
| Billing | `GET /api/billing` |
| System | `GET /api/system/status` |
| AI Models | `GET /api/ai-models`, `POST /api/ai-models/{slug}/test` |
| Documentation | `GET /api/documentation`, `GET /api/documentation/sources` |
| Security | `GET /api/security-status` |
| Recommendations | `GET /api/recommendations` |
| Validation Center | `GET /api/validation/summary` |

## 13. Comunicacao em tempo real

WebSocket:

- Backend: `backend/app/streamer.py`
- Endpoint: `WS /ws/live/{project_id}`
- Frontend: `frontend/src/app/live/[projectId]/page.tsx`

Eventos transmitidos no fluxo de geracao:

- `STREAM_TERMINAL`
- `STREAM_CODE`
- `STREAM_ARCH`

Formato:

```json
{
  "type": "STREAM_TERMINAL",
  "payload": {
    "message": "[SYSTEM] Generation completed"
  }
}
```

Tambem ha uso de `EventSource` no frontend:

- `frontend/src/app/activity/page.tsx`
- `frontend/src/components/activity/LiveActivityStreamPanel.tsx`
- URL esperada: `/api/activity/stream`

Ponto de atencao: nao foi localizado endpoint FastAPI para `/api/activity/stream` durante o mapeamento por `rg`. Existe `GET /api/activity`.

## 14. Persistencia e dados

Arquivos de dados:

- `backend/data/projects.json`
- `backend/data/upgrades.json`
- `backend/data/ai_usage.json`
- `data/leads.jsonl`
- `data/form_submissions.jsonl`

Servico principal de projetos/pagamentos:

- `backend/app/services/payment_service.py`

Funcoes:

- `register_project`
- `get_project`
- `get_project_by_name`
- `get_all_projects`
- `update_project`
- `update_payment_status`
- `create_checkout`
- `mock_confirm`
- `delete_project`

Path padrao de projeto:

- relativo: `generated_projects/{nome_normalizado}_{project_id}`
- absoluto: calculado dentro de `generated_projects/`

## 15. Marketplace e templates

Backend:

- `backend/app/routes/templates.py`
- `backend/app/services/marketplace_catalog.py`
- `backend/templates/template_registry.py`
- `backend/templates/template_quality_gate.py`

Frontend:

- `frontend/src/app/templates/page.tsx`
- `frontend/src/app/templates/[slug]/page.tsx`
- `frontend/src/components/templates/*`

Assets:

- `public/templates/static-brand-site/*.svg`
- `public/templates/realtime-analytics-platform/*.svg`
- `public/templates/marketplace-platform/*.svg`
- `public/templates/ai-saas-control-plane/*.svg`
- `public/templates/erp-suite/*.svg`
- `public/templates/banking-api-platform/*.svg`

Fluxo:

1. Usuario escolhe template.
2. Frontend chama `/api/templates/{id}/prepare-generation`.
3. Frontend envia payload para `/api/generate`.
4. Backend segue fluxo oficial de geracao.

## 16. AI Boost

Backend:

- `backend/app/routes/ai_boost.py`
- `backend/app/services/gemini_service.py`
- `backend/data/ai_usage.json`

Endpoints:

- `GET /api/ai-boost/plans`
- `GET /api/ai-boost/status/{project_id}`
- `GET /api/ai-boost/check-permission/{project_id}`
- `POST /api/ai-boost/activate`
- `POST /api/ai-boost/deactivate/{project_id}`
- `POST /api/ai-boost/mock-confirm`
- `POST /api/ai-boost/projects/{project_id}/ai/improve-code`
- `POST /api/ai-boost/projects/{project_id}/ai/generate-feature`
- `POST /api/ai-boost/projects/{project_id}/ai/generate-tests`
- `POST /api/ai-boost/projects/{project_id}/ai/generate-docs`
- `POST /api/ai-boost/projects/{project_id}/ai/chat`
- `GET /api/ai-boost/usage/{project_id}`

Regra no runner:

- Se `ai_generation_mode == agent_boost_100`, precisa de `agent_boost_status == active` e `payment_status == paid`.
- Caso contrario, faz fallback para `local_build_90`.
- A API key nao deve ser exposta nos artefatos; traces registram `api_key_exposed: false`.

## 17. Autenticacao e seguranca

Rotas:

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

Arquivos:

- `backend/app/services/auth_service.py`
- `backend/app/security/jwt_manager.py`
- `backend/app/security/password_hasher.py`
- `backend/app/security/auth_guard.py`
- `backend/app/security/permissions.py`

Seguranca de geracao/download:

- `PathGuard` e usado para resolver paths de projeto.
- `SecretScanner` existe para varredura de segredos.
- `SecurityGate` roda sobre projeto gerado.
- `RateLimiter`, CSRF, CORS e headers estao separados em modulos.

## 18. Testes

Testes Python:

- `tests/test_create_api.py`
- `tests/register_test.py`
- `backend/tests/test_zip_service.py`
- `backend/tests/test_secret_scanner.py`
- `backend/tests/test_prompt_generator_engine.py`
- `backend/tests/test_auth_routes.py`

Testes frontend/TS:

- `frontend/src/__tests__/route-separation.test.ts`
- `frontend/src/lib/architecture-engine/*.spec.ts`
- `frontend/scripts/static-site-wizard-navigation.test.cjs`

Comandos provaveis:

```bash
pytest
cd frontend && npm run build
```

Observacao: nao executei a suite inteira neste mapeamento; o objetivo foi inventario e documentacao.

## 19. Relatorios existentes

Pasta `reports/` contem auditorias e historico tecnico, incluindo:

- `architecture_inventory.md`
- `full_system_audit.md`
- `final_architecture_validation.md`
- `final_system_integration_audit.md`
- `download_pipeline_report.md`
- `security_gate_report.md`
- `dead_code_report.md`
- `route_conflicts.md`
- `prompt_engine_validation.md`
- varios relatorios de refactor UI/UX e marketplace.

Esses arquivos sao uteis para entender decisoes anteriores e pontos ja validados.

## 20. Pontos de atencao encontrados

1. Encoding: varios arquivos mostram caracteres quebrados quando lidos no terminal, exemplo `PortuguÃªs`, `GeraÃ§Ã£o`. Pode ser problema de encoding historico ou de exibicao PowerShell. Vale padronizar para UTF-8.
2. `EventSource` frontend espera `/api/activity/stream`, mas o endpoint nao apareceu na busca de rotas FastAPI.
3. Ha endpoints legados `POST /api/v1/generate` explicitamente desativados com HTTP 410. O caminho oficial e `/api/generate`.
4. Existem muitos artefatos gerados/cacheados em `frontend/`, `generated_projects/`, `backups/` e `output/`. Cuidado ao medir tamanho ou procurar codigo vivo.
5. `frontend/src/lib/api.ts` tem fallback offline para varias telas. Isso pode mascarar backend fora do ar em desenvolvimento.
6. `backend/data/projects.json` e arquivo local. Em ambiente multiusuario/producao, isso deveria migrar para banco transacional.
7. `docker-compose.yml` expoe Postgres no host `9876` e API em `8001`; frontend compose usa porta `4321`, mas CORS default no backend e `http://localhost:3000` se `ALLOWED_ORIGINS` nao for definido.
8. O runner e grande e concentra muitas responsabilidades: normalizacao, autorizacao AI Boost, geracao, gatekeepers e escrita de artefatos. Pode ser um alvo futuro de decomposicao.

## 21. Mapa de comunicacao geral

```text
Usuario
  |
  v
Frontend Next.js
  |-- apiGet/apiPost/fetch --------------------.
  |                                            |
  |-- WebSocket /ws/live/{project_id} <--------|---- Backend streamer
  |-- EventSource /api/activity/stream --------|---- Pendente/revisar
  v                                            |
Backend FastAPI -------------------------------'
  |
  |-- Auth Service / Security modules
  |-- Payment/Project Service -> backend/data/*.json
  |-- Prompt Engine -> Prompt Master
  |-- Knowledge Engine -> docs context/cache
  |-- Stack Registry -> stack_registry/stacks/*.json
  |-- Project Runner
        |
        |-- AI Router
        |-- Agents pipeline
        |-- Static/Backend/Frontend generators
        |-- Gatekeeper Registry
        |-- Quality/Fidelity/Stack/Security gates
        v
generated_projects/{project}_{id}
  |
  |-- download zip via /api/downloads/{id}/download
  |-- live preview via /api/projects/{id}/live
  '-- upgrade/AI Boost flows via /api/projects and /api/ai-boost
```

## 22. Arquivos de referencia rapida

- Backend app: `backend/app/main.py`
- Geracao oficial: `backend/app/routes/generate.py`
- Runner: `agents/core/project_runner.py`
- Pipeline: `agents/core/pipeline.py`
- WebSocket: `backend/app/streamer.py`
- Projetos/pagamento: `backend/app/services/payment_service.py`
- API frontend: `frontend/src/lib/api.ts`
- Config frontend API: `frontend/src/lib/config.ts`
- Registry: `stack_registry/registry.py`
- Stacks: `stack_registry/stacks/*.json`
- Prompt Engine: `prompt_engine/prompt_generator.py`
- Security gates: `security_engine/validators/*.py`
- Gatekeepers: `agents/gatekeepers/*.py`
- Frontend rotas: `frontend/src/app/**/page.tsx`
- Wizards: `frontend/src/wizards/` e `frontend/src/components/wizard/`

