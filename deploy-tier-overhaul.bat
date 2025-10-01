@echo off
echo.
echo ========================================
echo   TIER RANGE OVERHAUL - NO JITTER
echo ========================================
echo.

echo Changes:
echo - Fixed jittering widget box (always shows message)
echo - New tier ranges:
echo   * Premium: 10-100m (was 10-50m)
echo   * Business: 100-300m (NEW clear zone)
echo   * Free: 300-500m (was 50-500m)
echo - Color-coded slider zones (purple/blue/green)
echo - Tier markers: 10m Crown, 100m Building, 300m Free
echo.

echo [1/3] Staging changes...
git add src/lib/tiers.ts
git add src/components/map-view.tsx
git add UX_FIX_TIER_RANGES_NO_JITTER.md

echo.
echo [2/3] Creating commit...
git commit -m "fix: Overhaul tier ranges and eliminate widget jitter

TIER RANGE CHANGES:
- Premium: 10-100m (high precision, building-level)
- Business: 100-300m (medium precision, district-level)  
- Free: 300-500m (general area, neighborhood)

UX IMPROVEMENTS:
- Fixed jittering widget by always showing tier message
- Added color-coded zones (purple/blue/green overlays)
- Added tier markers: 10m 👑, 100m 🏢, 300m 🆓
- Widget maintains stable height with min-h-[60px]
- Default radius now 300m (free tier minimum)

VISUAL FEEDBACK:
- All users see three colored zones on slider
- Context message changes based on selected range
- Clear 'Upgrade to unlock!' prompts for restricted zones
- Smooth sliding experience without UI jumps

Addresses user feedback about widget resizing and unclear tier boundaries."

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
echo   TIER OVERHAUL DEPLOYED!
echo ========================================
echo.
echo Changes pushed successfully!
echo Vercel will rebuild in ~2-3 minutes.
echo.
echo NEW TIER STRUCTURE:
echo   Premium:  10-100m  (👑 Purple)
echo   Business: 100-300m (🏢 Blue)
echo   Free:     300-500m (🆓 Green)
echo.
echo Check deployment at: https://vercel.com/dashboard
echo.
pause
