# Hidden + Shared Drops Feature

## What You Want

Separate **visibility** (shown on map) from **access control** (who can unlock):

### 4 Desired Combinations:
1. **Public + Shared** (current "public") - Visible on map, anyone can unlock ✅  
2. **Public + Private** (new) - Visible on map, owner only
3. **Hidden + Shared** (new) - NOT on map, anyone can unlock ⭐ **THIS IS THE KEY ONE**
4. **Hidden + Private** (current "private") - NOT on map, owner only ✅

## Current System Limitation

Right now, `scope` field controls BOTH visibility AND access:
- `scope: 'public'` = visible on map + anyone can access
- `scope: 'private'` = hidden from map + owner-only access

There's no way to have "hidden but shareable" with the current backend.

## Quick Fix Option (No Backend Changes)

### Option A: Rename + Add Clarification
**Simplest approach** - just improve the existing UI:

1. Rename "Private" button to "Hidden"
2. Keep the same 3 options: Hidden, Public, Hunt
3. Add a NOTE under "Hidden" explaining: "Hidden drops are owner-only. For shareable hidden drops, contact support for premium features."

**Changes needed:**
- `create-drop-modal.tsx`: Change button label "Private" → "Hidden"
- Update description to clarify

**Files to edit:**
```
src/components/drops/create-drop-modal.tsx
- Line 318: Change "Private" to "Hidden"  
- Line 319: Change "Owner only" to "Not shown on map"
- Line 395: Update description
```

## Full Solution Option (Requires Backend Changes)

### Option B: Separate Visibility + Access Controls
**Better UX** - but needs backend work:

1. Add a new field: `visibility: 'public' | 'hidden'`
2. Keep `scope` for access control: `'private' | 'shared'`
3. Update backend logic to check both fields independently

**Backend changes needed:**
- `src/app/api/drops/route.ts` (GET): Return all drops, add `visibility` field
- `src/app/api/drops/unearth/route.ts`: Check `scope` for access, ignore visibility
- `src/lib/firestore-drops.ts`: Add `visibility` field to schema
- Frontend: Separate "Visibility" and "Access" sections in create modal

**This would enable all 4 combinations!**

## Recommended Approach

### For Now (Quick Win):
Go with **Option A** - just rename and clarify:

```tsx
// In create-drop-modal.tsx
// Change the Private button to:
<div className="font-medium text-sm">Hidden</div>
<div className="text-xs text-gray-500">Not shown on map</div>

// Update description:
<strong>Hidden drops</strong> are not displayed as pins on the map and 
can <strong className="text-red-600">ONLY be unlocked by you</strong>. 
Use this for personal storage or owner-only content.
```

### Later (Full Feature):
Implement **Option B** when you have time for backend changes:

1. Add `visibility` field to Firestore schema
2. Update GET /api/drops to return all drops (not just `scope: 'public'`)
3. Modify unearth logic to check `scope` separately from `visibility`
4. Update UI to have 2 separate controls

## Why Backend Changes Are Needed

The GET endpoint currently only returns public drops:
```typescript
// src/app/api/drops/route.ts, line 22
const firestoreDrops = await getDrops({ scope: 'public' })
```

This means:
- `scope: 'private'` drops are never shown on the map (correct)
- But `scope: 'private'` ALSO means owner-only access (prevents shared hidden drops)

To support "Hidden + Shared", you need either:
1. A new `visibility` field, OR
2. Different filtering logic in GET endpoint

## Implementation Steps for Option A (Quick Fix)

1. Open `src/components/drops/create-drop-modal.tsx`
2. Find line ~318 (Private button)
3. Change:
```tsx
// FROM:
<div className="font-medium text-sm">Private</div>
<div className="text-xs text-gray-500">Owner only</div>

// TO:
<div className="font-medium text-sm">Hidden</div>
<div className="text-xs text-gray-500">Not on map</div>
```

4. Update description (line ~395):
```tsx
// FROM:
<strong>Private drops</strong> are hidden from the map and can ONLY be unlocked by you...

// TO:
<strong>Hidden drops</strong> are not shown as pins on the map. 
These drops can <strong className="text-red-600">ONLY be unlocked by you</strong> (the owner). 
Perfect for personal storage or bookmarks that you don't want to share. 
<em>Note: For shareable hidden drops, upgrade to Premium for advanced features.</em>
```

5. Test and deploy!

## Want Me to Implement?

I can help with either approach:

**Quick fix (5 minutes):**
- Just rename and update descriptions
- No backend changes
- Deploy immediately

**Full solution (30+ minutes):**
- Add visibility field
- Update backend logic
- Redesign UI with separate controls
- Test all 4 combinations

Which would you prefer? 🚀
