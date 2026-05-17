# Templates Generation + Preview Fix

## What changed
- Reworked the `/templates` marketplace into a usable model surface instead of a static catalog.
- Added template cover assets and demo images under `public/templates/`.
- Made `Usar template` persist template context and redirect to the correct wizard route.
- Made `Gerar agora` call `POST /api/generate` with the template payload and redirect to download/checkout.
- Updated the template inspector modal to show image, live preview, architecture, blueprint, modules and direct actions.
- Updated the template detail page to use the official generation endpoint.
- Extended the registry to expose `image`, `demo_images`, `default_answers`, `stack_id`, `project_type`, and `redirect_url`.
- Tightened the template quality gate so `ready` requires visual assets and default answers.

## Endpoints used
- `GET /api/templates`
- `GET /api/templates/{id}`
- `GET /api/templates/{id}/preview`
- `GET /api/templates/{id}/blueprint`
- `POST /api/templates/{id}/prepare-generation`
- `POST /api/generate`

## Validation
- `python -m py_compile backend/templates/template_registry.py backend/templates/template_quality_gate.py backend/app/routes/templates.py`
- `npm.cmd exec tsc -- -p tsconfig.json --noEmit`
- Manual registry check confirmed:
  - `image` present
  - `demo_images` present
  - `default_answers` present
  - `redirect_url` points to the correct wizard route

## Result
Templates now behave as reusable product models:
- visual preview on the card
- architecture inspection
- template-to-wizard handoff
- direct generation
- download / checkout redirection
