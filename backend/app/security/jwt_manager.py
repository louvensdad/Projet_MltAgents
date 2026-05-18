from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict

from fastapi import HTTPException, status

# JWT Settings
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-default-key-please-change-in-prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Simple in-memory blacklist for demonstration. In production, use Redis.
TOKEN_BLACKLIST = set()


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _encode_segment(payload: dict[str, Any]) -> str:
    return _b64url_encode(json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))


def _decode_segment(segment: str) -> dict[str, Any]:
    return json.loads(_b64url_decode(segment).decode("utf-8"))


def _sign(message: str) -> str:
    digest = hmac.new(JWT_SECRET.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).digest()
    return _b64url_encode(digest)


class JWTManager:
    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = int(time.time()) + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        to_encode.update({"exp": expire, "type": "access"})
        return JWTManager._encode_token(to_encode)

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        to_encode = data.copy()
        expire = int(time.time()) + (REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)
        to_encode.update({"exp": expire, "type": "refresh"})
        return JWTManager._encode_token(to_encode)

    @staticmethod
    def _encode_token(payload: dict[str, Any]) -> str:
        header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
        header_segment = _encode_segment(header)
        payload_segment = _encode_segment(payload)
        signing_input = f"{header_segment}.{payload_segment}"
        signature = _sign(signing_input)
        return f"{signing_input}.{signature}"

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        if token in TOKEN_BLACKLIST:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )

        parts = token.split(".")
        if len(parts) != 3:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        header_segment, payload_segment, signature = parts
        signing_input = f"{header_segment}.{payload_segment}"
        expected_signature = _sign(signing_input)

        if not hmac.compare_digest(signature, expected_signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            payload = _decode_segment(payload_segment)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        exp = int(payload.get("exp", 0))
        if exp < int(time.time()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    @staticmethod
    def blacklist_token(token: str):
        TOKEN_BLACKLIST.add(token)
