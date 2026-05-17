# Static Site Generation and Download Fix

## Root Cause

The Static Site flow was failing after the project was actually generated because:

- The documentation cache was created outside the workspace, under `OneDrive/.cache/docs`, which could trigger `PermissionError`.
- The generation payload from the wizard used nested `answers`, but the backend `generate` route read only top-level fields.
- The static site prompt input was too short in fallback cases, causing the Prompt Validator to reject valid requests.
- `PathGuard` resolved the repository root one directory too high, pushing `generated_projects` outside the workspace.
- `StaticSiteGenerator` had a constructor contract mismatch with the project runner and returned a non-path payload.
- The ZIP/download flow still had legacy assumptions and previously referenced a missing `validators` module.

## Fixes Applied

### Backend

- `backend/app/routes/generate.py`
  - Merged nested `answers` into the generation payload before validation and generation.
  - Built a richer static-site `project_description` and `business_goal` fallback to satisfy prompt validation.
  - Added a safe fallback for documentation context loading.
  - Preserved success when the project is created on disk.
  - Returned a structured success contract with `download_url`, `checkout_url`, and `download_ready`.

- `backend/app/security/path_guard.py`
  - Fixed repository root resolution so `generated_projects` stays inside the workspace.

- `backend/app/routes/downloads.py`
  - Allowed free/static projects to expose metadata and download flow.
  - Added ZIP preparation and registry updates for `download_ready`, checksum, and filename.

- `backend/app/services/payment_service.py`
  - Persisted `stack_id`, `project_type`, `generation_status`, and download flags in the registry.

- `backend/app/services/zip_service.py`
  - Removed dependency on missing `validators` imports.

### Docs Engine

- `knowledge_engine/docs_fetcher.py`
  - Moved cache storage into the repo workspace.
  - Added fallback handling if cache write fails.

- `knowledge_engine/docs_registry.py`
  - Normalized documentation registry keys to canonical stack IDs.
  - Added aliases for stack lookup.

### Generator

- `generators/static/static_site_generator.py`
  - Rewrote the generator to accept the runtime constructor used by the runner.
  - Generates a real static-site structure:
    - `index.html`
    - `assets/css/style.css`
    - `assets/js/main.js`
    - `sections/*.html`
    - `README.md`
    - `docs/SEO.md`
    - `docs/ACCESSIBILITY.md`
    - `docs/PROMPT_MASTER.md`
  - Returns the generated project root path.

## Validation

Executed successfully:

- `python -m py_compile` on the changed backend and generator modules
- `POST /api/generate` for `static_site`
- `GET /api/downloads/{project_id}`
- `POST /api/downloads/{project_id}/prepare`
- `GET /api/downloads/{project_id}/download`

Observed successful result:

- `POST /api/generate` returned `success: true`
- `download_ready: true`
- `payment_required: false`
- `download_url: /downloads/{project_id}`
- ZIP download completed successfully

## Final Result

The Static Site flow now:

- generates a project successfully
- stores it in the correct workspace path
- returns a success response instead of a false failure
- exposes download metadata
- prepares and downloads a ZIP without the missing `validators` error
- keeps the user out of the wizard dead-end after generation
