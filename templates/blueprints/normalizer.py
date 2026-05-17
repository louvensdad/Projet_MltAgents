import unicodedata
import re
from typing import List, Dict, Tuple

# REMOVED: DICTIONARY auto-translation - users must confirm all naming
# Entities are now preserved exactly as the user confirmed them.
# Internal code names are derived by sanitizing the original name.

BLACKLIST = [
    "config", "setting", "dashboard", "relatório", "relatorio",
    "controle", "permiss", "export", "metric", "pdf", "visual", "report", "permission"
]

def clean_string(name: str) -> str:
    """Remove acentos e coloca em minúsculo para busca no dicionário"""
    name = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    return name.lower().strip()


def to_internal_name(original_name: str) -> str:
    """
    Converts a user-facing entity name to a code-safe internal name.
    Examples:
      "Usuário" -> "Usuario"
      "Agendamento" -> "Agendamento"
      "Client" -> "Client"
    """
    # Remove accents
    s = unicodedata.normalize('NFKD', original_name).encode('ASCII', 'ignore').decode('utf-8')
    # Capitalize first letter, keep rest as-is (PascalCase for class names)
    if not s:
        return s
    return s[0].upper() + s[1:]


def normalize_entities(raw_entities: List[str]) -> List[Tuple[str, str]]:
    """
    Função central de normalização:
    - preserves original user-provided names
    - creates internal code-safe names
    - removes duplicados
    - removes entidades da blacklist
    - returns list of (original_name, internal_name) tuples

    NO auto-translation happens here. The user's naming is respected.
    """
    result = []
    seen_originals = set()
    seen_internals = set()

    for original_name in raw_entities:
        if not original_name:
            continue

        clean_original = original_name.strip()

        # 1. Checa Blacklist (check both original and cleaned)
        if any(b in clean_string(clean_original) for b in BLACKLIST):
            print(f"⚠️ Aviso: Entidade '{original_name}' removida (Blacklist de Funcionalidades/Configurações).")
            continue

        # 2. Deduplicação por nome original (case-insensitive)
        original_key = clean_string(clean_original)
        if original_key in seen_originals:
            print(f"⚠️ Aviso: Duplicata detectada para '{original_name}'. Removendo.")
            continue

        # 3. Create internal name
        internal = to_internal_name(clean_original)
        internal_key = clean_string(internal)

        if internal_key in seen_internals:
            print(f"⚠️ Aviso: Conflito de nome interno para '{original_name}' ('{internal}' já existe). Removendo.")
            continue

        seen_originals.add(original_key)
        seen_internals.add(internal_key)
        result.append((clean_original, internal))

    return result


def extract_entities_from_brief(description: str, rules: List[str] = None) -> List[str]:
    """
    Extract potential entity names from the user's description.
    This is a suggestion function - the user MUST confirm the results.
    Uses basic NLP patterns but does NOT invent entities.
    """
    candidates = []
    text = description.lower()

    # Look for common entity indicators in the text
    # Pattern: "cadastrar X", "gerenciar Y", "X e Y", etc.
    patterns = [
        r'cadastr(?:ar|o|ar\s+\w+)\s+(\w+)',
        r'gerenci(?:ar|o)\s+(\w+)',
        r'agendar\s+(\w+)',
        r'(\w+)\s+e\s+(\w+)',  # "X e Y"
    ]

    import re
    for pattern in patterns:
        matches = re.findall(pattern, text)
        for m in matches:
            if isinstance(m, tuple):
                candidates.extend([g for g in m if g])
            else:
                candidates.append(m)

    # Filter out common non-entity words
    stop_words = {'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'no', 'na', 'com', 'para', 'por', 'um', 'uma'}
    filtered = [c for c in candidates if c.lower() not in stop_words and len(c) > 2]

    # Capitalize first letter for display
    return list(dict.fromkeys(c.capitalize() for c in filtered))  # preserve order, remove dupes
