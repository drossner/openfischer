# OpenFischer v2 - Deployment Guide

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **Fly CLI**: Install the Fly CLI tool
3. **Google OAuth Client**: Create OAuth 2.0 credentials in Google Cloud Console

## Step 1: Create Google OAuth 2.0 Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable **Google Drive API**
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `https://openfischer.fly.dev/sync` (or your custom domain)
     - `http://localhost:3000/sync` (for local testing)
5. Note down:
   - **Client ID**: `your-client-id.apps.googleusercontent.com`
   - **Client Secret**: `your-client-secret`

## Step 2: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Important**: Never commit `.env` to git! It's already in `.gitignore`.

## Step 3: Install Fly CLI

### Linux/Mac:
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows:
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

## Step 4: Login to Fly.io

```bash
fly auth login
```

## Step 5: Launch the App

```bash
cd /home/daniel/WebstormProjects/openfischer-2

# Launch the app (one-time setup)
fly launch --name openfischer --region fra

# When prompted:
# - Use existing fly.toml? YES
# - Deploy now? NO (we need to set secrets first)
```

## Step 6: Set Secrets

```bash
# Set Google OAuth credentials as secrets
fly secrets set GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
fly secrets set GOOGLE_CLIENT_SECRET=your-client-secret
```

## Step 7: Deploy

```bash
fly deploy
```

## Step 8: Verify Deployment

```bash
# Check status
fly status

# View logs
fly logs

# Open the app
fly open
```

Your app will be available at: `https://openfischer.fly.dev`

## Optional: Custom Domain

1. Add your domain in Fly.io:
```bash
fly certs create openfischer.de
fly certs show openfischer.de
```

2. Add DNS records (from the output above):
```
A    @     <fly-ip-address>
AAAA @     <fly-ipv6-address>
```

3. Update Google OAuth redirect URIs to include your custom domain

## Local Development

1. Copy `.env.example` to `.env` and fill in your values
2. Run the dev server:
```bash
npm run dev
```

3. Visit: `http://localhost:3000`

## Monitoring

- **Logs**: `fly logs`
- **Metrics**: `fly dashboard`
- **Scale**: `fly scale count 1` (adjust as needed)

## Cost Optimization

The current configuration (`fly.toml`) uses:
- **min_machines_running: 0** - Scales to zero when idle (free tier friendly)
- **auto_stop_machines: true** - Automatically stops when no traffic
- **512MB RAM** - Sufficient for the app

Estimated cost: **$0-5/month** depending on traffic.

## Troubleshooting

### Build fails
```bash
# Check build logs
fly logs --app openfischer

# Try local build first
npm run build
```

### OAuth not working
- Verify redirect URIs in Google Console match your deployed URL
- Check secrets are set: `fly secrets list`
- Check environment variables: `fly ssh console` then `printenv`

### App won't start
```bash
# View detailed logs
fly logs

# SSH into the machine
fly ssh console

# Check the process
node .output/server/index.mjs
```

## Updating the App

```bash
# Make your changes
git add .
git commit -m "Your changes"

# Deploy
fly deploy
```

## Rolling Back

```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback
```
