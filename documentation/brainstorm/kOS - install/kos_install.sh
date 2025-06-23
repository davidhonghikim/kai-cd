#!/bin/bash
# ==============================================
# kOS Core System Installer
# ==============================================
# Prepares a machine for Kind OS (kOS) deployment
# Installs Python, Docker, Node, Git, and necessary tooling
# ==============================================

set -e

# --- OS Check ---
OS=$(uname -s)
ARCH=$(uname -m)
echo "[kOS] Detected OS: $OS | Arch: $ARCH"

# --- Update System ---
echo "[kOS] Updating system packages..."
if [[ "$OS" == "Linux" ]]; then
  sudo apt update && sudo apt upgrade -y
elif [[ "$OS" == "Darwin" ]]; then
  brew update && brew upgrade
fi

# --- Install Dependencies ---
echo "[kOS] Installing dependencies..."
if [[ "$OS" == "Linux" ]]; then
  sudo apt install -y python3 python3-venv python3-pip docker.io docker-compose curl git unzip htop tmux
elif [[ "$OS" == "Darwin" ]]; then
  brew install python git docker docker-compose curl tmux htop
fi

# --- Enable Docker ---
echo "[kOS] Starting Docker..."
sudo systemctl enable docker
sudo systemctl start docker

# --- Create kOS Folder ---
echo "[kOS] Creating /opt/kos ..."
sudo mkdir -p /opt/kos && sudo chown $USER:$USER /opt/kos
cd /opt/kos

# --- Clone Repo or Sync Files ---
echo "[kOS] Fetching kOS system files..."
git clone https://github.com/kind-os/kOS.git . || echo "[WARN] Using local files instead."

# --- Prepare Python ---
echo "[kOS] Setting up Python environment..."
python3 -m venv venv && source venv/bin/activate
pip install --upgrade pip
pip install -r configs/requirements.txt || echo "[NOTE] You can install missing packages later."

# --- Final Message ---
echo "[kOS] ✅ System is ready. To deploy kOS, run:"
echo ""
echo "    cd /opt/kos && ./deploy.sh"
echo ""
echo "[kOS] Welcome to the Kind OS."
