// Simple debug script to test the API endpoint
const testAPI = async () => {
  try {
    console.log('Testing /api/drops endpoint...')
    
    const response = await fetch('http://localhost:3000/api/drops?north=90&south=-90&east=180&west=-180')
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      console.log('Error response:', await response.text())
    } else {
      const data = await response.json()
      console.log('Success response:', data)
    }
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

testAPI()
