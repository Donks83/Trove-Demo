# Quick Test Checklist - Cross-User Drop Fix

## ✅ Pre-Deployment Checklist

- [ ] Files modified:
  - [x] `src/components/drops/create-drop-modal.tsx` - Changed defaults and descriptions
  - [x] `CROSS-USER-DROP-FIX.md` - Documentation created
  - [x] `QUICK-TEST-CHECKLIST.md` - This file

## 🧪 Manual Testing Steps

### Test 1: Verify Default is Now "Public"
1. [ ] Open app locally: `npm run dev`
2. [ ] Sign in as any user
3. [ ] Click on map to create a drop
4. [ ] **CHECK**: Green "Public" button should be pre-selected
5. [ ] **CHECK**: Description should say "Anyone can unlock files"
6. [ ] **CHECK**: Button label should say "Anyone can unlock" (not "Open sharing")

### Test 2: Create Public Drop (User A)
1. [ ] Sign in as User A (or create account `testa@example.com`)
2. [ ] Create a drop:
   - Title: `Test Public Drop`
   - Secret: `sharetest123`
   - Location: 51.5074, -0.1278
   - Drop type: Public (should be default)
   - Upload test file: Create a small .txt file
3. [ ] **CHECK**: Drop created successfully
4. [ ] **CHECK**: Drop appears as pin on map
5. [ ] Note the exact coordinates used

### Test 3: Unlock as Different User (User B)
1. [ ] Sign OUT from User A
2. [ ] Sign in as User B (or create account `testb@example.com`)
3. [ ] Navigate to location: 51.5074, -0.1278
4. [ ] **CHECK**: Can see the drop pin on map
5. [ ] Click "Unlock Drop" at that location
6. [ ] Enter secret: `sharetest123`
7. [ ] **EXPECTED RESULT**: ✅ Drop unlocks successfully
8. [ ] **EXPECTED RESULT**: ✅ Can download the file
9. [ ] **CRITICAL**: If this fails, the fix didn't work!

### Test 4: Verify Private Drops Still Work
1. [ ] Sign in as User A
2. [ ] Create a drop:
   - Title: `Test Private Drop`
   - Secret: `privatetest456`
   - Drop type: **Select "Private"** (blue button)
   - Location: 51.5100, -0.1300
3. [ ] **CHECK**: Description says "can ONLY be unlocked by you"
4. [ ] **CHECK**: Button says "Owner only"
5. [ ] Create the drop
6. [ ] **CHECK**: Drop NOT visible as pin on map (hidden)

### Test 5: Verify Private Drops are Owner-Only
1. [ ] Sign OUT from User A
2. [ ] Sign in as User B
3. [ ] Navigate to location: 51.5100, -0.1300
4. [ ] Try to unlock with secret: `privatetest456`
5. [ ] **EXPECTED RESULT**: ❌ "No Drop Found" or access denied
6. [ ] This is CORRECT - private drops are owner-only

### Test 6: Verify Owner Can Access Private Drop
1. [ ] Sign OUT from User B  
2. [ ] Sign back in as User A (owner)
3. [ ] Navigate to location: 51.5100, -0.1300
4. [ ] Enter secret: `privatetest456`
5. [ ] **EXPECTED RESULT**: ✅ Drop unlocks successfully
6. [ ] Owner can always access their private drops

## 🌐 Production Testing (After Deployment)

### After Pushing to Main Branch
1. [ ] Wait for Vercel deployment (check https://vercel.com/dashboard)
2. [ ] Once deployed, visit: https://trove-demo.vercel.app
3. [ ] Repeat Test 1-6 above on production site
4. [ ] **CHECK**: All tests pass on production

## 🐛 Known Issues to Ignore

These are cosmetic and don't affect functionality:
- [ ] React hydration warnings from Leaflet (cosmetic only)
- [ ] Safari vendor prefix warnings (cosmetic only)  
- [ ] Missing favicon.ico 404 error (doesn't affect drops)

## ✅ Success Criteria

All of the following must be true:
- [x] Default drop type is "Public" (green button selected)
- [x] UI descriptions are clear about owner-only vs shareable
- [x] User B can unlock User A's public drop
- [x] User B cannot unlock User A's private drop
- [x] User A (owner) can unlock their own private drop

## 🚨 If Tests Fail

### If User B can't unlock User A's public drop:
1. Check browser console for errors
2. Check Network tab - look at `/api/drops/unearth` response
3. Verify the drop's `scope` field in response is `'public'`
4. Check if secret hashing is working (case-sensitive)
5. Try hard refresh: Ctrl+Shift+R

### If Private drops are accessible cross-user:
1. This is a serious security issue!
2. Check the backend code in `/api/drops/unearth/route.ts`
3. Verify the privacy check is still present (lines ~100-110)
4. Don't deploy until fixed

### If Default is still "Private":
1. Clear browser cache
2. Hard refresh: Ctrl+Shift+R
3. Check that files were saved correctly
4. Verify Vercel deployment succeeded

## 📝 Notes

- Test with real Firebase accounts, not demo users
- Use incognito mode to easily test different users
- Private drops are intentionally owner-only (not a bug)
- Hunt drops are also private by default (special logic)

## 🎯 Final Verification

Before marking as complete:
- [ ] All 6 tests pass locally
- [ ] Code committed and pushed to main
- [ ] Vercel deployment successful
- [ ] All 6 tests pass on production
- [ ] Documentation is complete and accurate

---

**Date Tested**: ___________  
**Tested By**: ___________  
**Result**: PASS / FAIL  
**Notes**: ___________
