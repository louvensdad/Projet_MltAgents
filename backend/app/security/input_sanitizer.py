import re
from fastapi import HTTPException, status

class InputSanitizer:
    @staticmethod
    def sanitize_text(text: str) -> str:
        """Remove tags HTML perigosas e scripts."""
        if not text:
            return text
        
        # Remove <script> tags
        sanitized = re.sub(r'<\s*script[^>]*>.*?<\s*/\s*script\s*>', '', text, flags=re.IGNORECASE|re.DOTALL)
        # Remove javascript: no inicio de links
        sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)
        # Remove onclick e outros event handlers
        sanitized = re.sub(r'\bon[a-z]+\s*=\s*"[^"]*"', '', sanitized, flags=re.IGNORECASE)
        
        return sanitized.strip()
    
    @staticmethod
    def validate_project_name(name: str) -> str:
        """Garante que o nome do projeto contenha apenas caracteres seguros para o FileSystem."""
        if not name:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project name is empty.")
            
        # Apenas alfanuméricos, espaços, hífens e underscores
        if not re.match(r'^[\w\s\-]+$', name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid characters in project name.")
            
        return name.strip()

    @staticmethod
    def block_sql_injection(text: str):
        """Regra básica contra SQL injection (o ORM já deve fazer isso, mas adiciona defesa em profundidade)."""
        if not text:
            return
            
        # Padrões perigosos
        dangerous = [
            r"(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)",
            r"('--)",
            r"(;.*--)"
        ]
        
        for pattern in dangerous:
            if re.search(pattern, text, re.IGNORECASE):
                from .audit_logger import AuditLogger
                AuditLogger.log("blocked_attempt", "system", "SQL Injection pattern detectado e bloqueado.")
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Input contains invalid or dangerous characters.")
