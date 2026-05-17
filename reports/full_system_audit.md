# Full System Audit

Date: 2026-05-15

## Scope audited
- `control_panel/frontend/src/app`
- `control_panel/frontend/src/wizards`
- `control_panel/frontend/src/components`
- `control_panel/backend/app/routes`
- `control_panel/backend/app/services`
- `control_panel/backend/app/security`
- `src/generators`
- `src/validators`
- `src/prompt_engine`

## Critical findings
- Project output root was inconsistent across flows: old records used `generated_projects/...`, newer code used `output/generated_projects/...`.
- Generator registration and generator write path were disconnected, producing valid records that pointed to non-existent directories.
- Static site generation duplicated the project name in the filesystem path, breaking download lookup and quality/security checks.
- `/static-site` had no guaranteed canonical redirect into the unified wizard flow.
- Sidebar/layout layering relied on default stacking and full-height overflow rules, increasing the chance of wizard/layout lockups.
- Prompt Engine existed in backend but was not enforced as the source of truth in the static-site wizard.
- API configuration was duplicated between `src/lib/api.ts` and `src/lib/config.ts`.
- `tsconfig.json` plus the local frontend test file layout made standalone type-checks fail until test-only files were excluded from the app compile scope.
- Python backend compilation exposed a pre-existing syntax defect in `src/config/version_matrix.py`.

## Mapped subsystems
- Routers: `frontend/src/app/*`, `backend/app/routes/*`
- Sidebar/layout: `frontend/src/components/Sidebar.tsx`, `frontend/src/app/layout.tsx`
- Wizard shell: `frontend/src/wizards/core/WizardShell.tsx`
- Live builder: `frontend/src/components/live-builder/*`, `frontend/src/context/LiveBuilderContext.tsx`
- Prompt engine: `backend/app/routes/prompt_routes.py`, `src/prompt_engine/*`
- Project runner/generation: `backend/app/routes/generate.py`, `src/generators/*`
- Downloads: `backend/app/routes/downloads.py`, `backend/app/services/zip_service.py`, `frontend/src/app/downloads*`
- Gatekeepers: `src/validators/quality_gate.py`, `src/validators/security_gate.py`
- I18N/preferences: `frontend/src/context/PreferencesContext.tsx`, `frontend/src/i18n/*`

## Resolved in this pass
- Unified safe generated-project root handling with backward compatibility.
- Bound project registration to the generator output directory before generation.
- Restored static-site flow to a single canonical wizard route.
- Connected static-site wizard generation to Prompt Master validation.
- Added direct download route `/downloads/[id]`.
- Fixed frontend type-check configuration and backend version-matrix syntax error.

## Remaining risks
- `pytest` could not run because the package is not installed in the environment.
- Full browser E2E was not executed from this terminal session.
- FastAPI/SpringBoot wizards still need deeper runtime integration parity with the upgraded static-site flow.
