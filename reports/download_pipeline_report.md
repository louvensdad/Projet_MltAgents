# Download Pipeline Report

## Root cause
- Project registration and generator output used different roots and different directory shapes.
- Some records pointed to `output/generated_projects/...` while actual files lived under `generated_projects/...`.
- Static-site generator wrote to a nested path that did not match the registered project root.

## Fixes applied
- Canonical root standardized in runtime to `generated_projects/`.
- Backward compatibility added for historical `output/generated_projects/...` records.
- Generation now registers the project first and injects `_project_output_dir` into generators.
- Static-site generator now writes directly into the registered project root.
- FastAPI and Spring Boot generators now write under the registered root without duplicating the project name.
- Added `/downloads/[id]` for direct post-payment navigation and download preparation visibility.

## Validation
- Frontend build passed after the pipeline changes.
- Backend modules compile successfully.
- Dynamic redirect path now resolves to checkout or direct download based on payment status.
