# 🔍 Drop Retrieval Debugging Guide

## Current Status
- ✅ Firebase: Only 1.2% of quota used (NOT the issue)
- ⚠️ Drops not unlocking
- ⚠️ Pattern: Works sometimes, then stops

## Root Cause Analysis

Since Firebase is fine, the issue is likely:
1. **Vercel Edge Cache** - Caching old API responses
2. **Browser Cache** - Caching old JavaScript with incorrect hashes
3. **Hash Mismatch** - Server expecting different secret format than stored

## 🧪 Step-by-Step Debugging

### Test 1: Browser Cache Check (Do This First!)

**In Chrome/Edge:**
1. Open **Incognito/Private Window** (Ctrl+Shift+N)
2. Go to: https://trove-demo.vercel.app
3. Sign in if needed
4. Try "Unlock by ID":
   - Drop ID: `test-drop-1`
   - Secret: `test123`

**Result:**
- ✅ Works in incognito = **Browser cache issue** → Solution: Hard refresh (Ctrl+Shift+R)
- ❌ Doesn't work = **Server-side issue** → Continue to Test 2

---

### Test 2: API Response Check

**Open DevTools (F12):**
1. Go to **Network** tab
2. Click "Unlock by ID" button
3. Enter: `test-drop-1` and `test123`
4. Click Unlock

**Find the API call** (look for one of these):
- `/api/drops/test-drop-1/authorize`
- `/api/drops/unearth`

**Click on it and check Response tab:**

#### Scenario A: "Invalid secret phrase"
```json
{
  "success": false,
  "error": "Invalid secret phrase"
}
```
**Issue:** Hash mismatch between client and server
**Solution:** Server needs fresh deploy with correct hashes

#### Scenario B: "Drop not found"
```json
{
  "success": false,
  "error": "Drop not found"
}
```
**Issue:** Demo drops not loading
**Solution:** Check demo-storage.ts is being imported

#### Scenario C: Success but no files
```json
{
  "success": true,
  "downloadUrls": []
}
```
**Issue:** Drop exists but files array is empty
**Solution:** Check demo data structure

#### Scenario D: Network error or CORS
**Issue:** API not responding or blocked
**Solution:** Check Vercel deployment logs

---

### Test 3: Local Development Test

**Run locally to bypass all caching:**
```bash
cd C:\Claude\trove
npm run dev
```

Then go to: http://localhost:3000

Try the same unlock with `test-drop-1` and `test123`

**Result:**
- ✅ Works locally = **Vercel deployment/cache issue**
- ❌ Doesn't work = **Code issue**

---

### Test 4: Check Console Logs

**In DevTools Console tab**, look for:
```
🔍 POST /api/drops/unearth called
Looking for drops near: {...}
Checking drop: Test Drop - Try Me!
✅ Secret matches!
✅ Within geofence
🎉 Single match found!
```

**Or errors like:**
```
❌ Secret doesn't match
❌ No matching drops found
```

---

## 🔧 Solutions by Scenario

### Solution 1: Browser Cache Issue
```bash
# Hard refresh the page
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Or clear cache:
# Chrome: Settings → Privacy → Clear browsing data → Cached images and files
```

### Solution 2: Vercel Cache Issue
```bash
# Force redeploy
cd C:\Claude\trove
git add .
git commit -m "fix: add no-cache headers to prevent API caching" --allow-empty
git push origin main

# Wait 2-3 minutes for deployment
# Check: https://vercel.com/dashboard
```

### Solution 3: Hash Mismatch
The latest commit added cache-control headers. After deployment:
1. Wait for Vercel deploy to complete
2. Hard refresh browser (Ctrl+Shift+R)
3. Try again in incognito

---

## 📊 Expected Behavior

### Successful Unlock Should Show:

**Console:**
```
🔍 POST /api/drops/unearth called
Unearth request: {coords: {...}, secret: '***'}
✅ Secret matches!
✅ Within geofence for remote drop
🎉 Single match found! Unlocking drop: Test Drop - Try Me!
```

**UI:**
- ✅ "Drop unlocked!" success message
- ✅ Download buttons appear
- ✅ File names visible

---

## 🆘 If Nothing Works

### Last Resort: Complete Cache Clear

```bash
# 1. Clear Vercel cache (in project settings)
Go to Vercel Dashboard → Your Project → Settings → General
Scroll down → "Clear Build Cache"

# 2. Clear browser completely
- Close ALL browser windows
- Reopen browser
- Go to site in incognito

# 3. Verify deployment
Check: https://vercel.com/dashboard
Look for latest deployment timestamp
Should be within last few minutes
```

---

## 📞 Report Your Findings

After running these tests, report:
1. **Test 1 Result:** Works in incognito? Yes/No
2. **Test 2 Result:** API response status and error message
3. **Test 3 Result:** Works locally? Yes/No
4. **Console Logs:** Copy any error messages

This will help pinpoint the exact issue!

---

## ✅ Post-Fix Verification

Once working, verify:
- [ ] Unlock by Drop ID works
- [ ] Unearth mode works (click map, enter secret)
- [ ] Works in regular browser (not just incognito)
- [ ] Works on mobile
- [ ] Works after page refresh
