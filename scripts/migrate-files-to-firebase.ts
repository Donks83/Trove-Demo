/**
 * Migration Script: In-Memory Storage → Firebase Storage
 * 
 * This script migrates files from in-memory storage to Firebase Storage.
 * Run this if you have existing drops with files that need to be preserved.
 * 
 * Usage:
 *   npx tsx scripts/migrate-files-to-firebase.ts
 */

import { uploadedFilesStore, demoDropsStore } from '../src/lib/demo-storage'
import { uploadFileToStorage } from '../src/lib/firebase-storage'

async function migrateFiles() {
  console.log('🚀 Starting file migration to Firebase Storage...\n')

  let successCount = 0
  let failureCount = 0
  let skippedCount = 0

  // Iterate through all files in memory
  for (const [fileId, fileData] of Object.entries(uploadedFilesStore)) {
    try {
      // Extract dropId from fileId (format: dropId_file_index)
      const dropId = fileId.split('_file_')[0]

      // Find the drop
      const drop = demoDropsStore.find(d => d.id === dropId)
      if (!drop) {
        console.log(`⚠️  Skipping ${fileId}: Drop not found`)
        skippedCount++
        continue
      }

      // Find the file in the drop's metadata
      const file = drop.files?.find(f => f.name === fileData.name)
      if (!file) {
        console.log(`⚠️  Skipping ${fileId}: File metadata not found`)
        skippedCount++
        continue
      }

      // Check if already migrated
      if ('storagePath' in file && file.storagePath) {
        console.log(`✅ Already migrated: ${fileData.name}`)
        skippedCount++
        continue
      }

      // Upload to Firebase Storage
      console.log(`⬆️  Uploading ${fileData.name} (${fileData.content.length} bytes)...`)
      const storagePath = await uploadFileToStorage(
        fileData.content,
        fileData.name,
        fileData.type,
        dropId
      )

      // Update the drop metadata with storage path
      if (file) {
        (file as any).storagePath = storagePath
      }

      console.log(`✅ Migrated: ${fileData.name} → ${storagePath}\n`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to migrate ${fileId}:`, error)
      failureCount++
    }
  }

  console.log('\n📊 Migration Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failureCount}`)
  console.log(`   ⚠️  Skipped: ${skippedCount}`)
  console.log(`   📁 Total: ${Object.keys(uploadedFilesStore).length}`)

  if (failureCount > 0) {
    console.log('\n⚠️  Some files failed to migrate. Check the errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 Migration completed successfully!')
  }
}

// Run the migration
migrateFiles().catch(error => {
  console.error('💥 Migration failed:', error)
  process.exit(1)
})
