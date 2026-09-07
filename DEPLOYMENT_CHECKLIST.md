# Deployment Checklist - Print This and Follow Step by Step

## ✅ Before You Start
- [ ] Have your GitHub username and password ready
- [ ] Have 30 minutes available
- [ ] Open Command Prompt (Windows Key + R, type "cmd")

## ✅ Step 1: Install Tools (10 minutes)
- [ ] Run: `npm install -g vercel`
- [ ] Wait for it to finish
- [ ] Run: `npm install -g @railway/cli` 
- [ ] Wait for it to finish

## ✅ Step 2: Deploy Frontend to Vercel (5 minutes)
- [ ] Run: `cd "C:\Users\Administrator\Documents\ChatGPT\Battle System"`
- [ ] Run: `vercel`
- [ ] Press Enter for all questions (use defaults)
- [ ] Wait for "Deployed!" message
- [ ] Write down your Vercel URL: __________________________

## ✅ Step 3: Create Railway Account (5 minutes)
- [ ] Go to https://railway.app
- [ ] Click "Sign Up"
- [ ] Sign up with GitHub
- [ ] Go to Account Settings → API Tokens
- [ ] Click "New Token"
- [ ] Copy the token: __________________________

## ✅ Step 4: Deploy Backend to Railway (10 minutes)
- [ ] Run: `railway login`
- [ ] Paste your Railway token and press Enter
- [ ] Run: `railway init` (press Enter for all questions)
- [ ] Run: `railway add postgresql`
- [ ] Run: `railway up`
- [ ] Wait for deployment to finish
- [ ] Write down your Railway URL: __________________________

## ✅ Step 5: Connect Frontend to Backend (5 minutes)
- [ ] Go to https://vercel.com/dashboard
- [ ] Click your "battle-system" project
- [ ] Click "Settings" → "Environment Variables"
- [ ] Add `VITE_API_URL` = your Railway URL
- [ ] Add `VITE_SOCKET_URL` = your Railway URL
- [ ] Click "Deployments" → Redeploy latest

## ✅ Step 6: Configure Backend (5 minutes)
- [ ] Go to https://railway.app/dashboard
- [ ] Click your project
- [ ] Click "Variables" tab
- [ ] Add `FRONTEND_URL` = your Vercel URL
- [ ] Add `JWT_SECRET` = make up a password
- [ ] Add `PORT` = `3000`
- [ ] Click "Redeploy"

## ✅ Step 7: Test Your Website (5 minutes)
- [ ] Go to your Vercel URL
- [ ] Try to register an account
- [ ] Try to log in
- [ ] Try to create a character
- [ ] If it works, you're done! 🎉

## 🔧 If Something Goes Wrong

**Vercel not working:**
- [ ] Check Vercel dashboard shows "Running"
- [ ] Check environment variables are added
- [ ] Try clearing browser cache

**Railway not working:**
- [ ] Check Railway dashboard shows "Running"  
- [ ] Check all environment variables are added
- [ ] Make sure Railway token was correct

**Website not loading:**
- [ ] Wait 5-10 minutes (deployment takes time)
- [ ] Check both Vercel and Railway are running
- [ ] Try the URLs in a new browser window

## 📝 Your Important Information

**Vercel URL:** __________________________
**Railway URL:** __________________________
**Railway Token:** __________________________
**JWT Secret:** __________________________

## 🎯 Done!
Your Battle System should now be live on the internet!