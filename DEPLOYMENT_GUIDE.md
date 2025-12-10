# QuickServe Deployment Guide

## Current Status
- ✅ Frontend deployed on Vercel: https://capstone-03-quick-serve.vercel.app
- ❌ Backend needs to be deployed

## Steps to Complete Deployment

### 1. Deploy Backend to Render/Railway

#### Option A: Deploy to Render
1. Go to https://render.com and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the Backend folder
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `DATABASE_URL`: (your existing Neon PostgreSQL URL)
     - `JWT_SECRET`: your_super_secret_jwt_key_here_change_in_production
     - `sec_key`: your_super_secret_jwt_key_here_change_in_production
     - `FRONTEND_URL`: https://capstone-03-quick-serve.vercel.app
     - `NODE_ENV`: production
     - `PORT`: 4000

#### Option B: Deploy to Railway
1. Go to https://railway.app and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables (same as above)

### 2. Update Frontend Environment
Once backend is deployed, update:
`Frontend/quick_serve/.env.production`
```
VITE_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
```

### 3. Redeploy Frontend
Push changes to trigger Vercel redeploy

## Quick Deploy Commands

```bash
# Update frontend env for production
echo "VITE_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com" > Frontend/quick_serve/.env.production

# Commit and push
git add .
git commit -m "Configure production environment"
git push origin main
```