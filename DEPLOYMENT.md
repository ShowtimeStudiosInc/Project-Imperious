# Deployment Guide - Vercel + Railway

## Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free tier with $5 credit)
- MongoDB Atlas account (free tier)

## Step 1: Frontend Deployment (Vercel)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy Frontend
```bash
cd frontend
vercel
```

### 3. Configure Environment Variables in Vercel
- Add `VITE_API_URL` = Your Railway backend URL
- Add `VITE_SOCKET_URL` = Your Railway backend URL

## Step 2: Backend Deployment (Railway)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
cd backend
railway init
```

### 4. Add PostgreSQL Database (or MongoDB)
```bash
railway add postgresql
```

### 5. Configure Environment Variables in Railway
- `PORT` = 3000 (Railway's default)
- `FRONTEND_URL` = Your Vercel frontend URL
- `JWT_SECRET` = Generate a secure random string
- `MONGODB_URI` = Your MongoDB Atlas connection string (if using MongoDB)

### 6. Deploy Backend
```bash
railway up
```

## Step 3: MongoDB Atlas Setup (Free Tier)

### 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free tier

### 2. Create Cluster
- Create a free M0 cluster
- Set up database user and password
- Get connection string

### 3. Whitelist IP Addresses
- Add Railway's IP ranges
- Add Vercel's IP ranges (or allow all for development)

## Step 4: Update Frontend Configuration

After deployment, update your frontend's environment:

### Local Development
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Production (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

## Step 5: Update Backend CORS

Ensure your backend's CORS configuration includes:
- Your Vercel frontend URL
- Socket.io origin settings

## Step 6: Test Deployment

1. Test backend health endpoint: `https://your-backend.railway.app/api/health`
2. Test frontend loads correctly
3. Test authentication flow
4. Test Socket.io connection
5. Test battle features

## Troubleshooting

### Common Issues:
- **CORS errors**: Check CORS configuration in backend
- **Socket.io connection fails**: Ensure WebSocket support in Railway
- **Database connection**: Check MongoDB Atlas IP whitelist
- **Environment variables**: Verify all required variables are set

### Railway-Specific:
- Railway automatically assigns ports
- Use `process.env.PORT` for server port
- Check Railway logs for errors

### Vercel-Specific:
- Ensure build command: `npm run build`
- Output directory: `dist`
- Static files served from `dist`

## Cost Breakdown

- **Vercel**: Free (unlimited)
- **Railway**: $5/month free credit (covers small backend)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0/month