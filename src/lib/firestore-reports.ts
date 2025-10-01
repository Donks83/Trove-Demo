import { getFirestore } from 'firebase-admin/firestore'
import { initAdmin } from './firebase-admin'

const app = initAdmin()
const db = getFirestore(app)
const REPORTS_COLLECTION = 'reports'

export interface Report {
  id: string
  dropId: string
  reportedBy: string
  reporterEmail: string
  category: 'inappropriate' | 'harassment' | 'spam' | 'illegal' | 'copyright' | 'other'
  reason: string
  details: string
  dropTitle: string
  dropOwnerId: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new report
 */
export async function createReport(report: Omit<Report, 'id'>): Promise<string> {
  try {
    const reportRef = db.collection(REPORTS_COLLECTION).doc()
    const reportId = reportRef.id

    await reportRef.set({
      id: reportId,
      ...report,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    })

    console.log(`✅ Report created: ${reportId}`)
    return reportId
  } catch (error) {
    console.error('❌ Error creating report:', error)
    throw error
  }
}

/**
 * Get a report by ID
 */
export async function getReport(reportId: string): Promise<Report | null> {
  try {
    const doc = await db.collection(REPORTS_COLLECTION).doc(reportId).get()
    
    if (!doc.exists) {
      return null
    }
    
    const data = doc.data()
    return {
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      reviewedAt: data?.reviewedAt?.toDate(),
    } as Report
  } catch (error) {
    console.error('❌ Error fetching report:', error)
    return null
  }
}

/**
 * Get all reports for a specific drop
 */
export async function getReportsForDrop(dropId: string): Promise<Report[]> {
  try {
    const snapshot = await db.collection(REPORTS_COLLECTION)
      .where('dropId', '==', dropId)
      .orderBy('createdAt', 'desc')
      .get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reviewedAt: data.reviewedAt?.toDate(),
      } as Report
    })
  } catch (error) {
    console.error('❌ Error fetching reports for drop:', error)
    return []
  }
}

/**
 * Get all pending reports (for admin review)
 */
export async function getPendingReports(limit: number = 50): Promise<Report[]> {
  try {
    const snapshot = await db.collection(REPORTS_COLLECTION)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reviewedAt: data.reviewedAt?.toDate(),
      } as Report
    })
  } catch (error) {
    console.error('❌ Error fetching pending reports:', error)
    return []
  }
}

/**
 * Update report status (for admin review)
 */
export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> {
  try {
    await db.collection(REPORTS_COLLECTION).doc(reportId).update({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || '',
      updatedAt: new Date(),
    })
    
    console.log(`✅ Report status updated: ${reportId} -> ${status}`)
  } catch (error) {
    console.error('❌ Error updating report status:', error)
    throw error
  }
}

/**
 * Get report count for a specific drop (useful for moderation)
 */
export async function getReportCountForDrop(dropId: string): Promise<number> {
  try {
    const snapshot = await db.collection(REPORTS_COLLECTION)
      .where('dropId', '==', dropId)
      .where('status', '==', 'pending')
      .get()
    
    return snapshot.size
  } catch (error) {
    console.error('❌ Error counting reports:', error)
    return 0
  }
}
