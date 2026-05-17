from fastapi import HTTPException, status, Depends
from .auth_guard import get_current_user
from typing import List

class PermissionsGuard:
    """
    Sistema robusto de RBAC (Role-Based Access Control).
    Nenhum frontend decide sozinho o que o usuário pode acessar.
    """
    
    @staticmethod
    def require_roles(allowed_roles: List[str]):
        def role_checker(current_user: dict = Depends(get_current_user)):
            user_role = current_user.get("role")
            if not user_role or user_role not in allowed_roles:
                from .audit_logger import AuditLogger
                AuditLogger.log("blocked_attempt", current_user.get("sub", "unknown"), f"Acesso negado por falta da role {allowed_roles}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to perform this action."
                )
            return current_user
        return role_checker
        
    @staticmethod
    def has_active_subscription(current_user: dict = Depends(get_current_user)):
        """Verifica se o usuário pode acessar funcionalidades restritas (AI Boost, Downloads premium)"""
        # Exemplo simples, deve ser integrado com o BD ou serviço de subscrição
        status_sub = current_user.get("subscription_status", "free")
        if status_sub not in ["active", "pro", "premium"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Active subscription required for this feature."
            )
        return current_user
