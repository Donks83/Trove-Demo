import { createHash } from 'crypto'

// Helper function to hash secret phrases consistently
function hashSecret(secret: string): string {
  return createHash('sha256').update(secret.trim().toLowerCase()).digest('hex')
}

// In-memory storage for demo drops (in production this would be a database)
let demoDropsStore: any[] = [
  {
    id: 'test-drop-1',
    title: 'Test Drop - Try Me!',
    description: 'A test drop you can unlock. Secret: "test123"',
    coords: { lat: 51.5074, lng: -0.1278, geohash: 'gcpvj0' },
    geofenceRadiusM: 100,
    tier: 'free',
    scope: 'public',
    retrievalMode: 'remote',
    stats: { views: 15, unlocks: 8 },
    createdAt: new Date(),
    secretHash: hashSecret('test123'), // Properly hashed secret
    files: [
      {
        id: 'file1',
        name: 'treasure-map.pdf',
        size: 1024576,
        type: 'application/pdf',
        downloadUrl: '/api/drops/test-drop-1/files/treasure-map.pdf'
      },
      {
        id: 'file2',
        name: 'secret-note.txt',
        size: 2048,
        type: 'text/plain',
        downloadUrl: '/api/drops/test-drop-1/files/secret-note.txt'
      }
    ]
  },
  {
    id: 'test-drop-2',
    title: '📍 Physical Drop Demo',
    description: 'Test physical-only drop (you must be within 50m). Secret: "location123"',
    coords: { lat: 51.5155, lng: -0.1425, geohash: 'gcpvn0' },
    geofenceRadiusM: 50,
    tier: 'premium',
    scope: 'public',
    retrievalMode: 'physical',
    stats: { views: 23, unlocks: 3 },
    createdAt: new Date(),
    secretHash: hashSecret('location123'),
    files: [
      {
        id: 'file3',
        name: 'premium-content.zip',
        size: 5242880,
        type: 'application/zip',
        downloadUrl: '/api/drops/test-drop-2/files/premium-content.zip'
      }
    ]
  },
  {
    id: 'test-drop-3',
    title: 'Files for Dave Sharp',
    description: 'Demo drop for Dave Sharp. Secret: "Fake Believe"',
    coords: { lat: 54.575663, lng: -1.229192, geohash: 'gcyej8' },
    geofenceRadiusM: 75,
    tier: 'premium',
    scope: 'public',
    retrievalMode: 'remote',
    stats: { views: 12, unlocks: 5 },
    createdAt: new Date(),
    secretHash: hashSecret('Fake Believe'),
    files: [
      {
        id: 'file4',
        name: 'dave-sharp-documents.pdf',
        size: 2097152,
        type: 'application/pdf',
        downloadUrl: '/api/drops/test-drop-3/files/dave-sharp-documents.pdf'
      },
      {
        id: 'file5',
        name: 'project-notes.docx',
        size: 1048576,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        downloadUrl: '/api/drops/test-drop-3/files/project-notes.docx'
      },
      {
        id: 'file6',
        name: 'meeting-recording.mp3',
        size: 15728640,
        type: 'audio/mpeg',
        downloadUrl: '/api/drops/test-drop-3/files/meeting-recording.mp3'
      }
    ]
  }
]

let uploadedFilesStore: Record<string, { name: string; content: Buffer; type: string }> = {}

export { demoDropsStore, uploadedFilesStore }