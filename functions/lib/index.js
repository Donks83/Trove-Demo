"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.onDropDelete = exports.authorizeDrop = exports.onHuntCompleted = exports.onHuntParticipantJoined = exports.onHuntInvitationAccepted = exports.onHuntDropAdded = exports.onHuntInvitation = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const bcrypt = __importStar(require("bcryptjs"));
const geo_1 = require("./utils/geo");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
const storage = (0, storage_1.getStorage)();
// Import and export notification functions
var notifications_1 = require("./notifications");
Object.defineProperty(exports, "onHuntInvitation", { enumerable: true, get: function () { return notifications_1.onHuntInvitation; } });
Object.defineProperty(exports, "onHuntDropAdded", { enumerable: true, get: function () { return notifications_1.onHuntDropAdded; } });
Object.defineProperty(exports, "onHuntInvitationAccepted", { enumerable: true, get: function () { return notifications_1.onHuntInvitationAccepted; } });
Object.defineProperty(exports, "onHuntParticipantJoined", { enumerable: true, get: function () { return notifications_1.onHuntParticipantJoined; } });
Object.defineProperty(exports, "onHuntCompleted", { enumerable: true, get: function () { return notifications_1.onHuntCompleted; } });
exports.authorizeDrop = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1',
    maxInstances: 10,
}, async (request) => {
    var _a, _b;
    const { data, auth } = request;
    const { dropId, secret, userCoords } = data;
    if (!dropId || !secret) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        // Rate limiting check
        const userId = auth === null || auth === void 0 ? void 0 : auth.uid;
        const ipHash = request.rawRequest.ip ?
            require('crypto').createHash('sha256').update(request.rawRequest.ip).digest('hex') :
            'unknown';
        const rateLimitKey = userId ? `user:${userId}` : `ip:${ipHash}`;
        const rateLimitRef = db.collection('rateLimits').doc(rateLimitKey);
        const rateLimitDoc = await rateLimitRef.get();
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const maxAttempts = 5;
        if (rateLimitDoc.exists) {
            const data = rateLimitDoc.data();
            const attempts = data.attempts || 0;
            const windowStart = ((_a = data.windowStart) === null || _a === void 0 ? void 0 : _a.toMillis()) || 0;
            if (now - windowStart < windowMs && attempts >= maxAttempts) {
                throw new https_1.HttpsError('resource-exhausted', 'Too many unlock attempts. Please try again later.');
            }
            if (now - windowStart >= windowMs) {
                // Reset window
                await rateLimitRef.set({
                    attempts: 1,
                    windowStart: firestore_2.Timestamp.fromMillis(now),
                });
            }
            else {
                // Increment attempts
                await rateLimitRef.update({
                    attempts: attempts + 1,
                });
            }
        }
        else {
            // First attempt
            await rateLimitRef.set({
                attempts: 1,
                windowStart: firestore_2.Timestamp.fromMillis(now),
            });
        }
        // Get drop document
        const dropRef = db.collection('drops').doc(dropId);
        const dropDoc = await dropRef.get();
        if (!dropDoc.exists) {
            await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, 'remote');
            throw new https_1.HttpsError('not-found', 'Drop not found');
        }
        const drop = dropDoc.data();
        // Check if drop has expired
        if (drop.expiresAt && drop.expiresAt.toMillis() < now) {
            await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, 'remote');
            throw new https_1.HttpsError('failed-precondition', 'Drop has expired');
        }
        // Verify secret
        const secretMatch = await bcrypt.compare(secret, drop.secretHash);
        if (!secretMatch) {
            await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, 'remote');
            throw new https_1.HttpsError('permission-denied', 'Invalid secret phrase');
        }
        // Check geofence if required
        let distance;
        if (drop.retrievalMode === 'physical' || userCoords) {
            if (!userCoords) {
                await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, drop.retrievalMode);
                throw new https_1.HttpsError('failed-precondition', 'Location required for this drop');
            }
            distance = (0, geo_1.calculateDistance)(userCoords.lat, userCoords.lng, drop.coords.lat, drop.coords.lng);
            if (distance > drop.geofenceRadiusM) {
                await logAccessAttempt(dropId, userId, ipHash, 'failure', distance, drop.retrievalMode);
                throw new https_1.HttpsError('failed-precondition', `You're too far away. Distance: ${Math.round(distance)}m, Required: ${drop.geofenceRadiusM}m`);
            }
        }
        // Generate signed URLs for files
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({
            prefix: drop.storagePath,
        });
        const downloadUrls = [];
        const fileNames = [];
        for (const file of files) {
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            });
            downloadUrls.push(signedUrl);
            // Extract filename from path
            const fileName = file.name.split('/').pop() || file.name;
            fileNames.push(fileName);
        }
        // Update drop stats
        await dropRef.update({
            'stats.unlocks': (((_b = drop.stats) === null || _b === void 0 ? void 0 : _b.unlocks) || 0) + 1,
            'stats.lastAccessedAt': firestore_2.Timestamp.fromMillis(now),
        });
        // Log successful access
        await logAccessAttempt(dropId, userId, ipHash, 'success', distance, drop.retrievalMode);
        return {
            success: true,
            downloadUrls,
            metadata: {
                title: drop.title,
                description: drop.description,
                fileNames,
                createdAt: drop.createdAt.toDate().toISOString(),
            },
            distance,
        };
    }
    catch (error) {
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        console.error('Error authorizing drop:', error);
        throw new https_1.HttpsError('internal', 'Internal server error');
    }
});
// Helper function to log access attempts
async function logAccessAttempt(dropId, userId, ipHash, result, distance, mode = 'remote') {
    try {
        await db.collection('dropAccessLogs').add({
            dropId,
            uid: userId || null,
            ipHash,
            result,
            distanceM: distance || null,
            mode,
            createdAt: firestore_2.Timestamp.now(),
        });
    }
    catch (error) {
        console.error('Error logging access attempt:', error);
    }
}
// Clean up storage when drop is deleted
exports.onDropDelete = (0, firestore_1.onDocumentDeleted)('drops/{dropId}', async (event) => {
    var _a;
    const deletedDrop = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!(deletedDrop === null || deletedDrop === void 0 ? void 0 : deletedDrop.storagePath))
        return;
    try {
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({
            prefix: deletedDrop.storagePath,
        });
        // Delete all files in the drop's storage path
        await Promise.all(files.map(file => file.delete()));
        console.log(`Cleaned up ${files.length} files for deleted drop ${event.params.dropId}`);
    }
    catch (error) {
        console.error('Error cleaning up storage:', error);
    }
});
// Health check endpoint
exports.healthCheck = (0, https_1.onRequest)({ cors: true }, (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
//# sourceMappingURL=index.js.map