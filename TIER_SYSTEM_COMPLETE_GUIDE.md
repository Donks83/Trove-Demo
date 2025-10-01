# 🎯 Trove Tier System - Complete Guide

## ✅ All Your Questions Answered!

---

## 1️⃣ **How to Change Your Tier (Testing)**

### **Dev Tier Switcher** (Bottom-left corner)
You'll now see a yellow box in the bottom-left corner that lets you switch tiers instantly:

```
🛠️ DEV: Tier Switcher
Current tier: FREE

[🆓 Free Explorer - 300-500m radius]
[👑 Premium - 10-100m precision] ← Click to test
[🏢 Business - 100-300m precision]

⚠️ Dev only - Will reload page after change
```

**How it works:**
1. Click any tier button
2. Page reloads automatically
3. Your tier is saved in Firestore
4. All UI updates to match your new tier

**Location:** Bottom-left corner (dev mode only)

---

## 2️⃣ **Are Tiers Implemented?**

### **Backend: ✅ Fully Implemented**
- Tier limits defined in `src/lib/tiers.ts`
- Backend validates all requests
- Firestore stores user tiers
- API enforces tier restrictions

### **Frontend: ✅ Fully Implemented**
- Color-coded UI (purple/blue/green)
- Tier indicators on sliders
- Upgrade prompts for locked features
- Visual feedback for restrictions

### **Subscriptions: ❌ NOT YET**
**What's missing:**
- Payment processing (Stripe/Paddle)
- Subscription management
- Billing portal
- Auto-tier updates on payment

**What you need to add:**
1. **Stripe Integration**
   ```bash
   npm install @stripe/stripe-js stripe
   ```

2. **Create pricing page**
   - Show tier comparison
   - "Subscribe" buttons
   - Stripe Checkout integration

3. **Webhook handler**
   - Listen for payment events
   - Update user tier in Firestore
   - Handle subscription changes

4. **Billing portal**
   - Manage subscription
   - Update payment method
   - Cancel subscription

**Example implementation flow:**
```typescript
// pages/api/create-checkout-session.ts
import Stripe from 'stripe'

export async function POST(req: Request) {
  const { tier, userId } = await req.json()
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: TIER_PRICE_IDS[tier], // Premium/Business price IDs
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    client_reference_id: userId,
  })
  
  return Response.json({ url: session.url })
}

// pages/api/webhooks/stripe.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  
  if (event.type === 'checkout.session.completed') {
    const userId = event.data.object.client_reference_id
    const tier = getTierFromPriceId(event.data.object.amount_total)
    
    // Update user tier in Firestore
    await updateUserProfile(userId, { tier })
  }
  
  return Response.json({ received: true })
}
```

---

## 3️⃣ **How Radius Works**

### **The radius you choose determines the GEOFENCE**

Think of it like this:
```
        📍 Drop Location
         ╱│╲
        ╱ │ ╲
       ╱  │  ╲    ← Radius (e.g., 50m)
      ╱   │   ╲
     ────────────
    This circle = unlock zone
```

### **For Physical Mode Drops:**
- **User MUST be within the radius to unlock**
- GPS validates their location
- Backend checks: `distance(userLocation, dropLocation) <= radius`
- If too far → Error: "You must be within 50m"

### **For Remote Mode Drops:**
- **Radius doesn't restrict unlock**
- User can unlock from anywhere in the world
- Just need coordinates + secret phrase
- Radius is more for organizational purposes

### **Example:**
```
Drop at coordinates: 51.5074, -0.1278 (London)
Radius: 50m

PHYSICAL MODE:
- User in London at 51.5073, -0.1279 (40m away) → ✅ Can unlock
- User in Paris → ❌ Cannot unlock (too far)

REMOTE MODE:
- User in London → ✅ Can unlock
- User in Paris → ✅ Can unlock (distance doesn't matter)
```

---

## 4️⃣ **Color-Coded UI - Now Matches!**

### **Sidebar Slider**
```
[purple|blue  |green    ]
 10-100 100-300 300-500m
 👑     🏢      🆓
Premium Business Free
```

### **Modal Display** (Now matches!)
**When radius is 50m (Premium zone):**
```
┌────────────────────────────────┐
│ [Purple] 👑 Premium            │  ← Purple box
│ Drop Radius: 50m               │
│ High precision                 │
└────────────────────────────────┘
```

**When radius is 150m (Business zone):**
```
┌────────────────────────────────┐
│ [Blue] 🏢 Business             │  ← Blue box
│ Drop Radius: 150m              │
│ Medium precision               │
└────────────────────────────────┘
```

