# Firebase Storage Setup Guide

## Problem: File Persistence
Your files were disappearing because they were stored in **in-memory storage** (`uploadedFilesStore`). When Vercel redeploys or restarts your server, all in-memory data is wiped.

## Solution: Firebase Storage
We've integrated Firebase Storage for **persistent file storage**. Files now survive server restarts and redeploys!

---

## 🚀 Quick Setup (Development)

For local development, your existing Firebase emulator setup should work:

1. **Start Firebase emulators:**
   ```bash
   pnpm emulators
   ```

2. **Start Next.js dev server:**
   ```bash
   pnpm dev
   ```

Files will be stored in the Firebase Storage emulator during development.

---

## 🔧 Production Setup (Vercel)

To deploy to production with persistent file storage, you need to configure Firebase Admin credentials:

### Option 1: Service Account Key (Recommended)

1. **Generate a service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `trove-9e659`
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Download the JSON file

2. **Add to Vercel environment variables:**
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add a new variable:
     - Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
     - Value: Paste the **entire JSON content** from the downloaded file
     - Environment: Production (and Preview if needed)

3. **Redeploy your application:**
   ```bash
   git push
   ```

### Option 2: Individual Service Account Fields

Alternatively, you can set individual fields:

```bash
# In Vercel Environment Variables:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@trove-9e659.iam.gserviceaccount.com"
```

Then update `.env.local` for local testing:
```bash
FIREBASE_PRIVATE_KEY="your-private-key-here"
FIREBASE_CLIENT_EMAIL="your-client-email-here"
```

---

## ✅ What Changed

### Files Added/Modified:

1. **`src/lib/firebase-admin.ts`** - NEW
   - Initializes Firebase Admin SDK for server-side operations
   - Uses service account credentials in production

2. **`src/lib/firebase-storage.ts`** - NEW
   - Handles file uploads to Firebase Storage
   - Handles file downloads from Firebase Storage
   - Provides signed URLs for secure file access

3. **`src/app/api/drops/route.ts`** - MODIFIED
   - Now uploads files to Firebase Storage
   - Stores `storagePath` in drop metadata
   - Falls back to in-memory storage if Firebase fails (development)

4. **`src/app/api/drops/[dropId]/files/[fileName]/route.ts`** - MODIFIED
   - First checks Firebase Storage for files
   - Falls back to in-memory storage (old drops)
   - Falls back to demo files (test drops)

5. **`src/types/index.ts`** - MODIFIED
   - Added `DropFile` interface with `storagePath` field
   - Updated `Drop` interface to include `files` array

---

## 🧪 Testing the Integration

### Test File Upload:
1. Create a new drop with files
2. Check the logs - you should see:
   ```
   ✅ Uploaded file to Firebase Storage: filename.pdf (12345 bytes)
   ```

### Test File Download:
1. Try to unearth the drop and download files
2. Check the logs - you should see:
   ```
   ✅ Serving file from Firebase Storage: filename.pdf (12345 bytes)
   ```

### What If It Fails?
The code includes fallback mechanisms:
- If Firebase upload fails → uses in-memory storage (temporary)
- If Firebase download fails → checks in-memory storage → checks demo files

---

## 🔒 Firebase Storage Security Rules

Make sure your Firebase Storage has proper security rules. In the Firebase Console:

**Storage → Rules:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /drops/{dropId}/{fileName} {
      // Allow authenticated users to read/write
      allow read, write: if request.auth != null;
      
      // For production, you might want more restrictive rules:
      // allow read: if request.auth != null;
      // allow write: if request.auth != null && request.auth.uid == resource.metadata.ownerId;
    }
  }
}
```

---

## 📊 Monitoring

### Check if files are being uploaded:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Storage**
3. Look for the `drops/` folder
4. You should see folders for each dropId containing uploaded files

### Check logs in Vercel:
```bash
vercel logs
```

Look for:
- ✅ Upload success messages
- ✅ Download success messages
- ❌ Any error messages

---

## 🐛 Troubleshooting

### "Firebase Admin initialization failed"
- **Solution**: Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is set in Vercel
- Check that the JSON is valid (no extra quotes or escaping issues)

### "Failed to upload file"
- **Solution**: Check Firebase Storage quota (free tier has limits)
- Verify storage bucket name is correct: `trove-9e659.firebasestorage.app`

### "File not found" when downloading
- **Solution**: This could mean:
  1. File was uploaded before Firebase integration (old drop) - will use fallback
  2. Storage path is incorrect - check drop metadata
  3. Firebase Storage permissions issue - check security rules

### Files still disappearing
- **Solution**: Verify the upload logs show Firebase Storage being used
- If seeing "⚠️ Serving from in-memory storage", the upload to Firebase failed
- Check Vercel logs for upload errors

---

## 🎯 Migration Strategy

**Old drops (before Firebase integration):**
- Still work! They use in-memory storage or demo files as fallback
- You can keep them or migrate them manually if needed

**New drops (after Firebase integration):**
- Automatically use Firebase Storage
- Files persist across deployments
- Viewable in Firebase Console

---

## 💡 Next Steps

1. ✅ Set up Firebase Service Account in Vercel
2. ✅ Deploy to production
3. ✅ Test creating a new drop with files
4. ✅ Verify files persist after redeploy
5. ✅ Check Firebase Storage in console
6. 🔄 Optional: Migrate old drops if needed

---

## 📞 Need Help?

If you run into issues:
1. Check Vercel logs: `vercel logs`
2. Check Firebase Console Storage section
3. Look for error messages in browser console
4. Share the error logs for debugging

---

## 🎉 Benefits

**Before (In-Memory Storage):**
- ❌ Files disappear on redeploy
- ❌ Lost on server restart
- ❌ No persistence

**After (Firebase Storage):**
- ✅ Files persist forever
- ✅ Survive redeployments
- ✅ Scalable storage
- ✅ Built-in security
- ✅ Free tier: 5GB storage, 1GB/day downloads
