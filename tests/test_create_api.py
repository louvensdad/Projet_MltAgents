from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_create_stacks_lists_core_stacks():
    response = client.get("/api/create/stacks")
    assert response.status_code == 200
    data = response.json()
    stack_ids = {stack["id"] for stack in data["stacks"]}

    for stack_id in {"static_site", "spring_boot", "fastapi", "angular", "vue", "blazor"}:
        assert stack_id in stack_ids


def test_create_stack_springboot_contract():
    response = client.get("/api/create/stack/springboot")
    assert response.status_code == 200
    data = response.json()

    assert data["stack_id"] == "spring_boot"
    assert data["name"] == "Java + Spring Boot"
    assert "PostgreSQL" in data["allowed_databases"]
    assert "JWT" in data["allowed_auth"]
    assert "FastAPI" in data["forbidden_terms"]


def test_create_stack_static_site_contract():
    response = client.get("/api/create/stack/static-site")
    assert response.status_code == 200
    data = response.json()

    assert data["stack_id"] == "static_site"
    assert "Static Site" in data["name"]
    assert data["status"] == "stable"
    assert "index.html" in data["required_files"]
    assert "backend" in data["forbidden_terms"]


def test_create_validate_rejects_forbidden_terms():
    response = client.post(
        "/api/create/validate",
        json={
            "stack_profile_id": "springboot",
            "project_name": "FastAPITest",
            "selected_stack_options": {"ORM": ["Pydantic", "SQLAlchemy"]},
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False
    assert any("FastAPI" in error or "Pydantic" in error or "SQLAlchemy" in error for error in data["errors"])


def test_create_invalid_stack_returns_error_code():
    response = client.post(
        "/api/create",
        json={
            "project_type": "api",
            "stack_profile_id": "stack_invalida_xyz",
            "project_name": "ProjetoInvalido",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] in {"VALIDATION_ERROR", "INTERNAL_ERROR"}
