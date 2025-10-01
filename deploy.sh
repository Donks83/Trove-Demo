#!/bin/bash

# =================================================================
# Trove - Git Commit and Vercel Deploy Script (Unix/Mac/Linux)
# =================================================================

echo ""
echo "========================================"
echo "  TROVE DEPLOYMENT SCRIPT"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ ERROR: Git is not installed"
    echo "Please install Git: https://git-scm.com/"
    exit 1
fi

echo "[1/5] Checking git status..."
echo ""
git status
echo ""

# Ask for confirmation
read -p "Do you want to commit and push these changes? (y/n): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "[2/5] Adding all changes to git..."
git add .

echo ""
echo "[3/5] Committing changes..."
echo ""
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="feat: update tier system - adjust file size limits and fix EditDropModal integration"
fi

git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Git commit failed"
    exit 1
fi

echo ""
echo "[4/5] Pushing to remote repository..."
git push

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Git push failed"
    echo "Please check your git configuration and try again"
    exit 1
fi

echo ""
echo "[5/5] Triggering Vercel deployment..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  WARNING: Vercel CLI not found"
    echo ""
    echo "To deploy to Vercel:"
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Run: vercel --prod"
    echo ""
    echo "OR: Vercel will auto-deploy from your git push if connected"
    echo ""
else
    read -p "Deploy to Vercel now? (y/n): " DEPLOY
    if [[ $DEPLOY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Deploying to production..."
        vercel --prod
    else
        echo ""
        echo "Skipping Vercel deployment"
        echo "Vercel will auto-deploy from git push if connected"
        echo ""
    fi
fi

echo ""
echo "========================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "========================================"
echo ""
echo "✓ Changes committed and pushed successfully!"
echo ""
echo "Next steps:"
echo "- Check your git repository for the new commit"
echo "- Monitor Vercel dashboard for deployment status"
echo "- Test the live site once deployment completes"
echo ""
