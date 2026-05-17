import os
import shutil

root_dir = r"c:\Users\louvens\OneDrive\Projet_MltAgents"

def move_contents(src, dest):
    if os.path.exists(src):
        os.makedirs(dest, exist_ok=True)
        for item in os.listdir(src):
            try:
                shutil.move(os.path.join(src, item), os.path.join(dest, item))
            except Exception as e:
                print(f"Error moving {item}: {e}")

# Move src/validators to security_engine
move_contents(os.path.join(root_dir, "src", "validators"), os.path.join(root_dir, "security_engine", "validators"))

# Move src/blueprints to templates
move_contents(os.path.join(root_dir, "src", "blueprints"), os.path.join(root_dir, "templates", "blueprints"))

# Move src/briefing to prompt_engine/briefing
move_contents(os.path.join(root_dir, "src", "briefing"), os.path.join(root_dir, "prompt_engine", "briefing"))

# Remove src/generators
gen_dir = os.path.join(root_dir, "src", "generators")
if os.path.exists(gen_dir):
    shutil.rmtree(gen_dir)

# Remove control_panel completely
cp_dir = os.path.join(root_dir, "control_panel")
if os.path.exists(cp_dir):
    shutil.rmtree(cp_dir)
    
# Remove src completely
src_dir = os.path.join(root_dir, "src")
if os.path.exists(src_dir):
    shutil.rmtree(src_dir)

print("Cleanup and final moves completed.")
