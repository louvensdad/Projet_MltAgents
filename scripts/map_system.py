import os
import re
import json
from collections import defaultdict

def scan_directory(base_path, ignore_dirs=('.git', 'node_modules', '__pycache__', '.next', 'generated_projects', 'backups')):
    files_list = []
    for root, dirs, files in os.walk(base_path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            files_list.append(os.path.join(root, file))
    return files_list

def find_patterns(files, patterns):
    results = defaultdict(list)
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                for key, regex in patterns.items():
                    matches = re.finditer(regex, content, re.MULTILINE | re.IGNORECASE)
                    for match in matches:
                        line_no = content[:match.start()].count('\n') + 1
                        results[key].append(f"{file_path}:{line_no} - {match.group(0).strip()[:100]}")
        except Exception:
            pass
    return results

def main():
    root_dir = "c:\\Users\\louvens\\OneDrive\\Projet_MltAgents"
    backend_dirs = [os.path.join(root_dir, 'src'), os.path.join(root_dir, 'control_panel', 'backend')]
    frontend_dir = [os.path.join(root_dir, 'control_panel', 'frontend')]
    
    backend_files = []
    for bd in backend_dirs:
        backend_files.extend(scan_directory(bd))
    frontend_files = scan_directory(frontend_dir[0])
    
    # 1. Architecture Inventory
    with open(os.path.join(root_dir, 'reports', 'architecture_inventory.md'), 'w', encoding='utf-8') as f:
        f.write("# Architecture Inventory\n\n")
        f.write("## Backend Structure\n")
        f.write("### Rotas / Services / Schemas / Validators / Gatekeepers / Routers\n")
        for file in sorted(backend_files):
            f.write(f"- {os.path.relpath(file, root_dir)}\n")
        f.write("\n## Frontend Structure\n")
        f.write("### Dashboard, Wizard, Projects, Settings, etc.\n")
        for file in sorted(frontend_files):
            f.write(f"- {os.path.relpath(file, root_dir)}\n")

    # 2. Dead Code Report
    dead_code_patterns = {
        'TODOs & FIXMEs': r'(TODO|FIXME).*',
        'Passes / Empty Blocks': r'def \w+\(.*\):\s+pass',
        'Commented Code': r'^\s*#\s*def\s+|^\s*//\s*function\s+',
        'Mocks / Fakes': r'(mock|fake|dummy|test_mode)',
        'Parallel Generators / Duplicates': r'(_old|v1|backup)',
    }
    dead_code = find_patterns(backend_files + frontend_files, dead_code_patterns)
    with open(os.path.join(root_dir, 'reports', 'dead_code_report.md'), 'w', encoding='utf-8') as f:
        f.write("# Dead Code & Mocks Report\n\n")
        for category, items in dead_code.items():
            f.write(f"## {category}\n")
            for item in items[:100]: # Limit to 100 per category to keep it readable
                f.write(f"- `{item}`\n")
            f.write("\n")

    # 3. Route Conflicts
    route_patterns = {
        'Backend Routes': r'@(?:app|router)\.(?:get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]',
        'Frontend Routes': r'path:\s*[\'"]([^\'"]+)[\'"]|href=[\'"]([^\'"]+)[\'"]',
    }
    routes = find_patterns(backend_files + frontend_files, route_patterns)
    with open(os.path.join(root_dir, 'reports', 'route_conflicts.md'), 'w', encoding='utf-8') as f:
        f.write("# Route Conflicts & Broken Routes\n\n")
        for category, items in routes.items():
            f.write(f"## {category}\n")
            for item in items[:200]:
                f.write(f"- `{item}`\n")
            f.write("\n")
            
    # 4. Duplicated Components
    frontend_patterns = {
        'Hardcoded Fetches': r'fetch\([\'"]http://localhost.*[\'"]\)',
        'Orphan / Unused Components': r'(//|<!--)?\s*TODO.*remove.*',
        'Dead States': r'const \[[^\]]+\] = useState\(.* // dead',
    }
    frontend_issues = find_patterns(frontend_files, frontend_patterns)
    with open(os.path.join(root_dir, 'reports', 'duplicated_components.md'), 'w', encoding='utf-8') as f:
        f.write("# Duplicated & Orphan Components\n\n")
        for category, items in frontend_issues.items():
            f.write(f"## {category}\n")
            for item in items[:100]:
                f.write(f"- `{item}`\n")
            f.write("\n")

    # 5. Old Pipeline Report
    pipeline_patterns = {
        'Validation Bypass': r'return True #\s*bypass|skip_validation|validate=False',
        'Fake Integrations': r'Fake\w+Client|Mock\w+Service',
        'Old Generators': r'class \w+Old|def generate_v1',
    }
    pipeline_issues = find_patterns(backend_files, pipeline_patterns)
    with open(os.path.join(root_dir, 'reports', 'old_pipeline_report.md'), 'w', encoding='utf-8') as f:
        f.write("# Old Pipeline & Bypasses Report\n\n")
        f.write("## Real Pipeline Trace\n")
        f.write("Wizard -> Prompt Gen -> Validator -> Doc Engine -> Gatekeeper -> AI Router -> Project Runner -> Q Gate -> Sec Gate -> Download\n\n")
        for category, items in pipeline_issues.items():
            f.write(f"## {category}\n")
            for item in items:
                f.write(f"- `{item}`\n")
            f.write("\n")

if __name__ == '__main__':
    main()
