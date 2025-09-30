/**
 * Test script for delete and edit functionality
 * Tests the new DELETE and PATCH endpoints
 */

const https = require('https')

const API_BASE = 'https://trove-demo.vercel.app'

// You'll need to get a valid auth token from your browser
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'

// Drop ID to test with (will be created in test)
let TEST_DROP_ID = null

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
 * Test 1: Get user drops to find a test drop
 */
async function testGetUserDrops() {
  console.log('\n🔍 Test 1: Getting user drops')
  console.log('='.repeat(60))
  
  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
    console.log('⚠️  Warning: AUTH_TOKEN not set')
    console.log('   Please update the AUTH_TOKEN variable in this script')
    return { success: false, dropId: null }
  }
  
  try {
    const response = await authenticatedRequest('/api/user/drops', {
      method: 'GET'
    })
    
    if (response.status === 200) {
      const drops = response.data.drops || []
      console.log(`✅ Found ${drops.length} drops`)
      
      if (drops.length > 0) {
        TEST_DROP_ID = drops[0].id
        console.log(`   Using drop: "${drops[0].title}" (${TEST_DROP_ID})`)
        return { success: true, dropId: TEST_DROP_ID }
      } else {
        console.log('⚠️  No drops found - please create a drop first')
        return { success: false, dropId: null }
      }
    } else {
      console.log(`❌ Failed with status ${response.status}`)
      return { success: false, dropId: null }
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message)
    return { success: false, dropId: null }
  }
}

/**
 * Test 2: Edit a drop
 */
async function testEditDrop(dropId) {
  console.log('\n🔍 Test 2: Editing drop')
  console.log('='.repeat(60))
  
  if (!dropId) {
    console.log('⚠️  No drop ID available - skipping')
    return false
  }
  
  try {
    const newTitle = `Test Edit ${Date.now()}`
    const newDescription = 'This drop was edited by the test script'
    
    console.log(`Updating drop ${dropId}`)
    console.log(`New title: "${newTitle}"`)
    console.log(`New description: "${newDescription}"`)
    
    const response = await authenticatedRequest(`/api/drops/${dropId}`, {
      method: 'PATCH',
      body: {
        title: newTitle,
        description: newDescription
      }
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Drop updated successfully!')
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
 * Test 3: Edit drop with new secret
 */
async function testEditSecret(dropId) {
  console.log('\n🔍 Test 3: Changing secret phrase')
  console.log('='.repeat(60))
  
  if (!dropId) {
    console.log('⚠️  No drop ID available - skipping')
    return false
  }
  
  try {
    const newSecret = `testsecret${Date.now()}`
    
    console.log(`Updating secret for drop ${dropId}`)
    console.log(`New secret: "${newSecret}"`)
    
    const response = await authenticatedRequest(`/api/drops/${dropId}`, {
      method: 'PATCH',
      body: {
        secret: newSecret
      }
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Secret updated successfully!')
      console.log('⚠️  Note: You\'ll need to use the new secret to unearth this drop')
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
 * Test 4: Get single drop (verify it exists before delete)
 */
async function testGetDrop(dropId) {
  console.log('\n🔍 Test 4: Getting single drop')
  console.log('='.repeat(60))
  
  if (!dropId) {
    console.log('⚠️  No drop ID available - skipping')
    return false
  }
  
  try {
    const response = await authenticatedRequest(`/api/drops/${dropId}`, {
      method: 'GET'
    })
    
    if (response.status === 200 && response.data.drop) {
      console.log(`✅ Drop found: "${response.data.drop.title}"`)
      console.log(`   Description: ${response.data.drop.description}`)
      console.log(`   Stats: ${response.data.drop.stats.views} views, ${response.data.drop.stats.unlocks} unlocks`)
      return true
    } else {
      console.log(`❌ Failed with status ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error:`, error.message)
    return false
  }
}

/**
 * Test 5: Delete drop (commented out for safety)
 */
async function testDeleteDrop(dropId) {
  console.log('\n🔍 Test 5: Delete drop (DISABLED for safety)')
  console.log('='.repeat(60))
  console.log('⚠️  Delete test is disabled by default')
  console.log('   To enable, uncomment the code in this function')
  console.log('   This will permanently delete the test drop!')
  
  // UNCOMMENT BELOW TO ENABLE DELETE TEST
  // WARNING: This will permanently delete the drop!
  
  /*
  if (!dropId) {
    console.log('⚠️  No drop ID available - skipping')
    return false
  }
  
  try {
    console.log(`⚠️  Deleting drop ${dropId}`)
    console.log('   This action cannot be undone!')
    
    const response = await authenticatedRequest(`/api/drops/${dropId}`, {
      method: 'DELETE'
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Drop deleted successfully!')
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
  */
  
  return null // Null = test skipped
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('='.repeat(60))
  console.log('🧪 Delete & Edit Functionality Test Suite')
  console.log('='.repeat(60))
  console.log(`API Base: ${API_BASE}`)
  console.log(`Auth Token: ${AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE' ? '⚠️  NOT SET' : '✅ Set'}`)
  
  const results = []
  
  // Test 1: Get drops
  const getDropsResult = await testGetUserDrops()
  results.push(getDropsResult.success)
  
  if (!getDropsResult.dropId) {
    console.log('\n⚠️  Cannot continue without a test drop')
    console.log('   Please create a drop first and try again')
  } else {
    // Test 2: Edit title and description
    results.push(await testEditDrop(getDropsResult.dropId))
    
    // Test 3: Edit secret
    results.push(await testEditSecret(getDropsResult.dropId))
    
    // Test 4: Get single drop
    results.push(await testGetDrop(getDropsResult.dropId))
    
    // Test 5: Delete (disabled by default)
    const deleteResult = await testDeleteDrop(getDropsResult.dropId)
    if (deleteResult !== null) {
      results.push(deleteResult)
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Results Summary')
  console.log('='.repeat(60))
  
  const validResults = results.filter(r => r !== null && r !== undefined)
  const passed = validResults.filter(r => r === true).length
  const failed = validResults.filter(r => r === false).length
  
  console.log(`✅ Passed: ${passed}/${validResults.length}`)
  console.log(`❌ Failed: ${failed}/${validResults.length}`)
  
  if (passed === validResults.length) {
    console.log('\n🎉 All tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed - check output above')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Next Steps:')
  console.log('1. Test in browser: https://trove-demo.vercel.app/app/drops')
  console.log('2. Try editing a drop')
  console.log('3. Try deleting a test drop')
  console.log('4. Verify files are deleted from Firebase Storage')
  console.log('='.repeat(60))
}

// Instructions
if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
  console.log('\n📝 Setup Instructions:')
  console.log('1. Open https://trove-demo.vercel.app in your browser')
  console.log('2. Login to your account')
  console.log('3. Go to My Drops page')
  console.log('4. Open DevTools (F12) → Network tab')
  console.log('5. Refresh the page')
  console.log('6. Click on the "drops" request')
  console.log('7. Copy the Authorization header value (after "Bearer ")')
  console.log('8. Paste it as AUTH_TOKEN in this script')
  console.log('9. Run this script again\n')
}

// Run the tests
runTests().catch(console.error)
