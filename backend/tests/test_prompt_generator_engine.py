import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from prompt_engine.prompt_generator import PromptGeneratorEngine


def test_prompt_generator_engine_accepts_answers_and_exposes_contract():
    engine = PromptGeneratorEngine("static_site")
    engine.answer("project_name", "Acme Landing")
    engine.answer("project_description", "Landing page independente para gerar leads qualificados com SEO.")
    engine.answer("site_type", "landing_page")
    engine.answer("target_audience", "startups")
    engine.answer("business_goal", "generate leads")
    engine.answer("sections", ["hero", "contact"])
    engine.answer("visual_style", "premium")
    engine.answer("seo_keywords", ["landing page", "seo"])
    engine.answer("contact_method", "form")
    engine.answer("language", "pt-BR")

    assert engine.stack_name == "Static Site"
    assert engine.answered_count >= 8
    assert engine.total_questions >= 1
    assert engine.validate() is True

    master = engine.finalize()
    dumped = master.model_dump()

    assert dumped["stack_id"] == "static_site"
    assert dumped["status"] == "validated"
    assert "Acme Landing" in dumped["prompt_text"]
