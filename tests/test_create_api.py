"""
test_create_api.py — Testes completos de validação da refatoração /create/*
Uso: python test_create_api.py
Requer: backend rodando em http://127.0.0.1:8765
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

API = "http://127.0.0.1:8765"
PASS = 0
FAIL = 0
ERRORS = []


def request(method: str, path: str, body: dict = None) -> tuple:
    url = f"{API}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 0, {"error": str(e)}


def test(name: str, condition: bool, detail: str = ""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        msg = f"  ❌ {name} — {detail}"
        print(msg)
        ERRORS.append(msg)


def section(title: str):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


# ═══════════════════════════════════════════════════════════════════
section("1. Testar /api/create/stacks")
# ═══════════════════════════════════════════════════════════════════

status, data = request("GET", "/api/create/stacks")
test("GET /api/create/stacks retorna 200", status == 200, f"status={status}")
test("Retorna lista de stacks", "stacks" in data, f"keys={list(data.keys())}")

stacks = data.get("stacks", [])
test("Lista não está vazia", len(stacks) > 0, f"count={len(stacks)}")

# Check for key stacks and their statuses
stack_map = {s["id"]: s for s in stacks}
for required_id in ("static_site", "java_springboot", "python_fastapi", "angular", "vue", "blazor"):
    test(f"Stack '{required_id}' presente na lista", required_id in stack_map, f"found={required_id in stack_map}")

# Status checks
if "static_site" in stack_map:
    test("static_site status = stable", stack_map["static_site"]["status"] == "stable", f"got={stack_map['static_site']['status']}")
if "python_fastapi" in stack_map:
    test("python_fastapi status = stable", stack_map["python_fastapi"]["status"] == "stable", f"got={stack_map['python_fastapi']['status']}")
if "angular" in stack_map:
    test("angular status = partial", stack_map["angular"]["status"] == "partial", f"got={stack_map['angular']['status']}")
if "vue" in stack_map:
    test("vue status = not_implemented", stack_map["vue"]["status"] == "not_implemented", f"got={stack_map['vue']['status']}")
if "blazor" in stack_map:
    test("blazor status = not_implemented", stack_map["blazor"]["status"] == "not_implemented", f"got={stack_map['blazor']['status']}")


# ═══════════════════════════════════════════════════════════════════
section("2. Testar /api/create/stack/springboot")
# ═══════════════════════════════════════════════════════════════════

status, data = request("GET", "/api/create/stack/springboot")
test("GET /api/create/stack/springboot retorna 200", status == 200, f"status={status}")

forbidden_terms = data.get("forbidden_terms", [])
test("forbidden_terms contém FastAPI", "FastAPI" in forbidden_terms, f"terms={forbidden_terms}")
test("forbidden_terms contém Pydantic", "Pydantic" in forbidden_terms)
test("forbidden_terms contém Uvicorn", "Uvicorn" in forbidden_terms)
test("forbidden_terms contém SQLAlchemy", "SQLAlchemy" in forbidden_terms)
test("forbidden_terms contém Laravel Sanctum", "Laravel Sanctum" in forbidden_terms)
test("forbidden_terms contém Blazor", "Blazor" in forbidden_terms)
test("forbidden_terms NÃO contém Spring Security", "Spring Security" not in forbidden_terms, "Spring Security é permitido no Spring Boot")

# Allowed databases
dbs = data.get("allowed_databases", [])
test("allowed_databases contém PostgreSQL", "PostgreSQL" in dbs)
test("allowed_databases contém MySQL", "MySQL" in dbs)
test("allowed_databases contém H2", "H2" in dbs)
test("allowed_databases NÃO contém SQLite (não é H2/PostgreSQL/MySQL)", "SQLite" not in dbs)

# Allowed auth
auth = data.get("allowed_auth", [])
test("allowed_auth contém Spring Security", "Spring Security" in auth)
test("allowed_auth contém Keycloak", "Keycloak" in auth)
test("allowed_auth contém JWT", "JWT" in auth)
test("allowed_auth contém OAuth2", "OAuth2" in auth)

# Name
test("name = 'Java + Spring Boot'", data.get("name") == "Java + Spring Boot", f"got={data.get('name')}")


# ═══════════════════════════════════════════════════════════════════
section("3. Testar /api/create/stack/static-site")
# ═══════════════════════════════════════════════════════════════════

status, data = request("GET", "/api/create/stack/static-site")
test("GET /api/create/stack/static-site retorna 200", status == 200, f"status={status}")

test("name contém 'Static Site'", "Static" in data.get("name", ""), f"got={data.get('name')}")
test("category = 'static'", data.get("category") == "static", f"got={data.get('category')}")
test("status = 'stable'", data.get("status") == "stable", f"got={data.get('status')}")

forbidden = data.get("forbidden_terms", [])
test("forbidden_terms contém 'backend'", "backend" in forbidden)
test("forbidden_terms contém 'database'", "database" in forbidden)
test("forbidden_terms contém 'JWT'", "JWT" in forbidden)

dbs = data.get("allowed_databases", [])
test("allowed_databases contém 'None'", "None" in dbs)
test("allowed_databases NÃO tem PostgreSQL (static não precisa de banco)", "PostgreSQL" not in dbs)

auth = data.get("allowed_auth", [])
test("allowed_auth contém 'None'", "None" in auth)
test("allowed_auth NÃO tem JWT (static não precisa de auth)", auth == ["None"], f"got={auth}")

required = data.get("required_files", [])
test("required_files contém 'index.html'", "index.html" in required)


# ═══════════════════════════════════════════════════════════════════
section("4. Testar /api/create/validate com payload inválido (Spring Boot + Pydantic)")
# ═══════════════════════════════════════════════════════════════════

payload_invalid = {
    "stack_profile_id": "java_springboot",
    "project_name": "TesteInvalido",
    "selected_versions": {"java": "21"},
    "selected_stack_options": {"ORM": ["Pydantic"]},
}
status, data = request("POST", "/api/create/validate", payload_invalid)
test("POST /api/create/validate retorna 200", status == 200, f"status={status}")
test("valid = False", data.get("valid") is False, f"got={data.get('valid')}")

errors = data.get("errors", [])
has_forbidden = any("Pydantic" in e for e in errors)
test("Erro menciona 'Pydantic' como incompatível", has_forbidden, f"errors={errors}")

# Also test with FastAPI term in the project name
payload_invalid2 = {
    "stack_profile_id": "java_springboot",
    "project_name": "FastAPITest",
}
status2, data2 = request("POST", "/api/create/validate", payload_invalid2)
errors2 = data2.get("errors", [])
has_fastapi_error = any("FastAPI" in e for e in errors2)
test("Erro quando nome contém 'FastAPI' no Spring Boot", has_fastapi_error, f"errors={errors2}")


# ═══════════════════════════════════════════════════════════════════
section("5. Testar /api/create com Static Site")
# ═══════════════════════════════════════════════════════════════════

payload_static = {
    "project_type": "static_site",
    "stack_profile_id": "static_site",
    "backend_stack": "static_site",
    "frontend_stack": "html_css_js",
    "project_name": "LandingForgeAI",
    "confirmed_entities": ["home", "servicos", "sobre", "contato", "faq"],
    "confirmed_features": ["seo", "responsividade", "formulario_contato"],
}
status, data = request("POST", "/api/create", payload_static)
test("POST /api/create static retorna 200", status == 200, f"status={status}")
test("success = True", data.get("success") is True, f"got={data.get('success')}")
test("project_name = 'LandingForgeAI'", data.get("project_name") == "LandingForgeAI", f"got={data.get('project_name')}")
test("stack contém 'Static Site'", "Static" in data.get("stack", ""), f"got={data.get('stack')}")

# Verify files were generated
project_path = os.path.join("generated_projects", "landingforgeai")
index_html = os.path.join(project_path, "index.html")
css_dir = os.path.join(project_path, "assets", "css")
js_dir = os.path.join(project_path, "assets", "js")

test(f"index.html existe em {project_path}", os.path.exists(index_html), f"path={index_html}")
test(f"assets/css/ existe", os.path.exists(css_dir), f"path={css_dir}")
test(f"assets/js/ existe", os.path.exists(js_dir), f"path={js_dir}")

# Verify style.css exists
style_css = os.path.join(css_dir, "style.css")
test(f"style.css existe", os.path.exists(style_css), f"path={style_css}")

# Verify NO Python files generated
python_files = []
for root, dirs, files in os.walk(project_path):
    for f in files:
        if f.endswith(".py"):
            python_files.append(os.path.join(root, f))
test("NENHUM arquivo .py gerado", len(python_files) == 0, f"found={python_files}")

# Verify NO requirements.txt
req_txt = os.path.join(project_path, "requirements.txt")
test("requirements.txt NÃO existe", not os.path.exists(req_txt), f"path={req_txt}")


# ═══════════════════════════════════════════════════════════════════
section("6. Testar /api/create com Spring Boot")
# ═══════════════════════════════════════════════════════════════════

payload_springboot = {
    "project_type": "api",
    "stack_profile_id": "java_springboot",
    "backend_stack": "java_springboot",
    "frontend_stack": "angular",
    "project_name": "SistemaGestao",
    "selected_versions": {"java": "21", "spring_boot": "3.3"},
    "confirmed_entities": ["Usuario", "Agendamento"],
    "confirmed_features": ["Cadastro de usuário", "Agendamento"],
}
status, data = request("POST", "/api/create", payload_springboot)
test("POST /api/create springboot retorna 200", status == 200, f"status={status}")
test("success = True", data.get("success") is True, f"got={data.get('success')}")
test("project_name = 'SistemaGestao'", data.get("project_name") == "SistemaGestao", f"got={data.get('project_name')}")
test("stack contém 'Spring Boot'", "Spring" in data.get("stack", ""), f"got={data.get('stack')}")

# Verify Java files generated
sb_path = os.path.join("generated_projects", "sistemagestao", "backend")
pom_xml = os.path.join(sb_path, "pom.xml")
test(f"pom.xml existe em {sb_path}", os.path.exists(pom_xml), f"path={pom_xml}")

# Verify NO Python/requirements.txt
req_txt = os.path.join(sb_path, "requirements.txt")
test("requirements.txt NÃO existe no projeto Spring Boot", not os.path.exists(req_txt), f"path={req_txt}")
py_files = [f for f in os.listdir(sb_path) if f.endswith(".py")] if os.path.exists(sb_path) else []
test("NENHUM arquivo .py na raiz do projeto Spring Boot", len(py_files) == 0, f"found={py_files}")

# Check Java source directory exists
java_src = os.path.join(sb_path, "src", "main", "java")
test(f"src/main/java/ existe", os.path.exists(java_src) if os.path.exists(sb_path) else False, f"path={java_src}")


# ═══════════════════════════════════════════════════════════════════
section("7. Testar /api/create com Angular")
# ═══════════════════════════════════════════════════════════════════

payload_angular = {
    "project_type": "frontend",
    "stack_profile_id": "angular",
    "frontend_stack": "angular",
    "project_name": "MeuAngularApp",
}
status, data = request("POST", "/api/create", payload_angular)
test("POST /api/create angular retorna 200", status == 200, f"status={status}")
test("success = True", data.get("success") is True, f"got={data.get('success')}")
test("stack contém 'Angular'", "Angular" in data.get("stack", ""), f"got={data.get('stack')}")

# Verify Angular files
ng_path = os.path.join("generated_projects", "meuangulrapp", "frontend")
ng_package = os.path.join(ng_path, "package.json")
test(f"package.json existe em {ng_path}", os.path.exists(ng_package), f"path={ng_package}")

# Verify NO backend generated
backend_path = os.path.join("generated_projects", "meuangulrapp", "backend")
test("NÃO existe diretório backend/ para Angular", not os.path.exists(backend_path), f"path={backend_path}")


# ═══════════════════════════════════════════════════════════════════
section("8. Quality Gate — Projeto vazio / stack errada")
# ═══════════════════════════════════════════════════════════════════

# 8a. Projeto vazio (sem nome)
payload_empty = {
    "project_type": "api",
    "stack_profile_id": "java_springboot",
    "project_name": "",
}
status, data = request("POST", "/api/create", payload_empty)
# This should either fail validation or fail generation
test("Projeto vazio (sem nome) NÃO é bem-sucedido", data.get("success") is not True, f"got={data.get('success')}")

# 8b. Stack ID inválido
payload_bad_stack = {
    "project_type": "api",
    "stack_profile_id": "stack_invalida_xyz",
    "project_name": "ProjetoInvalido",
}
status, data = request("POST", "/api/create", payload_bad_stack)
test("Stack inválida NÃO é bem-sucedida", data.get("success") is not True, f"got={data.get('success')}")
test("Stack inválida retorna erro_code", "error_code" in data, f"got={data.get('error_code')}")

# 8c. Stack errada — usar FastAPI options com Spring Boot
payload_wrong_stack = {
    "project_type": "api",
    "stack_profile_id": "java_springboot",
    "project_name": "ProjetoSpringComPydantic",
    "selected_stack_options": {"ORM": ["Pydantic", "SQLAlchemy"]},
}
status, data = request("POST", "/api/create", payload_wrong_stack)
test("Spring Boot + Pydantic/SQLAlchemy NÃO é bem-sucedido", data.get("success") is not True, f"got={data.get('success')}")
test("Erro menciona termos proibidos", len(data.get("details", [])) > 0, f"details={data.get('details')}")


# ═══════════════════════════════════════════════════════════════════
section("9. Testar fallback — Vue / Blazor (não implementados)")
# ═══════════════════════════════════════════════════════════════════

payload_vue = {
    "project_type": "frontend",
    "stack_profile_id": "vue",
    "frontend_stack": "vue",
    "project_name": "VueAppTest",
}
status, data = request("POST", "/api/create", payload_vue)
test("Vue retorna STACK_NOT_IMPLEMENTED", data.get("error_code") == "STACK_NOT_IMPLEMENTED", f"got={data.get('error_code')}")
test("Vue NÃO gera projeto (success != True)", data.get("success") is not True, f"got={data.get('success')}")

# Verify no Python files generated for Vue
vue_path = os.path.join("generated_projects", "vueapptest")
test("NENHUM diretório criado para Vue (não implementado)", not os.path.exists(vue_path), f"path={vue_path}")


# ═══════════════════════════════════════════════════════════════════
section("10. Testar DotNet (stub com NotImplementedError)")
# ═══════════════════════════════════════════════════════════════════

payload_dotnet = {
    "project_type": "api",
    "stack_profile_id": "dotnet_aspnetcore",
    "backend_stack": "dotnet_aspnetcore",
    "project_name": "DotNetAppTest",
}
status, data = request("POST", "/api/create", payload_dotnet)
test("DotNet retorna STACK_NOT_IMPLEMENTED ou sucesso", data.get("error_code") in ("STACK_NOT_IMPLEMENTED", None), f"got={data.get('error_code')}")
# DotNet has a stub that raises NotImplementedError — should be caught


# ═══════════════════════════════════════════════════════════════════
section("RESUMO FINAL")
# ═══════════════════════════════════════════════════════════════════

total = PASS + FAIL
print(f"\n  ✅ Passou: {PASS}/{total}")
print(f"  ❌ Falhou: {FAIL}/{total}")
if ERRORS:
    print(f"\n  Detalhes das falhas:")
    for e in ERRORS:
        print(f"    {e}")

print(f"\n  Projetos gerados durante o teste:")
for p in ["landingforgeai", "sistemagestao", "meuangulrapp"]:
    p_path = os.path.join("generated_projects", p)
    if os.path.exists(p_path):
        print(f"    📁 {p_path}/")

sys.exit(0 if FAIL == 0 else 1)
