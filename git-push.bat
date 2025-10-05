@echo off
echo ============================================
echo Committing Admin Panel + Build Fixes
echo ============================================
echo.

cd /d "C:\Claude\trove"

echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "Complete admin panel implementation + critical build fixes

CRITICAL BUILD FIXES:
- Fixed Firebase admin import errors (initializeFirebaseAdmin -> initAdmin)
  * Updated all 6 admin API routes
  * Updated admin middleware
- Fixed missing closing div tag in create-drop-modal-v2.tsx
- Fixed React Hook warnings in admin pages (added useCallback)

ADMIN PANEL FEATURES:
- Added isAdmin field to User type
- Updated navigation with admin panel links (desktop, mobile, dropdown)
- Fixed typo in admin users page (setFiltereredUsers -> setFilteredUsers)
- Admin panel access for managing users and drops
- Created comprehensive setup documentation

Admin Capabilities:
- User management (view, search, change tier, toggle admin, delete)
- Drop management (view, delete with file cleanup)
- Admin middleware for route protection
- Responsive UI with proper mobile support

Files Modified:
- src/types/index.ts (added isAdmin)
- src/components/navigation.tsx (added admin links)
- src/components/drops/create-drop-modal-v2.tsx (fixed JSX)
- src/app/admin/users/page.tsx (fixed hooks + typo)
- src/app/admin/drops/page.tsx (fixed hooks)
- src/lib/admin-middleware.ts (fixed import)
- src/app/api/admin/**/route.ts (fixed imports - 6 files)

Documentation:
- ADMIN_SETUP_COMPLETE.md (complete setup guide)
- BUILD_FIXES.md (detailed fix documentation)

CRITICAL: Requires setting isAdmin: true in Firebase for admin access

Build Status: ✅ All errors resolved, ready for deployment"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo Done! Check https://github.com/Donks83/Trove-Demo
echo ============================================
pause
