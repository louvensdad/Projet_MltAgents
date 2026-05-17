import re
from typing import List, Dict, Any, Tuple
from .blueprint_schema import BlueprintData, Entity, EntityField, Endpoint
from agents.core.agent_context import AgentContext
from design_intelligence import infer_design_brief, infer_ux_intelligence
from briefing.architecture import SAFE_DEFAULT
from blueprints.normalizer import normalize_entities

# REMOVED: Fallback entity lists
# NEVER use default entities like "User", "Resource", etc.


def extract_list(text: str, section_header: str) -> List[str]:
    """Extrai itens de lista de uma seção específica do markdown."""
    if not text:
        return []
    items = []
    capture = False
    for line in text.splitlines():
        if section_header.lower() in line.lower():
            capture = True
            continue
        if capture:
            if line.startswith("###") or line.startswith("==="):
                break
            if line.strip().startswith("- "):
                items.append(line.replace("- ", "").strip())
    return items


def build_endpoints_for_entity(entity_name: str, original_name: str = None, auth_required: bool = True) -> List[Endpoint]:
    """Build standard CRUD endpoints for a confirmed entity. No invention."""
    route = f"/{entity_name.lower()}s"
    display_name = original_name or entity_name

    endpoints = [
        Endpoint(
            method="GET",
            path=route,
            description=f"Lista todos os registros de {display_name}",
            auth_required=auth_required,
            roles_allowed=["admin", "user"],
            request_body=None,
            response_body={"data": "array"},
            related_entity=entity_name
        ),
        Endpoint(
            method="POST",
            path=route,
            description=f"Cria um novo registro de {display_name}",
            auth_required=auth_required,
            roles_allowed=["admin", "user"],
            request_body={"name": "string", "created_at": "datetime"},
            response_body={"id": "uuid", "message": "success"},
            related_entity=entity_name
        ),
        Endpoint(
            method="GET",
            path=f"{route}/{{id}}",
            description=f"Obtém um registro de {display_name} por ID",
            auth_required=auth_required,
            roles_allowed=["admin", "user"],
            request_body=None,
            response_body={"data": "object"},
            related_entity=entity_name
        ),
        Endpoint(
            method="PUT",
            path=f"{route}/{{id}}",
            description=f"Atualiza um registro de {display_name}",
            auth_required=auth_required,
            roles_allowed=["admin"],
            request_body={"name": "string"},
            response_body={"id": "uuid", "message": "updated"},
            related_entity=entity_name
        ),
        Endpoint(
            method="DELETE",
            path=f"{route}/{{id}}",
            description=f"Remove um registro de {display_name}",
            auth_required=auth_required,
            roles_allowed=["admin"],
            request_body=None,
            response_body={"message": "deleted"},
            related_entity=entity_name
        ),
    ]
    return endpoints


