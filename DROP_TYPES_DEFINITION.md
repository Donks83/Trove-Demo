# 🎯 Drop Types & Retrieval Modes - Complete Definition

## Overview

Trove has **3 drop types** and **2 retrieval modes** that combine to create different user experiences.

---

## Drop Types

### 1. 🔒 **Private Drop**
**Who can see it:** Only the owner  
**Who can unlock it:** Anyone with the secret + coordinates  
**Hints:** None (zero proximity hints)  
**Use case:** Personal storage, secure file sharing  
**Tier:** All tiers

**Characteristics:**
- ❌ Not visible on public map
- ❌ No proximity hints (even for hunt participants)
- ✅ Only visible to owner in "My Drops"
- ✅ Can be shared via coordinates + secret
- ✅ Most secure option

**Example:**
```
"I buried my passport backup at home. 
Only I know where it is and what the secret is."
```

---

### 2. 🌍 **Public Drop**
**Who can see it:** Everyone  
**Who can unlock it:** Anyone with the secret (at location if physical mode)  
**Hints:** None (zero proximity hints)  
**Use case:** Public treasure, geocaching, community sharing  
**Tier:** All tiers

**Characteristics:**
- ✅ Visible on public map to all users
- ❌ No proximity hints
- ✅ Anyone can attempt to unlock
- ✅ Shows location and metadata
- ✅ Good for community engagement

**Example:**
```
"I left a book at the coffee shop for anyone to find.
The pin shows exactly where it is."
```

---

### 3. 🏴‍☠️ **Hunt Drop** (Treasure Hunt)
**Who can see it:** Everyone  
**Who can unlock it:** Anyone with secret + hunt code (for hints)  
**Hints:** Proximity hints for hunt participants  
**Use case:** Games, events, team building  
**Tier:** All tiers

**Characteristics:**
- ✅ Visible on public map to all users
- ✅ Proximity hints for hunt code holders
- ❌ No hints without hunt code
- ✅ Shows difficulty level
- ✅ Gamified experience

**Hunt Code Features:**
- Enter hunt code → Get proximity hints
- "You're warm!" / "You're close!" / "You found it!"
- Distance feedback (10m, 50m, 100m, 250m)
- Competitive element

**Example:**
```
"Company treasure hunt event!
Hunt Code: SUMMER2025
Participants get hints as they get closer."
```

---

## Retrieval Modes

### 1. 📡 **Remote** (Any Location)
**Available to:** All tiers (Free, Premium, Business)  
**Restriction:** None  
**How it works:** Can unlock from anywhere in the world

**Characteristics:**
- ✅ Unlock from your couch
- ✅ No GPS validation required
- ✅ Good for digital content sharing
- ✅ Free tier default

**Use Cases:**
- Password vaults
- Document sharing
- Code snippets
- Personal notes
- Digital gifts

**Security:**
- Only secret phrase protects the drop
- No location validation
- More convenient, less secure

---

### 2. 📍 **Physical Only** (Must Be At Location)
**Available to:** Premium & Business tiers only  
**Restriction:** Must be within geofence radius  
**How it works:** GPS validated, must physically be there

**Characteristics:**
- ✅ Requires physical presence
- ✅ GPS coordinates validated
- ✅ Distance calculated and enforced
- 👑 **Premium feature**

**Use Cases:**
- Real physical treasures
- Location-based games
- Scavenger hunts
- Event check-ins
- Proof of visit

**Security:**
- Secret phrase + location validation
- Must be within geofence radius
- More secure, more engaging

**Validation:**
```
User location: 51.5074°N, 0.1278°W
Drop location: 51.5074°N, 0.1278°W
Distance: 15m
Geofence: 50m
✅ Within range - unlock allowed
```

---

## Feature Matrix

| Feature | Private | Public | Hunt | Remote | Physical |
|---------|---------|--------|------|--------|----------|
| **Visible on map** | ❌ Owner only | ✅ Everyone | ✅ Everyone | N/A | N/A |
| **Proximity hints** | ❌ Never | ❌ Never | ✅ With code | N/A | N/A |
| **GPS validation** | N/A | N/A | N/A | ❌ No | ✅ Yes |
| **Tier requirement** | All | All | All | All | Premium+ |
| **Security level** | Highest | Medium | Medium | Lower | Higher |
| **Use case** | Personal | Community | Games | Digital | Physical |

