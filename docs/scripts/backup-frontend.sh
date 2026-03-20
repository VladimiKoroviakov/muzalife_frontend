#!/usr/bin/env bash
# =============================================================================
# MuzaLife Frontend — Automated Backup Script
#
# Usage:
#   chmod +x docs/scripts/backup-frontend.sh
#   ./docs/scripts/backup-frontend.sh
# =============================================================================

set -euo pipefail

BACKUP_ROOT="/var/backups/muzalife-frontend"
DEPLOY_DIR="/var/www/muzalife-frontend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"; }
success() { echo -e "${GREEN}[$(date +%H:%M:%S)] OK${RESET} $*"; }

mkdir -p "$BACKUP_ROOT"

# ── 1. Back up production build ───────────────────────────────────────────────
if [ -d "$DEPLOY_DIR" ]; then
  info "Backing up production build..."
  sudo tar -czf "$BACKUP_ROOT/build_${TIMESTAMP}.tar.gz" -C /var/www muzalife-frontend/
  success "Build backup: $BACKUP_ROOT/build_${TIMESTAMP}.tar.gz"
else
  info "No production build found at $DEPLOY_DIR — skipping."
fi

# ── 2. Back up .env ───────────────────────────────────────────────────────────
info "Backing up .env..."
mkdir -p "$BACKUP_ROOT/config"
cp "$PROJECT_ROOT/.env" "$BACKUP_ROOT/config/.env_${TIMESTAMP}" 2>/dev/null || true
success ".env backed up"

# ── 3. Rotate old build backups (keep last 5) ─────────────────────────────────
info "Rotating old build backups (keeping last 5)..."
ls -1t "$BACKUP_ROOT"/build_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f || true
success "Rotation complete"

echo ""
echo -e "${GREEN}Frontend backup complete: $TIMESTAMP${RESET}"
