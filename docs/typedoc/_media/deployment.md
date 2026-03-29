# MuzaLife Frontend — Production Deployment Guide

This document describes how to deploy the MuzaLife Frontend to a production server. It is intended for **release engineers and DevOps engineers**.

---

## Table of Contents

1. [Hardware Requirements](#1-hardware-requirements)
2. [Software Requirements](#2-software-requirements)
3. [Network Configuration](#3-network-configuration)
4. [Build Configuration](#4-build-configuration)
5. [Production Build](#5-production-build)
6. [Serving the Static Bundle](#6-serving-the-static-bundle)
7. [Health Verification](#7-health-verification)

---

## 1. Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Architecture | x86_64 (amd64) | x86_64 |
| CPU | 1 vCPU | 2 vCPU |
| RAM | 512 MB | 1 GB |
| Disk | 5 GB | 10 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

> The Frontend is a static SPA (Single Page Application). After building, it consists only of HTML, JS, and CSS files that can be served by any static file server (Nginx, Apache, CDN, etc.).

---

## 2. Software Requirements

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS (needed for the build step)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx (for serving static files)
sudo apt install -y nginx certbot python3-certbot-nginx git

# Verify
node -v    # v20.x.x
nginx -v
```

---

## 3. Network Configuration

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d muzalife.com -d www.muzalife.com
```

---

## 4. Build Configuration

### Production Environment Variables

Create a `.env.production` file (or set CI/CD secrets) with production values:

```bash
VITE_API_URL=https://api.muzalife.com/api
VITE_APP_NAME=MuzaLife
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_FACEBOOK_APP_ID=your_production_facebook_app_id
```

> **Security note:** Vite inlines all `VITE_*` variables into the client-side bundle. **Never place secrets** (private keys, passwords) in these variables — they will be visible to end users.

---

## 5. Production Build

```bash
# Clone the repository
git clone https://github.com/VladimiKoroviakov/muzalife_frontend.git
cd muzalife_frontend

# Install all dependencies
npm ci --legacy-peer-deps

# Copy production env
cp .env.production .env   # or fill .env manually

# Build for production
npm run build
```

The production bundle is generated in the `build/` directory.

```
build/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

---

## 6. Serving the Static Bundle

### Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/muzalife-frontend
```

```nginx
server {
    listen 80;
    server_name muzalife.com www.muzalife.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name muzalife.com www.muzalife.com;

    ssl_certificate     /etc/letsencrypt/live/muzalife.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/muzalife.com/privkey.pem;

    root /var/www/muzalife-frontend;
    index index.html;

    # React Router — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/muzalife-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Deploy the build output
sudo mkdir -p /var/www/muzalife-frontend
sudo cp -r build/* /var/www/muzalife-frontend/
sudo chown -R www-data:www-data /var/www/muzalife-frontend
```

---

## 7. Health Verification

```bash
# Check Nginx is serving the app
curl -I https://muzalife.com
# Expected: HTTP/2 200

# Check Nginx status
sudo systemctl status nginx

# Tail Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

Open `https://muzalife.com` in a browser and confirm:
- The homepage loads without errors
- Login / registration works (OAuth redirects complete)
- API calls to the backend succeed (check DevTools → Network)

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| 404 on page refresh | Missing `try_files` in Nginx | Ensure `try_files $uri /index.html` is set |
| Blank page after deploy | Wrong `VITE_API_URL` | Check `.env` and rebuild |
| Mixed content warnings | HTTP API from HTTPS frontend | Set `VITE_API_URL` to `https://` |
| OAuth redirect errors | Wrong origin in Google/Facebook console | Update Authorized Redirect URIs |
