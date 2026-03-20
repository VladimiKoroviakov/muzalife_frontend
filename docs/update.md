# MuzaLife Frontend — Update Procedure

This document provides step-by-step instructions for updating the MuzaLife Frontend in a production environment. It is intended for **release engineers and DevOps engineers**.

---

## Table of Contents

1. [Pre-Update Checklist](#1-pre-update-checklist)
2. [Update Process](#2-update-process)
3. [Post-Update Verification](#3-post-update-verification)
4. [Rollback Procedure](#4-rollback-procedure)

---

## 1. Pre-Update Checklist

### 1.1 Back Up the Current Build

Before deploying a new build, preserve the current production bundle:

```bash
BACKUP_DIR=~/backups/frontend-pre-update-$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
cp -r /var/www/muzalife-frontend "$BACKUP_DIR/build"
echo "Build backup created: $BACKUP_DIR/build"
```

### 1.2 Back Up Configuration

```bash
cp ~/muzalife_frontend/.env "$BACKUP_DIR/.env.backup"
```

### 1.3 Check Compatibility

Review the changelog for:
- Changes to API endpoint paths (must match the deployed backend version)
- New required environment variables
- Changes to OAuth redirect URIs (may need to be updated in Google/Facebook consoles)

```bash
cd ~/muzalife_frontend
git fetch origin
git log HEAD..origin/main --oneline
```

### 1.4 Record Current Commit Hash

```bash
git rev-parse HEAD
```

---

## 2. Update Process

The frontend is a static SPA, so updating means building a new bundle and replacing the files served by Nginx. There is no service to restart — the update is essentially atomic from the user's perspective.

### 2.1 Pull the New Code

```bash
cd ~/muzalife_frontend
git fetch origin
git pull origin main
```

### 2.2 Install or Update Dependencies

```bash
npm ci --legacy-peer-deps
```

### 2.3 Update Environment Variables *(if needed)*

Add any new `VITE_*` variables to `.env`:

```bash
nano .env
```

### 2.4 Build the New Version

```bash
npm run build
```

The new bundle is placed in `build/`.

### 2.5 Deploy the New Bundle

Use an atomic swap to minimize the time the site serves incomplete files:

```bash
# Prepare the new build in a staging location
sudo cp -r build /var/www/muzalife-frontend-new
sudo chown -R www-data:www-data /var/www/muzalife-frontend-new

# Atomic swap
sudo mv /var/www/muzalife-frontend /var/www/muzalife-frontend-old
sudo mv /var/www/muzalife-frontend-new /var/www/muzalife-frontend

# Reload Nginx (no downtime)
sudo nginx -s reload
```

---

## 3. Post-Update Verification

```bash
# Check Nginx is running
sudo systemctl status nginx

# Verify the site responds
curl -I https://muzalife.com
# Expected: HTTP/2 200

# Check the deployed version (look for a version comment or hash in index.html)
curl -s https://muzalife.com | head -5
```

Also verify manually in a browser:
- Homepage loads correctly
- Navigation between pages works (React Router)
- Login / registration flow completes
- API calls return expected data (check DevTools → Network)
- No JavaScript console errors

---

## 4. Rollback Procedure

Because the previous build was preserved during deployment, rollback is straightforward.

### 4.1 Restore the Previous Build

```bash
# The old build is still at /var/www/muzalife-frontend-old
sudo mv /var/www/muzalife-frontend /var/www/muzalife-frontend-failed
sudo mv /var/www/muzalife-frontend-old /var/www/muzalife-frontend
sudo nginx -s reload
```

### 4.2 Or Restore from Backup

If the `-old` directory was already cleaned up, restore from the backup:

```bash
sudo cp -r ~/backups/frontend-pre-update-<timestamp>/build/* /var/www/muzalife-frontend/
sudo chown -R www-data:www-data /var/www/muzalife-frontend
sudo nginx -s reload
```

### 4.3 Verify the Rollback

```bash
curl -I https://muzalife.com
# Expected: HTTP/2 200
```

Open `https://muzalife.com` in a browser and confirm the site works correctly.

### 4.4 Post-Rollback Actions

- Notify the team about the rollback.
- Create a GitHub issue describing the failure.
- Investigate the root cause before rescheduling the update.
