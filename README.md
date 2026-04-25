# ScrumVisuals Admin Portal

Internal admin portal for managing frameworks, workshop types, styles, and templates.

## Quick Start (local dev)

```bash
npm install
npm run dev
```

Opens at http://localhost:3001. API calls proxy to n8n.twentytwospices.com.

## Deploy to VPS

### 1. Copy files to VPS
```bash
scp -r admin-portal/ user@your-vps:/opt/admin-portal/
```

### 2. Create basic auth password
```bash
cd /opt/admin-portal
htpasswd -c .htpasswd admin
# Enter password when prompted
```

### 3. Build and run
```bash
docker compose up -d --build
```

### 4. DNS + SSL
Point `portal.scrumvisuals.com` A record to VPS IP.
Add SSL via your existing nginx reverse proxy or Traefik setup.

## API Key

The portal uses API key `AdminPortal2026Secure!` to talk to N8N.
Set this as the X-API-Key value in your N8N webhook credentials.
To change it, edit `src/api.js` line 6 and rebuild.

## Architecture

- React + Vite SPA (no routing library needed — just state-based nav)
- All data via single N8N webhook: POST /webhook/admin-api
- nginx serves static files + proxies /webhook/ to N8N
- Basic auth for portal access (nginx level)
- No client-side auth — nginx handles it
