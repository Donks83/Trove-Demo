import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { getDrop } from '@/lib/firestore-drops'
import { createReport } from '@/lib/firestore-reports'

// Force this route to be dynamic (not statically rendered)
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    dropId: string
  }
}

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Report a drop for inappropriate content
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { dropId } = params
    const { reason, category, details } = await request.json()

    console.log(`🚨 Report submitted for drop: ${dropId}`)

    // Verify user
    const user = await verifyAuthToken(request)
    if (!user) {
      const response = NextResponse.json(
        { success: false, error: 'Authentication required to submit reports' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }

    // Validate inputs
    if (!category || !reason) {
      const response = NextResponse.json(
        { success: false, error: 'Category and reason are required' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Verify drop exists
    const drop = await getDrop(dropId)
    if (!drop) {
      const response = NextResponse.json(
        { success: false, error: 'Drop not found' },
        { status: 404 }
      )
      return addCorsHeaders(response)
    }

    // Create report
    const report = {
      dropId,
      reportedBy: user.uid,
      reporterEmail: user.email || 'unknown',
      category,
      reason,
      details: details || '',
      dropTitle: drop.title,
      dropOwnerId: drop.ownerId,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await createReport(report)

    console.log(`✅ Report created for drop: ${dropId}`)

    const response = NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Error submitting report:', error)
    const response = NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
