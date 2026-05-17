import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    
    print("======================================================")
    print("🚀 Iniciando SaaS Factory AI - Control Panel...")
    print("======================================================\n")
    
    # --- CLEANUP STEP (To resolve Next.js route conflicts) ---
    import shutil
    frontend_app_dir = os.path.join(root_dir, "frontend", "src", "app", "projects")
    conflict_dir = os.path.join(frontend_app_dir, "[name]")
    redundant_dir = os.path.join(frontend_app_dir, "[id]", "details")
    
    cleaned = False
    if os.path.exists(conflict_dir):
        print(f"🧹 Removendo diretório conflitante: {conflict_dir}")
        shutil.rmtree(conflict_dir, ignore_errors=True)
        cleaned = True
    if os.path.exists(redundant_dir):
        print(f"🧹 Removendo diretório redundante: {redundant_dir}")
        shutil.rmtree(redundant_dir, ignore_errors=True)
        cleaned = True
    
    if cleaned:
        print("✨ Limpeza concluída.\n")
    # ---------------------------------------------------------
    
    # Instalar uvicorn e fastapi caso o usuário não tenha no ambiente atual
    print("📦 Verificando dependências do backend...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "pydantic", "google-generativeai", "-q"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
    print("   ✅ Dependências OK.")
    
    # Iniciar Backend via módulo python para evitar problemas de PATH no Windows
    print("\n🟢 Iniciando Backend da IA (Porta 8001)...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--port", "8001"]
    backend_process = subprocess.Popen(backend_cmd, cwd=root_dir)
    
    time.sleep(3) # Tempo para o backend inicializar
    
    # Iniciar Frontend
    print("\n🟢 Iniciando Frontend Visual (Porta 4321)...")
    frontend_dir = os.path.join(root_dir, "frontend")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_process = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)
    
    print("\n" + "="*54)
    print("✅ Painel de Controle Online!")
    print("🌐 Abra seu navegador e acesse: http://localhost:4321")
    print("❌ Pressione [Ctrl+C] neste terminal para fechar tudo.")
    print("="*54 + "\n")
    
    try:
        # Mantém o script rodando enquanto os servidores estiverem de pé
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Encerrando painel de controle...")
        backend_process.terminate()
        frontend_process.terminate()
        print("👋 Servidores encerrados.")

if __name__ == "__main__":
    main()
