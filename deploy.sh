#!/usr/bin/env bash
# deploy.sh — Build and run the CEREMONY_WEBAPP_NUXT frontend container
# Usage:
#   ./deploy.sh              # build + run (default)
#   ./deploy.sh --pull       # git pull first, then build + run
#   ./deploy.sh --dev        # run dev server locally (no Docker)
#   ./deploy.sh --stop       # stop running container
#   ./deploy.sh --logs       # tail container logs
#   ./deploy.sh --status     # show container status

set -e

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "${GREEN}${BOLD}  ✔ $1${NC}"; }
info() { echo -e "${BLUE}  ▶ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail() { echo -e "${RED}${BOLD}  ✘ $1${NC}"; exit 1; }
step() { echo -e "\n${CYAN}${BOLD}── $1 ──${NC}"; }

# ── Resolve project root (docker-compose.yml lives one level up) ──────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Parse args ────────────────────────────────────────────────────────────────
MODE="deploy"
for arg in "$@"; do
  case "$arg" in
    --pull)   MODE="pull+deploy" ;;
    --dev)    MODE="dev" ;;
    --stop)   MODE="stop" ;;
    --logs)   MODE="logs" ;;
    --status) MODE="status" ;;
    --help|-h)
      echo "Usage: ./deploy.sh [--pull | --dev | --stop | --logs | --status]"
      echo "  (no flag)  Build Docker image and start container"
      echo "  --pull     git pull latest, then build and start"
      echo "  --dev      Run local dev server (npm run dev)"
      echo "  --stop     Stop the running webapp container"
      echo "  --logs     Tail webapp container logs"
      echo "  --status   Show container status"
      exit 0 ;;
  esac
done

# ── Handlers ──────────────────────────────────────────────────────────────────

do_status() {
  echo -e "\n${BOLD}Container status:${NC}"
  docker compose -f "$ROOT_DIR/docker-compose.yml" ps webapp 2>/dev/null || \
    docker ps -a --filter name=wedding-webapp --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

do_stop() {
  step "Stopping webapp container"
  docker compose -f "$ROOT_DIR/docker-compose.yml" stop webapp && ok "Stopped" || fail "Failed to stop"
}

do_logs() {
  info "Tailing logs (Ctrl+C to exit)..."
  docker compose -f "$ROOT_DIR/docker-compose.yml" logs webapp -f
}

do_pull() {
  step "Git pull"
  cd "$SCRIPT_DIR"
  if git pull origin main; then
    ok "Up to date"
  else
    warn "git pull failed — continuing with current code"
  fi
}

do_dev() {
  step "Starting local dev server"
  cd "$SCRIPT_DIR"
  if [ ! -d node_modules ]; then
    info "Installing dependencies..."
    npm install || fail "npm install failed"
    ok "Dependencies installed"
  fi
  info "Starting Nuxt dev server at http://localhost:3000"
  npm run dev
}

do_deploy() {
  step "Building Docker image"
  info "Context: $ROOT_DIR"
  info "Dockerfile: CEREMONY_WEBAPP_NUXT/Dockerfile"

  docker compose -f "$ROOT_DIR/docker-compose.yml" build webapp \
    || fail "Docker build failed"
  ok "Image built"

  step "Starting container"
  docker compose -f "$ROOT_DIR/docker-compose.yml" up webapp --no-deps -d \
    || fail "Failed to start container"
  ok "Container started"

  sleep 2
  do_status

  echo ""
  ok "Frontend deployed → http://localhost:3000"
}

# ── Main ──────────────────────────────────────────────────────────────────────

echo -e "\n${BOLD}${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║  CEREMONY_WEBAPP_NUXT  deploy.sh     ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${NC}\n"

case "$MODE" in
  stop)         do_stop ;;
  logs)         do_logs ;;
  status)       do_status ;;
  dev)          do_dev ;;
  pull+deploy)  do_pull && do_deploy ;;
  deploy)       do_deploy ;;
esac
