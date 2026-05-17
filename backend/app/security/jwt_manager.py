import os
import time
from typing import Dict, Any, Optional
import jwt
from fastapi import HTTPException, status

# JWT Settings
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-default-key-please-change-in-prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Simple in-memory blacklist for demonstration. In production, use Redis.
TOKEN_BLACKLIST = set()

class JWTManager:
    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = time.time() + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        to_encode = data.copy()
        expire = time.time() + (REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        if token in TOKEN_BLACKLIST:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if payload.get("exp", 0) < time.time():
                raise jwt.ExpiredSignatureError()
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def blacklist_token(token: str):
        TOKEN_BLACKLIST.add(token)
