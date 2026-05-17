import pytest
import json
import zipfile
import tempfile
import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.services.zip_service import (
    create_project_zip,
    _is_safe_path,
    _is_allowed_item,
    scan_project_for_secrets,
    GENERATED_ROOT,
    FORBIDDEN_ROOT_DIRS,
)


def test_safe_path_within_generated_root(tmp_path):
    safe_path = GENERATED_ROOT / "myproject"
    safe_path.mkdir(parents=True, exist_ok=True)
    is_safe, reason = _is_safe_path(safe_path)
    assert is_safe is True, reason


def test_unsafe_path_with_traversal(tmp_path):
    unsafe_path = GENERATED_ROOT / ".." / "secrets"
    is_safe, reason = _is_safe_path(unsafe_path)
    assert is_safe is False


def test_unsafe_absolute_path_outside_root():
    unsafe_path = Path("/etc/passwd")
    is_safe, reason = _is_safe_path(unsafe_path)
    assert is_safe is False


def test_allowed_root_files():
    assert _is_allowed_item(Path("README.md"))[0] is True
    assert _is_allowed_item(Path(".env.example"))[0] is True
    assert _is_allowed_item(Path("package.json"))[0] is True
    assert _is_allowed_item(Path("requirements.txt"))[0] is True
    assert _is_allowed_item(Path("robots.txt"))[0] is True
    assert _is_allowed_item(Path("sitemap.xml"))[0] is True


def test_allowed_directories():
    assert _is_allowed_item(Path("backend"))[0] is True
    assert _is_allowed_item(Path("frontend"))[0] is True
    assert _is_allowed_item(Path("static_site"))[0] is True
    assert _is_allowed_item(Path("docs"))[0] is True
    assert _is_allowed_item(Path("assets"))[0] is True
    assert _is_allowed_item(Path("sections"))[0] is True
    assert _is_allowed_item(Path("components"))[0] is True
    assert _is_allowed_item(Path("content"))[0] is True


def test_forbidden_root_directories():
    for forbidden in FORBIDDEN_ROOT_DIRS:
        is_allowed, _ = _is_allowed_item(Path(forbidden))
        assert is_allowed is False, f"{forbidden} should be forbidden"


def test_forbidden_files():
    forbidden_cases = [
        Path(".env"),
        Path("secrets.key"),
        Path("config.pem"),
        Path("node_modules/package.json"),
        Path(".git/config"),
        Path("__pycache__/module.pyc"),
    ]
    for fpath in forbidden_cases:
        is_allowed, reason = _is_allowed_item(fpath)
        assert is_allowed is False, f"{fpath} should be forbidden: {reason}"


def test_files_in_allowed_dirs_are_allowed():
    assert _is_allowed_item(Path("backend/src/main.py"))[0] is True
    assert _is_allowed_item(Path("frontend/app.py"))[0] is True
    assert _is_allowed_item(Path("static_site/index.html"))[0] is True


def test_detects_api_key(tmp_path):
    test_file = tmp_path / "config.py"
    # Use a 32+ char key to trigger detection
    test_file.write_text('API_KEY = "sk-abc123def456789012345678901234"')
    has_secrets, details = scan_project_for_secrets(tmp_path)
    assert has_secrets is True


def test_no_false_positives_on_clean_code(tmp_path):
    test_file = tmp_path / "app.py"
    test_file.write_text('def hello():\n    return "world"\n')
    has_secrets, _ = scan_project_for_secrets(tmp_path)
    assert has_secrets is False


def test_creates_zip_with_allowed_files_only(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip1"
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "backend").mkdir(exist_ok=True)
    (project_dir / "backend" / "main.py").write_text("print('hello')")
    (project_dir / "README.md").write_text("# Project")
    (project_dir / ".env.example").write_text("KEY=example")

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "test123", "name": "test_project", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    zip_buffer, checksum, filename = create_project_zip("test123", projects_data_path)
    assert zip_buffer is not None
    assert "test_project" in filename

    zip_buffer.seek(0)
    with zipfile.ZipFile(zip_buffer, 'r') as zf:
        names = zf.namelist()
    assert "backend/main.py" in names
    assert "README.md" in names


