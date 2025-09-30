/**
 * Test script to verify the My Drops fix
 * Tests that user drops are fetched from Firestore, not mock data
 */

const https = require('https')

const API_BASE = 'https://trove-demo.vercel.app'

// You'll need to get a valid auth token from your browser
// 1. Login to the app
// 2. Open DevTools → Network tab
// 3. Look for a request to /api/user/drops
// 4. Copy the Authorization header (without "Bearer " prefix)
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'

/**
 * Make an authenticated HTTP request
 */
function authenticatedRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`
    const reqOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...options.headers
      }
    }
    
    const req = https.request(url, reqOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          })
        }
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

/**
 * Test: Fetch user drops
 */
async function testFetchUserDrops() {
  console.log('\n🔍 Testing: GET /api/user/drops')
  console.log('=' .repeat(60))
  
  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
    console.log('⚠️  Warning: AUTH_TOKEN not set')
    console.log('   Please update the AUTH_TOKEN variable in this script')
    console.log('   You can get it from the browser DevTools → Network tab')
    return false
  }
  
  try {
    const response = await authenticatedRequest('/api/user/drops', {
      method: 'GET'
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.status === 401) {
      console.log('❌ Authentication failed')
      console.log('   Your auth token may have expired')
      console.log('   Get a fresh token from the browser and try again')
      return false
    }
    
    if (response.status === 200) {
      const drops = response.data.drops || []
      
      console.log(`✅ Success! Fetched ${drops.length} drops`)
      console.log('')
      
      if (drops.length === 0) {
        console.log('📭 No drops found')
        console.log('   This is expected if you haven\'t created any drops yet')
        console.log('   Create a drop first, then run this test again')
      } else {
        console.log('📦 Drops found:')
        drops.forEach((drop, index) => {
          console.log(`\n   ${index + 1}. ${drop.title}`)
          console.log(`      ID: ${drop.id}`)
          console.log(`      Location: ${drop.coords.lat}, ${drop.coords.lng}`)
          console.log(`      Scope: ${drop.scope}`)
          console.log(`      Files: ${drop.files?.length || 0}`)
          console.log(`      Created: ${drop.createdAt}`)
          console.log(`      Stats: ${drop.stats?.views || 0} views, ${drop.stats?.unlocks || 0} unlocks`)
        })
        
        // Check if these are real drops or mock drops
        console.log('\n🔍 Validating drops are real (not mock data):')
        
        const hasMockDrop1 = drops.some(d => d.id.includes('user-drop-1'))
        const hasMockDrop2 = drops.some(d => d.id.includes('user-drop-2'))
        const hasMyFirstDrop = drops.some(d => d.title === 'My First Drop')
        const hasPhotoArchive = drops.some(d => d.title === 'Photo Archive')
        
        if (hasMockDrop1 || hasMockDrop2 || hasMyFirstDrop || hasPhotoArchive) {
          console.log('   ❌ FOUND MOCK DATA!')
          console.log('   The fix may not be deployed yet')
          console.log('   Mock indicators found:')
          if (hasMockDrop1) console.log('      - ID contains "user-drop-1"')
          if (hasMockDrop2) console.log('      - ID contains "user-drop-2"')
          if (hasMyFirstDrop) console.log('      - Title: "My First Drop"')
          if (hasPhotoArchive) console.log('      - Title: "Photo Archive"')
          return false
        } else {
          console.log('   ✅ All drops appear to be real (no mock data detected)')
          console.log('   Drop IDs look like: drop_[timestamp]_[hash]')
        }
      }
      
      return true
    } else {
      console.log(`❌ Failed with status ${response.status}`)
      console.log('Response:', response.data)
      return false
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message)
    return false
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=' .repeat(60))
  console.log('🧪 My Drops Fix - Test Suite')
  console.log('=' .repeat(60))
  console.log(`API Base: ${API_BASE}`)
  console.log(`Auth Token: ${AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE' ? '⚠️  NOT SET' : '✅ Set'}`)
  
  const result = await testFetchUserDrops()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Result')
  console.log('='.repeat(60))
  
  if (result) {
    console.log('✅ Test PASSED')
    console.log('   My Drops is now fetching real data from Firestore!')
  } else {
    console.log('❌ Test FAILED or INCOMPLETE')
    console.log('   See output above for details')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Next Steps:')
  console.log('1. If auth token not set: Update AUTH_TOKEN in this script')
  console.log('2. If no drops found: Create a drop first')
  console.log('3. If mock data found: Verify deployment completed')
  console.log('4. Test in browser: https://trove-demo.vercel.app/app/drops')
  console.log('='.repeat(60))
}

// Instructions
console.log('\n📝 How to get your auth token:')
console.log('1. Open https://trove-demo.vercel.app in your browser')
console.log('2. Login to your account')
console.log('3. Go to My Drops page')
console.log('4. Open DevTools (F12) → Network tab')
console.log('5. Refresh the page')
console.log('6. Click on the "drops" request')
console.log('7. Copy the Authorization header value (after "Bearer ")')
console.log('8. Paste it as AUTH_TOKEN in this script')
console.log('9. Run this script again\n')

// Run the tests
runTests().catch(console.error)
