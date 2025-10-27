@echo off
echo ====================================
echo Trackyfy Biometric Server Installer
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js detected: 
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Creating .env file...
if not exist ".env" (
    copy config\.env.example .env
    echo .env file created. Please edit it with your settings.
) else (
    echo .env file already exists.
)
echo.

echo [4/4] Installation complete!
echo.
echo ====================================
echo Next Steps:
echo ====================================
echo 1. Edit .env file with your settings
echo 2. Run 'setup-cloudflare.bat' to setup Cloudflare Tunnel
echo 3. Run 'install-service.bat' to install as Windows Service
echo    OR
echo    Run 'start-server.bat' to start server manually
echo ====================================
echo.
pause
