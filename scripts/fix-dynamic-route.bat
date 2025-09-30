@echo off
REM Fix Dynamic Route Naming Conflict
REM This script removes the conflicting [id] folder from git

echo.
echo 🔧 Fixing dynamic route naming conflict...
echo.

cd /d "%~dp0\.."

echo 📋 Checking git status...
git status

echo.
echo 🗑️ Removing [id] folder from git (if it exists)...

REM Remove the [id] folder from git
git rm -rf "src/app/api/drops/[id]" 2>nul
if errorlevel 1 (
    echo    No [id] folder found in git (already clean^)
)

echo.
echo 📝 Current git status after cleanup:
git status

echo.
echo ✅ Cleanup complete!
echo.
echo 📤 Next steps:
echo 1. Review changes above
echo 2. Commit: git commit -m "fix: remove duplicate [id] folder, use [dropId]"
echo 3. Push: git push origin main
echo 4. Vercel will rebuild automatically
echo.

pause
