# Dead Code Cleanup

## Atualização da auditoria final

Foram confirmados novos pontos de código órfão, fake ou parcialmente conectado.

## Órfãos ou fora do fluxo principal

### `src/agents/core/project_runner.py`

Problema:

- contém o pipeline mais completo do produto
- usa `AIRouter`, gatekeepers, `StackGate`, `FidelityGate`, geração de trace e docs de IA
- porém o fluxo real do painel usa `control_panel/backend/app/routes/generate.py`

Impacto:

- existe duplicidade de pipeline
- a versão mais rica não é a que responde à geração principal

### `src/agents/core/ai_router.py`

Problema:

- implementa governança real de `local_build_90` vs `agent_boost_100`
- não é consumido pelo `/api/generate` atual

Impacto:

- modo premium existe no código, mas não controla a geração principal

## Wizards parcialmente fake

### `control_panel/frontend/src/wizards/fastapi/FastAPIWizard.tsx`

Evidência:

- usa `setTimeout(...)`
- não chama `/api/generate`

### `control_panel/frontend/src/wizards/springboot/SpringBootWizard.tsx`

Evidência:

- depende de `onGenerate?`
- a rota dinâmica `wizard/[slug]/page.tsx` apenas renderiza o componente
- o callback de geração não é injetado

Impacto:

- UI existe
- fluxo real de geração não está conectado

## Componentes com contrato morto ou divergente

### Documentação

- `control_panel/frontend/src/components/documentation/DocumentationPanel.tsx`
- chama `/api/docs/sources`
- backend expõe `/api/documentation`

### Validation center

- `control_panel/frontend/src/app/validation-center/page.tsx`
- chama `/api/validation/summary`
- backend expõe `/api/validation-center`

### AI model drawers

- componentes de AI models chamam `/api/ai-models/{slug}/test`
- backend não expõe esse endpoint

## Mock explícito ainda presente

### Documentation Engine

Arquivo:

- `src/documentation_engine/docs_fetcher.py`

Evidência:

- `success = True`
- conteúdo sintético fixo

Conclusão:

- o engine está mockado

### Rotas sistêmicas

`control_panel/backend/app/routes/system.py` expõe vários status e listas estáticas/sintéticas:

- billing
- activity
- recommendations
- validation-center

Isso não é necessariamente erro, mas não deve ser tratado como integração real.

## Resumo final

Código morto ou semi-morto mais relevante hoje:

- pipeline `project_runner` não ligado ao fluxo principal
- `AIRouter` fora do `/api/generate`
- FastAPI wizard sem backend real
- Spring Boot wizard sem callback real de geração
- documentação e validation center com contratos desencontrados
- docs engine mockado

## Removed or neutralized
- Removed broken duplicate tail block in `src/config/version_matrix.py`.
- Neutralized legacy route ambiguity by adding a canonical redirect page for `/static-site`.
- Excluded `src/__tests__` from the application TypeScript compile scope so app checks stop failing on Bun-specific test helpers.

## Consolidated
- API base URL now resolves through one frontend source of truth: `src/lib/config.ts`.
- Path validation now centralizes generated-project root normalization in `backend/app/security/path_guard.py`.

## Still present but not removed in this pass
- Legacy comments and logs still mention `output/generated_projects`.
- Older records in `control_panel/backend/data/projects.json` still contain historical paths; runtime compatibility was added instead of destructive migration.
- Unused older wizard infrastructure still exists outside the static-site path and should be pruned in a second cleanup pass after broader integration.
