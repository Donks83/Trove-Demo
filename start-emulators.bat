@echo off
echo 🔥 Starting Firebase Emulators for Trove Development...

echo Stopping any existing emulators...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Firebase Emulator*" >nul 2>&1

echo Waiting for processes to stop...
timeout /t 2 /nobreak >nul

echo Starting Firebase emulators...
firebase emulators:start --only auth,firestore,storage,functions

echo ✅ Emulators should be running at:
echo    - Firebase UI: http://localhost:4000
echo    - Auth Emulator: http://localhost:9099
echo    - Firestore Emulator: http://localhost:8081  
echo    - Storage Emulator: http://localhost:9199
echo    - Functions Emulator: http://localhost:5001
