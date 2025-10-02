# Drop Cleanup Scripts

## delete-drop-by-title.js

Deletes a drop by its exact title.

### Prerequisites

1. Download your Firebase Admin SDK service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in this `scripts` folder

2. Install dependencies (from project root):
   ```bash
   npm install firebase-admin
   ```

### Usage

From the project root directory:

```bash
node scripts/delete-drop-by-title.js "Files for Dave Sharp"
```

The script will:
- Search for drops with the exact title
- Delete all associated files from Firebase Storage
- Delete the Firestore document
- Show detailed progress

### Important Notes

- The title must match exactly (case-sensitive)
- This script requires admin access to Firebase
- **Keep `serviceAccountKey.json` secure and never commit it to git**
- The script will delete ALL drops with matching titles
- There is no undo - use with caution!

### Security

Add this to your `.gitignore`:
```
scripts/serviceAccountKey.json
```
