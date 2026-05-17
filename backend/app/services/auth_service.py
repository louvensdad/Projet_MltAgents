from __future__ import annotations

import json
import os
import secrets
import uuid
import base64
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from typing import Any

from backend.app.security.audit_logger import AuditLogger
from backend.app.security.jwt_manager import JWTManager

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_ROOT / "data"
AUTH_USERS_FILE = DATA_DIR / "auth_users.json"
PASSWORD_RESETS_FILE = DATA_DIR / "password_resets.json"
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@saasfactory.local").strip().lower()
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@123!")
DEFAULT_ADMIN_NAME = os.getenv("DEFAULT_ADMIN_NAME", "SaaS Factory Admin")
DEFAULT_USER_EMAIL = os.getenv("DEFAULT_USER_EMAIL", "user@saasfactory.local").strip().lower()
DEFAULT_USER_PASSWORD = os.getenv("DEFAULT_USER_PASSWORD", "User@123!")
DEFAULT_USER_NAME = os.getenv("DEFAULT_USER_NAME", "SaaS Factory User")

_USERS_LOCK = Lock()
_RESETS_LOCK = Lock()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_json(path: Path, default: Any) -> Any:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        _save_json(path, default)
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        _save_json(path, default)
        return default


def _save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    iterations = 200_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        base64.urlsafe_b64encode(salt).decode("ascii"),
        base64.urlsafe_b64encode(digest).decode("ascii"),
    )


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations_raw, salt_b64, digest_b64 = password_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_raw)
        salt = base64.urlsafe_b64decode(salt_b64.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_b64.encode("ascii"))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return secrets.compare_digest(actual, expected)
    except Exception:
        return False


def _seed_user(users: list[dict[str, Any]], *, email: str, password: str, name: str, role: str) -> None:
    if any(str(user.get("email", "")).lower() == email for user in users):
        return
    users.append(
        {
            "id": str(uuid.uuid4())[:8],
            "name": name,
            "email": email,
            "password_hash": _hash_password(password),
            "role": role,
            "active": True,
            "must_reset_password": False,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
            "last_login_at": None,
        }
    )


def load_users() -> list[dict[str, Any]]:
    with _USERS_LOCK:
        users = _load_json(AUTH_USERS_FILE, [])
        if not isinstance(users, list):
            users = []
        users = list(users)
        before = len(users)
        _seed_user(users, email=DEFAULT_ADMIN_EMAIL, password=DEFAULT_ADMIN_PASSWORD, name=DEFAULT_ADMIN_NAME, role="admin")
        _seed_user(users, email=DEFAULT_USER_EMAIL, password=DEFAULT_USER_PASSWORD, name=DEFAULT_USER_NAME, role="user")
        if len(users) != before:
            _save_json(AUTH_USERS_FILE, users)
        return users


def save_users(users: list[dict[str, Any]]) -> None:
    with _USERS_LOCK:
        _save_json(AUTH_USERS_FILE, users)


def load_resets() -> list[dict[str, Any]]:
    with _RESETS_LOCK:
        resets = _load_json(PASSWORD_RESETS_FILE, [])
        if not isinstance(resets, list):
            resets = []
        return resets


def save_resets(resets: list[dict[str, Any]]) -> None:
    with _RESETS_LOCK:
        _save_json(PASSWORD_RESETS_FILE, resets)


def get_user_by_email(email: str) -> dict[str, Any] | None:
    normalized = email.strip().lower()
    return next((user for user in load_users() if str(user.get("email", "")).lower() == normalized), None)


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    return next((user for user in load_users() if str(user.get("id")) == str(user_id)), None)


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user.get("id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "active": bool(user.get("active", True)),
        "must_reset_password": bool(user.get("must_reset_password", False)),
        "last_login_at": user.get("last_login_at"),
    }


def authenticate_user(email: str, password: str) -> dict[str, Any] | None:
    user = get_user_by_email(email)
    if not user or not user.get("active", True):
        return None
    if not _verify_password(password, str(user.get("password_hash", ""))):
        return None
    return user


