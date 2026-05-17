import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .jwt_manager import JWTManager

# Opcionalmente, pode ser configurado um token URL se houver a rota /api/auth/login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Modo mock opcional para desenvolvimento. Padrão: desativado.
MOCK_AUTH_ENABLED = os.getenv("MOCK_AUTH_ENABLED", "false").lower() == "true"


def get_current_user(token: str = Depends(oauth2_scheme)):
    if MOCK_AUTH_ENABLED and not token:
        # Permite uso temporário do painel sem auth
        # O ideal é retirar isso na versão final e exigir o login do painel.
        return {"sub": "mock_admin", "role": "admin"}

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = JWTManager.verify_token(token)
    return payload


def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
