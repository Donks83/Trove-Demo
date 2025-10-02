# Firebase & Vercel Usage Limits - Free Tiers

## 🔥 Firebase Spark (Free) Plan Limits

### Firestore Database
- ⚠️ **50,000 reads/day** - Most likely to hit
- **20,000 writes/day**
- **20,000 deletes/day**
- **1 GB stored data**

**Resets:** Daily at midnight UTC

### Storage
- **1 GB stored**
- **10 GB download bandwidth/month**
- **50,000 download operations/day**

### Authentication
- ✅ Unlimited (most auth methods)

### Hosting/Functions
- **10 GB bandwidth/month**
- **125K function invocations/day**

## ▲ Vercel Free (Hobby) Plan Limits

- **100 GB bandwidth/month**
- **100 GB-hours compute/month**
- **6,000 minutes build time/month**
- No daily limits (monthly only)

## 🗺️ Mapbox Free Tier

- **50,000 map loads/month**
- **100,000 geocoding requests/month**

## 📊 How to Monitor Usage

### Check Firebase Usage
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to: **Usage and billing** (left sidebar)
4. Check "Cloud Firestore" reads/writes
5. Look for red/orange indicators

### Check Vercel Usage
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Usage" tab
4. Check bandwidth and function execution

### Check Mapbox Usage
1. Go to [Mapbox Dashboard](https://account.mapbox.com)
2. Click "Statistics"
3. Check map loads and API requests

## 🚨 Signs You've Hit a Limit

### Firestore (50K reads/day)
- ❌ Drops don't load
- ❌ "My Drops" page is empty
- ❌ Authentication seems to work but no data loads
- ✅ **Works again after midnight UTC**

### Storage Bandwidth (10GB/month)
- ❌ Files don't download
- ❌ Images don't load
- Works again next month

### Vercel Bandwidth (100GB/month)
- ❌ Site becomes unavailable
- Usually not hit unless very popular

## 💡 Your Symptoms Match: Firestore Daily Read Limit

**Pattern:** Works → Stops → Works again later

This is **exactly** what happens when you hit the 50K reads/day limit on Firestore.

## 🔧 Quick Fixes

### Immediate (While Testing)
1. **Wait until midnight UTC** (resets daily)
2. **Use local development** (`npm run dev`) - doesn't hit Firebase limits
3. **Use demo data only** - already in memory, no Firestore reads

### Long-term Solutions
1. **Upgrade to Firebase Blaze Plan** (pay-as-you-go)
   - First 50K reads still free
   - Then $0.06 per 100K reads
   - Very cheap for personal projects

2. **Optimize Queries**
   - Cache data on client side
   - Limit number of drops fetched
   - Use pagination

3. **Use IndexedDB for Caching**
   - Store fetched drops locally
   - Only refresh periodically

## 📈 Typical Usage for Your App

### Per Page Load (Logged In)
- Auth check: ~2 reads
- Load public drops: ~5-10 reads (depending on how many)
- Load user profile: 1 read
- **Total: ~8-13 reads per page load**

### Testing Scenario
If you reload the page 50 times testing = **400-650 reads**
If you test 100 times = **800-1,300 reads**

**You could hit 50K with ~4,000-6,000 page loads/day**

## ✅ Recommended Actions

1. **Check Firebase Console NOW** - see if you're near 50K reads
2. **If near limit:** 
   - Stop testing on production for today
   - Use `npm run dev` locally instead
3. **If this is a recurring issue:**
   - Consider upgrading to Blaze plan (probably costs $0-5/month)
4. **Enable usage alerts** in Firebase console

## 💰 Cost Estimate (Blaze Plan)

If you go over 50K reads/day:
- 100K extra reads = $0.06
- 1M extra reads = $0.60
- Very affordable for development!

## 🔗 Quick Links

- [Firebase Usage Dashboard](https://console.firebase.google.com)
- [Vercel Usage Dashboard](https://vercel.com/dashboard/usage)
- [Firebase Pricing Calculator](https://firebase.google.com/pricing#blaze-calculator)
