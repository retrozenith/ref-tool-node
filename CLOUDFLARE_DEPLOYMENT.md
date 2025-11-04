# Cloudflare Pages Deployment Guide

This project uses a hybrid architecture:
- **Frontend**: Next.js static site on Cloudflare Pages
- **Backend API**: Cloudflare Worker for PDF generation

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Cloudflare Pages (Frontend)      │
│   - Next.js Static Export           │
│   - Client-side PDF fallback        │
│   - Service Worker (PWA)            │
└──────────────┬──────────────────────┘
               │ API calls
               ▼
┌─────────────────────────────────────┐
│   Cloudflare Worker (Backend)      │
│   - PDF generation API              │
│   - pdf-lib processing              │
│   - PDF templates & fonts           │
└─────────────────────────────────────┘
```

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Node.js 18+** installed
3. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```

## Step 1: Deploy the Worker (Backend)

### 1.1 Login to Cloudflare

```bash
cd worker
wrangler login
```

This will open a browser window to authenticate.

### 1.2 Install Worker Dependencies

```bash
npm install
```

### 1.3 Deploy the Worker

```bash
npm run deploy
```

This will output a Worker URL like:
```
https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev
```

**Save this URL!** You'll need it for the frontend.

### 1.4 Test the Worker

```bash
curl https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev/health
```

Should return:
```json
{
  "message": "PDF Generator API",
  "endpoint": "POST /api/generate-report",
  "supported_categories": ["U9", "U11", "U13", "U15"],
  "status": "healthy"
}
```

## Step 2: Deploy the Frontend (Cloudflare Pages)

### 2.1 Update Environment Variable

Edit `server/.env.production` and replace with your Worker URL:

```env
NEXT_PUBLIC_API_URL=https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev
```

### 2.2 Create Cloudflare Pages Project

Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → Create a project

#### Connect Git Repository (Recommended)

1. Connect your GitHub account
2. Select your repository: `retrozenith/ref-tool-node`
3. Configure build settings:
   - **Build command**: `cd server && npm install && npm run build`
   - **Build output directory**: `server/out`
   - **Root directory**: `/` (leave as default)
   - **Environment variables**:
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev`

4. Click "Save and Deploy"

#### Manual Deployment (Alternative)

```bash
cd server
npm install
npm run build

# Install Wrangler if not already installed
npm install -g wrangler

# Deploy to Pages
npx wrangler pages deploy out --project-name=ref-tool-node
```

### 2.3 Verify Deployment

Your site will be available at:
```
https://ref-tool-node.pages.dev
```

Test the application by filling out a form and generating a PDF.

## Step 3: Custom Domain (Optional)

### For the Worker:

```bash
cd worker
wrangler publish --route="api.yourdomain.com/*"
```

Update `server/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### For Pages:

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add your domain (e.g., `referee.yourdomain.com`)
3. Cloudflare will automatically configure DNS

## Local Development

### Terminal 1: Run the Worker

```bash
cd worker
npm install
npm run dev
```

Worker runs at `http://localhost:8787`

### Terminal 2: Run the Frontend

```bash
cd server
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

The frontend will automatically use the local Worker API via `NEXT_PUBLIC_API_URL=http://localhost:8787` from `.env.local`.

## Testing

### Test Worker API

```bash
curl -X POST http://localhost:8787/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "referee_name_1": "John Doe",
    "match_date": "2025-11-04",
    "starting_hour": "14:00",
    "team_1": "Team A",
    "team_2": "Team B",
    "age_category": "U9"
  }' \
  --output test-report.pdf
```

### Test Frontend

1. Open `http://localhost:3000`
2. Fill out the form
3. Click "Generate PDF"
4. PDF should download

## Offline Support

The application includes PWA support for offline functionality:

- **Online**: Uses Worker API (faster, server-side)
- **Offline**: Falls back to client-side PDF generation

Service worker caches:
- PDF templates
- Fonts
- Static assets

## Troubleshooting

### Worker Issues

**Error**: "Cannot find module 'pdf-lib'"
```bash
cd worker
npm install
npm run deploy
```

**Error**: "ASSETS binding not found"
- Check `wrangler.toml` has `[site]` configuration
- Ensure `public/` directory exists with PDF templates

### Frontend Issues

**Error**: "Failed to fetch API"
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Worker is deployed and accessible
- Check CORS headers in Worker response

**Error**: "Failed to load PDF template"
- Ensure `server/public/reports/` contains all PDF templates
- Check Service Worker is registered

### Build Issues

**Error**: "Build failed"
```bash
cd server
rm -rf .next out node_modules
npm install
npm run build
```

## Environment Variables Summary

### Worker (.env or wrangler.toml)
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
```

### Frontend (server/.env.production)
```env
NEXT_PUBLIC_API_URL=https://ref-tool-worker.YOUR-SUBDOMAIN.workers.dev
```

## Updating Deployments

### Update Worker

```bash
cd worker
# Make changes to src/index.ts
npm run deploy
```

### Update Frontend

Cloudflare Pages auto-deploys on git push (if connected to GitHub).

Manual update:
```bash
cd server
npm run build
npx wrangler pages deploy out --project-name=ref-tool-node
```

## Cost Estimation

Both services are **free** for low-medium traffic:

- **Cloudflare Workers**: 100,000 requests/day (free tier)
- **Cloudflare Pages**: Unlimited requests, 500 builds/month (free tier)

## Security Notes

1. **CORS**: Worker allows all origins (`*`). For production, restrict to your domain:
   ```typescript
   'Access-Control-Allow-Origin': 'https://ref-tool-node.pages.dev'
   ```

2. **Rate Limiting**: Consider adding rate limiting for production
3. **Input Validation**: Already implemented in Worker

## Support

For issues:
1. Check [Cloudflare Logs](https://dash.cloudflare.com/)
2. Use `wrangler tail` for real-time Worker logs
3. Check browser console for frontend errors

## Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
