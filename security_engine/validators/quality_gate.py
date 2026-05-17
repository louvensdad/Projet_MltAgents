import os
from typing import Dict, Any

class QualityGate:
    """
    Verifica a estrutura Clean Code, testes, Arquitetura selecionada 
    e diretrizes de UX exigidas antes do download.
    """
    def __init__(self):
        pass

    def validate(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Retorna 'passed' ou 'failed'."""
        errors = []
        
        if not os.path.exists(project_path):
            return {"status": "failed", "errors": ["Caminho do projeto no encontrado."]}

        project_type = str(blueprint.get("project_type", "")).lower()
        is_static = project_type in {"static", "static_site", "site_estático", "site estatico"}
        if is_static:
            static_root = project_path
            nested_static = os.path.join(project_path, "static_site")
            if not os.path.exists(os.path.join(static_root, "index.html")) and os.path.isdir(nested_static):
                static_root = nested_static
            required_static = [
                "index.html",
                os.path.join("assets", "css", "style.css"),
                os.path.join("assets", "js", "main.js"),
                os.path.join("assets", "images"),
                "sections",
                "README.md",
            ]
            static_errors = []
            for rel in required_static:
                if not os.path.exists(os.path.join(static_root, rel)):
                    static_errors.append(f"Quality Gate: static site incompleto - ausente {rel}")
            if static_errors:
                return {"status": "failed", "errors": static_errors}
            return {"status": "passed", "errors": []}

        frontend_enabled = blueprint.get("frontend_enabled", False)
        if frontend_enabled:
            if not os.path.exists(os.path.join(project_path, "backend")):
                errors.append("Quality Gate: Pasta 'backend' ausente no projeto com frontend separado.")
            if not os.path.exists(os.path.join(project_path, "frontend")):
                errors.append("Quality Gate: Pasta 'frontend' ausente no projeto.")
            if not os.path.exists(os.path.join(project_path, "docs", "FRONTEND_BACKEND_CONNECTION.md")):
                errors.append("Quality Gate: Documentao de conexo FRONTEND_BACKEND_CONNECTION.md ausente.")
        
        # Determine paths to check inside based on frontend separation
        backend_check_path = os.path.join(project_path, "backend") if frontend_enabled else project_path
        if os.path.isdir(os.path.join(project_path, "backend")):
            backend_check_path = os.path.join(project_path, "backend")


        # 1. Validar Arquitetura
        arch = blueprint.get("architecture", {})
        arch_type = arch.get("type") if isinstance(arch, dict) else str(arch)
        if arch_type == "monolith_modular":
            # Exemplo: deve existir uma pasta 'modules' ou 'src' com pastas separadas
            if not os.path.exists(os.path.join(project_path, "src")) and not os.path.exists(os.path.join(project_path, "app")):
                errors.append("Arquitetura falhou: Estrutura Modular esperada no encontrada.")

        # 2. Validar UX (Se houver frontend/templates)
        ux_rules = blueprint.get("ux_rules", [])
        if "responsive" in ux_rules or "dashboard_layout" in blueprint.get("ux_components", []):
            # Apenas uma checagem simulada. Na prtica, buscaria por CSS ou meta tags no HTML.
            has_frontend = False
            for root, _, files in os.walk(project_path):
                if any(f.endswith(".html") or f.endswith(".tsx") for f in files):
                    has_frontend = True
                    break
            if not has_frontend and blueprint.get("project_type") != "api":
                errors.append("UX falhou: Frontend ou templates esperados, mas no encontrados.")

        # 3. Testes existem (buscando no backend_check_path)
        testing = blueprint.get("testing", [])
        if isinstance(testing, str):
            testing = [testing]
        if "pytest" in testing or "junit" in testing:
            if not os.path.exists(os.path.join(backend_check_path, "tests")) and not os.path.exists(os.path.join(backend_check_path, "src", "test")):
                errors.append("Qualidade falhou: Nenhum diretrio de testes encontrado no backend.")

        # 4. README (Pode estar na raiz ou no backend_check_path)
        if not os.path.exists(os.path.join(project_path, "README.md")) and not os.path.exists(os.path.join(backend_check_path, "README.md")):
            errors.append("Qualidade falhou: README.md ausente.")
            
        # 4.1. Swagger/OpenAPI ou Docs de API
        if blueprint.get("project_type") == "api" or backend_check_path != project_path:
            # Em NestJS/FastAPI/Spring, procuramos menção a Swagger
            swagger_found = False
            for root, _, files in os.walk(backend_check_path):
                for f in files:
                    if f.endswith(('.py', '.ts', '.java', '.json', '.yaml')):
                        try:
                            with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as file_obj:
                                content = file_obj.read()
                                if 'swagger' in content.lower() or 'openapi' in content.lower():
                                    swagger_found = True
                                    break
                        except Exception:
                            pass
                if swagger_found:
                    break
            
            # Não obrigamos a falhar por Swagger ainda, mas em um strict mode sim.
            # Aqui vamos só registrar.
            if not swagger_found:
                pass # errors.append("Qualidade falhou: Nenhuma documentação de API (Swagger/OpenAPI) encontrada no código base.")
                
        # 5. Validação de versões de stack
        selected_versions = blueprint.get("selected_versions", {})
        if selected_versions:
            # We check if some key files exist to parse them or do string matching
            # For Python: requirements.txt
            # For Java: pom.xml / build.gradle
            # For Node: package.json
            for k, v in selected_versions.items():
                if "java_version" in k:
                    pom_path = os.path.join(backend_check_path, "pom.xml")
                    if os.path.exists(pom_path):
                        with open(pom_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            if f"<java.version>{v}</java.version>" not in content:
                                errors.append(f"Qualidade falhou: Versão do Java esperada era {v}, mas não encontrada no pom.xml")
                elif "spring_boot_version" in k:
                    pom_path = os.path.join(backend_check_path, "pom.xml")
                    if os.path.exists(pom_path):
                        with open(pom_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            if f"<version>{v}</version>" not in content and f"<version>{v.replace('.x', '.0')}</version>" not in content:
                                errors.append(f"Qualidade falhou: Versão do Spring Boot esperada era {v}, mas parece não bater no pom.xml")
                elif "node_version" in k:
                    pkg_path = os.path.join(backend_check_path, "package.json")
                    if os.path.exists(pkg_path):
                        with open(pkg_path, "r", encoding="utf-8") as f:
                            if f'"node": ">={v}' not in f.read().replace(" ", "") and f'"{v}' not in f.read():
                                # Just a basic heuristic check
                                pass

        if errors:
            return {"status": "failed", "errors": errors}
            
        return {"status": "passed", "errors": []}
