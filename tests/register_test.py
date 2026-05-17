import json
from pathlib import Path

DATA_FILE = Path('control_panel/backend/data/projects.json')
DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

if not DATA_FILE.exists():
    DATA_FILE.write_text('[]', encoding='utf-8')

projects = json.loads(DATA_FILE.read_text(encoding='utf-8'))

# Add test project
test_project = {
    'id': 'test1234',
    'name': 'Teste Download',
    'type': 'api',
    'stack': 'FastAPI',
    'path': 'generated_projects/teste_download',
    'created_at': '2026-05-01T10:00:00',
    'status': 'generated',
    'payment_status': 'pending_payment',
    'ai_boost_status': 'inactive',
    'upgrade_status': 'none',
    'usage': {'ai_requests_used': 0, 'ai_requests_limit': 50}
}

projects.append(test_project)
DATA_FILE.write_text(json.dumps(projects, ensure_ascii=False, indent=2), encoding='utf-8')
print('✅ Projeto de teste registrado: test1234')
