from typing import List, Dict
from .recommendation_rules import RECOMMENDATION_RULES


def get_recommendations(selected: List[str]) -> Dict[str, List[str]]:
    selected_set = set(selected)
    suggestions: List[str] = []
    risks: List[str] = []

    for rule in RECOMMENDATION_RULES:
        if all(item in selected_set for item in rule["if_all"]):
            suggestions.extend(rule["suggest"])
            risks.extend(rule["risk"])

    # Remove duplicates preserving order
    uniq_suggestions = list(dict.fromkeys(suggestions))
    uniq_risks = list(dict.fromkeys(risks))
    return {"suggestions": uniq_suggestions, "risks": uniq_risks}
