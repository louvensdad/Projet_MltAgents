# Final System Integration Audit

Data da auditoria: 2026-05-15

## Escopo

Validação profunda do fluxo principal do SaaS Factory AI com foco em:

- Prompt Generator Engine
- Prompt Validator / Prompt Master
- Gatekeepers / Quality Gate / Security Gate
- Wizard / Live Builder / Preview
- AI Router / Agent Boost / Local Build
- Download Pipeline / Checkout / Project Registry
- I18N / UI system / rotas e endpoints

## Evidência executada

Comandos e execuções locais usados nesta auditoria:

- `npm.cmd run build` em `control_panel/frontend`: passou
- `python -m compileall control_panel/backend/app src`: passou
- `npx.cmd tsc --noEmit` em `control_panel/frontend`: falhou nesta auditoria por `include` inválido de `.next/types/**/*.ts`
- fluxo local direto das rotas/funções:
  - `health_check()`
  - `build_prompt_master()`
  - `generate_project()`
  - `get_download_info()`
  - `zip_service.create_project_zip()`
  - `SecurityGate.validate()`
  - `QualityGate.validate()`
  - `get_ai_status()`
  - `check_agent_boost_permission()`
  - `mock_confirm_payment()`
  - `ai_improve_code()`

## Veredito executivo

O sistema não está totalmente integrado.

Existe um fluxo principal funcional e comprovado para `static-site`:

- wizard chama `/api/prompt/build`
- backend gera projeto em `generated_projects/{nome}_{id}`
- projeto entra no registry
- checkout redireciona para `/downloads/[id]`
- download gera ZIP válido

Mas a integração ainda é parcial e inconsistente:

- Prompt Engine é chamado, mas rejeição não bloqueia geração
- `StackGate`, `AIRouter`, `project_runner` e GatekeeperRegistry existem, porém não dirigem o `/api/generate` atual
- Agent Boost existe como produto separado, mas não está integrado ao pipeline principal de geração
- Documentation Engine está presente, porém mockado
- somente o wizard `static-site` está realmente ligado ao backend de geração
- FastAPI e Spring Boot ainda não seguem o mesmo contrato do wizard principal

## O que foi provado

### 1. Health e backend principal

`/api/health` respondeu com:

- `status: ok`
- `service: saas-factory-api`

Arquivo principal: `control_panel/backend/app/routes/generate.py`

### 2. Prompt Generator no wizard static-site

Arquivo: `control_panel/frontend/src/wizards/static-site/StaticSiteWizard.tsx`

Fluxo comprovado:

- o wizard faz `POST /api/prompt/build`
- em seguida faz `POST /api/generate`
- usa `router.push(res.data?.redirect_url || ...)`

Isso prova integração real do `static-site` com Prompt Engine e geração.

### 3. Pipeline real de geração static-site

Execução local comprovou:

- geração bem-sucedida de projeto `427b93c6`
- diretório criado: `generated_projects/audit_site_427b93c6`
- arquivos reais criados:
  - `README.md`
  - `index.html`
  - `assets/`
  - `components/`
  - `content/`
  - `docs/`
  - `robots.txt`
  - `sections/`
  - `sitemap.xml`

### 4. Preview/state influenciando saída final

Projeto de auditoria foi gerado com seções `hero`, `faq`, `contact`.

Prova em arquivos gerados:

- `generated_projects/audit_site_427b93c6/sections/landing-sections.md` contém `Hero`, `FAQ`, `Contato`
- `generated_projects/audit_site_427b93c6/index.html` contém:
  - seção `hero`
  - seção `faq`
  - seção `contato`

Isso prova que a seleção de seções do fluxo `static-site` influencia o projeto final.

### 5. Registry + download pipeline

Projeto entrou no registry com:

- `project_id: 427b93c6`
- `project_path: generated_projects/audit_site_427b93c6`

Após marcar pagamento como `paid`, o download retornou:

- `file_name: Audit_Site_generated_by_Ldcn.zip`
- `file_count: 20`
- `security_status: passed`

`zip_service.create_project_zip()` também gerou ZIP válido em memória.

### 6. Security Gate

Validação controlada provou:

- `.env.example` com placeholder: permitido
- `os.getenv(...)`: permitido
- `.env` com segredo real: bloqueado

### 7. Quality Gate

Validação controlada provou:

- projeto static vazio: bloqueado
- projeto static mínimo com `index.html`, `assets`, `sections`, `README.md`: permitido

## Falhas críticas comprovadas

### 1. Prompt Validator não bloqueia a geração

Fato observado na execução:

- `build_prompt_master()` retornou `status: rejected`
- erros incluíam:
  - nenhuma entidade confirmada
  - nenhuma funcionalidade confirmada
  - estratégia de autenticação incompatível
- mesmo assim `generate_project()` retornou `success: true`

Conclusão:

- Prompt Engine é chamado
- Prompt Validator detecta erro
- mas o `/api/generate` não trata rejeição como bloqueio

Impacto:

