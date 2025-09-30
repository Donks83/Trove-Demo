# 🔄 Handover Prompt for Next Session

**Date:** September 30, 2025  
**Project:** Trove - Location-based file drops application  
**Status:** Active development, multiple features implemented today

---

## 📋 Quick Context

**Project Overview:**
Trove is a location-based file drop/treasure hunt application built with Next.js 14, Firebase, Mapbox, and Tailwind. Users can "bury" files at specific GPS coordinates and others can "unearth" them with secret phrases. Think geocaching meets secure file sharing.

**Tech Stack:**
- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Firebase (Firestore + Storage)
- Maps: Mapbox GL + Leaflet
- Auth: Firebase Authentication

**Project Location:** `C:\Claude\trove\`

**Key Files:**
- `src/components/map-view.tsx` - Main map interface
- `src/components/map/map.tsx` - Leaflet map component
- `src/app/api/drops/route.ts` - Create/list drops
- `src/app/api/drops/unearth/route.ts` - Unlock drops
- `src/lib/geocoding/mapbox-geocoder.ts` - Location search
- `src/lib/geocoding/custom-pois.ts` - UK landmarks database
- `src/lib/tiers.ts` - Tier system and validation
- `src/types/index.ts` - TypeScript types

---

## ✅ What We Achieved Today

### 1. **Location Search Enhancement** 🗺️ (COMPLETED)
**Problem:** Search didn't recognize UK postcodes, addresses, or landmarks like "Teesside University", "Big Ben", "Angel of the North"

**Solution Implemented:**
- ✅ Enhanced Mapbox geocoding with UK biasing and postcode support
- ✅ Created custom POI database (`custom-pois.ts`) with 17+ UK landmarks
- ✅ Implemented hybrid search (custom POIs first, then Mapbox)
- ✅ Added Enter key navigation (press Enter = go to first result)
- ✅ Added Escape key to close dropdown
- ✅ Visual indicators: Purple ⭐ for custom POIs, Blue for Mapbox results
- ✅ Smooth map navigation with flyTo animation

**Files Changed:**
- `src/lib/geocoding/mapbox-geocoder.ts` - Hybrid search implementation
- `src/lib/geocoding/custom-pois.ts` - NEW - UK landmarks database
- `src/components/map-view.tsx` - Enter/Escape keys, navigation events

**Documentation:**
- `LOCATION_SEARCH_COMPLETE.md` - Full implementation details
- `QUICK_DEPLOY_SEARCH.md` - Quick reference

**Testing:**
- "Big Ben" - Works ✅ (custom POI)
- "Teesside University" - Works ✅ (custom POI)
- "Angel of the North" - Works ✅ (custom POI)
- "TS1 3BA" - Works ✅ (postcode)
- Enter key navigation - Works ✅

---

### 2. **Drop Types & Retrieval Modes** 🎯 (BACKEND COMPLETE)
**Problem:** Needed clear definitions and enforcement of drop types (Private/Public/Hunt) and retrieval modes (Remote/Physical) with proper tier restrictions.

**Solution Implemented:**

#### **Drop Types Defined:**
1. **🔒 Private Drop**
   - Visibility: Owner only
   - Map: Not shown to others
   - Unlock: Owner + secret phrase
   - Use: Personal secure storage

2. **🌍 Public Drop**
   - Visibility: Everyone
   - Map: Visible to all
   - Unlock: Anyone + secret phrase
   - Use: Community sharing, geocaching

3. **🏴‍☠️ Hunt Drop**
   - Visibility: Everyone
   - Map: Visible to all
   - Unlock: Anyone + secret phrase
   - Special: Proximity hints with hunt code
   - Use: Treasure hunts, games

#### **Retrieval Modes Defined:**
1. **📡 Remote Mode** (All tiers)
   - Can unlock from anywhere in the world
   - No GPS validation
   - Only secret phrase required

2. **📍 Physical Mode** (Premium+ only) 👑
   - Must be at actual location
   - GPS coordinates validated
   - Distance calculated and enforced
   - Must be within geofence radius

#### **Tier System Implemented:**
Created `src/lib/tiers.ts` with clear limits:

**Free Tier:**
- Max 10 drops
- 10MB file limit
- 50-500m radius only
- ❌ Cannot use physical mode
- Remote mode only

**Premium Tier:** 👑
- Max 100 drops
- 100MB file limit
- 10-1000m radius (more precise)
- ✅ Can use physical mode
- GPS validation available

**Business Tier:** 🏢
- Max 1000 drops
- 500MB file limit
- 5-5000m radius (ultra-precise)
- ✅ Can use physical mode
- Unlimited expiry

#### **Validation Implemented:**

**Create Drop API (`/api/drops`):**
- ✅ Physical mode tier check (Premium+ only)
- ✅ Radius validation by tier
- ✅ File size validation by tier
- ✅ Clear error messages with upgrade prompts

**Unearth API (`/api/drops/unearth`):**
- ✅ Physical mode requires location
- ✅ Distance calculation and validation
- ✅ Private drop access control (owner only)
- ✅ Comprehensive error messages

**Error Messages Examples:**
```json
// Free user tries physical mode
{
  "error": "Physical Mode Requires Premium",
  "message": "Physical unlock mode (GPS validated) is available for Premium and Business tiers only.",
  "tier": "free",
  "upgradeRequired": true,
  "upgradeTo": "premium"
}

