import os
import shutil

root_dir = r"c:\Users\louvens\OneDrive\Projet_MltAgents"

# New directories to create
new_dirs = [
    "frontend",
    "backend",
    "agents",
    "orchestrator",
    "prompt_engine",
    "knowledge_engine",
    "generation_engine",
    "security_engine",
    "preview_engine",
    "templates",
    "shared",
    "docs",
    "stack_registry"
]

for d in new_dirs:
    path = os.path.join(root_dir, d)
    os.makedirs(path, exist_ok=True)

# Move control_panel/frontend to frontend
cp_frontend = os.path.join(root_dir, "control_panel", "frontend")
root_frontend = os.path.join(root_dir, "frontend")
if os.path.exists(cp_frontend):
    for item in os.listdir(cp_frontend):
        shutil.move(os.path.join(cp_frontend, item), os.path.join(root_frontend, item))

# Move control_panel/backend to backend
cp_backend = os.path.join(root_dir, "control_panel", "backend")
root_backend = os.path.join(root_dir, "backend")
if os.path.exists(cp_backend):
    for item in os.listdir(cp_backend):
        shutil.move(os.path.join(cp_backend, item), os.path.join(root_backend, item))

# Move src/agents to agents
src_agents = os.path.join(root_dir, "src", "agents")
root_agents = os.path.join(root_dir, "agents")
if os.path.exists(src_agents):
    for item in os.listdir(src_agents):
        shutil.move(os.path.join(src_agents, item), os.path.join(root_agents, item))

# Move src/prompt_engine to prompt_engine
src_prompt = os.path.join(root_dir, "src", "prompt_engine")
root_prompt = os.path.join(root_dir, "prompt_engine")
if os.path.exists(src_prompt):
    for item in os.listdir(src_prompt):
        shutil.move(os.path.join(src_prompt, item), os.path.join(root_prompt, item))

# Move src/documentation_engine to knowledge_engine
src_doc = os.path.join(root_dir, "src", "documentation_engine")
root_knowledge = os.path.join(root_dir, "knowledge_engine")
if os.path.exists(src_doc):
    for item in os.listdir(src_doc):
        shutil.move(os.path.join(src_doc, item), os.path.join(root_knowledge, item))

# We will handle src/generators and backend/generators by deleting them later.
# Let's write this script to run the structural changes.
print("Structural migration completed successfully.")
