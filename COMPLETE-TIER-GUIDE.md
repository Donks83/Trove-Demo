# 📚 Complete Tier Management Guide

## 🎯 Quick Answer

**Q: Where is the Dev Tier Switcher?**
**A:** Bottom-left corner, YELLOW BOX, only in development mode!

**To see it:**
```bash
cd C:\Claude\trove
npm run dev
# Open http://localhost:3000
# Look bottom-left for yellow box
```

---

## 📖 Documentation Created

I've created 4 detailed guides for you:

### 1️⃣ **TIER-ASSIGNMENT-GUIDE.md**
Complete guide on all 3 methods to assign tiers:
- ✅ Firebase Console (easiest, no coding)
- ✅ Admin Script (automated, needs setup)
- ✅ Dev Tier Switcher (fastest for testing)

### 2️⃣ **DEV-TIER-SWITCHER-LOCATION.md**
Visual guide showing exactly where to find the yellow box:
- Screenshots/diagrams
- Troubleshooting steps
- What it looks like

### 3️⃣ **Admin Script: scripts/assign-tier.js**
Node.js script to change tiers programmatically:
```bash
node scripts/assign-tier.js user@example.com premium
```

### 4️⃣ **Updated .gitignore**
Added security for Firebase credentials:
- `serviceAccountKey.json` now ignored
- Prevents accidental commits

---

## 🚀 Three Ways to Assign Tiers

### Method 1: Dev Tier Switcher (Local Testing)
**Best for:** Quick testing, switching between tiers frequently

**Steps:**
1. `npm run dev`
2. Open http://localhost:3000
3. Look for YELLOW BOX bottom-left
4. Click tier button
5. Page reloads automatically

**Pros:** 
- ✅ Instant
- ✅ Visual
- ✅ Easy

**Cons:**
- ❌ Only works locally
- ❌ Only for your own account

---

### Method 2: Firebase Console (Production)
**Best for:** Managing real user tiers, permanent changes

**Steps:**
1. Go to https://console.firebase.google.com
2. Select project → Firestore Database
3. Open `users` collection
4. Find user document
5. Edit `tier` field to: `free`, `premium`, or `paid`
6. Click Update

**Pros:**
- ✅ Works in production
- ✅ Permanent changes
- ✅ No coding needed
- ✅ Can change any user

**Cons:**
- ❌ Manual process
- ❌ Slower for bulk changes

---

### Method 3: Admin Script (Bulk/Automated)
**Best for:** Bulk updates, automated workflows

**Steps:**
1. Download Firebase service account key
2. Save as `scripts/serviceAccountKey.json`
3. Run: `node scripts/assign-tier.js user@email.com tier`

**Pros:**
- ✅ Scriptable/automatable
- ✅ Fast for bulk updates
- ✅ Can integrate with other systems

**Cons:**
- ❌ Requires setup
- ❌ Need service account key
- ❌ More technical

---

## 📊 Tier Features Reference

| Feature | Free 🆓 | Paid 💳 | Premium 👑 |
|---------|---------|---------|------------|
| **Radius** | 300-500m | 100-300m | 10-100m |
| **File Size** | 100MB | 250MB | 500MB |
| **Max Drops** | 10 | 1000 | 100 |
| **Private Drops** | ✅ | ✅ | ✅ |
| **Public Drops** | ✅ | ✅ | ✅ |
| **Hunt Drops** | ❌ | ✅ | ✅ |
| **Physical Mode** | ❌ | ✅ | ✅ |
| **Expiry** | 30 days | Unlimited | 365 days |

---

## 🔐 Firebase Database Structure

```
Firestore
└── users (collection)
    └── [USER_UID] (document)
        ├── uid: string
        ├── email: string
        ├── displayName: string
        ├── photoURL: string | null
        ├── tier: "free" | "premium" | "paid"  ← THIS FIELD
        ├── createdAt: timestamp
        ├── updatedAt: timestamp
        └── ... other fields
```

---

## 🎨 Dev Tier Switcher Appearance

