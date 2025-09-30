# 🚀 Start Next Session With This Prompt

Copy and paste this to Claude:

---

Hi! I'm continuing work on **Trove** - a location-based file drop/treasure hunt app (Next.js 14 + Firebase + Mapbox). Project location: `C:\Claude\trove\`

## ✅ What We Just Completed

### 1. **Location Search** (DONE)
- Enhanced Mapbox geocoding with UK postcodes support
- Created custom POI database with 17+ UK landmarks (Big Ben, Teesside University, Angel of the North all work now!)
- Added Enter key navigation (press Enter = go to first result)
- Hybrid search: Custom POIs first, then Mapbox
- Files: `src/lib/geocoding/mapbox-geocoder.ts`, `custom-pois.ts`, `map-view.tsx`

### 2. **Drop Types & Tier Validation** (BACKEND DONE)
- Defined 3 drop types: Private (owner only), Public (everyone), Hunt (with hints)
- Defined 2 retrieval modes: Remote (anywhere) and Physical (must be at location)
- **Physical mode is now a Premium+ feature** 👑
- Implemented tier system: Free (no physical), Premium (physical enabled), Business
- Added validation: tier checks, distance calculation, private drop protection
- Files: `src/lib/tiers.ts` (NEW), `api/drops/route.ts`, `api/drops/unearth/route.ts`

**Backend is complete and working!** All validation is in place.

## 🎯 What We Need to Do Next

### **HIGH PRIORITY: Frontend UI Updates**

The backend validation works, but users can't see/interact with it properly yet. We need to update the UI:

1. **Create Drop Modal** (`src/components/drops/create-drop-modal.tsx`)
   - Show retrieval mode selection clearly (Remote/Physical toggle)
   - Add Premium badge 👑 on Physical option
   - Disable physical mode for free users with "Upgrade" prompt
   - Add tooltips explaining each mode

2. **Error Message Toasts**
   - Install sonner: `npm install sonner`
   - Show backend errors to users (distance too far, premium required, etc.)
   - Map API error codes to friendly messages

3. **Drop Cards & Map Markers**
   - Show retrieval mode icon (📡 Remote / 📍 Physical)
   - Display drop type badge (🔒/🌍/🏴‍☠️)
   - Show tier badges for premium features
   - Distance indicator for physical drops

### **Key Implementation Notes:**

**Tier validation pattern:**
```typescript
// Frontend check
const canUsePhysical = user?.tier !== 'free'
if (!canUsePhysical) {
  setShowUpgradeModal(true)
  return
}

// Backend already validates in api/drops/route.ts
```

**Tier limits are in `src/lib/tiers.ts`:**
- Free: 10MB, 50-500m radius, ❌ no physical mode
- Premium: 100MB, 10-1000m radius, ✅ physical mode
- Business: 500MB, 5-5000m radius, ✅ physical mode

## 📁 Key Files

- `src/components/drops/create-drop-modal.tsx` - Needs UI updates
- `src/components/drops/unlock-drop-modal.tsx` - May need distance display
- `src/lib/tiers.ts` - Tier limits and validation (DONE)
- `src/app/api/drops/route.ts` - Create validation (DONE)
- `src/app/api/drops/unearth/route.ts` - Unlock validation (DONE)

## 📚 Documentation

Full details in:
- `HANDOVER_NEXT_SESSION.md` - Complete context
- `DROP_TYPES_IMPLEMENTATION.md` - Tier system specs
- `LOCATION_SEARCH_COMPLETE.md` - Search implementation

## ❓ Where Should We Start?

I'd like to start with updating the Create Drop Modal to show the retrieval mode options and tier restrictions. Should we:
1. Update the create-drop-modal.tsx UI first?
2. Add toast notifications for errors first?
3. Or something else?

The backend is complete and ready - we just need to make it visible/usable in the UI!
