// Admin script to assign user tiers in Firebase
// Run with: node scripts/assign-tier.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need your service account key)
// Download from: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function assignTier(userEmail, newTier) {
  try {
    // Validate tier
    const validTiers = ['free', 'premium', 'paid'];
    if (!validTiers.includes(newTier)) {
      console.error(`❌ Invalid tier: ${newTier}. Must be one of: ${validTiers.join(', ')}`);
      return;
    }

    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .get();

    if (usersSnapshot.empty) {
      console.error(`❌ No user found with email: ${userEmail}`);
      return;
    }

    // Update the first matching user
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      tier: newTier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Successfully updated ${userEmail} to ${newTier} tier`);
    console.log(`   User ID: ${userDoc.id}`);
  } catch (error) {
    console.error('❌ Error assigning tier:', error);
  }
}

// Get command line arguments
const email = process.argv[2];
const tier = process.argv[3];

if (!email || !tier) {
  console.log('Usage: node assign-tier.js <email> <tier>');
  console.log('');
  console.log('Example: node assign-tier.js user@example.com premium');
  console.log('');
  console.log('Valid tiers: free, premium, paid');
  process.exit(1);
}

// Run the function
assignTier(email, tier).then(() => {
  process.exit(0);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
