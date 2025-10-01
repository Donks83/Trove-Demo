@echo off
echo.
echo Checking for any remaining 'business' references...
echo.

cd C:\Claude\trove

echo Searching all TypeScript/JavaScript files...
findstr /s /i /n "business" src\*.tsx src\*.ts src\*.jsx src\*.js 2>nul

if errorlevel 1 (
    echo.
    echo ✅ No 'business' references found locally!
    echo.
) else (
    echo.
    echo ❌ Found 'business' references above.
    echo.
)

echo.
echo Checking git status...
git status

echo.
echo Checking git diff...
git diff

echo.
echo.
set /p PUSH="Push all changes to fix build? (y/n): "
if /i "%PUSH%"=="y" (
    git add -A
    git commit -m "fix: ensure all business->paid changes are committed"
    git push
    echo.
    echo ✅ Pushed! Vercel will rebuild.
) else (
    echo Cancelled.
)

pause
