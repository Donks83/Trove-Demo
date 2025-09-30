# ⚡ QUICK FIX - Build Error

## Run This Now

```bash
cd C:\Claude\trove

# Remove the duplicate [id] folder from git
git rm -rf "src/app/api/drops/[id]"

# Commit
git commit -m "fix: remove duplicate [id] folder, use [dropId]"

# Push (triggers automatic rebuild)
git push origin main
```

## What's Happening

✅ `[dropId]` folder - HAS ALL YOUR CODE (keep this)  
❌ `[id]` folder - DUPLICATE (removing it)

## Wait 2 Minutes

Vercel will rebuild automatically. You'll see:
```
✅ Build successful
✅ Deployed to production
```

## Then Test

1. https://trove-demo.vercel.app/app/drops
2. Click Edit on a drop → ✅ Should work
3. Click Delete on a drop → ✅ Should work

---

**Issue:** Next.js requires consistent naming for dynamic routes  
**Fix:** Remove duplicate folder  
**Time:** 2 minutes  
**Everything still works after fix!** ✅
