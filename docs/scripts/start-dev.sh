#!/usr/bin/env bash
# =============================================================================
# MuzaLife Frontend — Development Environment Startup Script
#
# Usage:
#   chmod +x docs/scripts/start-dev.sh
#   ./docs/scripts/start-dev.sh
#
# What it does:
#   1. Checks Node.js availability
#   2. Verifies .env exists
#   3. Installs npm dependencies if node_modules is missing
#   4. Starts the Vite dev server
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
cd "$PROJECT_ROOT"

info "Project root: $PROJECT_ROOT"

# ── 1. Check Node.js ──────────────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || error "Node.js is not installed. Download from https://nodejs.org"
success "Node.js $(node -v) found"

# ── 2. Check .env ─────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  error ".env file not found. Create it with VITE_API_URL, VITE_GOOGLE_CLIENT_ID, etc. See README.md."
fi
success ".env found"

# ── 3. Check optional HTTPS certificates ─────────────────────────────────────
if [ -f "localhost-key.pem" ] && [ -f "localhost.pem" ]; then
  success "HTTPS certificates found — Vite will serve on https://localhost:3000"
else
  warn "HTTPS certificates not found. Vite will serve on http://localhost:3000"
  warn "For HTTPS: mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost"
fi

# ── 4. Install dependencies ───────────────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  info "node_modules not found. Running npm install..."
  npm install --legacy-peer-deps
fi
success "Dependencies installed"

# ── 5. Start development server ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${RESET}"
echo -e "${GREEN}  Starting MuzaLife Frontend (DEV mode)    ${RESET}"
echo -e "${GREEN}═══════════════════════════════════════════${RESET}"
echo ""
info "Vite dev server starting at https://localhost:3000 (or http if no certs)"
echo ""

npm run dev