// Too far from physical drop
{
  "error": "Too Far Away",
  "message": "You're 287m from this drop. You need to be within 50m to unlock it.",
  "distance": 287,
  "required": 50,
  "hint": "Keep moving towards the location"
}

// Not owner of private drop
{
  "error": "Private Drop",
  "message": "This drop is private and only accessible to its owner."
}
```

**Files Changed:**
- `src/lib/tiers.ts` - NEW - Tier limits and validation
- `src/app/api/drops/route.ts` - Added tier validation on create
- `src/app/api/drops/unearth/route.ts` - Added physical/private validation

**Documentation:**
- `DROP_TYPES_DEFINITION.md` - Complete specification
- `DROP_TYPES_IMPLEMENTATION.md` - Implementation guide
- `QUICK_DEPLOY_DROP_TYPES.md` - Quick reference

---

## 🚧 What's NOT Done Yet (Next Steps)

### **Phase 2: Frontend UI Updates** 📱 (HIGH PRIORITY)

The backend validation is complete and working, but the frontend UI needs updates to reflect these features:

#### **1. Create Drop Modal Updates**
**File:** `src/components/drops/create-drop-modal.tsx`

**Needs:**
- [ ] Show "Physical Mode" option with Premium badge 👑
- [ ] Disable physical mode for free users with tooltip
- [ ] Show "Requires Premium" message
- [ ] Add "Upgrade" button when free user clicks physical mode
- [ ] Show retrieval mode toggle/radio buttons clearly
- [ ] Explain what each mode does (tooltips/help text)

**Current State:** Form exists but doesn't show retrieval mode options prominently

**Mockup:**
```
┌─────────────────────────────────────┐
│ Create Drop                         │
├─────────────────────────────────────┤
│                                     │
│ Drop Type:                          │
│ ○ Private (Only you)                │
│ ○ Public (Everyone sees)            │
│ ○ Hunt (Treasure hunt mode)         │
│                                     │
│ Retrieval Mode:                     │
│ ○ Remote (Unlock from anywhere)     │
│ ○ Physical (Must be at location) 👑 │
│   └─ Requires Premium               │
│                                     │
│ [If free user clicks Physical:]     │
│ ⚠️ Physical mode requires Premium   │
│    [Upgrade to Premium]             │
│                                     │
└─────────────────────────────────────┘
```

#### **2. Drop Cards UI Enhancement**
**Files:** 
- `src/components/drops/drop-card.tsx` (if exists)
- Or in map markers/popups

**Needs:**
- [ ] Show retrieval mode icon (📡 Remote / 📍 Physical)
- [ ] Show drop type badge (🔒 Private / 🌍 Public / 🏴‍☠️ Hunt)
- [ ] Display tier badge for premium features
- [ ] Show "Physical only" indicator on physical drops

**Example:**
```
┌─────────────────────────────────────┐
│ 🏴‍☠️ Summer Treasure    [Hunt] 👑    │
│ Find the hidden prize!               │
│                                     │
│ 📍 Physical unlock required         │
│ 🎯 Hunt Code: SUMMER2025            │
│ 📍 51.5074, -0.1278 (10m radius)    │
│ 👁 45 views  📥 12 unlocks           │
└─────────────────────────────────────┘
```

#### **3. Unlock/Unearth UI Updates**
**File:** `src/components/drops/unearth-popup.tsx` or `unlock-drop-modal.tsx`

**Needs:**
- [ ] Show distance for physical drops
- [ ] Real-time distance updates as user moves
- [ ] "Getting closer!" progress indicator
- [ ] Clear message when too far away
- [ ] Show "No location" error for physical drops without GPS

**Example:**
```
┌─────────────────────────────────────┐
│ 🔍 Unlocking Physical Drop          │
├─────────────────────────────────────┤
│                                     │
│ Drop: Summer Treasure               │
│ Mode: 📍 Physical (must be there)   │
│                                     │
│ Your Distance: 287m                 │
│ Required: Within 50m                │
│                                     │
│ [=========>           ] 50m         │
│                                     │
│ ⚠️ Too far! Get closer to unlock.   │
│                                     │
└─────────────────────────────────────┘
```

#### **4. Tier/Upgrade Prompts**
**File:** Create `src/components/upgrade-modal.tsx`

**Needs:**
- [ ] Modal explaining Premium benefits
- [ ] Feature comparison table
- [ ] "Upgrade to Premium" CTA
- [ ] Show when free user tries premium feature
- [ ] List specific benefits they'd get

**Triggers:**
- Free user clicks "Physical mode"
- Free user tries to create drop with <50m radius
- Free user tries to upload >10MB file

#### **5. Map Markers Enhancement**
**File:** `src/components/map/map.tsx`

**Needs:**
- [ ] Different marker colors/icons for drop types
- [ ] Visual indicator for physical vs remote drops
- [ ] Geofence circle visualization (optional)
- [ ] Distance indicator on hover

---

### **Phase 3: Additional Features** 🚀 (MEDIUM PRIORITY)

#### **1. Better Error Handling UI**
- [ ] Toast notifications for errors (use sonner or react-hot-toast)
- [ ] Show API error messages in user-friendly format
- [ ] "What went wrong" explanations

#### **2. My Drops Page Enhancement**
- [ ] Filter by drop type (Private/Public/Hunt)
- [ ] Filter by retrieval mode (Remote/Physical)
- [ ] Show tier badges on each drop
- [ ] Edit drop settings

#### **3. Hunt System Improvements**
- [ ] Hunt code entry UI (prominent)
- [ ] Show joined hunts
- [ ] Proximity feedback for hunt participants
- [ ] Hunt progress tracking

---

## 🔍 Current Issues/Known Limitations

### 1. **Demo vs Production Data**
- App currently uses mix of in-memory demo data and Firestore
- Demo drops are in `src/lib/demo-storage.ts`
- Need to fully migrate to Firestore or clearly separate demo mode

### 2. **Auth Context**
- Mock user tier in development (`src/components/auth-provider.tsx`)
- Real tier comes from Firebase user profile
- Need to ensure consistent tier checking

### 3. **Custom POI Database**
- Currently has 17 UK landmarks
- Easy to expand - just add to `src/lib/geocoding/custom-pois.ts`
- Could add sports stadiums, universities, etc.

### 4. **Mobile Testing Needed**
- Physical mode GPS validation needs mobile device testing
- Distance calculation accuracy on different devices
- Location permission handling

---

## 📝 Important Implementation Notes

### **Tier Validation Pattern**
Always validate tier restrictions on BOTH frontend AND backend:

```typescript
// Frontend (src/components/...)
const { user } = useAuth()
const canUsePhysical = user?.tier !== 'free'

