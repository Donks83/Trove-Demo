# 🎨 Dev Tier Switcher - Visual Location Guide

## 📍 Where to Find It

The Dev Tier Switcher appears as a **YELLOW/AMBER BOX** in the **BOTTOM-LEFT CORNER** of your screen when running in development mode.

---

## 🖥️ Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🛠️ DEV MODE - Mock Data    [Bury] [Unearth]  [Search...]  │ ← Top Bar
│                                                               │
│                                                               │
│                         MAP AREA                              │
│                                                               │
│                    (Interactive Map)                          │
│                                                               │
│                                                               │
│  ┌──────────────────────────┐                                │
│  │ 🛠️ DEV: Tier Switcher   │  ← YOU'RE LOOKING FOR THIS!    │
│  │ Current: FREE            │                                │
│  │                          │                                │
│  │ [🆓 Free Explorer ✓]    │                                │
│  │ [👑 Premium]             │                                │
│  │ [💳 Paid Tier]           │                                │
│  │                          │                                │
│  │ ⚠️ Dev only              │                                │
│  └──────────────────────────┘                                │
│                                                               │
│                                                               │
│                                   🎯 BURY MODE: Click...  →  │ ← Bottom Action Bar
└─────────────────────────────────────────────────────────────┘
     ↑
  YELLOW BOX HERE!
```

---

## ✅ Appearance Details

### Color Scheme:
- **Background:** Amber/Yellow (`bg-amber-100`)
- **Border:** Thicker amber border (`border-2 border-amber-400`)
- **Text:** Dark amber (`text-amber-900`)
- **Icon:** Shield icon 🛡️

### Size:
- Width: ~250-300px
- Height: ~280-320px (depending on content)
- Position: Fixed (stays visible when scrolling)

### What It Looks Like:

```
╔══════════════════════════════════╗
║ 🛡️ 🛠️ DEV: Tier Switcher        ║  ← Header
║────────────────────────────────  ║
║ Current tier: FREE               ║  ← Status
║                                  ║
║ ┌────────────────────────────┐   ║
║ │ 🆓 Free Explorer          ✓│   ║  ← Active (has checkmark)
║ │    300-500m radius         │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌────────────────────────────┐   ║
║ │ 👑 Premium                 │   ║  ← Click to switch
║ │    10-100m precision       │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌────────────────────────────┐   ║
║ │ 💳 Paid Tier               │   ║  ← Click to switch
║ │    100-300m precision      │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ⚠️ Dev only - Will reload       ║  ← Warning
╚══════════════════════════════════╝
```

---

## 🔍 How to Make It Appear

### Step 1: Stop Production Server (if running)
```bash
# Press Ctrl+C in terminal to stop any running process
```

### Step 2: Start Development Server
```bash
cd C:\Claude\trove
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:3000
```

### Step 4: Look Bottom-Left
- Scroll to bottom if needed
- Look for **YELLOW BOX** with **amber border**
- Should appear immediately after page loads

---

## 🚫 Why You Might Not See It

### Reason 1: Running Production Build
**Problem:** You're on Vercel (production)
**Solution:** Run locally with `npm run dev`

### Reason 2: Not Logged In
**Problem:** Dev switcher only shows for authenticated users
**Solution:** Sign in first, then it will appear

### Reason 3: CSS/Z-index Issues
**Problem:** Another element is covering it
**Solution:** 
- Press F12 (DevTools)
- Look for element with class `fixed bottom-4 left-4`
- Check z-index is `9999`

### Reason 4: Component Not Rendered
**Problem:** Code not deployed or missing
**Solution:** Check `src/components/map-view.tsx` line 611:
```typescript
{/* Dev Tools */}
<DevTierSwitcher />
```

---

## 🧪 Testing the Switcher

### Test 1: Visual Check
- [ ] Can you see yellow box?
- [ ] Is it in bottom-left corner?
- [ ] Does it show current tier?
- [ ] Are all 3 tier options visible?

### Test 2: Interaction
- [ ] Click on a tier button
- [ ] Does page reload?
- [ ] Does tier change in profile?
- [ ] Can you switch between all tiers?

### Test 3: Feature Testing
- [ ] Switch to Premium → Try 50m radius
- [ ] Switch to Free → Try 400m radius  
- [ ] Switch to Paid → Try 200m radius
- [ ] Verify tier-specific features work

---

## 📸 Screenshot Reference

**What to Look For:**

1. **Color:** YELLOW/AMBER background - Very distinct!
2. **Position:** Bottom-left corner - Can't miss it!
3. **Icons:** Shield 🛡️ + tool emoji 🛠️ in header
4. **Border:** Thick amber border (2px)
5. **Size:** Small-medium box, always visible

**If you see:**
- ✅ Yellow box bottom-left → **You found it!**
- ❌ No yellow box → **Check you're running `npm run dev`**
- ❌ Grey/other color box → **Different component**

---

## 🆘 Still Can't Find It?

### Diagnostic Steps:

1. **Check Browser Console (F12)**
   ```javascript
   // Type in console:
   document.querySelector('.fixed.bottom-4.left-4')
   // Should return the element if present
   ```

2. **Check Component File**
   ```bash
   # Verify file exists:
   ls C:\Claude\trove\src\components\dev\tier-switcher.tsx
   ```

3. **Check Map View**
   ```bash
   # Search for usage:
   grep -n "DevTierSwitcher" C:\Claude\trove\src\components\map-view.tsx
   # Should show line 611
   ```

4. **Check Environment**
   ```bash
   # In browser console:
   console.log(process.env.NODE_ENV)
   // Should show 'development'
   ```

---

## 🎯 Quick Checklist

Before looking for the Dev Tier Switcher:

- [ ] Running `npm run dev` (not production)
- [ ] Opened `http://localhost:3000`
- [ ] Logged in with a user account
- [ ] Looking at bottom-left corner
- [ ] Yellow/amber colored box
- [ ] Says "DEV: Tier Switcher" at top

**If ALL checked and still don't see it:** Check the code in `map-view.tsx` line 611!

---

Created: October 1, 2025
