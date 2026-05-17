# Security Gate Report

## Security behavior after refactor
- API keys remain backend-owned; no frontend code was changed to expose platform keys.
- Path validation now restricts download resolution to generated-project roots while accepting legacy path formats.
- Security Gate continues to allow placeholders and env references through `SecretScanner`.
- Download pipeline still blocks real secrets before ZIP delivery.

## Changes relevant to gate stability
- `backend/app/security/path_guard.py` now normalizes both canonical and legacy generated-project paths.
- `src/validators/quality_gate.py` now validates static-site outputs in the actual generated location instead of failing on folder layout alone.

## Remaining operational note
- Full secret-scanner test suite could not be executed because `pytest` is not installed in the current environment.
