#!/bin/bash

echo "🔥 Starting Firebase Emulators for Trove Development..."

# Kill any existing emulator processes
echo "Stopping any existing emulators..."
pkill -f "firebase.*emulator" || true

# Wait a moment
sleep 2

# Start the emulators
echo "Starting Firebase emulators..."
firebase emulators:start --only auth,firestore,storage,functions

echo "✅ Emulators should be running at:"
echo "   - Firebase UI: http://localhost:4000"
echo "   - Auth Emulator: http://localhost:9099"
echo "   - Firestore Emulator: http://localhost:8081"
echo "   - Storage Emulator: http://localhost:9199"
echo "   - Functions Emulator: http://localhost:5001"
