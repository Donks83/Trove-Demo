import { getStorage } from 'firebase-admin/storage'
import { initAdmin } from './firebase-admin'

// Initialize Firebase Admin (reuses existing instance)
initAdmin()

// Get bucket name from environment
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

if (!STORAGE_BUCKET) {
  throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set')
}

/**
 * Upload a file to Firebase Storage
 * @param buffer - File content as Buffer
 * @param fileName - Name of the file
 * @param mimeType - MIME type of the file
 * @param dropId - ID of the drop this file belongs to
 * @returns Download URL for the file
 */
export async function uploadFileToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  dropId: string
): Promise<string> {
  try {
    const bucket = getStorage().bucket(STORAGE_BUCKET) // Explicitly pass bucket name
    const filePath = `drops/${dropId}/${fileName}`
    const file = bucket.file(filePath)

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          dropId,
          uploadedAt: new Date().toISOString(),
        },
      },
      public: false, // Keep files private, require authentication
    })

    // Generate a signed URL that expires in 1 hour (can be refreshed as needed)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    })

    console.log(`✅ File uploaded to Firebase Storage: ${filePath}`)
    return filePath // Return the path, we'll generate signed URLs on download
  } catch (error) {
    console.error('❌ Error uploading file to Firebase Storage:', error)
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download a file from Firebase Storage
 * @param filePath - Path to the file in Firebase Storage (e.g., "drops/dropId/fileName")
 * @returns Buffer containing the file content
 */
export async function downloadFileFromStorage(filePath: string): Promise<Buffer> {
  try {
    const bucket = getStorage().bucket(STORAGE_BUCKET) // Explicitly pass bucket name
    const file = bucket.file(filePath)

    const [buffer] = await file.download()
    console.log(`✅ File downloaded from Firebase Storage: ${filePath}`)
    return buffer
  } catch (error) {
    console.error(`❌ Error downloading file from Firebase Storage: ${filePath}`, error)
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a signed URL for a file in Firebase Storage
 * @param filePath - Path to the file
 * @param expiresInMs - Expiration time in milliseconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedUrl(filePath: string, expiresInMs = 60 * 60 * 1000): Promise<string> {
  try {
    const bucket = getStorage().bucket(STORAGE_BUCKET) // Explicitly pass bucket name
    const file = bucket.file(filePath)

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMs,
    })

    return signedUrl
  } catch (error) {
    console.error(`❌ Error generating signed URL for: ${filePath}`, error)
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a file from Firebase Storage
 * @param filePath - Path to the file
 */
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  try {
    const bucket = getStorage().bucket(STORAGE_BUCKET) // Explicitly pass bucket name
    const file = bucket.file(filePath)

    await file.delete()
    console.log(`✅ File deleted from Firebase Storage: ${filePath}`)
  } catch (error) {
    console.error(`❌ Error deleting file from Firebase Storage: ${filePath}`, error)
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete all files associated with a drop
 * @param dropId - ID of the drop
 */
export async function deleteDropFiles(dropId: string): Promise<void> {
  try {
    const bucket = getStorage().bucket(STORAGE_BUCKET) // Explicitly pass bucket name
    const [files] = await bucket.getFiles({
      prefix: `drops/${dropId}/`,
    })

    await Promise.all(files.map((file) => file.delete()))
    console.log(`✅ Deleted ${files.length} files for drop: ${dropId}`)
  } catch (error) {
    console.error(`❌ Error deleting files for drop: ${dropId}`, error)
    throw new Error(`Failed to delete drop files: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if a file exists in Firebase Storage
 * @param filePath - Path to the file
 * @returns True if file exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const bucket = getStorage().bucket(STORAGE_BUCKET) // Explicitly pass bucket name
    const file = bucket.file(filePath)
    const [exists] = await file.exists()
    return exists
  } catch (error) {
    console.error(`❌ Error checking if file exists: ${filePath}`, error)
    return false
  }
}
