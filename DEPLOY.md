# 🚀 Deployment Checklist - Trove Frontend UI Updates

## ⚠️ CRITICAL - Do This First!

**Install Sonner** (or Vercel build will fail):

```bash
npm install sonner
```

This will update `package.json` and `package-lock.json` automatically.

---

## 📦 Files to Commit

### New Files:
- `src/components/ui/sonner.tsx` (NEW Sonner toast component)
- `FRONTEND_UI_UPDATES_COMPLETE.md` (Documentation)
- `UI_VISUAL_IMPROVEMENTS.md` (Design reference)
- `INSTALL_SONNER.md` (Installation note)
- `DEPLOY.md` (This file)

### Modified Files:
- `src/app/layout.tsx` (Added Sonner Toaster)
- `src/components/drops/create-drop-modal.tsx` (Complete UI overhaul)
- `package.json` (Sonner dependency)
- `package-lock.json` (Sonner lockfile)

---

## 🔍 Pre-Deployment Checks

- [ ] `npm install sonner` completed
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] Create drop modal opens and looks correct
- [ ] Toast notifications appear
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No build errors (`npm run build`)

---

## 📝 Git Workflow

### 1. Check Status
```bash
git status
```

### 2. Stage All Changes
```bash
git add .
```

Or stage specific files:
```bash
git add src/app/layout.tsx
git add src/components/ui/sonner.tsx
git add src/components/drops/create-drop-modal.tsx
git add package.json
git add package-lock.json
```

### 3. Commit with Clear Message
```bash
git commit -m "feat: Enhanced create drop modal UI with tier restrictions

- Added Sonner toast system for user-friendly notifications
- Implemented card-based retrieval mode selection (Remote/Physical)
- Added Premium badges and upgrade prompts for locked features
- Enhanced error handling with actionable upgrade CTAs
- Created upgrade modal showing tier benefits
- Improved visual hierarchy with icons and color coding
- Backend validation now properly reflected in UI

Breaking changes: None
Dependencies: Added sonner for toast notifications"
```

### 4. Push to Trigger Vercel Deployment
```bash
git push origin main
```

---

## ⏱️ Vercel Deployment Process

1. **Vercel detects push** (~5 seconds)
2. **Install dependencies** (~30-60 seconds)
   - This is where `npm install` runs
   - Sonner will be installed automatically
3. **Build Next.js app** (~1-2 minutes)
   - Runs `npm run build`
   - TypeScript compilation
4. **Deploy to production** (~30 seconds)
5. **Total time**: ~2-4 minutes

---

## 🔍 Monitor Deployment

### Check Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Find your Trove project
3. Watch the deployment progress
4. Check build logs if any errors

### Common Issues:

#### ❌ Build Error: "Cannot find module 'sonner'"
**Fix**: Make sure you ran `npm install sonner` locally and committed `package.json`

#### ❌ TypeScript Error
**Fix**: Run `npm run typecheck` locally to see errors

#### ❌ Build Timeout
**Fix**: Vercel free tier has 45-minute limit, shouldn't be an issue here

---

## ✅ Post-Deployment Verification

Once deployed, test on production:

1. **Open your live site**
2. **Test Create Drop Modal**:
   - ✅ Modal opens correctly
   - ✅ Retrieval mode cards display
   - ✅ Premium badges show for free users
   - ✅ Clicking Physical mode shows upgrade toast
   - ✅ Toast notifications appear (top-right)
   
3. **Test Error Handling**:
   - Try creating drop without files → Should show friendly toast
   - Try physical mode as free user → Should show upgrade prompt
   
4. **Test Across Devices**:
   - Desktop: Full card layout
   - Mobile: Stacked cards
   - Tablet: Check responsive design

---

## 🔄 Rollback Plan (If Needed)

If something breaks in production:

```bash
# Revert to previous commit
git revert HEAD

# Or reset to previous commit (if not pushed elsewhere)
git reset --hard HEAD~1

# Push the revert
git push origin main
```

Vercel will automatically deploy the reverted version.

---

## 📊 What Changed - Summary

### User-Facing Changes:
- ✨ Beautiful card-based mode selection
- 👑 Clear Premium feature indicators
- 🎯 Friendly error messages with emojis
- 🔔 Toast notifications (top-right)
- 💰 Upgrade modal with benefits list

### Technical Changes:
- Added `sonner` package for toasts
- Enhanced `create-drop-modal.tsx` (~300 lines changed)
- Added Toaster to app layout
- Better error mapping (API → User-friendly)
- Improved tier enforcement UX

### Backend:
- No backend changes (already complete)
- All validation logic already in place
- This is purely a UI/UX improvement

---

## 🎯 Quick Deploy Script

Save this as `deploy.sh` (optional):

```bash
#!/bin/bash

echo "🚀 Deploying Trove UI Updates..."

# Check if sonner is installed
if ! grep -q "sonner" package.json; then
    echo "❌ Error: sonner not installed!"
    echo "Run: npm install sonner"
    exit 1
fi

# Run checks
echo "🔍 Running TypeScript check..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found!"
    exit 1
fi

echo "🔍 Running build test..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Git workflow
echo "📝 Staging changes..."
git add .

echo "📝 Committing..."
git commit -m "feat: Enhanced create drop modal UI with tier restrictions"

echo "🚀 Pushing to trigger Vercel deployment..."
git push origin main

echo "✅ Deployment triggered! Check Vercel dashboard."
```

---

## 🆘 Need Help?

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Look for missing dependencies or TypeScript errors
- Verify `package.json` was committed

**Toasts don't appear:**
- Check browser console for errors
- Verify Sonner component is imported in layout
- Clear browser cache and hard refresh

**Premium badges missing:**
- Check user tier in auth context
- Verify `tierLimits.canUsePhysicalMode` logic
- Test with different mock user tiers

---

Ready to deploy? Run:
```bash
npm install sonner
npm run build  # Test locally first
git add .
git commit -m "feat: Enhanced create drop modal UI with tier restrictions"
git push origin main
```

Then watch the magic happen in your Vercel dashboard! ✨
