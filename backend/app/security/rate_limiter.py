from fastapi import Request, HTTPException, status
import time

# Memória simples para limites de taxa (IP -> {"count": x, "window_start": y})
# Em produção usar Redis (ex: redis.incr, redis.expire)
RATE_LIMITS = {}

# Configuração Padrão
RATE_LIMIT_WINDOW = 60 # segundos
RATE_LIMIT_MAX_REQUESTS = 30 # requests por minuto

def check_rate_limit(request: Request):
    client_ip = request.client.host
    now = time.time()
    
    # Clean up old limits (simple logic)
    if client_ip in RATE_LIMITS:
        data = RATE_LIMITS[client_ip]
        if now - data["window_start"] > RATE_LIMIT_WINDOW:
            RATE_LIMITS[client_ip] = {"count": 1, "window_start": now}
        else:
            data["count"] += 1
            if data["count"] > RATE_LIMIT_MAX_REQUESTS:
                from .audit_logger import AuditLogger
                AuditLogger.log("blocked_attempt", "system", f"Rate limit excedido para IP {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later."
                )
    else:
        RATE_LIMITS[client_ip] = {"count": 1, "window_start": now}
        
    return True

def rate_limiter_dependency(request: Request):
    check_rate_limit(request)
    return True
