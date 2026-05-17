import os
from typing import Dict, Any

class StackGate:
    """
    Verifica se a tecnologia (stack) gerada corresponde ao que foi pedido.
    Impede fallback crtico, ex: se pediu Java, no pode gerar Python.
    """
    def __init__(self):
        pass

    def validate(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        if not os.path.exists(project_path):
            return {"status": "failed", "errors": ["Caminho do projeto no encontrado."]}

        stack = blueprint.get("backend_stack", "").lower()
        if not stack:
            return {"status": "failed", "errors": ["Stack no especificada no blueprint."]}

        errors = []
        
        frontend_enabled = blueprint.get("frontend_enabled", False)
        backend_check_path = os.path.join(project_path, "backend") if frontend_enabled else project_path
        frontend_check_path = os.path.join(project_path, "frontend") if frontend_enabled else None
        
        files_in_backend = set()
        if os.path.exists(backend_check_path):
            for root, dirs, files in os.walk(backend_check_path):
                for f in files:
                    files_in_backend.add(f)
                    
        files_in_frontend = set()
        if frontend_check_path and os.path.exists(frontend_check_path):
            for root, dirs, files in os.walk(frontend_check_path):
                for f in files:
                    files_in_frontend.add(f)

        if "fastapi" in stack or "python" in stack:
            if "requirements.txt" not in files_in_backend and "pyproject.toml" not in files_in_backend:
                errors.append("Stack Gate (FastAPI): requirements.txt no encontrado.")
            if "main.py" not in files_in_backend:
                errors.append("Stack Gate (FastAPI): main.py no encontrado.")
            if "pom.xml" in files_in_backend:
                errors.append("Stack Gate (FastAPI): pom.xml proibido nesta stack.")
                
        elif "spring" in stack or "java" in stack:
            if "pom.xml" not in files_in_backend and "build.gradle" not in files_in_backend:
                errors.append("Stack Gate (Spring Boot): pom.xml/build.gradle no encontrado. (Gerador no implementou Java corretamente?)")
            if "requirements.txt" in files_in_backend:
                errors.append("Stack Gate (Spring Boot): requirements.txt proibido nesta stack. IA tentou fallback para Python!")
                
        elif "nest" in stack or "express" in stack or "node" in stack:
            if "package.json" not in files_in_backend:
                errors.append("Stack Gate (Node.js): package.json no encontrado.")
            if "pom.xml" in files_in_backend or "requirements.txt" in files_in_backend:
                errors.append("Stack Gate (Node.js): Arquivos de outras stacks encontrados.")
                
        elif "c#" in stack or "dotnet" in stack or "asp.net" in stack:
            # Por enquanto, dotnet no est implementado, o runner vai parar antes.
            # Mas se a IA tentasse gerar Python ao invez de C#, barraremos:
            if "requirements.txt" in files_in_backend or "pom.xml" in files_in_backend:
                errors.append("Stack Gate (C#): Fallback proibido detectado. IA gerou arquivos de outra linguagem!")
                
        else:
            errors.append(f"Stack Gate: Validao para a stack '{stack}' no suportada/configurada.")

        if frontend_enabled:
            frontend_stack = blueprint.get("frontend_stack", "").lower()
            if "angular" in frontend_stack or "react" in frontend_stack or "next" in frontend_stack or "vue" in frontend_stack:
                if "package.json" not in files_in_frontend:
                    errors.append(f"Stack Gate ({frontend_stack}): package.json no encontrado no frontend.")

        if errors:
            return {"status": "failed", "errors": errors}
            
        return {"status": "passed", "errors": []}