---

## Combination Examples

### 1. Private + Remote
```yaml
Type: Private
Mode: Remote
Visibility: Owner only
Unlock: Anywhere with secret
Use: Personal password vault
Tier: Free
```

### 2. Private + Physical (Premium)
```yaml
Type: Private
Mode: Physical
Visibility: Owner only
Unlock: At location with secret
Use: Home safe backup
Tier: Premium
```

### 3. Public + Remote
```yaml
Type: Public
Mode: Remote
Visibility: Everyone
Unlock: Anywhere with secret
Use: Community document sharing
Tier: Free
```

### 4. Public + Physical (Premium)
```yaml
Type: Public
Mode: Physical
Visibility: Everyone
Unlock: At location with secret
Use: Geocaching treasure
Tier: Premium
```

### 5. Hunt + Remote
```yaml
Type: Hunt
Mode: Remote
Visibility: Everyone
Hints: With hunt code
Unlock: Anywhere with secret
Use: Online treasure hunt
Tier: Free
```

### 6. Hunt + Physical (Premium)
```yaml
Type: Hunt
Mode: Physical
Visibility: Everyone
Hints: With hunt code
Unlock: At location with secret
Use: Real-world scavenger hunt
Tier: Premium
```

---

## Validation Rules

### Creating Drops

```typescript
// 1. Check tier for physical mode
if (retrievalMode === 'physical' && user.tier === 'free') {
  return error('Physical mode requires Premium or Business tier')
}

// 2. Validate geofence radius by tier
const limits = getTierLimits(user.tier)
if (geofenceRadiusM < limits.minRadiusM) {
  return error(`Minimum radius: ${limits.minRadiusM}m`)
}
if (geofenceRadiusM > limits.maxRadiusM) {
  return error(`Maximum radius: ${limits.maxRadiusM}m`)
}

// 3. Validate scope vs dropType consistency
// (dropType can be different from scope for flexibility)
```

### Unlocking Drops

```typescript
// 1. Check secret phrase (always required)
if (secretHash !== drop.secretHash) {
  return error('Incorrect secret phrase')
}

// 2. Check retrieval mode
if (drop.retrievalMode === 'physical') {
  // Validate user location
  if (!userCoords) {
    return error('Location required for physical drops')
  }
  
  // Calculate distance
  const distance = calculateDistance(userCoords, drop.coords)
  
  // Check if within geofence
  if (distance > drop.geofenceRadiusM) {
    return error(`Too far away. You are ${distance}m from the drop (need to be within ${drop.geofenceRadiusM}m)`)
  }
}

// 3. Check scope permissions (for private drops)
if (drop.scope === 'private' && drop.ownerId !== user.uid) {
  return error('This is a private drop')
}
```

---

## Tier Limits

### Free Tier
```typescript
{
  maxFileSizeMB: 10,
  defaultExpiryDays: 30,
  minRadiusM: 50,      // Minimum 50m radius
  maxRadiusM: 500,     // Maximum 500m radius
  canUsePrivateSpots: true,
  canUsePhysicalMode: false,  // ❌ Cannot use physical mode
  maxDrops: 10
}
```

### Premium Tier
```typescript
{
  maxFileSizeMB: 100,
  defaultExpiryDays: 365,
  minRadiusM: 10,      // Minimum 10m radius (more precise)
  maxRadiusM: 1000,    // Maximum 1000m radius
  canUsePrivateSpots: true,
  canUsePhysicalMode: true,  // ✅ Can use physical mode
  maxDrops: 100
}
```

### Business Tier
```typescript
{
  maxFileSizeMB: 500,
  defaultExpiryDays: -1, // Unlimited
  minRadiusM: 5,       // Minimum 5m radius (very precise)
  maxRadiusM: 5000,    // Maximum 5000m radius
  canUsePrivateSpots: true,
  canUsePhysicalMode: true,  // ✅ Can use physical mode
  maxDrops: 1000
}
```

---

## UI Implications

### Drop Creation Form

