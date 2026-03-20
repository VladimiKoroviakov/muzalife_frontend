#!/usr/bin/env bash
# =============================================================================
# MuzaLife Frontend — Production Build & Deploy Script
#
# Usage:
#   chmod +x docs/scripts/start-prod.sh
#   ./docs/scripts/start-prod.sh
#
# What it does:
#   1. Checks Node.js availability
#   2. Verifies .env exists
#   3. Installs dependencies
#   4. Builds the production bundle
#   5. Deploys to /var/www/muzalife-frontend (Nginx must be installed)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOY_DIR="/var/www/muzalife-frontend"
cd "$PROJECT_ROOT"

info "Project root: $PROJECT_ROOT"

# ── 1. Check Node.js ──────────────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || error "Node.js not installed."
success "Node.js $(node -v) found"

# ── 2. Check .env ─────────────────────────────────────────────────────────────
[ -f ".env" ] || error ".env not found. Ensure VITE_API_URL points to the production backend."
success ".env found"

# ── 3. Install dependencies ───────────────────────────────────────────────────
info "Installing dependencies..."
npm ci --legacy-peer-deps
success "Dependencies installed"

# ── 4. Build ──────────────────────────────────────────────────────────────────
info "Building production bundle..."
npm run build
success "Build complete — output in build/"

# ── 5. Deploy ─────────────────────────────────────────────────────────────────
if command -v nginx >/dev/null 2>&1; then
  info "Deploying to $DEPLOY_DIR ..."
  sudo mkdir -p "$DEPLOY_DIR"

  # Atomic swap
  sudo cp -r build "$DEPLOY_DIR-new"
  sudo chown -R www-data:www-data "$DEPLOY_DIR-new"

  if [ -d "$DEPLOY_DIR" ]; then
    sudo mv "$DEPLOY_DIR" "${DEPLOY_DIR}-old"
  fi
  sudo mv "$DEPLOY_DIR-new" "$DEPLOY_DIR"

  sudo nginx -s reload
  success "Deployed and Nginx reloaded"
else
  warn "Nginx not found. Build output is in build/ — copy it to your web server manually."
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${RESET}"
echo -e "${GREEN}  MuzaLife Frontend build & deploy complete!   ${RESET}"
echo -e "${GREEN}═══════════════════════════════════════════════${RESET}"