def test_excludes_forbidden_directories(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip2"
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "agents").mkdir(exist_ok=True)
    (project_dir / "agents" / "evil.py").write_text("bad")
    (project_dir / "backend").mkdir(exist_ok=True)
    (project_dir / "backend" / "main.py").write_text("good")

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "test456", "name": "test_project", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    zip_buffer, _, _ = create_project_zip("test456", projects_data_path)
    zip_buffer.seek(0)
    with zipfile.ZipFile(zip_buffer, 'r') as zf:
        names = zf.namelist()
    assert not any(n.startswith("agents/") for n in names)


def test_excludes_forbidden_files(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip3"
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / ".env").write_text("SECRET=verysecret")
    (project_dir / "backend").mkdir(parents=True, exist_ok=True)
    (project_dir / "backend" / "main.py").write_text("good")

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "test789", "name": "test_project", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    zip_buffer, _, _ = create_project_zip("test789", projects_data_path)
    zip_buffer.seek(0)
    with zipfile.ZipFile(zip_buffer, 'r') as zf:
        names = zf.namelist()
    assert not any(".env" in n for n in names)


def test_blocks_path_traversal(tmp_path):
    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "evil", "name": "evil", "path": "/etc/passwd", "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    with pytest.raises(ValueError):
        create_project_zip("evil", projects_data_path)


def test_blocks_project_with_secrets(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip4"
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "backend").mkdir(parents=True, exist_ok=True)
    # Use 32+ char key to trigger detection
    (project_dir / "backend" / "config.py").write_text('API_KEY = "sk-abc123def456789012345678901234"')

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "secretproj", "name": "secretproj", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    with pytest.raises(ValueError, match="segredo|secrets?"):
        create_project_zip("secretproj", projects_data_path)


def test_zip_does_not_include_factory_source(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip5"
    project_dir.mkdir(parents=True, exist_ok=True)
    for d in ["agents", "generators", "control_panel", "briefing"]:
        (project_dir / d).mkdir(exist_ok=True)
        (project_dir / d / "internal.py").write_text("internal")
    (project_dir / "backend").mkdir(parents=True, exist_ok=True)
    (project_dir / "backend" / "main.py").write_text("app")

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "factory_test", "name": "factory_test", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    zip_buffer, _, _ = create_project_zip("factory_test", projects_data_path)
    zip_buffer.seek(0)
    with zipfile.ZipFile(zip_buffer, 'r') as zf:
        names = zf.namelist()
    for forbidden in ["agents/", "generators/", "control_panel/", "briefing/"]:
        assert not any(n.startswith(forbidden) for n in names), f"CRITICAL: {forbidden} in ZIP!"


def test_download_only_contains_generated_project(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip6"
    project_dir.mkdir(parents=True, exist_ok=True)
    valid_files = [("backend/main.py", "app"), ("frontend/app.py", "front"), ("README.md", "# Project")]
    for fpath, content in valid_files:
        fp = project_dir / fpath
        fp.parent.mkdir(parents=True, exist_ok=True)
        fp.write_text(content)

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "genproj", "name": "genproj", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    zip_buffer, _, _ = create_project_zip("genproj", projects_data_path)
    zip_buffer.seek(0)
    with zipfile.ZipFile(zip_buffer, 'r') as zf:
        names = zf.namelist()
    assert "backend/main.py" in names
    assert "frontend/app.py" in names
    assert "README.md" in names
    for n in names:
        assert ".." not in n
        assert not n.startswith("/")


def test_generates_correct_filename_format(tmp_path):
    project_dir = GENERATED_ROOT / "test_project_zip7"
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "README.md").write_text("# Project")

    projects_data_path = tmp_path / "projects.json"
    projects = [{"id": "myproj", "name": "my project", "path": str(project_dir), "payment_status": "paid"}]
    projects_data_path.write_text(json.dumps(projects))

    _, _, filename = create_project_zip("myproj", projects_data_path)
    assert filename == "my_project_generated_by_Ldcn.zip"


def teardown_module(module):
    """Cleanup: remove test directories from GENERATED_ROOT."""
    for d in GENERATED_ROOT.iterdir():
        if d.is_dir() and d.name.startswith("test_project_zip"):
            import shutil
            shutil.rmtree(d, ignore_errors=True)
