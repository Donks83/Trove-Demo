# 🚀 Deployment Guide

## Quick Deploy Scripts

### For Windows Users:
```bash
deploy.bat
```

### For Mac/Linux Users:
```bash
chmod +x deploy.sh  # Make executable (first time only)
./deploy.sh
```

---

## What the Scripts Do:

1. ✅ Check git status
2. ✅ Add all changes (`git add .`)
3. ✅ Commit with message
4. ✅ Push to remote repository
5. ✅ Optionally deploy to Vercel

---

## Manual Deployment (If Scripts Don't Work)

### Step 1: Commit Changes to Git
```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "feat: update tier system - adjust file size limits and fix EditDropModal integration"

# Push to remote
git push
```

### Step 2: Deploy to Vercel

**Option A - Automatic (Recommended):**
If you have Vercel connected to your Git repository, it will automatically deploy when you push.

**Option B - Manual Deploy:**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

**Option C - Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Find your project
3. Click "Deploy"
4. Select the branch to deploy

---

## 📋 Changes in This Deployment

### ✅ Completed:
1. **Renamed "Business" to "Paid Tier"** everywhere
2. **Fixed Drop Type descriptions** (Private/Public/Hunt)
3. **Removed duplicate Visibility section**
4. **Added radius editing to Edit Drop Modal**
5. **Integrated EditDropModal with userTier prop**
6. **Fixed misleading Private drop tier badge**
7. **Updated file size limits:**
   - Free: 10MB → **100MB**
   - Paid: 500MB → **250MB**
   - Premium: 100MB → **500MB**

### 📊 Current Tier Configuration:

| Feature | Free 🆓 | Paid 💳 | Premium 👑 |
|---------|---------|---------|------------|
| File Size | 100MB | 250MB | **500MB** |
| Radius | 300-500m | 100-300m | 10-100m |
| Max Drops | 10 | 1000 | 100 |
| Physical Mode | ❌ | ✅ | ✅ |
| Hunt Drops | ❌ | ✅ | ✅ |

---

## 🔧 Troubleshooting

### "Git is not installed"
Install Git from: https://git-scm.com/

### "Permission denied" on deploy.sh
Make the script executable:
```bash
chmod +x deploy.sh
```

### "Git push failed"
Check your remote is configured:
```bash
git remote -v
```

If no remote:
```bash
git remote add origin <your-repo-url>
```

### "Vercel CLI not found"
Install globally:
```bash
npm install -g vercel
```

Then login:
```bash
vercel login
```

---

## 📚 Additional Resources

- **Git Documentation:** https://git-scm.com/doc
- **Vercel Documentation:** https://vercel.com/docs
- **Vercel CLI Reference:** https://vercel.com/docs/cli

---

## 🎯 Post-Deployment Checklist

- [ ] Check GitHub/GitLab for new commit
- [ ] Monitor Vercel dashboard for deployment status
- [ ] Test editing drops on live site
- [ ] Verify tier restrictions work correctly
- [ ] Test file upload limits for each tier
- [ ] Check radius slider in Edit Drop Modal
- [ ] Verify drop type descriptions are correct

---

**Need help?** Check the project README or create an issue in the repository.
