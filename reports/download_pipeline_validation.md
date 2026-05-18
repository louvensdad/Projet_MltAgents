# Download Pipeline Validation

Data: 2026-05-17

## Resultado

Backend tests: `25 passed`.

Suite completa atual: `pytest -q` com `30 passed`, incluindo os testes de contrato de `/api/create` convertidos para `TestClient`.

E2E downloads:

- `static_site`: prepare 200, download 200, `application/zip`.
- `fastapi`: prepare 200, download 200, `application/zip`.
- `spring_boot`: prepare 200, download 200, `application/zip`.

## Correcoes aplicadas

- Normalizacao de paths Windows em `_is_allowed_item`.
- Detector de `sk-...` ajustado para chaves reais longas.
- Secret scan roda antes do Quality Gate para erro de segredo ser explicito.
- Quality/Security Gate estrito roda em projetos gerados reais (`blueprint` ou `generation_trace`).
- `PathGuard` aponta para `generated_projects/` da raiz.

## Validacoes

| criterio | status |
|---|---|
| project_id existe | passed |
| project_path existe | passed |
| ZIP contem somente projeto | covered by tests |
| nao baixa raiz do SaaS Factory | covered by tests |
| nao quebra por dependencia `validators` | passed |
| nao da `project_path_not_found` no E2E | passed |