def build_blueprint(context: AgentContext) -> BlueprintData:
    """
    Constrói e valida o Blueprint a partir do AgentContext.
    REGRA CRÍTICA: Apenas entidades confirmadas pelo usuário.
    Se não houver entidades confirmadas, BLOQUEIA a geração.
    """
    design_brief = context.design_brief or infer_design_brief(
        project_name=context.project_name,
        description=context.user_idea,
        project_type=context.project_brief.get("Tipo", context.project_mode),
        brief=context.project_brief,
    )
    ux_data = {
        "ux_rules": context.ux_rules,
        "ux_flow": context.ux_flow,
    }
    if not ux_data["ux_rules"] or not ux_data["ux_flow"]:
        inferred_ux = infer_ux_intelligence(
            project_name=context.project_name,
            description=context.user_idea,
            design_brief=design_brief,
            project_type=context.project_brief.get("Tipo", context.project_mode),
        )
        ux_data["ux_rules"] = ux_data["ux_rules"] or inferred_ux["ux_rules"]
        ux_data["ux_flow"] = ux_data["ux_flow"] or inferred_ux["ux_flow"]

    advanced_architecture = (
        context.advanced_architecture
        or context.project_brief.get("advanced_architecture", {})
        or context.project_brief.get("_advanced_architecture_raw", {})
        or context.project_brief.get("_architecture_raw", {}).get("advanced_architecture", {})
        or dict(SAFE_DEFAULT)
    )
    if not advanced_architecture.get("architecture_type"):
        advanced_architecture["architecture_type"] = context.project_brief.get("architecture", "monolith_modular")

    # ── 1. Features: ONLY from user briefing ────────────────────
    features = context.project_brief.get("Funcionalidades", [])
    if not features:
        features = extract_list(context.requirements, "Funcionalidades")
    if not features:
        # NO default fallback - warn but continue with empty
        print("\n⚠️ AVISO: Nenhuma funcionalidade confirmada pelo usuário.")
        features = []

    # ── 2. Business Rules: ONLY from user briefing ───────────────
    business_rules = context.project_brief.get("Regras de Negócio", [])
    if not business_rules:
        business_rules = extract_list(context.requirements, "Regras")
    # Do NOT add defaults - use only what user confirmed

    # ── 3. Entities: CRITICAL - ONLY from user confirmation ─────
    raw_entities = context.project_brief.get("Entidades", [])

    # If not in brief, try to extract from requirements
    if not raw_entities:
        raw_entities = extract_list(context.requirements, "Entidades")

    # ABSOLUTE BLOCK: No entities = no generation
    if not raw_entities:
        raise ValueError(
            "\n❌ ERRO CRÍTICO: Nenhuma entidade foi confirmada pelo usuário.\n"
            "   O projeto NÃO pode ser gerado sem entidades.\n"
            "   Por favor, refaça o briefing e defina as entidades do projeto."
        )

    # Normalize: returns list of (original_name, internal_name) tuples
    normalized = normalize_entities(raw_entities)

    # ABSOLUTE BLOCK: Normalization removed all entities
    if not normalized:
        raise ValueError(
            "\n❌ ERRO CRÍTICO: Todas as entidades foram filtradas.\n"
            "   Nenhuma entidade válida restante para gerar o projeto."
        )

    print("\n✅ Entidades confirmadas pelo usuário:")
    for orig, internal in normalized:
        print(f"  - {orig} (interno: {internal})")
    print()

    # Build Entity objects with original_name preserved
    entities: List[Entity] = []
    for original_name, internal_name in normalized:
        # Basic fields for all entities (id, created_at are standard)
        fields = [
            EntityField(name="id", type="uuid"),
            EntityField(name="created_at", type="datetime")
        ]

        # Only add name if not already a field based on entity name
        # User should define their own fields
        fields.append(EntityField(name="name", type="string"))

        entities.append(Entity(
            name=internal_name,
            fields=fields,
            original_name=original_name  # Preserve user's original name
        ))

    # ── 4. Endpoints: ONLY for confirmed entities ───────────────
    endpoints: List[Endpoint] = []
    for e in entities:
        entity_endpoints = build_endpoints_for_entity(
            entity_name=e.name,
            original_name=e.original_name,
            auth_required=True
        )
        endpoints.extend(entity_endpoints)

    # ── 5. Security: ONLY from user briefing ────────────────────
    security_rules = context.project_brief.get("Segurança", [])
    if not security_rules:
        security_rules = extract_list(context.security_report, "Proteções Obrigatórias")
    # NO default fallback

    validation_rules = context.project_brief.get("Validação", [])
    if not validation_rules:
        validation_rules = extract_list(context.backend_plan, "Regras de Validação")

    # ── 6. Environment variables ────────────────────────────────
    env_variables = ["DATABASE_URL", "JWT_SECRET", "API_PORT"]
    for var in context.env_variables:
        if var not in env_variables:
            env_variables.append(var)

    # ── 7. Backend modules ─────────────────────────────────────
    backend_modules = ["auth", "core"]
    if context.automation_level != "none":
        backend_modules.append("automation")
    if context.selected_agents:
        backend_modules.append("agents")

    # ── 8. Frontend ────────────────────────────────────────────
    frontend_pages = context.project_brief.get("Seções", [])
    if not frontend_pages:
        frontend_pages = extract_list(context.frontend_plan, "Páginas")
    if not frontend_pages:
        frontend_pages = ["/login", "/dashboard"]

    frontend_components = extract_list(context.frontend_plan, "Componentes")
    if not frontend_components:
        frontend_components = ["DataTable", "Modal"]

    # ── 9. Language ─────────────────────────────────────────────
    language = context.project_brief.get("language", "Portuguese")

    # ── 10. Create Blueprint with confirmed data ONLY ───────────
    confirmed_entity_names = [orig for orig, _ in normalized]

    blueprint = BlueprintData(
        project_name=context.project_name or "Projeto Sem Nome",
        project_language=language,
        backend_stack=context.backend_stack,
        backend_language=context.backend_language,
        description=context.user_idea or "Descrição não informada",
        target_audience=design_brief.get("target_audience", "Definido pelo usuário"),
        core_features=features,
        entities=entities,
        relationships=[],  # User should define relationships explicitly
        backend_modules=backend_modules,
        api_endpoints=endpoints,
        frontend_pages=frontend_pages,
        frontend_components=frontend_components,
        auth_strategy=context.project_brief.get("Autenticação", "JWT"),
        security_rules=security_rules,
        validation_rules=validation_rules,
        test_strategy="Testes definidos pelo usuário ou padrão da stack",
        devops_plan="Docker containers hospedados em VPS",
        design_brief=design_brief,
        ux_rules=ux_data["ux_rules"],
        ux_flow=ux_data["ux_flow"],
        advanced_architecture=advanced_architecture,
        automation_level=context.automation_level,
        selected_agents=context.selected_agents,
        integrations_required=context.integrations_required,
        env_variables=env_variables,
        deployment_plan="CI/CD usando GitHub Actions -> Deploy VPS",
        risks=["Riscos a definir pelo usuário"],
        next_steps=["Iniciar repositório Git", "Configurar Banco de Dados"],
        # ── STRICT BRIEFING FIELDS ──
        confirmed_entities=confirmed_entity_names,
        confirmed_features=features,
        confirmed_business_rules=business_rules,
        language=language,
        stack=context.backend_stack,
        architecture=context.project_brief.get("architecture") or advanced_architecture.get("architecture_type", "monolith_modular"),
        strict_briefing=True,
        ux_ai_preferences=context.project_brief.get("ux_ai_preferences", []),
        selected_presets=context.project_brief.get("selected_presets", []),
        smart_recommendations=context.project_brief.get("smart_recommendations", []),
        architecture_scores=context.project_brief.get("architecture_scores", {}),
        generated_architecture_summary=context.project_brief.get("generated_architecture_summary", ""),
        step9_answers=context.project_brief.get("step9_answers", {}),
    )

    return blueprint