- o Prompt Master não é a source of truth real
- geração pode seguir com input inválido

### 2. Prompt artifacts não são persistidos no fluxo real static-site

No projeto gerado `427b93c6`:

- `PROMPT_MASTER.md`: ausente
- `docs/PROMPT_MASTER.md`: ausente
- `prompt_trace.json`: ausente
- `prompt_master.json`: ausente

Conclusão:

- a exportação do Prompt Engine não está chegando ao diretório final do projeto gerado static-site
- o requisito de rastreabilidade do Prompt Master não está cumprido

### 3. Agent Boost não está integrado ao `/api/generate`

Teste com payload:

- `ai_generation_mode = agent_boost_100`
- `payment_status = pending_payment`
- `agent_boost_status = inactive`

Resultado:

- geração ocorreu com sucesso
- nenhum bloqueio por pagamento ou permissão
- nenhum `generation_trace.json`
- nenhum `docs/AI_USAGE.md`

Conclusão:

- o fluxo principal de geração ignora a governança real do Agent Boost
- `AIRouter` não está no caminho do `/api/generate`

### 4. Inconsistência de Agent Boost após mock confirm

Após `mock_confirm_payment()`:

- `status_after.ai_boost_active = true`
- `permission_after.agent_boost_allowed = false`

Motivo real:

- sem `GEMINI_API_KEY` da plataforma

Conclusão:

- há divergência entre “status comercial/ativo” e “permissão real de uso”

### 5. Stack Gate / GatekeeperRegistry fora do fluxo principal

O pipeline rico com:

- `AIRouter`
- `GatekeeperRegistry`
- `StackGate`
- `FidelityGate`
- `generation_trace.json`
- `docs/AI_USAGE.md`
- `docs/PROMPT_MASTER.md`

está em `src/agents/core/project_runner.py`.

O `/api/generate` atual usa `ProjectGeneratorFactory.generate(...)` em:

- `control_panel/backend/app/routes/generate.py`

Conclusão:

- existe um pipeline avançado e outro pipeline real em produção local
- eles não são o mesmo pipeline

### 6. Documentation Engine não é real

`src/documentation_engine/docs_fetcher.py` usa:

- `success = True`
- retorno sintético `Documentação oficial estruturada para {stack}.`

Conclusão:

- não há prova de consulta real de documentação
- o engine está mockado

### 7. Nem todos os wizards estão conectados

Arquivos com evidência:

- `control_panel/frontend/src/wizards/fastapi/FastAPIWizard.tsx`
  - usa `setTimeout(...)`
  - não chama `/api/generate`
- `control_panel/frontend/src/wizards/springboot/SpringBootWizard.tsx`
  - depende de `onGenerate?`
  - a rota dinâmica não injeta esse callback

Conclusão:

- somente `static-site` está realmente integrado ao backend atual

### 8. Endpoints e páginas desconectados

Evidências encontradas:

- frontend `DocumentationPanel` chama `/api/docs/sources`
- backend expõe `/api/documentation`

- frontend `validation-center/page.tsx` chama `/api/validation/summary`
- backend expõe `/api/validation-center`

- componentes AI models chamam `/api/ai-models/{slug}/test`
- backend não expõe esse endpoint

Conclusão:

- ainda existem telas e componentes apontando para contratos inexistentes ou antigos

### 9. Typecheck não está estável

Nesta auditoria:

- `npm run build`: passou
- `npx tsc --noEmit`: falhou

Motivo:

- `tsconfig.json` inclui `.next/types/**/*.ts`
- os arquivos esperados não existem no momento da verificação standalone

Conclusão:

- build de produção passa
- typecheck standalone ainda não é confiável

## Integração por subsistema

### Integrado e funcionando

- static-site wizard
- prompt build endpoint
- geração static-site
- project registry
- checkout redirect
- download page e ZIP
- Quality Gate básico
- Security Gate básico

### Existe, mas integração parcial

- Live Builder
- Prompt Master persistence
- I18N
- design system
- Agent Boost
- AI Router
- Preview Engine

### Existe, mas não está no fluxo principal

- `src/agents/core/project_runner.py`
- `src/agents/core/ai_router.py`
- `src/validators/stack_gate.py`
- `src/agents/gatekeepers/*`

### Existe, mas está mockado / sintético

- `src/documentation_engine/docs_fetcher.py`
- partes de status sistêmico em `routes/system.py`

## Conclusão final

O produto já não está no estado “totalmente quebrado”, porque o eixo `static-site -> generation -> checkout -> download` foi comprovado.

Mas ainda não pode ser considerado “ecossistema unificado”.

O problema central hoje é arquitetural:

- existe um fluxo principal simplificado em produção local
- existe um fluxo mais avançado separado
- os dois não foram unificados

Enquanto isso não for consolidado, o sistema continua parcialmente Frankenstein:

- um wizard realmente conectado
- outros wizards parcialmente fake
- IA premium existente como subsistema separado
- gates mais ricos fora do fluxo principal
- docs e algumas telas ainda em contrato antigo
