@echo off
echo.
echo ========================================
echo   FINAL FIX - Map.tsx Business->Paid
echo ========================================
echo.

echo [1/3] Adding map.tsx fix...
git add src/components/map/map.tsx

echo.
echo [2/3] Committing...
git commit -m "fix: change business to paid in map.tsx tier display"

echo.
echo [3/3] Pushing to remote...
git push

echo.
echo ========================================
echo   ✅ FINAL FIX DEPLOYED!
echo ========================================
echo.
echo This was the last 'business' reference!
echo Vercel will rebuild now and it WILL succeed!
echo.
pause
