@echo off
echo ============================================
echo Committing Radius Box UI Fix
echo ============================================
echo.

cd /d "C:\Claude\trove"

echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix: Hide map radius widget when create drop modal is open

UI FIX - RADIUS BOX ISSUE:
✅ Map's radius slider now hides when modal opens
✅ Darker modal backdrop (70% opacity + medium blur)
✅ Prevents visual confusion and clutter

PROBLEM SOLVED:
- Map's radius widget was visible through modal backdrop
- Two radius controls were showing simultaneously
- Users were confused which one to use

CHANGES:
- src/components/map-view.tsx
  * Added !showCreateModal condition to radius widget
  * Widget only shows when modal is closed
  
- src/components/ui/dialog.tsx  
  * Increased backdrop opacity: 50% → 70%
  * Increased backdrop blur: sm → md
  * Prevents elements bleeding through

RESULT:
- Clean modal experience
- Only one radius display at a time
- Better visual hierarchy
- No more overlapping UI elements"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo Done! Check https://github.com/Donks83/Trove-Demo
echo ============================================
echo.
echo Changes pushed successfully!
pause
