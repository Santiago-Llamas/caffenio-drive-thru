@echo off
echo ============================================
echo    CAFFENIO DRIVE-THRU - SETUP COMPLETO
echo ============================================
echo.

echo [1/3] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no instalado. Descarga desde https://python.org
    pause
    exit /b 1
) else (
    echo ✅ Python encontrado
)

echo.
echo [2/3] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no instalado. Descarga desde https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado
)

echo.
echo [3/3] Instalando dependencias...
echo.

echo Instalando dependencias del backend...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)

echo.
echo Instalando dependencias del bridge...
cd ..
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del bridge
    pause
    exit /b 1
)

echo.
echo Instalando dependencias del frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo ============================================
echo         ✅ SETUP COMPLETADO
echo ============================================
echo.
echo Ahora ejecuta los 3 comandos en terminales separadas:
echo.
echo Terminal 1: cd backend && python main.py
echo Terminal 2: node bridge.js
echo Terminal 3: cd frontend && npm run dev
echo.
echo Luego abre: http://localhost:3000
echo.
pause