```
┌─────────────────────────────────────┐
│ Create Drop                         │
├─────────────────────────────────────┤
│                                     │
│ Drop Type:                          │
│ ○ Private (Only you can see)        │
│ ○ Public (Everyone can see)         │
│ ○ Hunt (Treasure hunt mode)         │
│                                     │
│ Retrieval Mode:                     │
│ ○ Remote (Unlock from anywhere)     │
│ ○ Physical (Must be at location) 👑 │
│   [Requires Premium]                │
│                                     │
│ If Physical mode:                   │
│ • User must be within geofence      │
│ • GPS coordinates validated         │
│ • More secure for real treasures    │
│                                     │
│ [Create Drop]                       │
└─────────────────────────────────────┘
```

### Drop Card (My Drops)

```
┌─────────────────────────────────────┐
│ 🔒 My Secret Files       [Private]  │
│ Personal document backup             │
│                                     │
│ 📍 51.5074, -0.1278 (50m)           │
│ 📡 Remote unlock enabled            │
│ 👁 5 views  📥 2 unlocks             │
│                                     │
│ [✏️ Edit]              [🗑️]        │
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│ 🏴‍☠️ Summer Treasure    [Hunt] 👑    │
│ Find the hidden prize!               │
│                                     │
│ 📍 51.5074, -0.1278 (10m)           │
│ 📍 Physical unlock required         │
│ 🎯 Hunt Code: SUMMER2025            │
│ 👁 45 views  📥 12 unlocks           │
│                                     │
│ [✏️ Edit]              [🗑️]        │
└─────────────────────────────────────┘
```

---

## Error Messages

### Physical Mode - Free Tier
```
❌ Physical Unlock Mode Requires Premium

Physical mode requires GPS validation and is available 
to Premium and Business tier subscribers.

Upgrade to Premium to:
✅ Create physical-only drops
✅ Use precision radius (down to 10m)
✅ Ensure real-world presence

[Upgrade to Premium] [Use Remote Instead]
```

### Physical Mode - Too Far Away
```
❌ You're Too Far Away

This drop requires physical presence.

📍 Your location: 51.5100°N, 0.1300°W
🎯 Drop location: 51.5074°N, 0.1278°W
📏 Distance: 287m
🎯 Required: Within 50m

Get closer and try again!
```

### Private Drop - Not Owner
```
❌ Private Drop

This drop is private and only accessible to its owner.
```

---

## Implementation Priority

### Phase 1: Core Validation ⚡ (High Priority)
1. Enforce physical mode tier restriction
2. Validate location for physical drops
3. Check scope permissions for private drops
4. Add clear error messages

### Phase 2: UI Enhancement 📱 (Medium Priority)
1. Show premium badge on physical mode option
2. Add tooltips explaining each mode
3. Display retrieval mode on drop cards
4. Show distance feedback for physical drops

### Phase 3: Advanced Features 🚀 (Low Priority)
1. Geofence visualization on map
2. "Getting closer" progress indicator
3. Location sharing for hunt participants
4. Replay protection (one-time unlocks)

---

## Testing Scenarios

### Test 1: Free User + Physical Mode
```
User: Free tier
Action: Try to create physical drop
Expected: ❌ Error - requires premium
```

### Test 2: Premium User + Physical Drop
```
User: Premium tier
Action: Create physical drop at 51.5074, 0.1278
Distance: 10m geofence
Expected: ✅ Success
```

### Test 3: Unlock Physical Drop - Too Far
```
User: At 51.5100, 0.1300
Drop: At 51.5074, 0.1278 (50m geofence)
Distance: 287m
Expected: ❌ Error - too far away
```

### Test 4: Unlock Physical Drop - Within Range
```
User: At 51.5074, 0.1280
Drop: At 51.5074, 0.1278 (50m geofence)
Distance: 15m
Expected: ✅ Success
```

### Test 5: Private Drop - Not Owner
```
User A: Creates private drop
User B: Tries to unlock
Expected: ❌ Error - private drop
```

### Test 6: Hunt Drop - No Hunt Code
```
Drop: Hunt type
User: No hunt code entered
Expected: ✅ Can see drop, ❌ no proximity hints
```

### Test 7: Hunt Drop - With Hunt Code
```
Drop: Hunt type, code: SUMMER2025
User: Entered code
Expected: ✅ Can see drop, ✅ proximity hints shown
```

---

**Status:** Defined and ready for implementation  
**Impact:** Clear rules, better UX, proper tier monetization  
**Next:** Implement validation logic
