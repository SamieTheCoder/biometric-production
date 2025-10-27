@echo off
echo ====================================
echo Installing Windows Service
echo ====================================
echo.
echo NOTE: This requires Administrator privileges
echo Right-click and select "Run as Administrator"
echo.
pause

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
REM Go up one level to the project root
cd /d "%SCRIPT_DIR%.."

REM Verify we're in the right directory
if not exist "package.json" (
    echo ERROR: Cannot find package.json
    echo Current directory: %CD%
    echo Please ensure you're running from the installer folder
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.
echo Installing Windows Service...
call npm run install-service

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Service installation failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ====================================
echo Service Installation Complete!
echo ====================================
echo.
echo The server will now start automatically when Windows boots.
echo.
echo To manage the service:
echo 1. Press Win+R
echo 2. Type: services.msc
echo 3. Find "Trackyfy Biometric Server"
echo.
pause
