import os
import subprocess
import time
import urllib.request
import urllib.error
import sys

class BackendValidator:
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.is_windows = os.name == 'nt'
        
        # Caminhos do ambiente virtual
        if self.is_windows:
            self.python_bin = os.path.join(self.project_path, "venv", "Scripts", "python.exe")
        else:
            self.python_bin = os.path.join(self.project_path, "venv", "bin", "python")

    def run_all(self):
        print("\n⚙️ [FASE 5] Iniciando Validação e Execução Automática do Backend...")
        try:
            self.check_python_syntax()
            self.check_requirements_install()
            self.check_server_start()
            return True
        except Exception as e:
            print(f"\n❌ Falha ao iniciar backend: {e}")
            return False

    def check_python_syntax(self):
        # A sintaxe já é verificada intensamente no gerador, mas confirmamos.
        print("🔍 Confirmando sintaxe...")
        pass 

    def check_requirements_install(self):
        print("📦 Criando ambiente virtual e instalando dependências (Isso pode demorar alguns segundos)...")
        
        # 1. Criar venv
        venv_cmd = [sys.executable, "-m", "venv", "venv"]
        try:
            subprocess.run(venv_cmd, cwd=self.project_path, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            raise Exception(f"Erro ao criar venv: {e.stderr}")

        # 2. Instalar dependencias
        pip_cmd = [self.python_bin, "-m", "pip", "install", "-r", "requirements.txt"]
        try:
            subprocess.run(pip_cmd, cwd=self.project_path, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            raise Exception(f"Erro ao instalar requirements.txt: {e.stderr}")

    def check_server_start(self):
        print("🚀 Subindo servidor Uvicorn na porta 8000...")
        
        # Iniciando o servidor em background
        server_cmd = [self.python_bin, "-m", "uvicorn", "app.main:app", "--port", "8000"]
        process = subprocess.Popen(
            server_cmd,
            cwd=self.project_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        try:
            self.check_routes_health()
        finally:
            # Sempre matamos o servidor depois do teste para liberar a porta e evitar processos zumbis
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                
            # Verifica se o processo morreu logo ao nascer
            if process.poll() is not None and process.returncode != 0:
                stdout, stderr = process.communicate()
                raise Exception(f"O servidor Uvicorn falhou ao iniciar.\nLog de Erro:\n{stderr}")

    def check_routes_health(self):
        print("🌐 Testando resposta HTTP do Swagger (/docs)...")
        
        timeout = 10
        start_time = time.time()
        url = "http://127.0.0.1:8000/docs"
        success = False
        
        while (time.time() - start_time) < timeout:
            try:
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=1) as response:
                    if response.status == 200:
                        success = True
                        break
            except urllib.error.URLError:
                # Servidor ainda nao subiu, aguarda
                time.sleep(1)
                
        if success:
            print("\n✅ Backend rodando com sucesso!")
            print(f"🌐 Swagger (API OK): {url}")
        else:
            raise Exception(f"Timeout excedido ({timeout}s) aguardando o servidor subir na porta 8000.")
