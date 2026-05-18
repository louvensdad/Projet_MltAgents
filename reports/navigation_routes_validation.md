# Navigation Routes Validation

Data: 2026-05-17

## Resultado por build

Next build gerou rotas:

- `/`
- `/create`
- `/create/[stackId]`
- `/wizard`
- `/wizard/[slug]`
- `/templates`
- `/templates/[slug]`
- `/projects`
- `/projects/[id]`
- `/projects/[id]/checkout`
- `/projects/[id]/details`
- `/projects/[id]/upgrade`
- `/downloads`
- `/downloads/[id]`
- `/settings`

## Divergencias

- O plano citava `/dashboard`; no projeto, Dashboard e `/`.
- O plano citava `/wizard/static-site`, `/wizard/springboot`, `/wizard/fastapi`; o App Router tem `/wizard/[slug]` e `/static-site` redireciona para `/wizard/static-site`.

## Status

Build, lint e typecheck passaram. Clique real/sidebar/mobile nao foi testado por browser nesta rodada porque a ferramenta Browser nao esta disponivel nesta sessao e nenhum Edge/Chrome/Chromium foi encontrado no PATH.
