@echo off
echo.
echo ========================================
echo   UX FIX: Single Radius Control
echo ========================================
echo.

echo Deploying improvements:
echo - Removed duplicate radius slider from modal
echo - Added Premium tier indicators to sidebar slider
echo - Added visual feedback with purple overlay
echo - Improved user clarity
echo.

echo [1/3] Staging changes...
git add src/components/map-view.tsx
git add src/components/drops/create-drop-modal.tsx
git add UX_FIX_SINGLE_RADIUS_CONTROL.md

echo.
echo [2/3] Creating commit...
git commit -m "fix: Remove duplicate radius slider and add tier indicators

- Removed confusing second slider from create drop modal
- Added Premium zone indicators on sidebar slider (purple overlay)
- Added crown emoji markers for Premium-only ranges (10-50m)
- Added contextual warning when free user selects premium range
- Changed modal to show read-only radius confirmation
- Improved UX clarity with single source of truth

Fixes user-reported confusion about which slider controls radius.
Addresses feedback about needing tier restriction indicators."

if errorlevel 1 (
    echo [ERROR] Git commit failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Pushing to trigger Vercel deployment...
git push origin main

if errorlevel 1 (
    echo [ERROR] Git push failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   UX FIX DEPLOYED!
echo ========================================
echo.
echo Changes pushed successfully!
echo Vercel will rebuild in ~2-3 minutes.
echo.
echo Check deployment at: https://vercel.com/dashboard
echo.
pause
