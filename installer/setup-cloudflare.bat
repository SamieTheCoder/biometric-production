@echo off
echo ====================================
echo Cloudflare Tunnel Setup Guide
echo ====================================
echo.
echo This will guide you through setting up Cloudflare Tunnel
echo to expose your local server with a permanent public URL.
echo.
echo Prerequisites:
echo - Cloudflare account (free)
echo - A domain added to Cloudflare (can be free)
echo.
pause

echo.
echo [STEP 1] Download cloudflared
echo ====================================
echo 1. Go to: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
echo 2. Download cloudflared for Windows
echo 3. Place cloudflared.exe in C:\cloudflared\
echo.
pause

echo.
echo [STEP 2] Install cloudflared
echo ====================================
echo Run these commands in Administrator PowerShell:
echo.
echo    cd C:\cloudflared
echo    .\cloudflared.exe service install
echo.
pause

echo.
echo [STEP 3] Login to Cloudflare
echo ====================================
echo Run this command:
echo.
echo    .\cloudflared.exe login
echo.
echo This will open your browser to authenticate.
pause

echo.
echo [STEP 4] Create Tunnel
echo ====================================
echo Run this command:
echo.
echo    .\cloudflared.exe tunnel create trackyfy-biometric
echo.
echo Save the Tunnel ID shown in the output!
pause

echo.
echo [STEP 5] Create config.yml
echo ====================================
echo Create file: C:\cloudflared\config.yml
echo.
echo Paste this content (replace TUNNEL_ID and yourdomain.com):
echo.
echo tunnel: TUNNEL_ID
echo credentials-file: C:\Users\%USERNAME%\.cloudflared\TUNNEL_ID.json
echo.
echo ingress:
echo   - hostname: biometric.yourdomain.com
echo     service: http://localhost:3000
echo   - service: http_status:404
echo.
pause

echo.
echo [STEP 6] Create DNS Record
echo ====================================
echo Run this command:
echo.
echo    .\cloudflared.exe tunnel route dns trackyfy-biometric biometric.yourdomain.com
echo.
pause

echo.
echo [STEP 7] Start Tunnel
echo ====================================
echo Run this command:
echo.
echo    .\cloudflared.exe tunnel run trackyfy-biometric
echo.
echo Or install as Windows Service:
echo    .\cloudflared.exe service install
echo.
pause

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Your public URL: https://biometric.yourdomain.com
echo.
echo This URL will remain the same even after system restarts!
echo.
echo Update your .env file with:
echo PUBLIC_URL=https://biometric.yourdomain.com
echo.
pause
