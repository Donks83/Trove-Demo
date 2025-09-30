#!/bin/bash

# Fix Dynamic Route Naming Conflict
# This script removes the conflicting [id] folder from git

echo "🔧 Fixing dynamic route naming conflict..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Check git status
echo "📋 Checking git status..."
git status

echo ""
echo "🗑️  Removing [id] folder from git (if it exists)..."

# Remove the [id] folder from git index and working directory
# Using -r for recursive, -f to force
git rm -rf "src/app/api/drops/[id]" 2>/dev/null || echo "   No [id] folder found in git (already clean)"

echo ""
echo "📝 Current git status after cleanup:"
git status

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📤 Next steps:"
echo "1. Review changes above"
echo "2. Commit: git commit -m 'fix: remove duplicate [id] folder, use [dropId]'"
echo "3. Push: git push origin main"
echo "4. Vercel will rebuild automatically"
echo ""
