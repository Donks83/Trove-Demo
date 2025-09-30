# 🎯 QUICK FIX - Run These Commands

Your delete button returns **405** because the backend endpoints **aren't deployed yet**. The Vercel build failed.

## Fix It NOW (Copy & Paste)

```bash
cd C:\Claude\trove

git rm -rf "src/app/api/drops/[id]" 2>nul
git add .
git commit -m "fix: delete/edit endpoints with [dropId] convention"
git push origin main
```

Then wait 2 minutes and reload your site. Delete will work! ✅

## OR Use the Helper Script

```bash
cd C:\Claude\trove
.\scripts\deploy-fix.bat
```

---

**That's it!** The issue is simple - your new code just needs to deploy. Once you push, Vercel will rebuild successfully and delete/edit will work on the live site.

**Check deployment status:** https://vercel.com (look for green checkmark)
