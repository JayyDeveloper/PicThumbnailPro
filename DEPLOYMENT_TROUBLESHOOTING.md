# Deployment Troubleshooting Guide

## ✅ Build Test Result
**Your local build works perfectly!** I've tested the production build and confirmed:
- ✅ HTML serves correctly
- ✅ CSS loads from `/assets/index-DMPIat4B.css`
- ✅ JavaScript bundles correctly
- ✅ Server serves static files on port 5001

The "black screen with white text" is a **deployment configuration issue**, not a code problem.

---

## 🔍 Quick Diagnosis Steps

### Step 1: Open Browser DevTools (CRITICAL!)
Press `F12` on the deployed page and check:

1. **Console Tab** - Look for errors like:
   ```
   Failed to load resource: /assets/index-DMPIat4B.css
   Uncaught ReferenceError: ...
   CORS policy error
   ```

2. **Network Tab** - Check if files are loading:
   - Should see: `index.html` (200 OK)
   - Should see: `index-DMPIat4B.css` (200 OK)
   - Should see: `index-aeoQoEPU.js` (200 OK)
   - If any show 404 or CORS errors, note which ones

**👉 The errors you see will tell us exactly what's wrong!**

---

## 🚀 Common Issues & Fixes

### Issue 1: CSS/JS Files Return 404
**Symptoms:** White text on plain background, no styling
**Cause:** Static files not being served

**Fix for Railway:**
```bash
# In Railway dashboard, verify:
1. Build Command: npm run build
2. Start Command: npm run start
3. Root Directory: /
4. Environment Variable: NODE_ENV=production
```

**Fix for Vercel:**
Vercel can't run Node.js server properly for this monorepo. Use this instead:

**Option A: Deploy Frontend Only to Vercel**
1. Fork the frontend code to a separate repo
2. Add a `.env` file in Vercel with:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app
   ```
3. Update API calls to use `import.meta.env.VITE_API_URL`

**Option B: Deploy Everything to Railway**
Railway handles full-stack apps better:
1. Create new project from GitHub repo
2. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Add environment variables (see below)
5. Deploy!

---

### Issue 2: Environment Variables Missing
**Symptoms:** App loads but features don't work, errors in console
**Required Environment Variables:**

```bash
# Required for production
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
DATABASE_URL=postgresql://user:password@host:port/database

# Optional but recommended
OPENAI_API_KEY=sk-your_openai_api_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**How to add in Railway:**
1. Go to your project
2. Click "Variables" tab
3. Add each variable
4. Redeploy

---

### Issue 3: Port Binding Issues
**Symptoms:** "Connection refused" or timeout errors
**Fix:**

Your server listens on port 5001. Railway/Render expect dynamic ports:

**Edit `server/index.ts`:**
```typescript
// Change this line (around line 62):
const port = 5001;

// To this:
const port = process.env.PORT || 5001;
```

Then rebuild and redeploy.

---

### Issue 4: CORS Errors
**Symptoms:** Console shows "blocked by CORS policy"
**Fix:**

Add CORS middleware in `server/routes.ts` (add near the top):

```typescript
import cors from 'cors';

// In registerRoutes function, after creating app:
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

Install cors:
```bash
npm install cors @types/cors
```

---

### Issue 5: Build Path Issues
**Symptoms:** Server starts but all routes return 404

**Check `dist` folder structure:**
```bash
npm run build
ls -la dist/
ls -la dist/public/
```

Should see:
```
dist/
├── index.js          (server)
└── public/
    ├── index.html
    └── assets/
        ├── index-DMPIat4B.css
        └── index-aeoQoEPU.js
```

If `public` folder is missing, check vite.config.ts build output path.

---

## 🎯 Recommended Deployment Method

Based on your error, here's the **easiest path to success:**

### Deploy to Replit (Fastest - Works Now!)

1. **Push your code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Replit from GitHub:**
   - Go to replit.com
   - Click "Create" → "Import from GitHub"
   - Paste your repo URL
   - Wait for import

3. **Set Environment Variables:**
   - Click "Secrets" (lock icon)
   - Add all required variables
   - Click "Add new secret" for each

4. **Run the app:**
   ```bash
   npm install
   npm run build
   npm run start
   ```

5. **Get your URL:**
   - Replit auto-generates a URL like `your-app.username.repl.co`
   - Test it!

---

### Deploy to Railway (Production-Ready)

1. **Go to railway.app**
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Configure:**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Environment Variables:** Add all from list above

5. **Add PostgreSQL Database:**
   - In Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway auto-adds DATABASE_URL variable
   - Click "Deploy"

6. **Run Migrations:**
   ```bash
   # In Railway's "Deploy" tab, run this command:
   npm run db:push
   ```

7. **Get your URL:**
   - Railway provides: `your-app.up.railway.app`

---

## 🐛 Still Having Issues?

**Collect this info and share it:**

1. **Which platform are you deploying to?** (Vercel/Railway/Replit/Other)

2. **Browser Console Errors** (F12 → Console tab):
   ```
   [Paste any red errors here]
   ```

3. **Network Tab Screenshot** (F12 → Network):
   - Show which files are loading (green)
   - Show which files are failing (red)

4. **Build Logs** from your deployment platform:
   ```
   [Paste last 20 lines of build output]
   ```

5. **Runtime Logs** from your deployment platform:
   ```
   [Paste last 20 lines of server logs]
   ```

---

## ✨ Quick Wins

Try these immediate fixes:

**1. Test Locally First:**
```bash
# Build and run production mode locally
npm run build
npm run start

# Open http://localhost:5001
# If this works but deployment doesn't, it's a config issue
```

**2. Check Environment:**
```bash
# In your deployment platform's shell/console:
echo $NODE_ENV
echo $PORT
ls -la dist/
ls -la dist/public/
```

**3. Simplify First:**
- Remove all environment variables except `NODE_ENV=production`
- Deploy
- If it works, add variables back one by one

---

## 📝 Expected Behavior

When deployment works correctly, you should see:

1. **Home Page loads** with gradients and styling
2. **Header appears** with logo and navigation
3. **No console errors** (maybe warnings, that's OK)
4. **All images/fonts load**

Good luck! 🚀
