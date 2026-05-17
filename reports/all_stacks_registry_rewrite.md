# All Stacks Registry Rewrite

## Scope
- Standardized all non-Static Site modules to canonical internal stack IDs.
- Left `static_site` modules untouched in this task.

## Canonical IDs
- `spring_boot`
- `fastapi`
- `nestjs`
- `express`
- `laravel`
- `dotnet`
- `angular`
- `react`
- `nextjs`
- `vue`
- `blazor`
- `automation`
- `ai_agents`

## Files Updated
- `stack_registry/registry.py`
- `stack_registry/stacks/*.json`
- `backend/config/stack_profiles.py`
- `backend/config/implemented_stacks.py`
- `backend/config/feature_support_matrix.py`
- `backend/config/version_matrix.py`
- `backend/app/routes/create.py`
- `backend/app/routes/generate.py`
- `backend/templates/template_registry.py`
- `prompt_engine/validator.py`
- `prompt_engine/briefing/navigator.py`
- `prompt_engine/templates/spring_boot_prompt.md`
- `prompt_engine/templates/automation_prompt.md`
- `prompt_engine/templates/ai_agents_prompt.md`
- `prompt_engine/prompt_templates/__init__.py`
- `frontend/src/app/create/page.tsx`
- `frontend/src/components/assistant/SuggestionEngine.ts`
- `frontend/src/mock/dashboard-data.ts`
- `frontend/src/lib/stackProfiles.ts`
- `frontend/src/lib/createPageConfigs.ts`
- `frontend/src/lib/stackThemes.ts`
- `frontend/src/lib/stack-maturity.ts`
- `frontend/src/lib/stack-validator.ts`
- `frontend/src/lib/architecture-engine/types.ts`
- `frontend/src/lib/architecture-engine/rules.ts`
- `frontend/src/app/wizard/page.tsx`
- `frontend/src/app/wizard/[slug]/page.tsx`
- `frontend/src/app/create/[stackId]/page.tsx`
- `frontend/src/wizards/springboot/*`
- `backend/data/projects.json`
- `agents/gatekeepers/*`
- `generators/*`
- `design_intelligence.py`

## Validation
- `python -m py_compile` passed on the updated Python modules.
- `python -m pytest backend/tests/test_prompt_generator_engine.py` passed.
- `python -c "from backend.app.main import app; print(len(app.routes))"` passed.
- `python -c "from backend.app.routes.create import list_stacks; print(list_stacks()['stacks'][:3])"` passed.
- `docker compose build frontend` passed.

## Notes
- Legacy aliases are still accepted at the registry boundary so older payloads do not fail immediately.
- The new generator package is intentionally minimal and wired to the canonical registry so the route imports and factory calls stop failing.
- Static Site was not modified in this task.
