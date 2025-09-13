import { createHash } from 'crypto'
import type { TreasureHunt, HuntParticipant } from '@/types'

// Helper function to hash secret phrases consistently
function hashSecret(secret: string): string {
  return createHash('sha256').update(secret.trim().toLowerCase()).digest('hex')
}

// In-memory storage for demo drops (in production this would be a database)
// eslint-disable-next-line prefer-const
let demoDropsStore: any[] = [
  {
    id: 'test-drop-1',
    title: 'Test Drop - Try Me!',
    description: 'A test drop you can unlock. Secret: "test123"',
    coords: { lat: 51.5074, lng: -0.1278, geohash: 'gcpvj0' },
    geofenceRadiusM: 100,
    tier: 'free',
    scope: 'public',
    dropType: 'public',
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
    dropType: 'public',
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
    id: 'hunt-drop-1',
    title: '🏆 Office Coffee Quest',
    description: 'Find the secret treasure near the office coffee machine! Join with code: HUNT-COFFEE-2024',
    coords: { lat: 51.5074, lng: -0.1278, geohash: 'gcpvj0' },
    geofenceRadiusM: 50,
    tier: 'premium',
    scope: 'private',
    dropType: 'hunt',
    huntCode: 'HUNT-COFFEE-2024',
    huntDifficulty: 'beginner',
    retrievalMode: 'physical',
    stats: { views: 5, unlocks: 2 },
    createdAt: new Date(),
    secretHash: hashSecret('coffee treasure'),
    files: [
      {
        id: 'hunt-file-1',
        name: 'coffee-treasure-map.pdf',
        size: 512000,
        type: 'application/pdf',
        downloadUrl: '/api/drops/hunt-drop-1/files/coffee-treasure-map.pdf'
      }
    ]
  },
  {
    id: 'hunt-drop-2',
    title: '🎯 London Bridge Hunt',
    description: 'Advanced treasure hunt near London Bridge. Expert level! Join with code: HUNT-BRIDGE-EXPERT',
    coords: { lat: 51.5055, lng: -0.0754, geohash: 'gcpvn1' },
    geofenceRadiusM: 15,
    tier: 'premium',
    scope: 'private',
    dropType: 'hunt',
    huntCode: 'HUNT-BRIDGE-EXPERT',
    huntDifficulty: 'expert',
    retrievalMode: 'physical',
    stats: { views: 3, unlocks: 1 },
    createdAt: new Date(),
    secretHash: hashSecret('bridge master'),
    files: [
      {
        id: 'hunt-file-2',
        name: 'london-bridge-secret.jpg',
        size: 1048576,
        type: 'image/jpeg',
        downloadUrl: '/api/drops/hunt-drop-2/files/london-bridge-secret.jpg'
      }
    ]
  },
  {
    id: 'hunt-drop-3',
    title: '🌟 Beginner Treasure Quest',
    description: 'Perfect for first-time treasure hunters! Large search area with strong hints. Join with code: HUNT-BEGINNER-2024',
    coords: { lat: 51.5200, lng: -0.1400, geohash: 'gcpvn2' },
    geofenceRadiusM: 100,
    tier: 'free',
    scope: 'private',
    dropType: 'hunt',
    huntCode: 'HUNT-BEGINNER-2024',
    huntDifficulty: 'beginner',
    retrievalMode: 'remote',
    stats: { views: 8, unlocks: 4 },
    createdAt: new Date(),
    secretHash: hashSecret('welcome treasure'),
    files: [
      {
        id: 'hunt-file-3',
        name: 'welcome-to-hunting.pdf',
        size: 256000,
        type: 'application/pdf',
        downloadUrl: '/api/drops/hunt-drop-3/files/welcome-to-hunting.pdf'
      },
      {
        id: 'hunt-file-4',
        name: 'treasure-hunting-tips.txt',
        size: 4096,
        type: 'text/plain',
        downloadUrl: '/api/drops/hunt-drop-3/files/treasure-hunting-tips.txt'
      }
    ]
  },
  {
    id: 'test-drop-3',
    title: 'Files for Dave Sharp',
    description: 'Demo drop for Dave Sharp. Secret: "Fake Believe"',
    coords: { lat: 54.577000, lng: -1.230000, geohash: 'gcyej7' },
    geofenceRadiusM: 75,
    tier: 'premium',
    scope: 'public',
    dropType: 'public',
    retrievalMode: 'remote',
    stats: { views: 12, unlocks: 5 },
    createdAt: new Date(),
    secretHash: hashSecret('Fake Believe'),
    files: [
      {
        id: 'file7',
        name: 'dave-sharp-documents.pdf',
        size: 2097152,
        type: 'application/pdf',
        downloadUrl: '/api/drops/test-drop-3/files/dave-sharp-documents.pdf'
      },
      {
        id: 'file8',
        name: 'project-notes.docx',
        size: 1048576,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        downloadUrl: '/api/drops/test-drop-3/files/project-notes.docx'
      },
      {
        id: 'file9',
        name: 'meeting-recording.mp3',
        size: 15728640,
        type: 'audio/mpeg',
        downloadUrl: '/api/drops/test-drop-3/files/meeting-recording.mp3'
      }
    ]
  }
]