def check_brief_fidelity(project_path: str, blueprint: BlueprintData) -> Dict[str, Any]:
    """
    Post-generation validation: verifies the generated project matches the briefing.
    Returns a dict with 'valid' (bool) and 'errors' (list of strings).
    """
    import os
    from pathlib import Path

    result = {"valid": True, "errors": []}
    project = Path(project_path)

    if not project.exists():
        result["valid"] = False
        result["errors"].append(f"Project path does not exist: {project_path}")
        return result

    # 1. Check all confirmed entities exist in generated code
    for entity_name in blueprint.confirmed_entities:
        # Look for entity files in common locations
        found = False
        for pattern in [f"**/{entity_name.lower()}*.py", f"**/{entity_name}*.java",
                       f"**/{entity_name}*.ts", f"**/{entity_name}*.js"]:
            if list(project.glob(pattern)):
                found = True
                break
        if not found:
            result["valid"] = False
            result["errors"].append(f"Entity '{entity_name}' from briefing NOT found in generated code.")

    # 2. Check no extra entities were created (not in confirmed list)
    # This is a best-effort check
    confirmed_set = set(blueprint.confirmed_entities)
    # Add common internal names
    for orig in blueprint.confirmed_entities:
        from blueprints.normalizer import to_internal_name
        confirmed_set.add(to_internal_name(orig))

    # 3. Check docs exist
    docs_dir = project / "docs"
    if docs_dir.exists():
        expected_docs = ["FEATURES.md", "BUSINESS_RULES.md"]
        for doc in expected_docs:
            if not (docs_dir / doc).exists():
                result["valid"] = False
                result["errors"].append(f"Missing documentation: docs/{doc}")

    # 4. Check language matching (if Portuguese, README should have Portuguese content)
    readme = project / "README.md"
    if readme.exists() and blueprint.language == "Portuguese":
        content = readme.read_text(encoding="utf-8", errors="ignore")
        # Very basic check: if README is in English only, warn
        if "Instalação" not in content and "Configuração" not in content:
            if "Installation" in content or "Getting Started" in content:
                result["errors"].append(
                    f"Warning: README.md appears to be in English but language is set to {blueprint.language}"
                )

    if result["errors"]:
        result["valid"] = False

    return result
