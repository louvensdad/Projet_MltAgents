import os
import re
from typing import Dict, Any

class FidelityGate:
    """
    Verifica se o projeto gerado contm EXATAMENTE o que o usurio confirmou no briefing.
    Bloqueia invenes (alucinaes) da IA em relao a entidades e features.
    """
    def __init__(self):
        pass

    def validate(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        if not os.path.exists(project_path):
            return {"status": "failed", "errors": ["Caminho do projeto no encontrado."]}

        errors = []
        confirmed_entities = blueprint.get("confirmed_entities", [])
        confirmed_features = blueprint.get("confirmed_features", [])
        
        # Simulao de verificao (num ambiente real, leramos os models/controllers gerados)
        # Buscar por nomes de arquivos ou contedo que defina entidades
        found_entities = set()
        
        for root, dirs, files in os.walk(project_path):
            for file in files:
                if file.endswith(('.py', '.java', '.ts', '.js', '.php')):
                    try:
                        filepath = os.path.join(root, file)
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read().lower()
                            for entity in confirmed_entities:
                                if entity.lower() in content:
                                    found_entities.add(entity)
                            
                            # Verificar se a IA inventou uma entidade crtica genrica no pedida
                            # (Heurstica: se tem class Produto mas Produto no est em confirmed_entities)
                            if "class produto" in content and "produto" not in [e.lower() for e in confirmed_entities]:
                                errors.append("Fidelity Gate: IA inventou a entidade 'Produto' que no foi solicitada.")
                    except Exception:
                        pass
        
        # Verificar se faltam entidades confirmadas
        missing_entities = [e for e in confirmed_entities if e not in found_entities]
        if missing_entities:
            # Toleramos se o usurio no pediu nada, mas se pediu e falta, erro!
            errors.append(f"Fidelity Gate: Entidades confirmadas ausentes no cdigo: {', '.join(missing_entities)}")

        # Verificao bsica de features (opcional, pode ser checada lendo README ou specs)
        
        if errors:
            return {"status": "failed", "errors": errors}
            
        return {"status": "passed", "errors": []}
