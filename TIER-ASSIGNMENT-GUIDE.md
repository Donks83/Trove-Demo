# 🎯 How to Assign User Tiers

## Quick Reference

**Available Tiers:**
- `free` - 300-500m radius, 100MB files
- `premium` - 10-100m radius, 500MB files, Physical mode, Hunt drops
- `paid` - 100-300m radius, 250MB files, Physical mode, Hunt drops

---

## Method 1: Firebase Console (Easy - No Code)

### Step-by-Step:

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your Trove project

2. **Navigate to Firestore**
   - Click **Firestore Database** in left sidebar
   - Click on **users** collection

3. **Find User**
   - Look for user by their document ID (UID)
   - Or search by email if visible

4. **Edit Tier Field**
   - Click on the user document
   - Find the `tier` field
   - Click the pencil icon ✏️
   - Change value to: `free`, `premium`, or `paid`
   - Click **Update**

5. **Verify**
   - User must refresh page or re-login to see changes
   - Check tier badge in their profile

### Visual Guide:
```
Firebase Console
  └─ Firestore Database
      └─ users collection
          └─ [USER_ID] document
              ├─ email: "user@example.com"
              ├─ displayName: "John Doe"
              ├─ tier: "free"  ← EDIT THIS
              └─ updatedAt: [timestamp]
```

---

## Method 2: Admin Script (Advanced - Using Node.js)

### Setup (One-time):

1. **Get Firebase Service Account Key**
   ```
   Firebase Console → Project Settings → Service Accounts
   → Generate New Private Key → Download JSON
   ```

2. **Save Key**
   ```bash
   # Save as: C:\Claude\trove\scripts\serviceAccountKey.json
   # ⚠️ NEVER commit this file to git!
   ```

3. **Install Dependencies**
   ```bash
   cd C:\Claude\trove
   npm install firebase-admin
   ```

### Usage:

```bash
# Navigate to scripts folder
cd C:\Claude\trove\scripts

# Assign tier to user
node assign-tier.js user@example.com premium

# Examples:
node assign-tier.js john@company.com free
node assign-tier.js jane@company.com premium
node assign-tier.js admin@company.com paid
```

### Expected Output:
```
✅ Successfully updated user@example.com to premium tier
   User ID: abc123xyz456
```

---

## Method 3: Dev Tier Switcher (Development Only)

### Setup:

1. **Run Development Server**
   ```bash
   cd C:\Claude\trove
   npm run dev
   ```

2. **Open App**
   ```
   http://localhost:3000
   ```

3. **Find Yellow Box**
   - Look in **bottom-left corner** of screen
   - Yellow/amber border with "🛠️ DEV: Tier Switcher"

4. **Click Tier Button**
   - Click **Free Explorer** 🆓
   - Click **Premium** 👑
   - Click **Paid Tier** 💳
   - Page will reload automatically

### Screenshot Description:
```
┌──────────────────────────────┐
│ 🛠️ DEV: Tier Switcher       │
│ Current tier: FREE           │
│                              │
│ ┌──────────────────────────┐ │
│ │ 🆓 Free Explorer         │ │
│ │    300-500m radius    [✓]│ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ 👑 Premium               │ │
│ │    10-100m precision     │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ 💳 Paid Tier             │ │
│ │    100-300m precision    │ │
│ └──────────────────────────┘ │
│                              │
│ ⚠️ Dev only - Will reload    │
└──────────────────────────────┘
```

---

## Troubleshooting

### "I don't see the Dev Tier Switcher"
- ✅ Make sure you're running `npm run dev` (not production)
- ✅ Check bottom-left corner of the page
- ✅ Make sure you're logged in
- ❌ It won't show on Vercel deployment (production only)

### "Changes don't apply"
- Try logging out and back in
- Hard refresh: `Ctrl + Shift + R`
- Check Firestore to confirm tier was updated

### "Script says 'User not found'"
- Double-check email spelling
- Make sure user has signed up
- Check Firestore users collection manually

---

## Security Notes

⚠️ **IMPORTANT:**
- The service account key (`serviceAccountKey.json`) has FULL admin access
- **NEVER commit it to git**
- Add to `.gitignore`:
  ```
  scripts/serviceAccountKey.json
  ```
- Store securely (password manager, secure vault)
- Rotate key if compromised

---

## Quick Testing Workflow

### For Development:

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Use Dev Tier Switcher in bottom-left
4. Test features for each tier
5. Switch tiers as needed

### For Production:

1. Use Firebase Console method
2. Update user's tier field
3. User must refresh page or re-login
4. Changes take effect immediately

---

## Need Help?

- **Firebase Docs:** https://firebase.google.com/docs/firestore
- **Admin SDK:** https://firebase.google.com/docs/admin/setup
- **Firestore Security:** https://firebase.google.com/docs/firestore/security/get-started

---

Created: October 1, 2025
