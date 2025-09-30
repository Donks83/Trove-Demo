# 🚨 Build Error Fix - Dynamic Route Conflict

## Error Message
```
Error: You cannot use different slug names for the same dynamic path ('dropId' !== 'id').
```

## What Happened
When implementing the delete/edit features, I created a new folder `src/app/api/drops/[id]/route.ts`. However, there was already an existing folder `src/app/api/drops/[dropId]/` in the codebase. 

Next.js doesn't allow different parameter names for dynamic routes at the same level, so we got this error during build.

## Good News ✅
- The `[dropId]` folder **already has all the correct code**
- All DELETE/PATCH/GET endpoints are working
- We just need to remove the duplicate `[id]` folder from git

## Quick Fix (Choose One)

### Option 1: Automated Fix (Recommended) ⚡

**Windows:**
```bash
cd C:\Claude\trove
.\scripts\fix-dynamic-route.bat
```

**Mac/Linux:**
```bash
cd C:\Claude\trove
bash scripts/fix-dynamic-route.sh
```

Then:
```bash
git commit -m "fix: remove duplicate [id] folder, use [dropId]"
git push origin main
```

### Option 2: Manual Fix 🔧

```bash
cd C:\Claude\trove

# Remove [id] folder from git (if it exists)
git rm -rf "src/app/api/drops/[id]"

# Check what changed
git status

# Commit the fix
git commit -m "fix: remove duplicate [id] folder, use [dropId]"

# Push to trigger rebuild
git push origin main
```

## Verification

After pushing, Vercel will automatically rebuild. You should see:
```
✅ Build successful
✅ Deployment complete
```

The build should complete in ~2 minutes.

## What's in the Working [dropId] Folder

The `src/app/api/drops/[dropId]/route.ts` file contains:
- ✅ GET endpoint - Fetch single drop
- ✅ DELETE endpoint - Remove drop + files
- ✅ PATCH endpoint - Update title/description/secret
- ✅ Owner verification
- ✅ CORS headers
- ✅ Error handling

All the functionality we need is already there!

## Testing After Deploy

Once deployment succeeds:

1. **Test Delete:**
   - Go to: https://trove-demo.vercel.app/app/drops
   - Click trash icon on a drop
   - Confirm deletion
   - ✅ Should work

2. **Test Edit:**
   - Click "Edit" on a drop
   - Change title/description
   - Save changes
   - ✅ Should work

## Why This Happened

When I created the initial solution, I used `[id]` as the parameter name. However, the codebase already had `[dropId]` as the convention. Next.js saw both folders during build and threw an error because it requires consistent naming.

## Prevention

For future dynamic routes in this project, always use:
- `[dropId]` for drop-related routes
- Check existing folder structure before creating new dynamic routes

## Files Status

### ✅ Correct (Keep)
- `src/app/api/drops/[dropId]/route.ts` - Has all code
- `src/app/api/drops/[dropId]/files/[fileName]/route.ts` - File downloads

### ❌ Duplicate (Remove)
- `src/app/api/drops/[id]/route.ts` - Causes conflict

### 📁 Ignored (Harmless)
- `src/app/api/drops/_[id].old/` - Underscore prefix means ignored by Next.js

## Troubleshooting

### Issue: "fatal: pathspec '[id]' did not match any files"
**Meaning:** The `[id]` folder doesn't exist in git (already clean)
**Action:** Skip the `git rm` step and just commit any other changes

### Issue: Build still fails after fix
**Check:**
1. Did you push to main branch? `git branch`
2. Is there a `.next` cache locally? Delete it: `rm -rf .next`
3. Check Vercel logs for different error

### Issue: Edit/Delete still not working
**This is unrelated to the build error.** Once build succeeds:
1. Clear browser cache (Ctrl+Shift+R)
2. Check you're logged in
3. Verify you own the drop you're trying to edit/delete

## Summary

**Problem:** Two folders with different names for same dynamic route  
**Solution:** Remove duplicate `[id]` folder, keep `[dropId]`  
**Time to fix:** 2 minutes  
**Impact:** Build will succeed, all features work  

---

**Status:** Ready to fix  
**Difficulty:** Easy  
**Risk:** None (just cleaning up a duplicate)
