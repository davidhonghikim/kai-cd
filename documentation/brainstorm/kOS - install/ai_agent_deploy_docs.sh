#!/bin/bash
# ==============================================
# UNIVERSAL AI AGENT SYSTEM BOOTSTRAP SCRIPT
# ==============================================
# OS-Agnostic, Modular, Upgradeable, Multi-Agent
# Supports Linux, macOS, Windows (via WSL)
# Detects hardware and configures environment
# ==============================================

set -e

# === 0. Detect OS and System ===
echo "[INFO] Detecting system..."
OS=$(uname -s)
ARCH=$(uname -m)
GPUS=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | wc -l || echo 0)
MEM=$(free -g | awk '/^Mem:/{print $2}' || sysctl hw.memsize | awk '{print $2/1073741824}')
CORES=$(nproc || sysctl -n hw.ncpu)

# === 1. Install Base Dependencies ===
echo "[INFO] Installing base dependencies..."
install_deps() {
  case "$1" in
    Linux)
      sudo apt update && sudo apt install -y git curl wget unzip build-essential python3 python3-venv python3-pip docker.io docker-compose
      ;;
    Darwin)
      brew install git python docker docker-compose || true
      ;;
    *)
      echo "[WARN] Unsupported OS for auto-deps. Use manual install." ;;
  esac
}
install_deps $OS

# === 2. Setup Python Env ===
echo "[INFO] Setting up Python environment..."
python3 -m venv venv && source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt || true

# === 3. Model Runtime Setup ===
echo "[INFO] Setting up model runtimes..."
read -p "Use Ollama [1], vLLM [2], or skip [3]? " MODEL_CHOICE
case $MODEL_CHOICE in
  1)
    if ! command -v ollama &> /dev/null; then
      curl -fsSL https://ollama.com/install.sh | sh
    fi
    ollama pull llama3 || echo "[WARN] Pull failed; try manually"
    ;;
  2)
    pip install vllm accelerate transformers
    echo "[INFO] vLLM installed. You must specify your model later."
    ;;
  *)
    echo "[INFO] Skipping model server setup."
    ;;
esac

# === 4. Setup Agents ===
echo "[INFO] Initializing agents..."
mkdir -p agents logs models config
cp templates/config.yaml config/config.yaml
cp templates/init_agents.py init_agents.py

# === 5. Hardware Optimization ===
echo "[INFO] Optimizing for detected hardware..."
echo "[INFO] OS: $OS, ARCH: $ARCH, GPUs: $GPUS, Memory: $MEM GB, Cores: $CORES"

# Adjust model loading based on VRAM availability
echo "[INFO] Choosing model quantization based on GPU RAM..."
if [[ $GPUS -gt 0 && $MEM -gt 15 ]]; then
  export MODEL_VARIANT="7b"
else
  export MODEL_VARIANT="4bit"
fi

# === 6. Launch Agents ===
echo "[INFO] Launching agents..."
python3 init_agents.py

# === 7. Optional GUI Interface ===
echo "[INFO] Installing optional GUI interface..."
read -p "Install OpenWebUI? (y/n): " GUI_CHOICE
if [[ "$GUI_CHOICE" == "y" ]]; then
  docker pull ghcr.io/open-webui/open-webui:main
  docker run -d -p 3000:3000 --name openwebui open-webui:main
  echo "[SUCCESS] OpenWebUI available at http://localhost:3000"
fi

# === 8. Modular Sync Setup (Optional) ===
echo "[INFO] Setting up sync and storage..."
mkdir -p /mnt/ai_data
# Optional: connect to NAS or cloud
# mount -t nfs nas:/data /mnt/ai_data

# === 9. Export Config and State ===
echo "[INFO] System is now running. Saving config..."
cp config/config.yaml backup/config.yaml.bak

echo "[SUCCESS] AI Agent system initialized. Ready to go!"