if (!canUsePhysical) {
  // Show upgrade modal
  setShowUpgradeModal(true)
  return
}

// Backend (src/app/api/drops/route.ts)
import { canUsePhysicalMode } from '@/lib/tiers'

if (retrievalMode === 'physical' && !canUsePhysicalMode(user.tier)) {
  return NextResponse.json({
    error: 'Physical Mode Requires Premium',
    upgradeRequired: true
  }, { status: 403 })
}
```

### **Location Handling**
Physical drops need coordinates:

```typescript
// Get user location
const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    },
    (error) => {
      console.error('Location error:', error)
      // Show error to user
    }
  )
}, [])

// Send with unlock request
await fetch('/api/drops/unearth', {
  method: 'POST',
  body: JSON.stringify({
    secret: secretPhrase,
    coords: userLocation // Required for physical drops
  })
})
```

### **Search Integration**
Custom POIs are integrated seamlessly:

```typescript
// In mapbox-geocoder.ts
export async function searchLocations(query: string) {
  // 1. Check custom POIs first (instant)
  const customResults = searchCustomPOIs(query)
  
  // 2. Query Mapbox (network)
  const mapboxResults = await fetchMapbox(query)
  
  // 3. Combine (custom first)
  return [...customResults, ...mapboxResults]
}
```

---

## 🎯 Recommended Next Session Focus

### **Priority 1: Create Drop Modal UI** ⚡
This is the most visible place where tier restrictions matter.

**Steps:**
1. Open `src/components/drops/create-drop-modal.tsx`
2. Add retrieval mode selection (Remote/Physical)
3. Show Premium badge on Physical option
4. Disable/show upgrade prompt for free users
5. Add helpful tooltips explaining each mode
6. Test with different user tiers

**Time estimate:** 30-60 minutes

### **Priority 2: Error Messages in UI** 📢
Show backend error messages to users properly.

**Steps:**
1. Install toast library: `npm install sonner`
2. Add toast notifications for errors
3. Map API error codes to friendly messages
4. Show distance info for "too far" errors
5. Test various error scenarios

**Time estimate:** 20-30 minutes

### **Priority 3: Drop Cards/Markers** 🗺️
Visual indicators on the map and in lists.

**Steps:**
1. Update map markers with mode icons
2. Show retrieval mode in drop popups
3. Add tier badges to drop cards
4. Test visual consistency

**Time estimate:** 30-45 minutes

---

## 🚀 How to Deploy Current Changes

All backend changes are ready to deploy:

```bash
cd C:\Claude\trove

