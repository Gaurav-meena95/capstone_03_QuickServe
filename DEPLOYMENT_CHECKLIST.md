# 🚀 QuickServe Deployment Checklist

## Current Status
- ✅ Frontend: https://capstone-03-quick-serve.vercel.app
- ❌ Backend: Not deployed yet
- ✅ Database: Neon PostgreSQL (configured)

## Backend Deployment (Choose One)

### Option 1: Render.com (Recommended)
1. [ ] Go to https://render.com
2. [ ] Create new Web Service
3. [ ] Connect GitHub repo
4. [ ] Configure:
   - Root Directory: `Backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. [ ] Add Environment Variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_R1zPfhmlk4nw@ep-raspy-resonance-a1dwac81-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   sec_key=your_super_secret_jwt_key_here_change_in_production
   FRONTEND_URL=https://capstone-03-quick-serve.vercel.app
   NODE_ENV=production
   PORT=4000
   ```
6. [ ] Deploy and get URL (e.g., https://quickserve-backend.onrender.com)

### Option 2: Railway.app
1. [ ] Go to https://railway.app
2. [ ] New Project → Deploy from GitHub
3. [ ] Select repository
4. [ ] Add same environment variables as above

## Frontend Configuration Update
1. [ ] Update `Frontend/quick_serve/.env.production`:
   ```
   VITE_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
   ```
2. [ ] Commit and push to trigger Vercel redeploy

## Verification Steps
1. [ ] Test frontend: https://capstone-03-quick-serve.vercel.app
2. [ ] Test backend health: https://your-backend-url.onrender.com/api/health
3. [ ] Test full flow: Register → Login → Browse shops
4. [ ] Run verification script: `node verify-deployment.js`

## Post-Deployment
- [ ] Update README.md with live URLs
- [ ] Test all features end-to-end
- [ ] Monitor for any CORS or API issues