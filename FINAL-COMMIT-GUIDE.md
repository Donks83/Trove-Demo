# 📋 ABSOLUTELY EVERYTHING TO COMMIT

## What You Said:
> "the last thing i pushed was the GPS coordinates search"

## What This Means:
Everything listed below needs to be committed. This includes:
1. Any lingering tier changes from SESSION-HANDOVER
2. Post-GPS bug fixes
3. All 3 collision prevention phases

---

## 🎯 COMPLETE FILE LIST (16 files + docs)

### From SESSION-HANDOVER (May need to verify):
```bash
git add src/types/index.ts
git add src/lib/tiers.ts
git add src/components/map/map.tsx
git add src/components/map-view.tsx
git add src/components/dev/tier-switcher.tsx
git add src/components/drops/create-drop-modal.tsx
git add src/components/drops/edit-drop-modal.tsx
git add src/app/drops/page.tsx
git add src/app/profile/page.tsx
```

### Post-GPS Bug Fixes:
```bash
git add src/components/ui/input.tsx
git add src/lib/firestore-drops.ts
```

### Phase 1: Shareable Drop Links:
```bash
git add src/app/drop/
git add src/components/drops/share-drop-success-modal.tsx
```

### Phase 2: Disambiguation:
```bash
git add src/app/api/drops/unearth/route.ts
git add src/app/api/drops/[dropId]/unlock/
git add src/components/drops/disambiguation-modal.tsx
git add src/components/drops/unearth-popup.tsx
```

### Phase 3: Reports:
```bash
git add src/app/api/drops/[dropId]/report/
git add src/lib/firestore-reports.ts
git add src/components/drops/report-modal.tsx
```

### Documentation:
```bash
git add COLLISION-PREVENTION-COMPLETE.md
git add CHANGES-TO-COMMIT.md
```

---

## ⚡ ONE COMMAND TO RULE THEM ALL:

```bash
cd C:\Claude\trove

# Stage EVERYTHING at once
git add src/types/index.ts src/lib/tiers.ts src/lib/firestore-drops.ts src/lib/firestore-reports.ts src/components/map/map.tsx src/components/map-view.tsx src/components/dev/tier-switcher.tsx src/components/drops/ src/components/ui/input.tsx src/app/drops/page.tsx src/app/profile/page.tsx src/app/drop/ src/app/api/drops/ *.md

# Or even simpler - stage all modified/new files
git add .

# Check what will be committed
git status

# Commit with comprehensive message
git commit -m "feat: complete tier updates, collision prevention, and content safety

Tier System Updates:
- Update radius ranges (Premium 10-500m, Paid 100-500m, Free 300-500m)
- Fix modal sync bug for radius selection
- Change all 'business' references to 'paid'
- Update tier switcher ranges

Bug Fixes:
- Fix dark mode text visibility in input fields
- Fix unearthing private drops (owner access)
- Fix search box text in dark mode

Phase 1 - Shareable Drop Links:
- Add /drop/[dropId] route for direct access
- Create ShareDropSuccessModal with share/copy features
- Add security disclaimer under secret phrase input
- Web Share API integration

Phase 2 - Disambiguation UI:
- Handle multiple drops with same passphrase
- Create DisambiguationModal for drop selection
- Add /api/drops/[dropId]/unlock endpoint
- Show drop details: title, creator, files, date, distance

Phase 3 - Report Feature:
- Add /api/drops/[dropId]/report endpoint
- Create Firestore reports collection
- Build ReportModal with 6 categories
- Add Report button to unlocked drops
- Implement admin review workflow

Documentation:
- Add COLLISION-PREVENTION-COMPLETE.md
- Add CHANGES-TO-COMMIT.md"

# Push everything
git push
```

---

## 🔍 VERIFY BEFORE PUSHING:

Run this to see what will be committed:
```bash
git status
```

Look for:
- Modified files (M)
- New files (?? or A)
- Should see ~20+ files

---

## 📊 Expected Files in `git status`:

**Modified (M):**
- src/types/index.ts
- src/lib/tiers.ts
- src/lib/firestore-drops.ts
- src/components/map/map.tsx
- src/components/map-view.tsx
- src/components/dev/tier-switcher.tsx
- src/components/drops/create-drop-modal.tsx
- src/components/drops/edit-drop-modal.tsx
- src/components/drops/unlock-drop-modal.tsx
- src/components/drops/unearth-popup.tsx
- src/components/ui/input.tsx
- src/app/drops/page.tsx
- src/app/profile/page.tsx
- src/app/api/drops/unearth/route.ts

**New (??)**:
- src/app/drop/[dropId]/page.tsx
- src/app/api/drops/[dropId]/unlock/route.ts
- src/app/api/drops/[dropId]/report/route.ts
- src/lib/firestore-reports.ts
- src/components/drops/share-drop-success-modal.tsx
- src/components/drops/disambiguation-modal.tsx
- src/components/drops/report-modal.tsx
- COLLISION-PREVENTION-COMPLETE.md
- CHANGES-TO-COMMIT.md

**Total: ~23 files**

---

## 🚨 IF YOU SEE UNEXPECTED FILES:

Files like these are SAFE to exclude (add to .gitignore if needed):
- `node_modules/`
- `.next/`
- `dist/`
- `.env.local`
- `serviceAccountKey.json`
- `*.log`
- `.DS_Store`

---

## ✅ SAFEST APPROACH:

```bash
# 1. Check current status
git status

# 2. Stage everything (git will respect .gitignore)
git add .

# 3. Review what will be committed
git status

# 4. If it looks good, commit
git commit -m "feat: complete tier updates, collision prevention, and content safety

[Use the full commit message from above]"

# 5. Push
git push
```

---

## 🎯 BOTTOM LINE:

Run this and you're done:
```bash
cd C:\Claude\trove
git add .
git status
# Review the output
git commit -m "feat: complete tier updates, collision prevention, and content safety

Tier System Updates + Bug Fixes + 3-Phase Collision Prevention System

See COLLISION-PREVENTION-COMPLETE.md for full details"
git push
```

**This will capture EVERYTHING we've done since your last GPS push!**
