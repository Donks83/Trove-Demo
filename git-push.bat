@echo off
echo ============================================
echo Committing Admin Panel Changes
echo ============================================
echo.

cd /d "C:\Claude\trove"

echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "Complete admin panel implementation

- Added isAdmin field to User type
- Updated navigation with admin panel links (desktop, mobile, dropdown)
- Fixed typo in admin users page (setFiltereredUsers -> setFilteredUsers)
- Added admin panel access for managing users and drops
- Created comprehensive setup documentation

Admin features:
- User management (view, search, change tier, toggle admin, delete)
- Drop management (view, delete with file cleanup)
- Admin middleware for route protection
- Responsive UI with proper mobile support

Critical: Requires setting isAdmin: true in Firebase for admin access"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo Done! Check https://github.com/Donks83/Trove-Demo
echo ============================================
pause
