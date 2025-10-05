# TROVE Platform Overview & User Guide

## Executive Summary

**Trove** is a revolutionary location-based file sharing platform that anchors digital content to physical geographic coordinates. Unlike traditional cloud storage, Trove creates a "digital treasure map" where files can only be accessed at specific locations with secret passphrases, enabling entirely new workflows for businesses and consumers.

---

## How Trove Works: The Core Concept

### The Three-Step Process

1. **Bury** - Upload files and anchor them to GPS coordinates
2. **Secure** - Protect with a secret phrase and geofence radius  
3. **Unearth** - Others discover and unlock files at that location

### Technical Architecture

```
User Location (GPS) + Secret Phrase → Authentication → File Access
         ↓                    ↓
   Geofence Check    Secret Hash Match
         ↓                    ↓
         → UNLOCK FILES ←
```

---

## Core Features

### 1. **Location-Based File Anchoring**
- Files are "buried" at precise GPS coordinates (latitude/longitude)
- Customizable geofence radius (25m to 1000m+)
- Real-time distance validation
- Works anywhere in the world

### 2. **Flexible Visibility Modes**

#### Hidden Drops
- Not visible on the map
- Requires exact coordinates
- Perfect for secret sharing
- Use case: Confidential document delivery

#### Public Drops  
- Visible as pins on the map
- Anyone can discover them
- Great for geocaching & community engagement
- Use case: Public art installations, educational content

#### Treasure Hunts (Premium)
- Gamified experience with proximity hints
- Hunt codes for invited participants
- Difficulty levels (Beginner to Master)
- Real-time "hot/cold" feedback
- Use case: Team building, marketing campaigns

### 3. **Access Control Systems**

#### Shared Access
- Anyone with location + secret can unlock
- Perfect for team collaboration
- Multiple people can access same files
- Use case: Construction site document sharing

#### Private Access
- Only the owner can unlock
- Even with correct secret, others blocked
- Personal file storage
- Use case: Location-based personal notes

### 4. **Unlock Modes**

#### Remote Unlock (All Tiers)
- Access from anywhere globally
- Click map pin + enter secret
- No physical presence required
- Use case: Remote document delivery

#### Physical Unlock (Premium+)
- GPS-validated physical presence required
- Must be within geofence radius
- Anti-spoofing verification
- Use case: Field inspections, scavenger hunts

### 5. **Tiered System**

| Feature | Free | Paid | Premium |
|---------|------|------|---------|
| Max File Size | 10MB | 50MB | 200MB |
| Geofence Radius | 300m+ | 100m+ | 25m+ |
| Physical Mode | ❌ | ❌ | ✅ |
| Treasure Hunts | ❌ | ❌ | ✅ |
| Public Drop Expiry | 3 days | 365 days | Never |
| Hidden Drop Expiry | 30 days | 365 days | Never |

---

## Platform Features

### Map Interface
- **Interactive Global Map** - Google Maps integration with real-time positioning
- **Radius Slider** - Visual geofence adjustment before creating drops
- **Drop Pins** - Color-coded by type (public, hunt, etc.)
- **Location Search** - Find addresses or coordinates instantly
- **Current Location** - One-click GPS positioning

### File Management
- **Multi-file Support** - Upload multiple files per drop
- **Type Support** - Documents, images, videos, audio, archives
- **Drag & Drop** - Intuitive file upload
- **Preview** - See file names and sizes before burial
- **Download** - One-click file retrieval after unlock

### Security Features
- **SHA-256 Secret Hashing** - Military-grade secret phrase protection
- **Case-Sensitive Secrets** - Exact phrase matching required
- **Firebase Authentication** - Secure user accounts
- **Owner Verification** - Private drops owner-validated
- **Report System** - Community moderation for inappropriate content

### User Management
- **Profile System** - Track your buried drops
- **Drop History** - See all your created drops
- **Stats Dashboard** - Views, unlocks, engagement metrics
- **Edit/Delete** - Manage your drops anytime

---

## How To Use Trove: Step-by-Step Guide

