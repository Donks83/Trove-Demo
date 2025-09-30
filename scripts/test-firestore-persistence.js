/**
 * Test script to verify Firestore persistence fix
 * Tests the "Happy Birthday!" drop and overall Firestore connectivity
 */

const https = require('https')

const API_BASE = 'https://trove-demo.vercel.app'

// Test configuration
const TEST_DROP = {
  id: 'drop_1759216620310_d61963e4',
  title: 'Happy Birthday!',
  secret: 'Happy Birthday!',
  // Update these coordinates to match the actual drop location
  coords: {
    lat: 51.5074, // Example coordinates (London)
    lng: -0.1278
  }
}

/**
 * Make an HTTP request
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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
 * Test 1: Fetch all drops (tests Firestore READ)
 */
async function testFetchDrops() {
  console.log('\n🔍 Test 1: Fetching all drops from Firestore...')
  
  try {
    const response = await request(`${API_BASE}/api/drops`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      const drops = response.data.drops || []
      console.log(`✅ Success! Found ${drops.length} drops`)
      
      // Check if our test drop is in the results
      const testDrop = drops.find(d => d.id === TEST_DROP.id)
      if (testDrop) {
        console.log(`✅ Found test drop: "${testDrop.title}"`)
        return true
      } else {
        console.log(`⚠️  Test drop "${TEST_DROP.title}" not found in results`)
        console.log('   Available drops:', drops.map(d => d.title).join(', '))
        return false
      }
    } else {
      console.log(`❌ Failed with status ${response.status}`)
      console.log('   Response:', response.data)
      return false
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message)
    return false
  }
}

/**
 * Test 2: Unearth the "Happy Birthday!" drop
 */
async function testUnearthDrop() {
  console.log('\n🔍 Test 2: Unearthing "Happy Birthday!" drop...')
  console.log(`   Location: ${TEST_DROP.coords.lat}, ${TEST_DROP.coords.lng}`)
  console.log(`   Secret: "${TEST_DROP.secret}"`)
  
  try {
    const response = await request(`${API_BASE}/api/drops/unearth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        coords: TEST_DROP.coords,
        secret: TEST_DROP.secret
      }
    })
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ Success! Found drop: "${response.data.metadata.title}"`)
      console.log(`   Files: ${response.data.metadata.fileNames.join(', ')}`)
      console.log(`   Distance: ${response.data.distance.toFixed(2)}m`)
      return true
    } else if (response.status === 200 && !response.data.success) {
      console.log(`❌ Failed: ${response.data.error}`)
      console.log('   Possible reasons:')
      console.log('   1. Drop location coordinates are incorrect in this script')
      console.log('   2. Outside geofence radius')
      console.log('   3. Secret phrase mismatch')
      return false
    } else {
      console.log(`❌ Failed with status ${response.status}`)
      console.log('   Response:', response.data)
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
  console.log('='.repeat(60))
  console.log('🧪 Trove Firestore Persistence Test Suite')
  console.log('='.repeat(60))
  console.log(`API Base: ${API_BASE}`)
  console.log(`Test Drop: "${TEST_DROP.title}" (${TEST_DROP.id})`)
  
  const results = []
  
  // Test 1: Fetch drops
  results.push(await testFetchDrops())
  
  // Test 2: Unearth drop
  results.push(await testUnearthDrop())
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Results Summary')
  console.log('='.repeat(60))
  
  const passed = results.filter(r => r === true).length
  const failed = results.filter(r => r === false).length
  
  console.log(`✅ Passed: ${passed}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  
  if (passed === results.length) {
    console.log('\n🎉 All tests passed! Firestore persistence is working!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Next Steps:')
  console.log('1. If tests pass: ✅ Persistence is working!')
  console.log('2. If tests fail: Update TEST_DROP coordinates in this script')
  console.log('3. Create a new drop and test unearthing it')
  console.log('4. Wait 10 minutes and test again (serverless cold start)')
  console.log('='.repeat(60))
}

// Run the tests
runTests().catch(console.error)
