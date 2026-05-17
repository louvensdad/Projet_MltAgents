# Final UI UX Review

## Estado geral

A base visual melhorou e há uma direção clara de produto premium:

- tokens centrais em `control_panel/frontend/src/design-system/`
- `globals.css` com atmosfera dark-tech
- sidebar e layout mais consistentes
- rota `/static-site` agora redireciona para `/wizard/static-site`

## Pontos positivos confirmados

- design tokens criados
- layout global usa profundidade e efeitos de fundo
- sidebar centralizada no layout principal
- wizard `static-site` está no App Router e usa redirect real
- build do frontend passou

## Riscos visuais e de navegação ainda abertos

### 1. Prova de navegação em browser não foi executada

Não houve teste real de clique em navegador nesta auditoria.

Logo, não foi possível provar de forma final:

- sidebar sempre clicável
- overlays nunca bloqueiam clique
- focus traps corretos
- ausência de lock visual em todos os fluxos

### 2. Z-index continua fragmentado

Busca no frontend mostrou múltiplos overlays com:

- `z-[9998]`
- `z-[9999]`

Arquivos com incidência:

- drawers de AI models
- modais de geração
- download cards
- toasts
- overlays de projetos

Conclusão:

- ainda não existe governança total de camadas
- o risco de colisão visual permanece

### 3. Wizard premium só está fechado em static-site

`/wizard/[slug]` mapeia:

- `static-site`
- `springboot`
- `fastapi`

Mas apenas `static-site` usa o fluxo integrado completo.

### 4. Contratos de UI ainda inconsistentes

Componentes/telas ainda apontam para endpoints que não batem com o backend:

- `DocumentationPanel` -> `/api/docs/sources`
- `validation-center` -> `/api/validation/summary`
- AI model drawers -> `/api/ai-models/{slug}/test`

Isso indica páginas visualmente prontas, mas sem backend correspondente.

## I18N

O frontend usa `PreferencesContext` e `t(...)` amplamente.

Pontos bons:

- idioma troca labels e várias telas do painel
- wizard `static-site` usa `t(...)`

Pontos faltando:

- mensagens de erro backend seguem em português fixo
- docs geradas e mensagens de gate não seguem i18n ponta a ponta
- downloads e relatórios do backend não estão internacionalizados de forma completa

## Conclusão

A UI já tem base de produto premium e consistente no frontend principal.

Mas a auditoria não permite dizer que a experiência está “definitivamente fechada”.

Motivos:

- ainda há modais com z-index concorrente
- ainda há páginas acopladas a endpoints inexistentes
- ainda não houve E2E visual real em navegador