# Location search enhancements
git add src/lib/geocoding/mapbox-geocoder.ts
git add src/lib/geocoding/custom-pois.ts
git add src/components/map-view.tsx
git add src/components/map/map.tsx

# Drop types and tier validation
git add src/lib/tiers.ts
git add src/app/api/drops/route.ts
git add src/app/api/drops/unearth/route.ts

# Commit all
git commit -m "feat: location search enhancement + drop types validation

- Add custom UK POI database (17+ landmarks)
- Implement hybrid search (custom + Mapbox)
- Add Enter/Escape key navigation
- Implement tier system with clear limits
- Add physical mode validation (Premium+)
- Add private drop access control
- Add distance validation for physical drops
- Comprehensive error messages"

# Deploy
git push origin main
```

**Deployment time:** ~2-3 minutes via Vercel

---

## 📚 Key Documentation Files

All in `C:\Claude\trove\`:

**Location Search:**
- `LOCATION_SEARCH_COMPLETE.md` - Full implementation details
- `QUICK_DEPLOY_SEARCH.md` - Quick reference
- `POI_SEARCH_LIMITATIONS.md` - Mapbox limitations info

**Drop Types:**
- `DROP_TYPES_DEFINITION.md` - Complete specification
- `DROP_TYPES_IMPLEMENTATION.md` - Implementation guide  
- `QUICK_DEPLOY_DROP_TYPES.md` - Quick reference

---

## 💡 Tips for Next Session

1. **Check Auth Context First**
   - Verify user tier is correctly set in `src/components/auth-provider.tsx`
   - In dev mode, you can mock different tiers for testing

2. **Test Backend First**
   - Backend validation is complete and working
   - Use Postman/curl to test API directly before UI work
   - Check browser console for API error responses

3. **Component Locations**
   - Most modals are in `src/components/drops/`
   - Map components in `src/components/map/`
   - UI primitives in `src/components/ui/` (shadcn)

4. **Styling**
   - Uses Tailwind CSS
   - Uses shadcn/ui components
   - Dark mode supported

5. **Error Handling Pattern**
   ```typescript
   try {
     const response = await fetch('/api/...')
     const data = await response.json()
     
     if (!data.success) {
       // Show error to user
       toast.error(data.message || data.error)
       return
     }
     
     // Success
     toast.success('Done!')
   } catch (error) {
     toast.error('Something went wrong')
   }
   ```

---

## 🤝 Questions to Ask User

When starting next session:

1. "Should we start with the Create Drop Modal UI to show tier restrictions?"
2. "Do you want to see the backend validation in action first before UI updates?"
3. "Should we focus on error messages/toasts before the full UI overhaul?"
4. "Any specific tier or drop type scenario you want to test?"

---

## ✅ Session Completion Checklist

**Completed Today:**
- [x] Location search with UK postcodes ✅
- [x] Custom POI database (17 UK landmarks) ✅
- [x] Enter key navigation ✅
- [x] Hybrid search system ✅
- [x] Tier system definition ✅
- [x] Physical mode validation ✅
- [x] Private drop protection ✅
- [x] Distance validation ✅
- [x] Comprehensive error messages ✅
- [x] Documentation created ✅

**Ready for Next Session:**
- [ ] Create Drop Modal UI updates
- [ ] Error message toasts
- [ ] Drop cards/marker updates
- [ ] Upgrade prompts
- [ ] Distance indicators
- [ ] Testing end-to-end

---

**Last Updated:** September 30, 2025  
**Next Focus:** Frontend UI for tier restrictions  
**Status:** Backend complete, ready for UI implementation  
**Deploy:** Ready to push location search + tier validation

---

## 🔗 Useful Links

**Live App:** https://trove-demo.vercel.app  
**GitHub:** (if applicable)  
**Vercel Dashboard:** (if applicable)  
**Firebase Console:** (if applicable)  

---

**End of Handover**

Copy this entire message to start the next session with full context! 🚀
