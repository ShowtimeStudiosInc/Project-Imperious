# Simple Deployment Guide (Beginner-Friendly)

## What We're Doing
We're putting your Battle System website on the internet so others can use it. We'll use two free services:
- **Vercel** (for the website part - what users see)
- **Railway** (for the backend part - the logic and battles)

## Step 1: Prepare Your Computer

### 1.1 Open Command Prompt
- Press `Windows Key + R`
- Type `cmd` and press Enter
- This opens a black window (Command Prompt)

### 1.2 Install Vercel Tool
In the Command Prompt, type this and press Enter:
```
npm install -g vercel
```
*This might take a few minutes. Wait until it finishes.*

### 1.3 Install Railway Tool  
In the same window, type this and press Enter:
```
npm install -g @railway/cli
```
*This might also take a few minutes. Wait until it finishes.*

## Step 2: Deploy Frontend to Vercel (The Website)

### 2.1 Go to Your Project Folder
In Command Prompt, type this and press Enter:
```
cd "C:\Users\Administrator\Documents\ChatGPT\Battle System"
```

### 2.2 Deploy to Vercel
Type this and press Enter:
```
vercel
```

### 2.3 Answer the Questions
Vercel will ask you some questions:

**"Set up and deploy?"** → Press Enter (defaults to Yes)

**"Which scope?"** → Press Enter (use your personal account)

**"Link to existing project?"** → Press Enter (defaults to No)

**"What's your project's name?"** → Press Enter (accepts "battle-system")

**"In which directory is your code located?"** → Press Enter (accepts current directory)

**"Want to override the settings?"** → Press Enter (defaults to No)

### 2.4 Wait for Deployment
- Vercel will build your project
- This takes 2-5 minutes
- You'll see lots of text scrolling by
- **First deployment might fail** - this is normal!
- We'll fix it using the Vercel website settings

### 2.5 Fix Build Settings (If First Deployment Fails)
If the first deployment fails, don't worry! Here's how to fix it:

1. Go to https://vercel.com/dashboard
2. Find your "battle-system" project
3. Click on it
4. Click "Settings" tab
5. Click "General" on the left
6. Scroll down to "Build & Development Settings"

**Update these settings:**
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `cd frontend && npm install`

7. Click "Save"
8. Go to "Deployments" tab
9. Click the dots (...) next to the failed deployment
10. Click "Redeploy"

### 2.6 Wait for Success
- This time it should work!
- Wait 2-5 minutes for the build
- When you see "✓ Deployed" you're done

### 2.7 Save Your Vercel URL
- Vercel will show you a URL like: `https://battle-system.vercel.app`
- **Write this down** - you'll need it later
- You can click the link to see your website!

### 2.5 Save Your Vercel URL
- Vercel will give you a URL like: `https://battle-system.vercel.app`
- **Write this down** - you'll need it later
- You can click the link to see your website!

## Step 3: Set Up Railway Account

### 3.1 Create Railway Account
1. Go to https://railway.app in your browser
2. Click "Sign Up" 
3. Sign up with GitHub (easiest method)
4. It's free - no credit card needed

### 3.2 Get Your API Token
1. After logging in, click your name in top right
2. Click "Account Settings"
3. Click "API Tokens" on the left
4. Click "New Token"
5. Give it a name like "Deployment Token"
6. Copy the token it gives you
7. **Save this token** - you'll need it in the next step

## Step 4: Deploy Backend to Railway

### 4.1 Login to Railway
In your Command Prompt (in the Battle System folder), type:
```
railway login
```

When it asks for your token, paste the token you copied in Step 3.2 and press Enter.

### 4.2 Create Railway Project
Type this and press Enter:
```
railway init
```

Press Enter for all questions (use defaults).

### 4.3 Add Database
Type this and press Enter:
```
railway add postgresql
```
This adds a free database for your backend.

### 4.4 Deploy Your Backend
Type this and press Enter:
```
railway up
```

Wait for it to deploy (2-5 minutes).

### 4.5 Get Your Railway URL
When done, Railway will show you a URL like:
`https://your-backend-name.up.railway.app`

**Write this down** - you'll need it for the next step.

## Step 5: Connect Frontend and Backend

### 5.1 Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your "battle-system" project
3. Click on it

### 5.2 Add Environment Variables
1. Click "Settings" tab
2. Click "Environment Variables" on the left
3. Click "Add New" button

**First Variable:**
- Name: `VITE_API_URL`
- Value: Your Railway URL from Step 4.5
- Click "Save"

**Second Variable:**
- Name: `VITE_SOCKET_URL` 
- Value: Your Railway URL from Step 4.5
- Click "Save"

### 5.3 Redeploy Vercel
1. Click "Deployments" tab
2. Click the dots (...) next to latest deployment
3. Click "Redeploy"

## Step 6: Set Up Backend Environment Variables

### 6.1 Go to Railway Dashboard
1. Go to https://railway.app/dashboard
2. Find your project
3. Click on it

### 6.2 Add Environment Variables
1. Click "Variables" tab
2. Click "New Variable"

**Add these variables:**

**FRONTEND_URL:**
- Name: `FRONTEND_URL`
- Value: Your Vercel URL from Step 2.5

**JWT_SECRET:**
- Name: `JWT_SECRET`
- Value: Make up a random password like `mySecretBattleSystem123`

**PORT:**
- Name: `PORT`
- Value: `3000`

### 6.3 Redeploy Railway
Click the "Redeploy" button in Railway.

## Step 7: Test Your Website

### 7.1 Visit Your Website
Go to your Vercel URL (from Step 2.5)

### 7.2 Test It
1. Try to register a new account
2. Try to log in
3. Try to create a character
4. If it works, you're done!

## Troubleshooting

**If deployment still fails after fixing settings:**
1. Make sure you saved the build settings
2. Make sure you clicked "Redeploy" on the failed deployment
3. Wait 5-10 minutes and try again
4. Check the Vercel logs for specific error messages

**If the website loads but looks wrong:**
- This might be because the backend isn't connected yet
- That's normal - we'll fix that in the Railway steps
- The frontend can work without the backend initially

**If you get a "404" error:**
- The deployment might still be processing
- Wait 5-10 minutes and try again
- Make sure you're using the correct Vercel URL

**If you get stuck:**
- The most common issue is environment variables
- Double-check you added them in both Vercel and Railway
- Make sure the URLs match exactly (no typos)

## What You Should Have Now

✅ Website live on Vercel (free)
✅ Backend running on Railway (free)
✅ Database working (free)
✅ Total cost: $0/month
✅ Your Battle System is online!

## Keep Your Tokens Safe

- Never share your Railway API token
- Never share your JWT_SECRET
- These are like passwords for your system