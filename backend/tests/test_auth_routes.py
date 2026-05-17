from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services import auth_service


def test_auth_login_forgot_and_reset_flow(tmp_path, monkeypatch):
    monkeypatch.setattr(auth_service, "AUTH_USERS_FILE", tmp_path / "auth_users.json")
    monkeypatch.setattr(auth_service, "PASSWORD_RESETS_FILE", tmp_path / "password_resets.json")

    client = TestClient(app)

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@saasfactory.local",
            "password": "Admin@123!",
            "remember_device": True,
        },
    )

    assert login_response.status_code == 200
    login_json = login_response.json()
    assert login_json["success"] is True
    assert login_json["access_token"]
    assert login_json["user"]["email"] == "admin@saasfactory.local"

    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "admin@saasfactory.local"},
    )

    assert forgot_response.status_code == 200
    forgot_json = forgot_response.json()
    assert forgot_json["success"] is True
    assert forgot_json["reset_token"]
    assert forgot_json["reset_url"].startswith("/reset-password/")

    reset_response = client.post(
        "/api/auth/reset-password",
        json={
            "token": forgot_json["reset_token"],
            "new_password": "NewPass123!",
        },
    )

    assert reset_response.status_code == 200
    reset_json = reset_response.json()
    assert reset_json["success"] is True

    relogin_response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@saasfactory.local",
            "password": "NewPass123!",
            "remember_device": False,
        },
    )

    assert relogin_response.status_code == 200
    assert relogin_response.json()["success"] is True
