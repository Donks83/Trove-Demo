@echo off
echo.
echo Committing all fixes...
echo.

git add src/components/drops/create-drop-modal.tsx
git add src/app/app/drops/page.tsx
git commit -m "fix: add missing Lock import and change 'business' to 'paid' in drops page"
git push

echo.
echo ✅ All fixes pushed! Vercel will auto-deploy.
echo.
pause
