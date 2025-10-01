@echo off
echo.
echo ========================================
echo   COMPLETE TIER SYSTEM UPDATE
echo ========================================
echo.

echo CRITICAL FIX:
echo - Remote mode now validates radius correctly!
echo - Both Physical and Remote check geofence
echo - Physical: Checks your GPS location
echo - Remote: Checks your map pin placement
echo.
echo NEW FEATURES:
echo 1. Dev Tier Switcher (bottom-left widget)
echo 2. Color-coded modal (purple/blue/green)
echo 3. Padlock indicators when locked
echo 4. Fixed radius validation bug
echo.

echo [1/4] Staging changes...
git add src/components/dev/tier-switcher.tsx
git add src/components/map-view.tsx
git add src/components/drops/create-drop-modal.tsx
git add src/app/api/drops/unearth/route.ts
git add TIER_SYSTEM_COMPLETE_GUIDE.md
git add RADIUS_VALIDATION_CLARIFIED.md

echo.
echo [2/4] Creating commit...
git commit -m "feat: Complete tier system + fix radius validation for remote mode

CRITICAL BACKEND FIX:
- Remote mode now validates geofence radius correctly
- Previously: Remote mode ignored radius (SECURITY BUG)
- Now: Remote mode checks map pin placement distance
- Both modes enforce radius, just different coord sources:
  * Physical: Validates GPS location vs drop location
  * Remote: Validates map pin placement vs drop location

DEV TIER SWITCHER:
- Added bottom-left widget for testing tiers
- Switch between Free/Premium/Business instantly
- Auto-reloads page, saves to Firestore
- Dev mode only (hidden in production)

COLOR-CODED MODAL:
- Modal background matches tier colors
- Purple: Premium (10-100m) 👑
- Blue: Business (100-300m) 🏢
- Green: Free (300-500m) 🆓
- Shows tier badge with radius value

PADLOCK INDICATORS:
- Shows 🔒 Locked in sidebar when restricted
- Real-time feedback as slider moves
- Appears for out-of-tier ranges

ERROR MESSAGES:
- Physical: 'You must be within 50m physically'
- Remote: 'Your map pin is 245m away, try within 50m'

DOCUMENTATION:
- Complete tier system guide
- Radius validation clarification
- Backend vs Frontend comparison
- Subscription implementation guide

This update fixes a security vulnerability where remote drops
ignored radius validation, and adds comprehensive testing tools."

if errorlevel 1 (
    echo [ERROR] Git commit failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Pushing to trigger Vercel deployment...
git push origin main

if errorlevel 1 (
    echo [ERROR] Git push failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo CRITICAL FIX DEPLOYED:
echo - Remote mode now properly validates radius
echo - Security vulnerability patched
echo.
echo NEW FEATURES:
echo - Dev Tier Switcher (bottom-left)
echo - Color-coded modal UI
echo - Padlock indicators
echo.
echo TO TEST:
echo 1. Use Dev Tier Switcher to change tiers
echo 2. Try creating drops with different radii
echo 3. Test Physical mode (GPS required)
echo 4. Test Remote mode (map pin required)
echo 5. Verify both modes check radius
echo.
echo Check deployment: https://vercel.com/dashboard
echo.
pause