### For Drop Creators (Burying Files)

#### Step 1: Create Account
1. Visit trove-demo.vercel.app
2. Click "Sign Up"
3. Enter email and create password
4. Verify email address
5. You're ready to bury!

#### Step 2: Choose Your Location
1. Click anywhere on the map OR
2. Use search bar to find address OR
3. Click "Use My Location" for current GPS
4. Adjust the radius slider to set geofence size

#### Step 3: Prepare Your Drop
1. Click "Bury Files Here" button
2. The Create Drop modal opens
3. See your selected coordinates displayed

#### Step 4: Select Visibility
Choose how discoverable your drop should be:
- **Hidden** - Secret location, no map pin
- **Public** - Visible pin, anyone can find
- **Hunt** - Gamified with hunt codes (Premium only)

#### Step 5: Set Access Control
- **Shared** - Anyone with secret can unlock
- **Private** - Only you can access (owner-locked)

#### Step 6: Upload Files
1. Drag files into upload zone OR
2. Click to browse files
3. See file size limits for your tier
4. Remove unwanted files with X button

#### Step 7: Add Details
- **Title** - Name your drop (e.g., "Q4 Site Plans")
- **Description** - Optional context or instructions
- **Secret Phrase** - Create unique passphrase (case-sensitive!)
  - Pro tip: Make it memorable but unique
  - Example: "BlueCoffee2024" not "password"

#### Step 8: Configure Settings
- **Unlock Mode** - Remote (anywhere) or Physical (on-site)
- **Expiry** - Set auto-deletion timeframe
  - Free public drops: Max 3 days
  - Hidden drops: Up to 30 days
  - Premium: Never expire option

#### Step 9: Create Drop
1. Review all settings
2. Click "Bury Drop" button
3. Wait for upload confirmation
4. Share modal appears with:
   - Drop link
   - QR code
   - Coordinates
   - Secret phrase reminder

#### Step 10: Share Access
- Copy link to share via email/message
- Show QR code for instant access
- Tell recipients the secret phrase
- For hunts: Share hunt code with participants

### For Drop Hunters (Unearthing Files)

#### Method 1: Direct Link
1. Click shared Trove link
2. Opens map at drop location
3. Click "Unearth" button
4. Enter secret phrase
5. Files unlock and download

#### Method 2: Map Exploration
1. Open Trove app
2. Explore public drop pins on map
3. Click pin to see drop info
4. Click "Unearth" at that location
5. Enter secret phrase if you know it
6. Download unlocked files

#### Method 3: Coordinate Entry
1. If you have exact coordinates
2. Click map at those coordinates OR
3. Search for coordinates in search bar
4. Click "Unearth" button
5. Enter secret phrase
6. Access files

#### Method 4: Treasure Hunt (Premium)
1. Receive hunt code from organizer
2. Enter hunt code in app
3. See distance to treasure
4. Get "hot/cold" proximity hints
5. Navigate to location
6. Secret phrase provided with hunt
7. Unlock treasure files

### Disambiguation (Multiple Drops)
If multiple drops exist at same location with same secret:
1. Trove shows list of matching drops
2. Each shows: Title, Description, File count, Owner
3. Select correct drop from list
4. Files unlock for chosen drop

---

## Business Use Cases

### 1. Construction & Field Services
**Problem:** Site workers need current blueprints, safety docs, inspection reports  
**Trove Solution:** Bury files at job site coordinates
- Workers arrive on-site
- Physical unlock ensures they're actually there
- Always access latest documents
- No emailing huge file attachments
- Audit trail of who accessed when

**Example:** Electrical subcontractor arrives at site
1. Opens Trove app
2. GPS confirms they're on-site
3. Enters site password
4. Downloads current wiring diagrams
5. References offline all day

### 2. Real Estate
**Problem:** Property-specific docs scattered across emails, folders  
**Trove Solution:** Anchor all property documents to exact address
- Listing details, inspection reports, disclosures
- Virtual tour videos and photos
- Homeowner manuals, warranties
- Buyer can access everything at property location

