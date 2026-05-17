# Final Architecture Validation

## Unified generation contract
- Source of truth for generated project location is now `generated_projects/{normalized_name}_{project_id}`.
- Backend registers the project first, resolves the safe absolute directory, then passes that directory into the generator.
- Prompt Master is built before final static-site generation and attached to the generation payload.
- Redirect contract is explicit:
  - pending payment -> `/projects/{project_id}/checkout`
  - paid -> `/downloads/{project_id}`

## Navigation contract
- Sidebar is sticky and layered above page content.
- Main content no longer relies on `overflow-hidden` at the body level.
- Legacy `/static-site` route redirects into `/wizard/static-site`.

## Download contract
- Download lookup resolves only within generated-project roots.
- Legacy `output/generated_projects/...` records are normalized for compatibility.
- Dynamic download page reads metadata from `/api/downloads/{project_id}` and downloads from `/api/downloads/{project_id}/download`.

## Gate validation contract
- Static-site quality checks accept either root-level site output or nested `static_site/` fallback.
- Security/path validation accepts the new canonical root and legacy records, but still rejects out-of-scope paths.

## Validation status
- `npm.cmd run build`: passed
- `npx.cmd tsc --noEmit`: passed
- `python -m compileall control_panel/backend/app src`: passed
- `python -m pytest`: blocked, module not installed
