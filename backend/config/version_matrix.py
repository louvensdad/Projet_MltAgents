VERSION_MATRIX = {
    "spring_boot": {
        "name": "Spring Boot",
        "versions": {
            "3.3.x": {"java": ["17", "21"], "build_tools": ["Maven", "Gradle"]},
            "3.2.x": {"java": ["17", "21"], "build_tools": ["Maven", "Gradle"]}
        },
        "recommended": "3.3.x"
    },
    "fastapi": {
        "name": "FastAPI",
        "versions": {
            "0.111.x": {"python": ["3.10", "3.11", "3.12"], "pydantic": ["2.7.x"]},
            "0.109.x": {"python": ["3.10", "3.11"], "pydantic": ["2.6.x"]}
        },
        "recommended": "0.111.x"
    },
    "nestjs": {
        "name": "NestJS",
        "versions": {
            "10.x": {"node": ["18", "20", "22"], "typescript": ["5.4.x"]},
            "9.x": {"node": ["16", "18"], "typescript": ["4.9.x"]}
        },
        "recommended": "10.x"
    },
    "express": {
        "name": "Express",
        "versions": {"4.19.x": {"node": ["18", "20", "22"], "orms": ["Prisma", "Sequelize"]}},
        "recommended": "4.19.x"
    },
    "laravel": {
        "name": "Laravel",
        "versions": {
            "11.x": {"php": ["8.2", "8.3"], "composer": ["2.7.x"]},
            "10.x": {"php": ["8.1", "8.2"], "composer": ["2.7.x"]}
        },
        "recommended": "11.x"
    },
    "dotnet": {
        "name": ".NET Core",
        "versions": {
            "8.0": {"aspnet_core": ["8.0"], "ef_core": ["8.0"]},
            "7.0": {"aspnet_core": ["7.0"], "ef_core": ["7.0"]}
        },
        "recommended": "8.0"
    },
    "angular": {
        "name": "Angular",
        "versions": {
            "18.x": {"rxjs": ["7.8.x"], "typescript": ["5.4.x"], "node": ["18", "20"]},
            "17.x": {"rxjs": ["7.8.x"], "typescript": ["5.2.x"], "node": ["18"]}
        },
        "recommended": "18.x"
    },
    "react": {
        "name": "React",
        "versions": {
            "18.x": {"node": ["18", "20", "22"], "typescript": ["5.x"]},
            "19.x": {"node": ["20", "22"], "typescript": ["5.x"]}
        },
        "recommended": "18.x"
    },
    "nextjs": {
        "name": "Next.js",
        "versions": {
            "14.x": {"react": ["18.2.x", "18.3.x"], "node": ["18", "20", "22"]},
            "13.x": {"react": ["18.2.x"], "node": ["16", "18"]}
        },
        "recommended": "14.x"
    },
    "react_nextjs": {
        "name": "Next.js",
        "versions": {
            "14.x": {"react": ["18.2.x", "18.3.x"], "node": ["18", "20", "22"]},
            "13.x": {"react": ["18.2.x"], "node": ["16", "18"]}
        },
        "recommended": "14.x"
    },
    "vue": {
        "name": "Vue",
        "versions": {"3.x": {"node": ["18", "20"], "typescript": ["5.x"]}},
        "recommended": "3.x"
    },
    "blazor": {
        "name": "Blazor",
        "versions": {"8.0": {"dotnet": ["8.0"]}},
        "recommended": "8.0"
    },
    "automation": {
        "name": "Automation",
        "versions": {"current": {"node": ["20"], "python": ["3.12"]}},
        "recommended": "current"
    },
    "ai_agents": {
        "name": "AI Agents",
        "versions": {"current": {"openai": ["latest"], "gemini": ["latest"]}},
        "recommended": "current"
    },
    "static_site": {
        "name": "Static Site",
        "versions": {
            "current": {"html": ["current"], "css": ["current"], "javascript": ["es2022", "es2023"]}
        },
        "recommended": "current"
    }
}

def get_recommended_versions(stack_id: str) -> dict:
    if stack_id not in VERSION_MATRIX:
        return {}
    stack_info = VERSION_MATRIX[stack_id]
    rec_version = stack_info["recommended"]
    details = stack_info["versions"][rec_version]
    result = {f"{stack_id}_version": rec_version}
    for key, values in details.items():
        if isinstance(values, list) and len(values) > 0:
            result[f"{key}_version"] = values[-1]
    return result

def is_combination_valid(stack_id: str, main_version: str, dependencies: dict) -> tuple:
    if stack_id not in VERSION_MATRIX:
        return False, f"Stack desconhecida: {stack_id}"
    stack_info = VERSION_MATRIX[stack_id]
    if main_version not in stack_info["versions"]:
        return False, f"Versão {main_version} de {stack_info['name']} não é suportada."
    valid_deps = stack_info["versions"][main_version]
    for dep_key, dep_val in dependencies.items():
        if dep_key in valid_deps:
            allowed = valid_deps[dep_key]
            if dep_val not in allowed:
                return False, f"Versão incompatível: {stack_info['name']} {main_version} requer {dep_key} nas versões {allowed}, mas foi recebido {dep_val}."
    return True, "Combinação válida."
