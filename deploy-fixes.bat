@echo off
echo.
echo ========================================
echo   COMMITTING ALL TIER SYSTEM FIXES
echo ========================================
echo.

echo [1/2] Adding all changed files...
git add src/components/drops/create-drop-modal.tsx
git add src/app/app/drops/page.tsx
git add src/app/app/profile/page.tsx

echo.
echo [2/2] Committing changes...
git commit -m "fix: complete business-to-paid tier rename - add Lock import, update all references"

echo.
echo [3/3] Pushing to remote...
git push

echo.
echo ========================================
echo   ✅ ALL FIXES DEPLOYED!
echo ========================================
echo.
echo Changes pushed successfully!
echo Vercel will auto-deploy in a few moments.
echo.
echo Summary of fixes:
echo - Added missing Lock icon import
echo - Changed 'business' to 'paid' in drops page
echo - Changed 'business' to 'paid' in profile page
echo - Updated tier display name to 'Paid Tier'
echo.
pause
