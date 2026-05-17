@echo off
echo ======================================================
echo 📦 SaaS Factory AI - Instalador de Dependencias Locais
echo ======================================================
echo.
echo Tentando instalar via 'python -m pip'...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo Tentando instalar via 'py -m pip'...
    py -m pip install -r requirements.txt
)
if %errorlevel% neq 0 (
    echo.
    echo Tentando instalar via 'pip' direto...
    pip install -r requirements.txt
)

echo.
echo ======================================================
echo ✅ Processo concluido! Se houve erro acima, verifique 
echo se o Python esta instalado em seu Windows.
echo ======================================================
pause