// eslint-disable-next-line prefer-const
let uploadedFilesStore: Record<string, { name: string; content: Buffer; type: string }> = {}

// Demo treasure hunts
// eslint-disable-next-line prefer-const
let demoHuntsStore: TreasureHunt[] = [
  {
    id: 'office-hunt-2024',
    ownerId: 'demo-user-1',
    title: '🏢 Office Adventure Challenge',
    description: 'A fun scavenger hunt around the office! Find hidden clues and solve puzzles to discover the final treasure. Perfect for team building and office engagement.',
    difficulty: 'intermediate',
    status: 'active',
    maxParticipants: 10,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) as any, // Started yesterday
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) as any, // Ends in a week
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) as any,
    updatedAt: new Date() as any,
    stats: {
      totalParticipants: 5,
      completedParticipants: 1,
      totalDrops: 2
    }
  },
  {
    id: 'london-exploration',
    ownerId: 'demo-user-2',
    title: '🌆 London Historical Tour',
    description: 'Explore London\'s rich history through an interactive treasure hunt. Visit famous landmarks and discover hidden stories of the city.',
    difficulty: 'beginner',
    status: 'draft',
    maxParticipants: 20,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) as any,
    updatedAt: new Date() as any,
    stats: {
      totalParticipants: 0,
      completedParticipants: 0,
      totalDrops: 0
    }
  }
]

// Demo hunt participants
// eslint-disable-next-line prefer-const
let demoParticipantsStore: HuntParticipant[] = [
  {
    id: 'participant-1',
    huntId: 'office-hunt-2024',
    userId: 'demo-user-3',
    email: 'alice@company.com',
    displayName: 'Alice Johnson',
    status: 'joined',
    joinedAt: new Date(Date.now() - 20 * 60 * 60 * 1000) as any,
    progress: {
      dropsFound: 2,
      totalDrops: 2,
      lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000) as any
    }
  },
  {
    id: 'participant-2',
    huntId: 'office-hunt-2024',
    userId: 'demo-user-4',
    email: 'bob@company.com',
    displayName: 'Bob Smith',
    status: 'joined',
    joinedAt: new Date(Date.now() - 18 * 60 * 60 * 1000) as any,
    progress: {
      dropsFound: 1,
      totalDrops: 2,
      lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000) as any
    }
  },
  {
    id: 'participant-3',
    huntId: 'office-hunt-2024',
    userId: 'demo-user-5',
    email: 'charlie@company.com',
    displayName: 'Charlie Brown',
    status: 'invited',
    progress: {
      dropsFound: 0,
      totalDrops: 2
    }
  }
]

export { demoDropsStore, uploadedFilesStore, demoHuntsStore, demoParticipantsStore }
