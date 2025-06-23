#!/bin/bash
# ==============================================
# kOS Deploy Script - Fully Automated AI Agent OS
# ==============================================
# Supports: USB, Docker, Native, PXE, Cloud, WSL
# Modes: Auto / Interactive / Expert
# ==============================================

set -e

MODE=${1:-auto}
export KOS_ROOT="$(pwd)"
echo "[kOS] Deploying in $MODE mode..."

# === 1. Detect Platform ===
OS=$(uname -s)
ARCH=$(uname -m)
MEM=$(free -g | awk '/^Mem:/{print $2}' || sysctl hw.memsize | awk '{print $2/1073741824}')
GPUS=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | wc -l || echo 0)
echo "[kOS] Platform: $OS / $ARCH / $MEM GB RAM / $GPUS GPU(s)"

# === 2. Install Base Dependencies ===
install_deps() {
  case "$OS" in
    Linux*) sudo apt update && sudo apt install -y git curl unzip python3 python3-venv python3-pip docker.io docker-compose ;;
    Darwin*) brew install git python docker ;;
    *) echo "[WARN] Unsupported OS: $OS" ;;
  esac
}
install_deps

# === 3. Setup Python Environment ===
python3 -m venv venv && source venv/bin/activate
pip install --upgrade pip
pip install -r $KOS_ROOT/configs/requirements.txt || true

# === 4. Init Docker Services ===
echo "[kOS] Starting core services (Docker)..."
docker-compose -f $KOS_ROOT/docker/core.yml up -d

# === 5. Start Agent Stack ===
echo "[kOS] Initializing agents..."
python3 $KOS_ROOT/init_agents.py

# === 6. Start UI Server ===
echo "[kOS] Launching UI server..."
nohup python3 $KOS_ROOT/ui/ui_server.py &>/dev/null &

# === 7. Show Access Points ===
echo "[kOS] Web UI available at: http://localhost:3000"
echo "[kOS] CLI TUI: ./tui.sh"
echo "[kOS] Remote API: ./docs/dev/02_api_reference.md"

echo "[kOS] Deployment complete. Welcome to Kind OS (kOS)."
