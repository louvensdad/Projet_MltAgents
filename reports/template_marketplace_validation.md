# Template Marketplace Validation

Data: 2026-05-17

## Resultado

Catalogo em `backend/templates/template_registry.py` validado. Todos os templates enriquecidos possuem:

- `image`
- `demo_images`
- `preview_html`
- `blueprint`
- `prompt_master_seed`
- `default_answers`
- `stack_id`
- `gatekeeper`
- `generation_supported`
- `create_payload`

## Correcoes

- `static-brand-site` passou a usar `stack_profile_id: static_site`.

## Status

| template | status | action_needed |
|---|---|---|
| banking-api-platform | ready | none |
| erp-suite | ready | none |
| marketplace-platform | ready | none |
| ai-saas-control-plane | ready | none |
| static-brand-site | ready | fixed static id |
| realtime-analytics-platform | ready | none |

