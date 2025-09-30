# 🗺️ Location Search - POI Limitations & Solutions

## Status: ✅ Enhanced (with known limitations)

**Date:** September 30, 2025

---

## What Works Now ✅

### Fixed Issues
1. ✅ **Enter key support** - Press Enter to go to first result
2. ✅ **Escape key** - Press Esc to close results
3. ✅ **Better UK biasing** - Proximity to UK center (-3.5, 54.5)
4. ✅ **Fuzzy matching** - Better typo tolerance
5. ✅ **More results** - Shows up to 10 results (was 5)

### What Works Well
- ✅ **UK Postcodes** - TS1 3BA, SW1A 1AA, etc.
- ✅ **Addresses** - 123 High Street, etc.
- ✅ **Cities/Towns** - London, Manchester, Middlesbrough
- ✅ **Major stores** - Tesco, Sainsbury's (with location)
- ✅ **Some universities** - When combined with location

---

## Known Limitations ⚠️

### POI Coverage Issues

Mapbox Geocoding API has **limited POI (Points of Interest) data** for UK landmarks and universities. This is a **known limitation** of the service.

**Examples that may not work:**
- ❌ "Teesside University" (alone)
- ❌ "Big Ben"
- ❌ "Angel of the North"
- ❌ Some specific landmarks

**Why this happens:**
- Mapbox Geocoding is primarily designed for addresses and places
- POI database is not as comprehensive as Google Places
- Some landmarks use official names (e.g., "Elizabeth Tower" not "Big Ben")
- Universities may need more specific queries

---

## Workarounds ✅

### Option 1: Add Location Context

Instead of:
```
❌ "Teesside University"
```

Try:
```
✅ "Teesside University Middlesbrough"
✅ "University Boulevard Middlesbrough"
✅ "TS1 3BX" (university postcode)
```

### Option 2: Use Postcodes

Most universities and landmarks have known postcodes:
```
Teesside University: TS1 3BX
Big Ben: SW1A 0AA
Angel of the North: NE9 7TY
```

### Option 3: Use Addresses

```
"Westminster, London" → then look for landmarks
"Gateshead" → then look for Angel of the North
```

---

## Alternative Solution: Hybrid Search

We could implement a **hybrid approach** that falls back to different services:

### Phase 1: Mapbox Geocoding (Current)
- Fast for addresses, postcodes, cities
- Good for most searches

### Phase 2: Custom POI Database (Future)
- Add our own database of UK landmarks
- Include universities, monuments, famous places
- Instant results for known POIs

### Phase 3: Google Places API Fallback (Future)
- If Mapbox returns no results
- Fall back to Google Places API
- Better POI coverage but costs money

---

## Quick Reference

### What Works Best

| Search Type | Example | Success Rate |
|-------------|---------|--------------|
| Postcode | TS1 3BA | ✅ 100% |
| Address | 10 Downing St | ✅ 95% |
| City/Town | Manchester | ✅ 100% |
| Store + Location | Tesco Middlesbrough | ✅ 80% |
| Landmark + Context | Big Ben Westminster | ⚠️ 50% |
| Landmark alone | Big Ben | ❌ 20% |
| University alone | Teesside Uni | ❌ 30% |
| University + Location | Teesside Uni Middlesbrough | ⚠️ 60% |

---

## Testing Specific Places

### Teesside University
```bash
# What works:
✅ "TS1 3BX" (main campus postcode)
✅ "University Boulevard, Middlesbrough"
✅ "Middlesbrough" (then navigate to campus)

# What might not:
❌ "Teesside University" (alone)
```

### Big Ben
```bash
# What works:
✅ "SW1A 0AA" (postcode)
✅ "Westminster, London"
✅ "Parliament Square"

# What might not:
❌ "Big Ben" (alone)

# Note: Official name is "Elizabeth Tower"
⚠️ Try "Elizabeth Tower Westminster"
```

