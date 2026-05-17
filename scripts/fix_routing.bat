@echo off
echo ==============================================
echo 🛠️  Limpando conflitos e cache do Frontend...
echo ==============================================

echo 1. Removendo pasta conflitante [name]...
if exist "control_panel\frontend\src\app\projects\[name]" rd /s /q "control_panel\frontend\src\app\projects\[name]"

echo 2. Limpando cache de build (.next)...
if exist "control_panel\frontend\.next" rd /s /q "control_panel\frontend\.next"

echo.
echo ✅ Tudo limpo! Agora você pode rodar: python start_panel.py
echo ==============================================
pause
