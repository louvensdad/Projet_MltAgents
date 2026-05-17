from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class ArtifactBuilder:
    def build(self, context: dict[str, Any]) -> dict[str, Any]:
        project_id = (
            context.get("_project_id")
            or context.get("project_id")
            or context.get("project", {}).get("id")
            or "unknown"
        )
        project_root = context.get("_project_output_dir") or context.get("project_root") or context.get("output_dir")
        project_root_path = Path(str(project_root)) if project_root else None

        generated_files: list[str] = []
        preview_markup = ""

        if project_root_path and project_root_path.exists():
            generated_files = [
                str(path.relative_to(project_root_path)).replace("\\", "/")
                for path in project_root_path.rglob("*")
                if path.is_file()
            ]
            generated_files.sort()

            readme_path = project_root_path / "README.md"
            if readme_path.exists():
                preview_markup = readme_path.read_text(encoding="utf-8", errors="replace")
            elif generated_files:
                preview_markup = "\n".join(generated_files[:100])

            manifest_path = project_root_path / "artifact_manifest.json"
            try:
                manifest_path.write_text(
                    json.dumps(
                        {
                            "project_id": project_id,
                            "generated_files": generated_files,
                            "preview_available": bool(preview_markup),
                        },
                        indent=2,
                        ensure_ascii=False,
                    ),
                    encoding="utf-8",
                )
            except Exception:
                pass

        return {
            "project_id": project_id,
            "project_path": context.get("_project_rel_path") or context.get("project_path"),
            "absolute_project_path": str(project_root_path) if project_root_path else None,
            "preview_url": f"/api/projects/{project_id}/live" if project_id != "unknown" else None,
            "download_url": f"/api/downloads/{project_id}" if project_id != "unknown" else None,
            "generated_files": generated_files,
            "preview_markup": preview_markup,
            "status": "generated",
        }
