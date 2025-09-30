@echo off
echo.
echo ========================================
echo   TROVE - UI UPDATE DEPLOYMENT
echo ========================================
echo.

REM Check if sonner is installed
findstr /C:"sonner" package.json >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Sonner not installed!
    echo.
    echo Please run: npm install sonner
    echo.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Running TypeScript check...
call npm run typecheck
if errorlevel 1 (
    echo [ERROR] TypeScript errors found!
    echo Please fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo [3/5] Testing production build...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed!
    echo Please fix build errors before deploying.
    pause
    exit /b 1
)

echo.
echo [4/5] Staging changes...
git add .

echo.
echo [5/5] Creating commit...
git commit -m "feat: Enhanced create drop modal UI with tier restrictions - Added Sonner toast system for user-friendly notifications - Implemented card-based retrieval mode selection - Added Premium badges and upgrade prompts - Enhanced error handling with actionable CTAs - Improved visual hierarchy with icons and color coding"

if errorlevel 1 (
    echo [ERROR] Git commit failed!
    echo Check if there are changes to commit.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   READY TO DEPLOY!
echo ========================================
echo.
echo The commit is ready. Push to deploy:
echo   git push origin main
echo.
echo This will trigger Vercel deployment.
echo Deployment will take 2-4 minutes.
echo.
echo Press any key to PUSH NOW, or Ctrl+C to cancel...
pause >nul

echo.
echo Pushing to origin/main...
git push origin main

if errorlevel 1 (
    echo [ERROR] Git push failed!
    echo Please check your git configuration and network connection.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOYMENT TRIGGERED!
echo ========================================
echo.
echo Check Vercel dashboard for deployment status:
echo https://vercel.com/dashboard
echo.
echo Deployment typically takes 2-4 minutes.
echo.
pause
