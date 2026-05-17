# Template Marketplace Inventory

## Scope

Mapeamento da camada de templates antes da fase 10 e do novo contrato real.

## Frontend

Arquivos relevantes:

- `frontend/src/app/templates/page.tsx`
- `frontend/src/app/templates/[slug]/page.tsx`
- `frontend/src/components/templates/TemplateInspectorModal.tsx`
- `frontend/src/components/templates/previews/StaticSiteMiniPreview.tsx`
- `frontend/src/components/templates/previews/BackendArchitectureMiniPreview.tsx`
- `frontend/src/components/templates/previews/DashboardMiniPreview.tsx`
- `frontend/src/components/templates/previews/MarketplaceMiniPreview.tsx`
- `frontend/src/components/templates/previews/AiSaasMiniPreview.tsx`
- `frontend/src/components/templates/previews/TemplateArchitectureDiagram.tsx`
- `frontend/src/components/templates/previews/TemplateFileTreePreview.tsx`

Inventário:

- Cards antigos eram decorativos e não carregavam contrato completo.
- Preview, Arquitetura e Build dependiam de conteúdo visual, sem ligação forte com registry ou pipeline.
- A detail page antiga em `/templates/[slug]` usava `iframe` com preview isolado e shape antigo.
- O wizard de criação ainda não recebia `template_id` como contexto de pré-preenchimento.

## Backend

Arquivos relevantes:

- `backend/templates/template_registry.py`
- `backend/templates/template_quality_gate.py`
- `backend/app/routes/templates.py`
- `backend/app/main.py`
- `backend/app/services/marketplace_catalog.py`

Inventário:

- Existia catálogo legado em `marketplace_catalog.py` com templates estáticos e preview fake.
- Não havia registry único para contrato de template, blueprint e geração.
- Não existiam endpoints próprios para preview, blueprint e prepare-generation.

## Problemas encontrados e corrigidos

- Cards fake sem contrato real.
- Botões sem ação forte de geração.
- Previews mockados ou desconectados do backend.
- Templates sem blueprint, stack_profile, prompt seed ou gatekeeper formal.
- Catálogo estático demais e duplicado em mais de um ponto.
- Caminho de geração sem preparação formal por template.

## Estado atual

- O backend agora usa `TemplateRegistry` como fonte de verdade.
- O frontend consome `/api/templates` com contrato real.
- O catálogo legado foi neutralizado e passou a delegar para o registry real.
- O wizard recebe `template_id` e pode ser pré-preenchido.