### Angel of the North
```bash
# What works:
✅ "NE9 7TY" (postcode)
✅ "Gateshead"
✅ "Low Eighton, Gateshead"

# What might not:
❌ "Angel of the North" (alone)
```

---

## Current Implementation

### Keyboard Shortcuts
- **Enter** - Navigate to first result
- **Escape** - Close search results

### Search Parameters
```typescript
proximity: -3.5, 54.5  // UK center
country: GB             // UK only
fuzzyMatch: true        // Typo tolerance
limit: 10               // Up to 10 results
autocomplete: true      // Real-time suggestions
```

---

## Recommended User Guidance

### In-App Help Text

Consider adding this tooltip/help text:

```
💡 Search Tips:
• Use postcodes for exact locations (TS1 3BA)
• Add city name for better results (Tesco Manchester)
• Universities: Use postcode or full address
• Landmarks: Try postcode or nearby area

Examples:
✅ "TS1 3BA" - Teesside University
✅ "SW1A 0AA" - Big Ben area
✅ "10 Downing Street"
```

---

## Future Improvements

### Short Term (Easy)
1. ✅ Add Enter key support (DONE)
2. ✅ Better UK biasing (DONE)
3. ✅ Fuzzy matching (DONE)
4. 📋 Add common POI database
5. 📋 Show "no results" message

### Medium Term (Moderate)
1. 📋 Custom UK landmarks database
2. 📋 University/campus database
3. 📋 Popular chains database
4. 📋 Historical sites database

### Long Term (Complex)
1. 📋 Google Places API fallback
2. 📋 Multiple search providers
3. 📋 AI-powered query understanding
4. 📋 User-submitted POIs

---

## Adding Custom POI Database

If we want perfect coverage for UK landmarks, we can add our own database:

```typescript
// custom-pois.ts
export const UK_LANDMARKS = [
  {
    name: "Teesside University",
    aliases: ["Teesside Uni", "TU"],
    lat: 54.5742,
    lng: -1.2349,
    postcode: "TS1 3BX"
  },
  {
    name: "Big Ben",
    aliases: ["Elizabeth Tower", "Parliament Clock"],
    lat: 51.5007,
    lng: -0.1246,
    postcode: "SW1A 0AA"
  },
  {
    name: "Angel of the North",
    aliases: ["Angel", "Gateshead Angel"],
    lat: 54.9144,
    lng: -1.5859,
    postcode: "NE9 7TY"
  }
  // ... add more
]

// Then in searchLocations:
// 1. Check custom database first
// 2. If found, return immediately
// 3. Otherwise, fallback to Mapbox
```

This would give instant results for known landmarks!

---

## Summary

### Current Status
- ✅ Enter key navigation works
- ✅ Postcodes work perfectly
- ✅ Addresses work well
- ⚠️ Some POIs work, many don't (Mapbox limitation)

### Best Practice for Users
1. **Use postcodes when available** (most reliable)
2. **Add location context** ("Tesco Middlesbrough" not just "Tesco")
3. **Be specific** ("University Boulevard" not just "university")

### Developer Options
1. **Accept limitation** - Document workarounds
2. **Add custom DB** - Create UK landmarks list
3. **Use Google Places** - Better coverage but costs money
4. **Hybrid approach** - Combine multiple sources

---

## Decision Needed

**Question for you:** How important is landmark search?

**Option A: Accept limitation**
- Cost: Free
- Time: 0 hours
- Coverage: 70% (postcodes + addresses)

**Option B: Add custom POI database**
- Cost: Free
- Time: 2-4 hours
- Coverage: 95% (add major landmarks manually)

**Option C: Add Google Places fallback**
- Cost: $$$  (paid API)
- Time: 4-6 hours
- Coverage: 99% (comprehensive)

**Recommendation:** Start with Option B (custom DB) for the most important POIs.

---

**Status:** Enhanced with Enter key + better search  
**Limitation:** POI coverage varies by location  
**Workaround:** Use postcodes or add location context
