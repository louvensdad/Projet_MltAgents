# Stack Fields Validation

Data: 2026-05-17

## Resultado

`PromptValidator` exige campos por `stack_registry/stacks/*.json`. O endpoint `/api/generate` agora normaliza respostas do wizard para os campos obrigatorios esperados.

## Campos corrigidos no payload oficial

- Campos base: `business_goal`, `business_rules`, `entities`, `features`, `language`, `docker`.
- Spring Boot: `auth`, `cache`, `observability`, `tests`.
- FastAPI: `auth`, `workers`, `cache`, `tests`.

## Status por categoria

| categoria | status |
|---|---|
| Spring Boot | ok para nome, descricao, publico, entidades, funcionalidades, arquitetura, Java, Spring Boot, banco, auth, cache, mensageria, Docker, observabilidade, testes, idioma |
| FastAPI | ok para entidades, regras, auth, async, ORM, banco, workers, cache, OpenAPI, testes |
| Frontend | partial: create config tem paginas/componentes/layout/API client/responsividade, mas wizards dedicados existem so para Static Site, Spring Boot e FastAPI |

