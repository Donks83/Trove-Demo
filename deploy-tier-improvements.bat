@echo off
echo.
echo ========================================
echo   TIER SYSTEM IMPROVEMENTS
echo ========================================
echo.

echo Changes being deployed:
echo.
echo 1. Dev Tier Switcher
echo    - Bottom-left widget for testing tiers
echo    - Switch between Free/Premium/Business
echo    - Auto-reloads on change
echo.
echo 2. Color-Coded Modal
echo    - Purple box for Premium range (10-100m)
echo    - Blue box for Business range (100-300m)
echo    - Green box for Free range (300-500m)
echo    - Matches sidebar colors!
echo.
echo 3. Padlock Indicators
echo    - Shows "Locked" when in restricted zone
echo    - Appears in sidebar widget header
echo    - Real-time feedback
echo.
echo 4. Complete Documentation
echo    - Tier system guide
echo    - How radius works
echo    - Subscription implementation guide
echo.

echo [1/3] Staging changes...
git add src/components/dev/tier-switcher.tsx
git add src/components/map-view.tsx
git add src/components/drops/create-drop-modal.tsx
git add TIER_SYSTEM_COMPLETE_GUIDE.md

echo.
echo [2/3] Creating commit...
git commit -m "feat: Add dev tier switcher, color-coded modal, and padlock indicators

DEV TIER SWITCHER:
- Added bottom-left widget for testing tiers in development
- Click to switch between Free/Premium/Business instantly
- Auto-reloads page to apply tier changes
- Stored in Firestore users collection

COLOR-CODED MODAL:
- Modal now matches tier colors from sidebar
- Purple box: Premium (10-100m)
- Blue box: Business (100-300m)
- Green box: Free (300-500m)
- Shows tier name badge (👑 Premium, 🏢 Business, 🆓 Free)

PADLOCK INDICATORS:
- Added 🔒 Locked indicator in sidebar header
- Shows when user is in restricted zone
- Real-time feedback as slider moves
- Clear visual cue for tier restrictions

DOCUMENTATION:
- Complete tier system guide
- Radius behavior explanation
- Subscription implementation roadmap
- Testing checklist

Addresses user feedback about testing tiers, color consistency,
and knowing when features are locked."

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
echo   TIER IMPROVEMENTS DEPLOYED!
echo ========================================
echo.
echo NEW FEATURES:
echo   - Dev Tier Switcher (bottom-left corner)
echo   - Color-coded modal (purple/blue/green)
echo   - Padlock indicators when locked
echo.
echo TO TEST:
echo   1. Look for yellow box (bottom-left)
echo   2. Click tier buttons to switch
echo   3. Page reloads automatically
echo   4. Try different radii on slider
echo   5. Check modal colors match
echo   6. See padlock when restricted
echo.
echo Check deployment at: https://vercel.com/dashboard
echo.
pause
