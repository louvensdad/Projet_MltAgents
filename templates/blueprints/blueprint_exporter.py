import json
import os
from .blueprint_schema import BlueprintData

def export_to_json(blueprint: BlueprintData, filepath: str):
    """Exporta o blueprint validado para JSON."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(blueprint.model_dump_json(indent=2))

def export_to_markdown(blueprint: BlueprintData, filepath: str):
    """Exporta o blueprint validado para um Markdown organizado."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    # Use the blueprint's language for headers
    lang = blueprint.language if hasattr(blueprint, 'language') else "Portuguese"
    is_pt = lang == "Portuguese"

    title = "Plano do Projeto" if is_pt else "Project Blueprint"
    md_content = f"# {title}: {blueprint.project_name}\n\n"
    md_content += f"**{'Descrição' if is_pt else 'Description'}**: {blueprint.description}\n"
    md_content += f"**{'Público-alvo' if is_pt else 'Target Audience'}**: {blueprint.target_audience}\n\n"

    # Confirmed Entities
    md_content += f"## {'Entidades Confirmadas' if is_pt else 'Confirmed Entities'}\n"
    if blueprint.confirmed_entities:
        for entity_name in blueprint.confirmed_entities:
            md_content += f"- {entity_name}\n"
    else:
        for entity in blueprint.entities:
            md_content += f"### {entity.name}\n"
            if entity.original_name and entity.original_name != entity.name:
                md_content += f"**{'Nome Original' if is_pt else 'Original Name'}**: {entity.original_name}\n"
            for field in entity.fields:
                md_content += f"- `{field.name}`: {field.type}\n"

    # Confirmed Features
    md_content += f"\n## {'Funcionalidades Confirmadas' if is_pt else 'Confirmed Features'}\n"
    for feature in blueprint.confirmed_features:
        md_content += f"- {feature}\n"

    # Confirmed Business Rules
    if blueprint.confirmed_business_rules:
        md_content += f"\n## {'Regras de Negócio' if is_pt else 'Business Rules'}\n"
        for rule in blueprint.confirmed_business_rules:
            md_content += f"- {rule}\n"

    # API Endpoints
    md_content += f"\n## {'API Endpoints' if is_pt else 'API Endpoints'}\n"
    for endpoint in blueprint.api_endpoints:
        desc = endpoint.description if hasattr(endpoint, 'description') else endpoint.get('description', '')
        method = endpoint.method if hasattr(endpoint, 'method') else endpoint.get('method', '')
        path = endpoint.path if hasattr(endpoint, 'path') else endpoint.get('path', '')
        md_content += f"### {method} {path}\n"
        md_content += f"**{'Descrição' if is_pt else 'Description'}**: {desc}\n"
        auth = endpoint.auth_required if hasattr(endpoint, 'auth_required') else endpoint.get('auth_required', False)
        md_content += f"- **{'Autenticação Obrigatória' if is_pt else 'Auth Required'}**: {'Sim' if is_pt else 'Yes' if auth else 'Não' if is_pt else 'No'}\n"
        roles = endpoint.roles_allowed if hasattr(endpoint, 'roles_allowed') else endpoint.get('roles_allowed', [])
        md_content += f"- **{'Roles Permitidas' if is_pt else 'Allowed Roles'}**: {', '.join(roles)}\n"
        req_body = endpoint.request_body if hasattr(endpoint, 'request_body') else endpoint.get('request_body')
        if req_body:
            md_content += f"**{'Request Body' if is_pt else 'Request Body'}**:\n```json\n{json.dumps(req_body, indent=2)}\n```\n"
        resp_body = endpoint.response_body if hasattr(endpoint, 'response_body') else endpoint.get('response_body')
        if resp_body:
            md_content += f"**{'Response Body' if is_pt else 'Response Body'}**:\n```json\n{json.dumps(resp_body, indent=2)}\n```\n"

    # Security
    md_content += f"\n## {'Segurança' if is_pt else 'Security'}\n"
    for rule in blueprint.security_rules:
        md_content += f"- {rule}\n"

    # Design Intelligence
    md_content += f"\n## {'Design Intelligence' if is_pt else 'Design Intelligence'}\n"
    if blueprint.design_brief:
        md_content += f"- **{'Nicho' if is_pt else 'Niche'}:** {blueprint.design_brief.get('niche', 'geral')}\n"
        md_content += f"- **{'Conceito visual' if is_pt else 'Visual Concept'}:** {blueprint.design_brief.get('visual_concept', '')}\n"
        md_content += f"- **{'Personalidade' if is_pt else 'Personality'}:** {blueprint.design_brief.get('brand_personality', '')}\n"
        md_content += f"- **{'Tipografia' if is_pt else 'Typography'}:** {blueprint.design_brief.get('typography', '')}\n"
        md_content += f"- **{'Layout' if is_pt else 'Layout'}:** {blueprint.design_brief.get('layout_style', '')}\n"
        md_content += f"- **{'Paleta' if is_pt else 'Palette'}:** {', '.join(blueprint.design_brief.get('color_palette', []))}\n"
    else:
        md_content += f"- {'Sem design brief estruturado.' if is_pt else 'No structured design brief.'}\n"

    # Architecture
    md_content += f"\n## {'Arquitetura Avançada' if is_pt else 'Advanced Architecture'}\n"
    adv = blueprint.advanced_architecture if hasattr(blueprint, 'advanced_architecture') else {}
    if adv:
        md_content += f"- **{'Tipo' if is_pt else 'Type'}:** {adv.get('architecture_type', 'monolith_modular')}\n"
        md_content += f"- **Service Discovery:** {adv.get('service_discovery', 'none')}\n"
        md_content += f"- **API Gateway:** {adv.get('api_gateway', 'none')}\n"
        md_content += f"- **{'Comunicação' if is_pt else 'Communication'}:** {', '.join(adv.get('communication_protocols', ['http_rest']))}\n"
        md_content += f"- **{'Segurança' if is_pt else 'Security'}:** {adv.get('auth_provider', 'jwt_simple')}\n"
        md_content += f"- **{'Monitoramento' if is_pt else 'Monitoring'}:** {adv.get('monitoring', 'basic_logs')}\n"
        md_content += f"- **Cache:** {adv.get('cache', 'none')}\n"
        md_content += f"- **{'Banco' if is_pt else 'Database'}:** {adv.get('database', 'sqlite_local')}\n"
        md_content += f"- **{'Estratégia de testes' if is_pt else 'Testing Strategy'}:** {', '.join(adv.get('testing_strategy', ['unit_tests', 'integration_tests']))}\n"

    # Automation
    md_content += f"\n## {'Automação e Agentes' if is_pt else 'Automation and Agents'}\n"
    auto_level = blueprint.automation_level if hasattr(blueprint, 'automation_level') else 'none'
    md_content += f"- **{'Nível' if is_pt else 'Level'}:** {auto_level}\n"
    agents = blueprint.selected_agents if hasattr(blueprint, 'selected_agents') else []
    md_content += "- **Agentes:** " + (", ".join(agents) if agents else ("nenhum" if is_pt else "none")) + "\n"
    integrations = blueprint.integrations_required if hasattr(blueprint, 'integrations_required') else []
    md_content += "- **Integrações:** " + (", ".join(integrations) if integrations else ("modo demo / nenhuma integração externa" if is_pt else "demo mode / no external integrations")) + "\n"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(md_content)
