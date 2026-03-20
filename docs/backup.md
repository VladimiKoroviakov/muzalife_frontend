# MuzaLife Frontend — Backup & Restore Procedures

This document describes the backup strategy and restoration procedures for the MuzaLife Frontend. It is intended for **release engineers and DevOps engineers**.

---

## Table of Contents

1. [Backup Strategy](#1-backup-strategy)
2. [Backup Procedures](#2-backup-procedures)
3. [Automated Backup](#3-automated-backup)
4. [Restoration Procedures](#4-restoration-procedures)

---

## 1. Backup Strategy

### 1.1 What Needs to Be Backed Up

| Component | Description | Priority |
|---|---|---|
| **Production build** | Static files in `/var/www/muzalife-frontend` | High |
| **Configuration** | `.env` (build-time env variables) | High |
| **Source code** | Managed by Git — recoverable from GitHub | Low |

> The frontend produces a **static bundle** (HTML/JS/CSS). There is no user data to back up — all user data resides in the backend database. The main risk is losing the production build if the server fails before the next deployment.

### 1.2 Backup Types and Frequency

| Type | Description | Frequency |
|---|---|---|
| **Build snapshot** | Archive of the current `/var/www/muzalife-frontend` | Before every deployment |
| **Config backup** | `.env` file backup | Before every deployment |

### 1.3 Retention Policy

| Backup | Retention |
|---|---|
| Build snapshots | Last 5 versions |
| Config backups | 30 days |

---

## 2. Backup Procedures

### 2.1 Back Up the Production Build

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/muzalife-frontend"
mkdir -p "$BACKUP_DIR"

sudo tar -czf "$BACKUP_DIR/build_${TIMESTAMP}.tar.gz" \
  -C /var/www muzalife-frontend/

echo "Build backup: $BACKUP_DIR/build_${TIMESTAMP}.tar.gz"
```

### 2.2 Back Up Configuration

```bash
CONFIG_BACKUP="$BACKUP_DIR/config_${TIMESTAMP}"
mkdir -p "$CONFIG_BACKUP"
cp ~/muzalife_frontend/.env "$CONFIG_BACKUP/.env.backup"
echo "Config backup: $CONFIG_BACKUP"
```

### 2.3 Source Code

The source code is version-controlled in Git. To recover a specific version:

```bash
git clone https://github.com/VladimiKoroviakov/muzalife_frontend.git
cd muzalife_frontend
git checkout <commit-hash>   # or a tag: git checkout tags/v1.0.0
```

---

## 3. Automated Backup

See [`docs/scripts/backup-frontend.sh`](./scripts/backup-frontend.sh) for the automated script.

Schedule it with cron to run before deployments, or nightly:

```bash
crontab -e
# Add:
0 2 * * * /home/deploy/muzalife_frontend/docs/scripts/backup-frontend.sh >> /var/log/muzalife-frontend-backup.log 2>&1
```

---

## 4. Restoration Procedures

### 4.1 Full Restoration from Build Backup

```bash
# Stop Nginx briefly (optional — swap is near-instant)
sudo systemctl stop nginx

# Restore from archive
sudo tar -xzf /var/backups/muzalife-frontend/build_<TIMESTAMP>.tar.gz \
  -C /var/www/

sudo chown -R www-data:www-data /var/www/muzalife-frontend
sudo systemctl start nginx
```

Verify:
```bash
curl -I https://muzalife.com
# Expected: HTTP/2 200
```

### 4.2 Selective Restoration

Restore a single file (e.g., `index.html`):

```bash
sudo tar -xzf /var/backups/muzalife-frontend/build_<TIMESTAMP>.tar.gz \
  -C /var/www/ \
  muzalife-frontend/index.html
```

### 4.3 Rebuild from Source

If no build backup is available, rebuild from the source code:

```bash
cd ~/muzalife_frontend
git checkout <last-known-good-commit>
cp /var/backups/muzalife-frontend/config_<TIMESTAMP>/.env.backup .env
npm ci --legacy-peer-deps
npm run build
sudo cp -r build/* /var/www/muzalife-frontend/
sudo nginx -s reload
```

### 4.4 Restoration Testing

Test restoration once per month on a staging server to ensure the procedure works:

```bash
# On staging server
sudo tar -xzf /var/backups/muzalife-frontend/build_<TIMESTAMP>.tar.gz -C /var/www/
curl -I https://staging.muzalife.com
```
