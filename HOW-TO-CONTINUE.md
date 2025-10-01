# 🎯 Quick Start Guide for Next Chat

## Step 1: Open Your Next Chat

Start a new conversation with Claude.

---

## Step 2: Copy & Paste This Prompt

**Location:** `C:\Claude\trove\NEXT-CHAT-PROMPT.txt`

**Or copy directly below:**

```
Hi! I'm continuing work on my Trove geospatial file sharing app. Here's where we left off:

## Current Status:
We just finished fixing 4 Vercel build errors (all TypeScript errors with 'business' tier references). The final fix for `src/components/map/map.tsx` line 213 has been made locally but **NOT yet pushed to remote**.

## What We Completed:
1. ✅ Renamed "business" tier → "paid" tier throughout app
2. ✅ Updated tier radius ranges:
   - Premium: 10-500m (was 10-100m)
   - Paid: 100-500m (was 100-300m)  
   - Free: 300-500m (unchanged)
3. ✅ Fixed modal sync bug - Create Drop modal now updates when slider changes
4. ✅ Fixed 3 of 4 build errors
5. ⏳ Final fix ready but not deployed

## What Needs Doing Next:
**IMMEDIATE:** Deploy the final fix to make Vercel build succeed:
```bash
cd C:\Claude\trove
git add src/components/map/map.tsx
git commit -m "fix: change business to paid in map.tsx tier display"
git push
```

## Key Files Modified (Local Only):
- `src/components/map/map.tsx` (line 213: 'business' → 'paid') **← NOT PUSHED YET**
- All other fixes already pushed in previous commits

## Project Location:
`C:\Claude\trove`

## Documentation Created:
- `SESSION-HANDOVER.md` - Full details of what we did
- `COMPLETE-TIER-GUIDE.md` - Tier management guide
- `RADIUS-UPDATE-SUMMARY.md` - Radius changes summary
- Plus 5 other guides in project root

## User Preference:
I prefer manual deployment (typing git commands) rather than running batch scripts.

## What I Need Help With:
1. Pushing the final fix to trigger Vercel rebuild
2. Confirming Vercel build succeeds
3. Testing that modal radius sync works in production
4. Understanding how to assign tiers via Firebase Console

Please help me complete this deployment! The fix is ready, just needs to be pushed. 🚀

---

**Additional Context:** Read `C:\Claude\trove\SESSION-HANDOVER.md` for complete details.
```

---

## Step 3: What to Expect

The next Claude will:
1. ✅ Understand exactly where you left off
2. ✅ Help you push the final fix
3. ✅ Monitor the Vercel build with you
4. ✅ Verify everything works
5. ✅ Guide you through tier management if needed

---

## Step 4: Have These Ready

Before starting next chat, have these open:
- Terminal/Command Prompt at `C:\Claude\trove`
- https://vercel.com/dashboard (to watch build)
- https://console.firebase.google.com (if testing tiers)

---

## 📚 Reference Documents

If the next Claude needs more context:

**Essential:**
- `SESSION-HANDOVER.md` - Complete session summary
- `RADIUS-UPDATE-SUMMARY.md` - What changed with radii

**Reference:**
- `COMPLETE-TIER-GUIDE.md` - Tier management
- `FINAL-FIX-SUMMARY.md` - Build fix history

---

## 🚀 Expected Timeline

**Next chat should take:**
- 5 minutes: Push final fix
- 3-5 minutes: Vercel build completes
- 2-3 minutes: Verify everything works
- **Total: ~10-15 minutes**

---

## ✅ Success Criteria

You'll know you're done when:
1. ✅ Vercel build shows "✓ Compiled successfully"
2. ✅ Live site is accessible
3. ✅ Modal radius syncs with slider
4. ✅ You understand tier assignment

---

## 🎉 You're All Set!

Just copy the prompt from `NEXT-CHAT-PROMPT.txt` into your next chat, and you'll pick up right where you left off!

Good luck! 🚀
