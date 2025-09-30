# Fix Dynamic Route Naming Conflict

## Issue
Build failed with:
```
Error: You cannot use different slug names for the same dynamic path ('dropId' !== 'id').
```

## Root Cause
Initially created `/api/drops/[id]/route.ts` but there was already a `/api/drops/[dropId]/` folder.
Next.js requires consistent parameter names for dynamic routes at the same level.

## Solution
1. Use existing `[dropId]` folder (already has all the DELETE/PATCH code)
2. Remove any `[id]` folders from git history
3. Fixed logging bugs in DELETE and PATCH handlers

## Files to Remove from Git
If `src/app/api/drops/[id]/route.ts` exists in git, remove it:

```bash
git rm -r src/app/api/drops/[id]
git commit -m "fix: remove duplicate [id] folder, use [dropId] convention"
git push
```

## Status
✅ Local files are correct  
✅ [dropId]/route.ts has all DELETE/PATCH/GET functionality  
⚠️  Need to ensure [id] folder is not in git

## Next Steps
1. Check git status: `git status`
2. If `[id]` folder shows up, remove it: `git rm -r src/app/api/drops/[id]`
3. Commit and push
4. Vercel will rebuild successfully