def _update_user(user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    users = load_users()
    updated_user = None
    for index, user in enumerate(users):
        if str(user.get("id")) == str(user_id):
            users[index] = {**user, **updates, "updated_at": _now_iso()}
            updated_user = users[index]
            break
    if updated_user:
        save_users(users)
    return updated_user


def login_user(email: str, password: str, remember_device: bool = False, ip_address: str = "unknown") -> dict[str, Any]:
    user = authenticate_user(email, password)
    if not user:
        AuditLogger.log("login_failed", email, f"invalid_credentials remember={remember_device}", ip_address)
        return {
            "success": False,
            "error_code": "INVALID_CREDENTIALS",
            "message": "Email ou senha inválidos.",
        }

    token_payload = {
        "sub": str(user.get("id")),
        "email": user.get("email"),
        "name": user.get("name"),
        "role": user.get("role", "user"),
        "remember_device": remember_device,
    }
    access_token = JWTManager.create_access_token(token_payload)
    refresh_token = JWTManager.create_refresh_token(token_payload)
    updated_user = _update_user(str(user.get("id")), {"last_login_at": _now_iso()}) or user

    AuditLogger.log("login_success", str(user.get("id")), f"remember={remember_device}", ip_address)

    return {
        "success": True,
        "message": "Login realizado com sucesso.",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 30 * 60,
        "redirect_url": "/dashboard",
        "user": public_user(updated_user),
    }


def request_password_reset(email: str, ip_address: str = "unknown") -> dict[str, Any]:
    user = get_user_by_email(email)
    if not user:
        AuditLogger.log("password_reset_failed", email, "email_not_found", ip_address)
        return {
            "success": False,
            "error_code": "USER_NOT_FOUND",
            "message": "Email não encontrado.",
        }

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
    resets = load_resets()
    resets = [item for item in resets if str(item.get("email", "")).lower() != str(email).lower()]
    resets.append(
        {
            "token": token,
            "email": user.get("email"),
            "user_id": user.get("id"),
            "used": False,
            "created_at": _now_iso(),
            "expires_at": expires_at.isoformat(),
        }
    )
    save_resets(resets)

    AuditLogger.log("password_reset_requested", str(user.get("id")), "reset link generated", ip_address)

    return {
        "success": True,
        "message": "Link de redefinição gerado com sucesso.",
        "email": user.get("email"),
        "reset_token": token,
        "reset_url": f"/reset-password/{token}",
        "expires_at": expires_at.isoformat(),
        "expires_in_minutes": 120,
    }


def reset_password(token: str, new_password: str, ip_address: str = "unknown") -> dict[str, Any]:
    resets = load_resets()
    record = next((item for item in resets if item.get("token") == token), None)
    if not record:
        AuditLogger.log("password_reset_failed", "unknown", "token_not_found", ip_address)
        return {
            "success": False,
            "error_code": "INVALID_RESET_TOKEN",
            "message": "Token de redefinição inválido.",
        }

    try:
        expires_at = datetime.fromisoformat(str(record.get("expires_at")))
    except Exception:
        expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)

    if expires_at < datetime.now(timezone.utc):
        AuditLogger.log("password_reset_failed", str(record.get("user_id")), "token_expired", ip_address)
        return {
            "success": False,
            "error_code": "RESET_TOKEN_EXPIRED",
            "message": "Token de redefinição expirado.",
        }

    if record.get("used"):
        AuditLogger.log("password_reset_failed", str(record.get("user_id")), "token_used", ip_address)
        return {
            "success": False,
            "error_code": "RESET_TOKEN_USED",
            "message": "Token de redefinição já foi utilizado.",
        }

    user = get_user_by_id(str(record.get("user_id")))
    if not user:
        AuditLogger.log("password_reset_failed", str(record.get("user_id")), "user_not_found", ip_address)
        return {
            "success": False,
            "error_code": "USER_NOT_FOUND",
            "message": "Usuário não encontrado.",
        }

    if len(new_password) < 8:
        return {
            "success": False,
            "error_code": "WEAK_PASSWORD",
            "message": "A senha precisa ter ao menos 8 caracteres.",
        }

    _update_user(
        str(user.get("id")),
        {
            "password_hash": _hash_password(new_password),
            "must_reset_password": False,
        },
    )

    for item in resets:
        if item.get("token") == token:
            item["used"] = True
            item["used_at"] = _now_iso()
            break
    save_resets(resets)

    AuditLogger.log("password_reset_completed", str(user.get("id")), "password updated", ip_address)

    return {
        "success": True,
        "message": "Senha redefinida com sucesso.",
        "login_url": "/login",
    }


def get_auth_me(token_payload: dict[str, Any]) -> dict[str, Any]:
    user_id = token_payload.get("sub")
    user = get_user_by_id(str(user_id)) if user_id else None
    if user:
        return public_user(user)
    return {
        "id": token_payload.get("sub"),
        "name": token_payload.get("name"),
        "email": token_payload.get("email"),
        "role": token_payload.get("role", "user"),
        "active": True,
        "must_reset_password": bool(token_payload.get("must_reset_password", False)),
        "last_login_at": token_payload.get("last_login_at"),
    }
