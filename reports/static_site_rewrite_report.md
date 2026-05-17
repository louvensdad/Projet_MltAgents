# Static Site Rewrite Report

## Cause Root
- The backend registry stored the static site stack as `static-site` while the Prompt Engine and generation pipeline expected `static_site`.
- The wizard also mixed legacy static site fields with the new contract, which caused prompt validation and generation to drift apart.

## Canonical ID
- Internal ID: `static_site`
- Public slug: `/wizard/static-site`
- Frontend payload: `stack_id: "static_site"`, `project_type: "static_site"`

## Files Updated
- `stack_registry/registry.py`
- `stack_registry/stacks/static_site.json`
- `prompt_engine/validator.py`
- `prompt_engine/prompt_generator.py`
- `prompt_engine/prompt_templates/static_site_prompt.md`
- `prompt_engine/templates/static_site_prompt.md`
- `backend/app/routes/prompt_routes.py`
- `backend/app/routes/generate.py`
- `backend/tests/test_prompt_generator_engine.py`
- `frontend/src/wizards/static-site/staticSiteConfig.ts`
- `frontend/src/wizards/static-site/staticSitePayload.ts`
- `frontend/src/wizards/static-site/StaticSiteWizard.tsx`
- `frontend/src/wizards/static-site/steps/*`
- `frontend/src/components/live-builder/LiveProjectBuilder.tsx`
- `frontend/src/components/live-builder/ArchitectureMiniMap.tsx`
- `frontend/src/lib/live-builder.ts`
- `frontend/scripts/static-site-wizard-navigation.test.cjs`

## Prompt Master Contract
- Required fields:
  - `project_name`
  - `site_type`
  - `target_audience`
  - `business_goal`
  - `sections`
  - `seo_keywords`
  - `visual_style`
  - `contact_method`
  - `language`
- Prompt build now returns:
  - `success`
  - `stack_id`
  - `prompt_master`
  - `missing_fields`
  - `validation.passed`

## Frontend Payload
- Final generate payload now sends:
  - `stack_id: "static_site"`
  - `project_type: "static_site"`
  - `project_name`
  - `project_description`
  - `answers`
  - `generation_quality_mode`
  - `locale`

## Generation Flow
- Static Site generation now passes the prompt answers as `project_brief` and `brief` into the official generation pipeline.
- This aligns the wizard fields with the gatekeeper and the static site generator.

## Validation
- `python -m pytest backend/tests/test_prompt_generator_engine.py`
- `node frontend/scripts/static-site-wizard-navigation.test.cjs`
- `docker compose build frontend`
- `python -m py_compile backend/app/routes/prompt_routes.py backend/app/routes/generate.py backend/tests/test_prompt_generator_engine.py prompt_engine/prompt_generator.py prompt_engine/validator.py stack_registry/registry.py`

## Result
- The static site module now uses one canonical internal ID: `static_site`.
- The Prompt Master no longer depends on the legacy `static-site` stack lookup.
- The wizard, prompt engine, registry and generation route now share the same contract.
