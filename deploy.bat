@echo off
REM =================================================================
REM Trove - Git Commit and Vercel Deploy Script (Windows)
REM =================================================================

echo.
echo ========================================
echo   TROVE DEPLOYMENT SCRIPT
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Checking git status...
echo.
git status
echo.

REM Ask for confirmation
set /p CONFIRM="Do you want to commit and push these changes? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo [2/5] Adding all changes to git...
git add .

echo.
echo [3/5] Committing changes...
echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=feat: update tier system - adjust file size limits and fix EditDropModal integration
)

git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo.
    echo ERROR: Git commit failed
    pause
    exit /b 1
)

echo.
echo [4/5] Pushing to remote repository...
git push

if errorlevel 1 (
    echo.
    echo ERROR: Git push failed
    echo Please check your git configuration and try again
    pause
    exit /b 1
)

echo.
echo [5/5] Triggering Vercel deployment...
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Vercel CLI not found
    echo.
    echo To deploy to Vercel:
    echo 1. Install Vercel CLI: npm i -g vercel
    echo 2. Run: vercel --prod
    echo.
    echo OR: Vercel will auto-deploy from your git push if connected
    echo.
) else (
    set /p DEPLOY="Deploy to Vercel now? (y/n): "
    if /i "%DEPLOY%"=="y" (
        echo.
        echo Deploying to production...
        vercel --prod
    ) else (
        echo.
        echo Skipping Vercel deployment
        echo Vercel will auto-deploy from git push if connected
        echo.
    )
)

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Changes committed and pushed successfully!
echo.
echo Next steps:
echo - Check your git repository for the new commit
echo - Monitor Vercel dashboard for deployment status
echo - Test the live site once deployment completes
echo.

pause
