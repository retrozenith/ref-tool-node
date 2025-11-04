# Quick Start Guide

## Local Development

### 1. Start the Worker (Backend API)
```bash
cd worker
npm install
npm run dev
```
✅ Worker running at: `http://localhost:8787`

### 2. Start the Frontend (Next.js)
```bash
cd server
npm install
npm run dev
```
✅ Frontend running at: `http://localhost:3000`

## Deploy to Cloudflare

### Deploy Worker First
```bash
cd worker
wrangler login
npm run deploy
```
📝 **Save the Worker URL** (e.g., `https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev`)

### Update Frontend Config
Edit `server/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev
```

### Deploy Frontend to Cloudflare Pages

**Option A: Via Dashboard (Recommended)**
1. Go to https://dash.cloudflare.com/ → Pages
2. Connect GitHub repository
3. Build settings:
   - **Build command**: `cd server && npm install && npm run build`
   - **Build output directory**: `server/out`
   - **Environment variable**: `NEXT_PUBLIC_API_URL` = your Worker URL

**Option B: Via CLI**
```bash
cd server
npm run build
npx wrangler pages deploy out --project-name=ref-tool-node
```

## Architecture

- **Frontend** (Cloudflare Pages): Static Next.js app with offline PWA support
- **Backend** (Cloudflare Worker): PDF generation API with pdf-lib

## Features

✅ Server-side PDF generation (Worker)
✅ Client-side fallback (offline support)
✅ PWA caching
✅ CORS enabled
✅ Free hosting

See `CLOUDFLARE_DEPLOYMENT.md` for detailed instructions.
