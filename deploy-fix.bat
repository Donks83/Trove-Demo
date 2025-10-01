@echo off
echo.
echo ========================================
echo   FIXING BUILD - Missing Exports
echo ========================================
echo.

echo [1/2] Staging tiers.ts fix...
git add src/lib/tiers.ts

echo.
echo [2/2] Creating fix commit...
git commit -m "fix: Add missing exports to tiers.ts

- Added validateDropForTier function
- Added TIER_DISPLAY_NAMES constant
- Added TIER_COLORS constant
- Fixes Vercel build errors"

if errorlevel 1 (
    echo [ERROR] Git commit failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   PUSHING FIX TO VERCEL
echo ========================================
echo.
git push origin main

if errorlevel 1 (
    echo [ERROR] Git push failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   FIX DEPLOYED!
echo ========================================
echo.
echo Build should succeed now.
echo Check Vercel dashboard in 2-3 minutes.
echo.
pause
