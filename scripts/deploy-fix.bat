@echo off
echo ====================================
echo Fixing Vercel Build Issue
echo ====================================
echo.

cd /d "%~dp0\.."

echo Step 1: Checking current git status...
echo.
git status
echo.

echo Step 2: Removing any [id] folders from git...
echo.

REM Try to remove [id] folder if it exists
git rm -rf "src/app/api/drops/[id]" 2>nul
if errorlevel 1 (
    echo [id] folder not found in git - that's OK
) else (
    echo Successfully removed [id] folder
)
echo.

echo Step 3: Adding all new files...
echo.
git add src/app/api/drops/[dropId]/route.ts
git add src/lib/firestore-drops.ts
git add src/components/edit-drop-modal.tsx
git add src/components/ui/label.tsx
git add src/components/ui/textarea.tsx
git add src/app/app/drops/page.tsx
echo.

echo Step 4: Showing what will be committed...
echo.
git status
echo.

echo Step 5: Ready to commit and push!
echo.
echo The next command will:
echo - Commit all changes
echo - Push to GitHub
echo - Trigger Vercel rebuild
echo.

set /p CONTINUE="Continue? (y/n): "
if /i "%CONTINUE%"=="y" (
    echo.
    echo Committing changes...
    git commit -m "fix: implement delete/edit using [dropId] convention, remove [id] conflict"
    
    echo.
    echo Pushing to GitHub...
    git push origin main
    
    echo.
    echo ====================================
    echo Success! Vercel is now rebuilding.
    echo ====================================
    echo.
    echo Watch the deployment at:
    echo https://vercel.com/your-account/trove-demo
    echo.
    echo The build should complete in ~2 minutes.
    echo Then delete/edit will work on the live site!
    echo.
) else (
    echo.
    echo Cancelled. No changes were pushed.
    echo.
)

pause