**Example:** Home buyer doing final walkthrough
1. Stands at property
2. Opens Trove
3. Accesses all property documents
4. Reviews inspection report on-site
5. Checks specific concerns in real-time

### 3. Emergency Services
**Problem:** First responders need building plans, hazmat info instantly  
**Trove Solution:** Pre-position critical data at every location
- Building floor plans at hospitals, schools
- Hazmat data at chemical facilities
- Utility shutoff locations
- Emergency contact information

**Example:** Fire crew responds to warehouse fire
1. Arrive on scene
2. Access pre-positioned building plans
3. See hazmat storage locations
4. View utility shutoff positions
5. Execute safer, faster response

### 4. Event Management
**Problem:** Attendees need schedules, maps, resources for venue  
**Trove Solution:** Location-based event content
- Conference schedules at convention center
- Museum exhibit info at each location
- Festival maps and schedules
- VIP area access codes

**Example:** Conference attendee
1. Arrives at venue
2. Unlocks event schedule and map
3. Gets speaker bios and presentation files
4. Accesses WiFi credentials
5. Downloads vendor contact info

### 5. Education & Field Research
**Problem:** Geotagged data collection in field studies  
**Trove Solution:** Anchor observations, samples, notes to exact locations
- Biology field study observations
- Geological survey data
- Archaeological site documentation
- Environmental monitoring

**Example:** Research team studying watershed
1. Takes water samples at specific points
2. Buries test results at sample GPS coordinates
3. Photos, measurements, analysis files
4. Team members access data at each site
5. Builds geographic dataset

### 6. Marketing & Customer Engagement
**Problem:** Need interactive location-based experiences  
**Trove Solution:** Treasure hunts and geo-marketing campaigns
- Scavenger hunts for product launches
- Location-based discount codes
- Interactive brand experiences
- Tourist information at landmarks

**Example:** Coffee shop grand opening
1. Creates treasure hunt around neighborhood
2. 10 hidden drops with discount codes
3. Customers follow clues
4. Physical unlock at each location
5. Unlock exclusive offers
6. Drives foot traffic and engagement

---

## Advanced Features

### Treasure Hunt System
**Components:**
- Hunt Code generation (e.g., HUNT-L3K5M-XY9Z)
- Difficulty levels with different geofence sizes
- Proximity hints ("You're getting warmer!")
- Participant tracking
- Leaderboards (coming soon)

**Hunt Difficulty Settings:**
- 🟢 **Beginner** - 100m+ radius, strong hints
- 🟡 **Intermediate** - 50m radius, moderate hints  
- 🟠 **Expert** - 25m radius, minimal hints
- 🔴 **Master** - Exact coordinates required

### Reporting System
Users can report inappropriate drops:
- Spam/Commercial content
- Inappropriate content
- Dangerous/Illegal items
- Location misuse
- Copyright violation

Reports reviewed by moderation team for action.

### Statistics & Analytics
Track engagement for each drop:
- **Views** - How many times pin clicked
- **Unlocks** - Successful file access count
- **Last Accessed** - Most recent unlock time
- **Distance Data** - How far users were when unlocking

---

## Mobile Experience

### Responsive Design
- Optimized for phones and tablets
- Touch-friendly interface
- GPS works on mobile browsers
- Download files directly to device

### Progressive Web App Features
- Add to home screen
- Offline map caching (coming soon)
- Push notifications for nearby drops (coming soon)
- Background location tracking for hunts (coming soon)

---

## Data & Privacy

### Data Storage
- **Files** - Encrypted in Firebase Cloud Storage
- **Metadata** - Firestore NoSQL database
- **Secrets** - One-way SHA-256 hashed, never stored plain
- **Location** - Coordinates stored, no tracking history

### Privacy Controls
- Private drops visible only to owner
- Secret phrases never exposed in API
- Location data not shared with third parties
- User email addresses protected
- Download history private

### Data Retention
- Drops expire per tier settings
- Auto-deletion after expiry date
- Owner can delete anytime
- Deleted files removed from storage within 24 hours

