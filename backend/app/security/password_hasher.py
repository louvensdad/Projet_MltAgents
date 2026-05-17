import re

class PasswordHasher:
    """
    Simples implementação de hash de senha para demonstração.
    Em produção, deve usar bibliotecas robustas como `passlib` ou `bcrypt`.
    Aqui, usaremos `hashlib` apenas para não exigir dependência externa complexa imediatamente, 
    mas o ideal é `pip install passlib[bcrypt]`.
    """
    
    @staticmethod
    def hash_password(password: str) -> str:
        # Import local para não falhar caso não tenha passlib
        try:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            return pwd_context.hash(password)
        except ImportError:
            import hashlib
            import os
            # Fallback seguro com salt aleatório se bcrypt não disponível
            salt = os.urandom(16)
            pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
            return salt.hex() + ":" + pwdhash.hex()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            return pwd_context.verify(plain_password, hashed_password)
        except ImportError:
            import hashlib
            if ":" not in hashed_password:
                return False
            salt_hex, hash_hex = hashed_password.split(":")
            salt = bytes.fromhex(salt_hex)
            pwdhash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
            return pwdhash.hex() == hash_hex

    @staticmethod
    def is_strong(password: str) -> bool:
        if len(password) < 8:
            return False
        if not re.search(r"[a-z]", password):
            return False
        if not re.search(r"[A-Z]", password):
            return False
        if not re.search(r"[0-9]", password):
            return False
        return True
