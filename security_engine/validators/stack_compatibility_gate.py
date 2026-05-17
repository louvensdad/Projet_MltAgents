import sys
import os
from typing import Dict, Any

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.stack_profiles import STACK_PROFILES
from config.version_matrix import is_combination_valid

class StackCompatibilityGate:
    """
    Verifica se todas as opções (banco, testes, auth) pertencem rigorosamente 
    ao perfil da stack. Bloqueia termos proibidos nas opções selecionadas.
    """
    def __init__(self):
        self.profiles = STACK_PROFILES

    def validate(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Retorna 'passed' ou 'failed'."""
        stack_id = blueprint.get("stack_profile_id", "")
        if not stack_id:
            stack = blueprint.get("backend_stack", "").lower()
            if "fastapi" in stack: stack_id = "fastapi"
            elif "spring" in stack: stack_id = "springboot"
            elif "nest" in stack: stack_id = "nestjs"
            elif "express" in stack: stack_id = "express"
            elif "laravel" in stack: stack_id = "laravel"
            elif "dotnet" in stack or "c#" in stack: stack_id = "dotnet"
            elif "static" in stack: stack_id = "static"
            else:
                return {"status": "failed", "errors": ["Stack profile não identificado."]}

        if stack_id not in self.profiles:
            return {"status": "failed", "errors": [f"Stack {stack_id} não possui perfil de configuração."]}
            
        errors = []
        profile = self.profiles[stack_id]
        forbidden_terms = [t.lower() for t in profile.get("forbidden_terms", [])]
        
        selected_options_raw = blueprint.get("selected_stack_options", [])
        if isinstance(selected_options_raw, dict):
            raw_text = " ".join([str(v) for v in selected_options_raw.values()]).lower()
        else:
            raw_text = " ".join([str(v) for v in selected_options_raw]).lower()
            
        # Adicionar textos do blueprint geral para varredura
        raw_text += " " + " ".join([str(blueprint.get(k, "")) for k in ["database", "testing", "security", "architecture"]])
        raw_text = raw_text.lower()
        
        for term in forbidden_terms:
            if term in raw_text:
                errors.append(f"Opção incompatível com {profile['name']}: {term.title()}")
                
        # Validação de matriz de versões, se configurado
        selected_versions = blueprint.get("selected_versions", {})
        if selected_versions:
            main_version_key = f"{stack_id}_version"
            if main_version_key in selected_versions:
                main_version = selected_versions[main_version_key]
                # Filter out main version to pass only dependencies
                dependencies = {k.replace("_version", ""): v for k, v in selected_versions.items() if k != main_version_key}
                is_valid, msg = is_combination_valid(stack_id, main_version, dependencies)
                if not is_valid:
                    errors.append(msg)
                
        if errors:
            return {"status": "failed", "errors": errors}
            
        return {"status": "passed", "errors": []}
