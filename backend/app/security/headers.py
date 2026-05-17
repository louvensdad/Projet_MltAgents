from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Proteção contra XSS e injeção de dados
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; object-src 'none';"
        # Proteção contra Clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Previne MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Política de Referrer
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissões do Browser
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # Proteção XSS básica (para navegadores antigos)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response

def setup_security_headers(app):
    app.add_middleware(SecurityHeadersMiddleware)
