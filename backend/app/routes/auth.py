from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status, Depends
from pydantic import BaseModel, Field

from backend.app.security.auth_guard import get_current_user
from backend.app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)
    remember_device: bool = False


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3)


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/login")
def login(request: Request, payload: LoginRequest):
    result = auth_service.login_user(
        email=payload.email,
        password=payload.password,
        remember_device=payload.remember_device,
        ip_address=_client_ip(request),
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": result.get("error_code", "INVALID_CREDENTIALS"),
                "message": result.get("message", "Email ou senha inválidos."),
                "details": [],
            },
        )
    return result


@router.post("/forgot-password")
def forgot_password(request: Request, payload: ForgotPasswordRequest):
    result = auth_service.request_password_reset(
        email=payload.email,
        ip_address=_client_ip(request),
    )
    if not result.get("success"):
        if result.get("error_code") == "USER_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error_code": "USER_NOT_FOUND",
                    "message": result.get("message", "Email não encontrado."),
                    "details": [],
                },
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": result.get("error_code", "RESET_REQUEST_FAILED"),
                "message": result.get("message", "Não foi possível gerar o link."),
                "details": [],
            },
        )
    return result


@router.post("/reset-password")
def reset_password(request: Request, payload: ResetPasswordRequest):
    result = auth_service.reset_password(
        token=payload.token,
        new_password=payload.new_password,
        ip_address=_client_ip(request),
    )
    if not result.get("success"):
        status_code = status.HTTP_400_BAD_REQUEST
        if result.get("error_code") in {"INVALID_RESET_TOKEN", "RESET_TOKEN_EXPIRED", "RESET_TOKEN_USED", "USER_NOT_FOUND"}:
            status_code = status.HTTP_404_NOT_FOUND if result.get("error_code") == "INVALID_RESET_TOKEN" else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail={
                "error_code": result.get("error_code", "RESET_FAILED"),
                "message": result.get("message", "Não foi possível redefinir a senha."),
                "details": [],
            },
        )
    return result


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": auth_service.get_auth_me(current_user),
    }
