# Security Quality Validation

Data: 2026-05-17

## Testes

`pytest backend/tests -q`: 25 passed.

`pytest -q`: 30 passed, 8 warnings de deprecacao.

## Security Gate

| criterio | status |
|---|---|
| bloqueia segredo real | passed |
| permite `.env.example` | passed por scanner/testes |
| permite `os.getenv` | passed por implementacao do scanner |
| evita falso positivo em placeholders | passed |
| bloqueia raiz/factory no ZIP | passed |

## Quality Gate

| criterio | status |
|---|---|
| bloqueia projeto gerado vazio | active para projetos com blueprint/generation_trace |
| exige README | active em projetos gerados reais |
| exige docs/static files | active |
| valida stack correta | active via gatekeeper + stack gate |