```
╔══════════════════════════════════╗
║ 🛡️ 🛠️ DEV: Tier Switcher        ║
║════════════════════════════════  ║
║ Current tier: FREE               ║
║                                  ║
║ ┌────────────────────────────┐   ║
║ │ 🆓 Free Explorer          ✓│   ║
║ │    300-500m radius         │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌────────────────────────────┐   ║
║ │ 👑 Premium                 │   ║
║ │    10-100m precision       │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌────────────────────────────┐   ║
║ │ 💳 Paid Tier               │   ║
║ │    100-300m precision      │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ⚠️ Dev only - Will reload       ║
╚══════════════════════════════════╝
     ↑
BOTTOM-LEFT CORNER
YELLOW/AMBER BACKGROUND
```

---

## ⚡ Quick Testing Workflow

### Local Development Testing:
```bash
# 1. Start dev server
npm run dev

# 2. Open browser
# http://localhost:3000

# 3. Use Dev Tier Switcher (yellow box, bottom-left)
# Click → Free, Premium, or Paid

# 4. Test tier-specific features
# - Try different radius ranges
# - Create Hunt drops (Premium+ only)
# - Upload different file sizes
```

### Production User Management:
```bash
# 1. Open Firebase Console
# https://console.firebase.google.com

# 2. Navigate to: Firestore → users → [USER_ID]

# 3. Edit tier field
# Change to: free, premium, or paid

# 4. User must refresh or re-login to see changes
```

---

## 🆘 Troubleshooting

### "I don't see the yellow box"
**Check:**
1. Are you running `npm run dev`? (not production)
2. Are you logged in?
3. Is it actually at bottom-left corner? (scroll if needed)
4. Check browser console for errors (F12)

**Solution:**
```bash
# Verify it's in the code:
grep -n "DevTierSwitcher" src/components/map-view.tsx
# Should show line 611
```

---

### "Tier changes don't work"
**Check:**
1. Did page reload after change?
2. Check Firestore to confirm tier was updated
3. Try hard refresh: Ctrl + Shift + R
4. Check browser console for errors

**Solution:**
```javascript
// In browser console:
console.log(user.tier)
// Should match what you set
```

---

### "Script says user not found"
**Check:**
1. Email spelling is correct
2. User has actually signed up
3. Check Firestore users collection manually

**Solution:**
```bash
# Verify user exists in Firebase Console
# Check email field in users collection
```

---

## 📁 File Locations

All documentation is in your project root:

```
C:\Claude\trove\
├── TIER-ASSIGNMENT-GUIDE.md        ← Main guide
├── DEV-TIER-SWITCHER-LOCATION.md   ← Visual guide
├── COMPLETE-TIER-GUIDE.md          ← This file
├── scripts/
│   └── assign-tier.js              ← Admin script
├── src/
│   └── components/
│       └── dev/
│           └── tier-switcher.tsx   ← Component code
└── .gitignore                      ← Updated with security
```

---

## ✅ Next Steps

1. **Read** TIER-ASSIGNMENT-GUIDE.md
2. **Try** running `npm run dev` and finding the yellow box
3. **Test** switching tiers locally
4. **Practice** Firebase Console method
5. **Optional:** Set up admin script for automation

---

## 🎓 Learning Resources

- **Firebase Console:** https://console.firebase.google.com
- **Firestore Docs:** https://firebase.google.com/docs/firestore
- **Admin SDK:** https://firebase.google.com/docs/admin/setup
- **React Components:** https://react.dev/learn

---

## 🔒 Security Reminders

⚠️ **NEVER commit** `serviceAccountKey.json` to git!
✅ It's now in `.gitignore` (protected)
✅ Store securely in password manager
✅ Rotate key if ever exposed

---

## 📞 Need More Help?

If you're still stuck:

1. Check the 4 guide files created
2. Look at screenshots/diagrams
3. Verify code at line 611 of map-view.tsx
4. Check Firebase Console for user data
5. Test with `npm run dev` first

---

**Created:** October 1, 2025  
**Status:** ✅ Complete and Ready to Use!

🎉 Everything you need to manage tiers is now documented!
