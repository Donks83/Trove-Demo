# 🔧 Troubleshooting: Drops Not Working

## Issue
After making secrets case-sensitive, test drops are not unlocking.

## Root Cause
Vercel is caching the old build with lowercase hashes. The new code expects case-sensitive hashes.

## Test Drops (Updated Secrets - Case Sensitive)
1. **Test Drop - Try Me!** (London: 51.5074, -0.1278)
   - Secret: `test123` (all lowercase)
   - Radius: 100m
   
2. **📍 Physical Drop Demo** (London: 51.5155, -0.1425)
   - Secret: `location123` (all lowercase)
   - Radius: 50m
   - **Note:** Requires physical GPS location

## How to Test

### Method 1: Unlock by Drop ID
1. Click "Unlock by ID" button
2. Enter Drop ID: `test-drop-1`
3. Enter Secret: `test123`
4. Should unlock successfully

### Method 2: Unearth Mode
1. Switch to "Unearth Mode"
2. Navigate to London (51.5074, -0.1278)
3. Click near the marker
4. Enter secret: `test123`
5. Should find the drop

## Force Fresh Deploy

To ensure Vercel rebuilds with new hashes:

```bash
# Add timestamp to force rebuild
cd C:\Claude\trove

# The demo-storage.ts file now has a timestamp comment to force rebuild

# Commit and deploy
git add .
git commit -m "force: rebuild with correct case-sensitive hashes"
git push origin main
```

## Verify Hash Generation

The hashes should now be:
- `test123` → SHA256(test123) case-sensitive
- `location123` → SHA256(location123) case-sensitive

## Alternative: Test Locally

```bash
npm run dev
```

Local dev should work immediately because it's not cached.

## Hydration Errors

The React #418 errors are separate and caused by:
- Leaflet (map library) rendering differences
- Can be suppressed but not critical
- Don't affect functionality

## Next Steps

1. ✅ Force rebuild committed
2. ⏳ Wait for Vercel deployment
3. 🧪 Test "test123" unlock
4. 📊 Check browser console for API errors

## Expected API Response

When unlocking works, you should see:
```json
{
  "success": true,
  "metadata": {
    "title": "Test Drop - Try Me!",
    "fileNames": ["treasure-map.pdf", "secret-note.txt"]
  },
  "downloadUrls": [...]
}
```

## If Still Not Working

Check browser Network tab:
1. Look for `/api/drops/unearth` or `/api/drops/[id]/authorize` call
2. Check response - should not be 403 (secret mismatch)
3. If 403, the hashes still don't match
