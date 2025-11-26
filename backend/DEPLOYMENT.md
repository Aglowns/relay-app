# Render Deployment Guide

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Supabase project with database connection string
- OpenAI API key

## Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
```bash
cd backend
git init
git add .
git commit -m "Initial backend setup"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/relay-backend.git
git branch -M main
git push -u origin main
```

## Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `relay-backend` (or your repo name)
5. Configure the service:

### Basic Settings
- **Name**: `relay-backend`
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend` (if repo is at root) or leave blank if backend is the repo root
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npm run prisma:generate && npm run build
  ```
- **Start Command**: 
  ```bash
  npm run start:prod
  ```

### Environment Variables
Add these in Render dashboard under **Environment**:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.niyhotjutoiidllppulp:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres
JWT_SECRET=[GENERATE-A-SECURE-RANDOM-STRING]
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=90d
OPENAI_API_KEY=sk-proj-[YOUR-OPENAI-KEY]
OPENAI_MODEL=gpt-4o-mini
THROTTLE_TTL=60
THROTTLE_LIMIT=100
FREE_PLAN_DAILY_LIMIT=100
PRO_PLAN_DAILY_LIMIT=10000
```

**Important**: 
- Replace `[YOUR-PASSWORD]` with your Supabase password (URL-encoded)
- Generate a new `JWT_SECRET` for production (use a long random string)
- Use your actual OpenAI API key

### Health Check
- **Health Check Path**: `/health`
- **Health Check Interval**: 60 seconds

### Advanced Settings
- **Auto-Deploy**: `Yes` (deploys on every push to main branch)
- **Plan**: Start with `Free` tier, upgrade later if needed

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Generate Prisma Client
   - Build the application
   - Start the server

3. Watch the build logs - first deployment takes 5-10 minutes

## Step 4: Verify Deployment

Once deployed, you'll get a URL like: `https://relay-backend.onrender.com`

Test the endpoints:
- Health: `https://relay-backend.onrender.com/health`
- Swagger: `https://relay-backend.onrender.com/api/docs`

## Step 5: Database Migrations

Since we already created tables manually in Supabase, migrations should pass. However, if you need to run migrations:

1. Use Render Shell (available in dashboard)
2. Run: `npm run prisma:migrate deploy`

Or add to build command:
```bash
npm install && npm run prisma:generate && npm run prisma:migrate deploy && npm run build
```

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Render uses Node 18+ by default)

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check Supabase project is active (not paused)
- Ensure password is URL-encoded in connection string
- Try Session Pooler connection string

### Application Crashes
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure port is set to `10000` (Render's default) or use `process.env.PORT`

## Custom Domain (Optional)

1. In Render dashboard → Settings → Custom Domains
2. Add your domain
3. Follow DNS configuration instructions

## Monitoring

- View logs in real-time: Render Dashboard → Your Service → Logs
- Set up alerts: Settings → Alerts
- Monitor metrics: Dashboard shows CPU, Memory, Request metrics

## Cost

- **Free Tier**: 
  - Services spin down after 15 minutes of inactivity
  - 750 hours/month free
  - Good for development/testing
  
- **Starter Plan** ($7/month):
  - Always-on service
  - Better for production

## Next Steps

1. Update iOS app to use Render URL instead of localhost
2. Set up environment-specific configs
3. Enable SSL (Render provides free SSL certificates)
4. Set up monitoring and alerts