---

## Technical Specifications

### Platform Stack
- **Frontend** - Next.js 14, React, TypeScript
- **Backend** - Next.js API Routes, Firebase Functions
- **Database** - Cloud Firestore
- **Storage** - Firebase Cloud Storage
- **Authentication** - Firebase Auth
- **Maps** - Google Maps JavaScript API
- **Hosting** - Vercel Edge Network

### APIs Available
- REST API for programmatic access
- Drop creation, unlocking, management
- Location-based queries
- User management
- Documentation available for developers

### Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

---

## Pricing Structure

### Free Tier
**Perfect for personal use**
- 10MB max file size
- 300m minimum geofence radius
- Remote unlock only
- Public drops expire in 3 days
- Hidden drops expire in 30 days
- Unlimited drops

### Paid Tier ($9.99/month)
**For professionals**
- 50MB max file size
- 100m minimum geofence radius
- Remote unlock only
- 365 day expiry
- Priority support
- Analytics dashboard

### Premium Tier ($24.99/month)
**For businesses**
- 200MB max file size
- 25m precision geofence
- **Physical unlock mode**
- **Treasure hunt creation**
- Never-expire option
- Advanced analytics
- Team collaboration features
- Priority support
- Custom branding (coming soon)

### Enterprise (Custom)
**For organizations**
- Unlimited file sizes
- Custom geofence rules
- Dedicated infrastructure
- SSO integration
- Admin dashboard
- API access
- White label option
- SLA guarantee
- Dedicated account manager

---

## Roadmap Features

### Coming Q1 2026
- Team collaboration workspaces
- Multi-user hunt participation
- Real-time leaderboards
- Push notifications for nearby drops
- Offline mode with sync
- QR code generation

### Coming Q2 2026
- Mobile native apps (iOS/Android)
- Augmented reality drop viewing
- Voice-activated unlocking
- Integration with popular tools (Slack, Drive, Dropbox)
- Advanced analytics dashboard
- Custom branded hunts

### Coming Q3 2026
- Enterprise admin console
- SSO and Active Directory integration
- Compliance certifications (SOC2, GDPR)
- API marketplace
- Developer SDK
- Webhook support

---

## Support Resources

### Documentation
- Full API documentation
- Video tutorials
- Feature guides
- FAQ section

### Support Channels
- Email: support@trove-app.com
- In-app chat support (Premium+)
- Community forum
- Twitter: @TroveApp

### Business Inquiries
- Sales: sales@trove-app.com
- Partnerships: partners@trove-app.com
- Press: press@trove-app.com

---

## Getting Started Checklist

### For New Users
- [ ] Create account at trove-demo.vercel.app
- [ ] Complete profile setup
- [ ] Try demo drops on map
- [ ] Create your first hidden drop
- [ ] Share a drop with a friend
- [ ] Explore public drops nearby
- [ ] Upgrade to access premium features

### For Businesses
- [ ] Schedule demo with sales team
- [ ] Identify use cases in your workflow
- [ ] Run pilot program with team
- [ ] Train team members
- [ ] Integrate with existing tools
- [ ] Roll out organization-wide
- [ ] Monitor usage analytics

---

## Success Stories (Coming Soon)

We're collecting case studies from early adopters across:
- Construction companies reducing document delivery time by 90%
- Real estate teams closing deals 30% faster
- Event companies creating viral marketing campaigns
- Research institutions improving field data quality

---

## Conclusion

Trove transforms static cloud storage into location-intelligent file management. By anchoring digital content to physical space, we enable workflows that were previously impossible.

Whether you're burying blueprints at construction sites, creating treasure hunts for marketing, or ensuring first responders have critical building plans, Trove makes location-based file sharing simple, secure, and powerful.

**Ready to get started?** Visit [trove-demo.vercel.app](https://trove-demo.vercel.app)

---

*Document Version: 1.0*  
*Last Updated: October 2025*  
*© 2025 Trove. All rights reserved.*
