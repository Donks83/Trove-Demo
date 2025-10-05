@echo off
echo ============================================
echo Committing Email Verification System
echo ============================================
echo.

cd /d "C:\Claude\trove"

echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "Implement complete email verification system

EMAIL VERIFICATION FEATURES:
✅ Send verification email on signup
✅ Prevent unverified users from creating drops
✅ Show verification status in profile
✅ Resend verification email option
✅ Verification banner in navigation

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

USER EXPERIENCE:
- Clear visual indicators (banner, badges, icons)
- One-click resend verification email
- Direct links to verification actions
- Automatic status updates
- Graceful error handling

SECURITY:
- Frontend verification check
- Real-time status updates
- User-friendly error messages

DOCUMENTATION:
- EMAIL_VERIFICATION_COMPLETE.md (comprehensive guide)

All users must verify email before creating drops!"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo Done! Check https://github.com/Donks83/Trove-Demo
echo ============================================
pause
