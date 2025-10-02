/**
 * Script to delete a drop by its title
 * Usage: node scripts/delete-drop-by-title.js "Files for Dave Sharp"
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  // You'll need to download your Firebase service account key
  // and place it in the scripts folder
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();
const storage = admin.storage();

async function deleteDropByTitle(title) {
  try {
    console.log(`🔍 Searching for drop with title: "${title}"`);
    
    // Query for the drop by title
    const dropsSnapshot = await db.collection('drops')
      .where('title', '==', title)
      .get();
    
    if (dropsSnapshot.empty) {
      console.log('❌ No drop found with that title');
      return;
    }
    
    console.log(`📦 Found ${dropsSnapshot.size} drop(s) with that title`);
    
    // Delete each matching drop
    for (const doc of dropsSnapshot.docs) {
      const drop = doc.data();
      const dropId = doc.id;
      
      console.log(`\n🗑️  Deleting drop: ${dropId}`);
      console.log(`   Owner: ${drop.ownerId}`);
      console.log(`   Created: ${drop.createdAt?.toDate()}`);
      console.log(`   Files: ${drop.files?.length || 0}`);
      
      // Delete files from storage
      if (drop.files && drop.files.length > 0) {
        console.log('   Deleting files from storage...');
        const bucket = storage.bucket();
        
        for (const file of drop.files) {
          try {
            const filePath = file.storagePath || `drops/${dropId}/${file.name}`;
            await bucket.file(filePath).delete();
            console.log(`   ✅ Deleted file: ${file.name}`);
          } catch (error) {
            console.log(`   ⚠️  Could not delete file ${file.name}: ${error.message}`);
          }
        }
      }
      
      // Delete the Firestore document
      await doc.ref.delete();
      console.log(`   ✅ Deleted Firestore document`);
    }
    
    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error deleting drop:', error);
    throw error;
  }
}

// Get title from command line arguments
const title = process.argv[2];

if (!title) {
  console.error('❌ Please provide a drop title as an argument');
  console.error('Usage: node scripts/delete-drop-by-title.js "Drop Title"');
  process.exit(1);
}

deleteDropByTitle(title)
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
