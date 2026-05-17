from fastapi import Request, HTTPException, status

def verify_csrf_token(request: Request):
    """
    Simples verificador de CSRF para rotas mutáveis (POST, PUT, DELETE) 
    quando a autenticação for baseada em cookies (opcional).
    Se estiver usando JWT via cabeçalho Authorization puro, CSRF não é estritamente necessário.
    """
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        csrf_token = request.headers.get("X-CSRF-Token")
        # Exemplo simples: o token deve estar presente, a validação exata depende
        # da implementação do cookie sincronizado.
        if not csrf_token and request.cookies.get("session"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing or invalid"
            )
    return True
