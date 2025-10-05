@echo off
echo ============================================
echo Committing Email Verification + Hook Fix
echo ============================================
echo.

cd /d "C:\Claude\trove"

echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "Implement email verification + fix React Hook order

EMAIL VERIFICATION FEATURES:
✅ Send verification email on signup
✅ Prevent unverified users from creating drops
✅ Show verification status in profile
✅ Resend verification email option
✅ Verification banner in navigation

BUILD FIX:
✅ Fixed React Hook order in admin pages
  - Moved loadUsers/loadDrops before useEffect
  - Fixes 'Block-scoped variable used before declaration' error

FILES MODIFIED:
- src/components/auth/auth-modal.tsx
  * Auto-send verification email on signup
  * Updated success messages
  
- src/app/app/profile/page.tsx
  * Display verification status with colored badges
  * Resend verification email button
  * 'I've verified' refresh button
  * Visual indicators (CheckCircle/AlertCircle icons)
  
- src/components/navigation.tsx
  * Amber verification banner for unverified users
  * Direct link to profile page
  * Auto-hides when verified
  
- src/components/drops/create-drop-modal-v2.tsx
  * Check email verification before drop creation
  * Error message with profile link
  * Prevent form submission if unverified

- src/app/admin/users/page.tsx
  * Fixed hook order (loadUsers before useEffect)
  
- src/app/admin/drops/page.tsx
  * Fixed hook order (loadDrops before useEffect)

All users must verify email before creating drops!"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo Done! Check https://github.com/Donks83/Trove-Demo
echo ============================================
pause
