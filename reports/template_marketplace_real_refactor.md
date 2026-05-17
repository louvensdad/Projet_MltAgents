# Template Marketplace Real Refactor

## Resultado

A página `/templates` deixou de depender de cards decorativos e passou a operar sobre um registry real de templates.

## Templates criados

Templates enterprise registrados no backend:

1. `banking-api-platform`
2. `erp-suite`
3. `marketplace-platform`
4. `ai-saas-control-plane`
5. `static-brand-site`
6. `realtime-analytics-platform`

Cada template agora possui:

- `id`
- `name`
- `category`
- `level`
- `stack`
- `architecture`
- `description`
- `business_domain`
- `modules`
- `features`
- `required_files`
- `blueprint`
- `prompt_master_seed`
- `gatekeeper`
- `preview_type`
- `demo_data`
- `generation_supported`
- `stack_profile_id`
- `quality_score`
- `status`
- `wizard_route`

## Backend endpoints

Endpoints implementados ou corrigidos:

- `GET /api/templates`
- `GET /api/templates/{template_id}`
- `GET /api/templates/{template_id}/preview`
- `GET /api/templates/{template_id}/blueprint`
- `POST /api/templates/{template_id}/prepare-generation`

Esses endpoints agora retornam dados do `TemplateRegistry`.

## Frontend refactor

Arquivos principais:

- `frontend/src/app/templates/page.tsx`
- `frontend/src/app/templates/[slug]/page.tsx`
- `frontend/src/components/templates/TemplateInspectorModal.tsx`
- `frontend/src/components/templates/previews/*`
- `frontend/src/app/create/[stackId]/page.tsx`

Mudanças entregues:

- Cards com mini preview real.
- Badges de stack, arquitetura, score, complexidade e status.
- Botões funcionando:
  - Preview
  - Arquitetura
  - Build
  - Ver detalhes
  - Usar template
- Detail page com preview grande, blueprint, Prompt Master seed, arquivos previstos e requisitos de segurança.
- Wizard com `template_id` e pré-preenchimento quando o template é selecionado.

## Pipeline

Fluxo agora alinhado ao caminho oficial:

Template -> Prompt Master -> Prompt Validator -> Documentation Engine -> Gatekeeper -> Project Runner -> Quality Gate -> Security Gate -> Download

## Limpeza de fake

Foi removida a dependência do catálogo estático como fonte de verdade.

O arquivo legado `backend/app/services/marketplace_catalog.py` foi mantido apenas para billing e compatibilidade, e os antigos helpers de catálogo foram delegados ao registry real.

## Validação

Verificações executadas com sucesso:

- `python -m py_compile` nos módulos do backend alterados
- `python -c "from backend.app.main import app; print(len(app.routes))"`
- `npm exec tsc -- -p tsconfig.json --noEmit`
- chamadas de teste para:
  - `/api/templates`
  - `/api/templates/banking-api-platform`
  - `/api/templates/banking-api-platform/preview`
  - `/api/templates/banking-api-platform/blueprint`
  - `/api/templates/banking-api-platform/prepare-generation`

## Observação

O catálogo visual offline ainda pode cair para fallback local, mas agora o fallback segue o mesmo contrato do registry real e não é mais a fonte principal de geração.