**When radius is 350m (Free zone):**
```
┌────────────────────────────────┐
│ [Green] 🆓 Free                │  ← Green box
│ Drop Radius: 350m              │
│ General area                   │
└────────────────────────────────┘
```

---

## 5️⃣ **Padlock Indicator**

### **Shows when you're in a restricted zone**

**Free user at 50m:**
```
┌───────────────────────────┐
│ • Drop Radius    🔒 Locked │
└───────────────────────────┘
```

**Premium user at 350m:**
```
┌───────────────────────────┐
│ • Drop Radius    🔒 Locked │
└───────────────────────────┘
```

The padlock appears **immediately** when you slide into a zone you can't use.

---

## 6️⃣ **Complete Tier Breakdown**

| Feature | Free 🆓 | Premium 👑 | Business 🏢 |
|---------|---------|-----------|-------------|
| **Radius Range** | 300-500m | 10-100m | 100-300m |
| **Precision** | General area | High precision | Medium precision |
| **Use Case** | Neighborhood | Building/room | District/block |
| **Max Drops** | 10 | 100 | 1000 |
| **File Size** | 10MB | 100MB | 500MB |
| **Physical Mode** | ❌ No | ✅ Yes | ✅ Yes |
| **Expiry** | 30 days | 365 days | Unlimited |
| **Example** | Neighborhood event | Office treasure hunt | Campus-wide game |

---

## 7️⃣ **Assigning Tiers to Users**

### **Manual (Admin Panel)**
Create an admin route:
```typescript
// app/admin/users/page.tsx
export default function AdminUsers() {
  const { user } = useAuth()
  
  // Check if admin
  if (user?.email !== 'admin@trove.com') {
    return <div>Access Denied</div>
  }
  
  return (
    <UserTable 
      onUpdateTier={async (userId, newTier) => {
        await updateDoc(doc(db, 'users', userId), {
          tier: newTier,
          updatedAt: Timestamp.now()
        })
      }}
    />
  )
}
```

### **Automatic (Stripe Webhooks)**
When payment succeeds:
```typescript
// Stripe webhook automatically updates tier
async function handleCheckoutComplete(session) {
  const userId = session.client_reference_id
  const tier = getTierFromPrice(session.amount_total)
  
  await updateDoc(doc(db, 'users', userId), {
    tier,
    stripeCustomerId: session.customer,
    subscriptionId: session.subscription,
    updatedAt: Timestamp.now()
  })
}
```

---

## 8️⃣ **Testing Checklist**

### **With Dev Tier Switcher:**
- [ ] Switch to **Free** tier
  - [ ] Sidebar slider shows 🔒 padlock at 50m
  - [ ] Modal shows **green box** at 350m
  - [ ] Can't create drop at 50m (backend rejects)
  - [ ] Can create drop at 350m

- [ ] Switch to **Premium** tier
  - [ ] Sidebar slider shows NO padlock at 50m
  - [ ] Modal shows **purple box** at 50m
  - [ ] Can create drop at 50m ✅
  - [ ] Shows padlock at 350m (out of premium range)

- [ ] Switch to **Business** tier
  - [ ] Sidebar slider shows NO padlock at 150m
  - [ ] Modal shows **blue box** at 150m
  - [ ] Can create drop at 150m ✅
  - [ ] Shows padlock at 50m and 350m (out of business range)

---

## 9️⃣ **Next Steps for Production**

### **Payment Integration (Priority 1)**
1. Set up Stripe account
2. Create products & pricing
3. Add Stripe Checkout
4. Implement webhooks
5. Create billing portal

### **Admin Panel (Priority 2)**
1. User management table
2. Manual tier assignment
3. Usage analytics
4. Revenue dashboard

### **Polish (Priority 3)**
1. Remove Dev Tier Switcher in production
2. Add onboarding flow
3. Tier comparison page
4. Upgrade CTAs throughout app

---

## 🎉 **Summary**

**✅ What's Working:**
- Tier system fully functional
- Visual feedback (colors, padlocks)
- Backend validation
- Dev tier switcher for testing
- Modal matches tier colors

**❌ What's Missing:**
- Payment processing (Stripe)
- Subscription management
- User can't self-upgrade yet

**🔧 How to Test:**
1. Use Dev Tier Switcher (bottom-left)
2. Try different radii
3. See padlock indicators
4. Check modal colors match
5. Try creating drops

**📍 Radius Behavior:**
- Physical mode = Must be within radius
- Remote mode = Radius is just for organization
- Choose smaller radius for precision
- Choose larger radius for flexibility

---

**Ready to add payments?** Let me know and I can help you implement Stripe! 💰
