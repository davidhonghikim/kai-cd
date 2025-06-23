#!/bin/bash

set -e

## kOS Advanced Install Script ##
echo "[kOS] Starting advanced installation..."

# Create directories
mkdir -p downloads installers logs

# 1. AUTOMATIC1111 Web UI (Stable Diffusion)
if [ "$INSTALL_A1111" = "1" ]; then
  echo "[+] Installing AUTOMATIC1111 Web UI..."
  git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui installers/a1111 || true
  cd installers/a1111 && ./webui.sh & cd -
fi

# 2. ComfyUI
if [ "$INSTALL_COMFYUI" = "1" ]; then
  echo "[+] Installing ComfyUI..."
  git clone https://github.com/comfyanonymous/ComfyUI installers/comfyui || true
  cd installers/comfyui && pip install -r requirements.txt && python main.py & cd -
fi

# 3. n8n (workflow automation)
if [ "$INSTALL_N8N" = "1" ]; then
  echo "[+] Installing n8n (Docker)..."
  docker run -d --name n8n -p 5678:5678 n8nio/n8n
fi

# 4. Whisper (STT)
if [ "$INSTALL_WHISPER" = "1" ]; then
  echo "[+] Installing Whisper (OpenAI)..."
  pip install git+https://github.com/openai/whisper.git
fi

# 5. Bark (Audio Gen)
if [ "$INSTALL_BARK" = "1" ]; then
  echo "[+] Installing Bark..."
  git clone https://github.com/suno-ai/bark installers/bark || true
  cd installers/bark && pip install -r requirements.txt && cd -
fi

# 6. MusicGen
if [ "$INSTALL_MUSICGEN" = "1" ]; then
  echo "[+] Installing MusicGen..."
  git clone https://github.com/facebookresearch/audiocraft installers/musicgen || true
  cd installers/musicgen && pip install -r requirements.txt && cd -
fi

# 7. LM Studio (optional GUI)
if [ "$INSTALL_LMSTUDIO" = "1" ]; then
  echo "[+] Downloading LM Studio..."
  wget -O downloads/lmstudio.AppImage https://api.lmstudio.ai/download/latest/linux &>/dev/null
  chmod +x downloads/lmstudio.AppImage
  echo "LM Studio downloaded to downloads/lmstudio.AppImage"
fi

# 8. Monitoring (Prometheus + Grafana)
if [ "$INSTALL_MONITORING" = "1" ]; then
  echo "[+] Launching Prometheus & Grafana via Docker..."
  docker-compose -f docker-compose.monitoring.yml up -d
fi

# 9. Logging (ELK Stack)
if [ "$INSTALL_ELK" = "1" ]; then
  echo "[+] Launching ELK Stack via Docker..."
  docker-compose -f docker-compose.logging.yml up -d
fi

# 10. Reverse Proxy (NGINX)
if [ "$INSTALL_NGINX" = "1" ]; then
  echo "[+] Installing NGINX..."
  sudo apt install -y nginx
  sudo systemctl enable nginx
  sudo systemctl start nginx
fi

# 11. Semantic Kernel
if [ "$INSTALL_SEMANTIC_KERNEL" = "1" ]; then
  echo "[+] Installing Semantic Kernel..."
  git clone https://github.com/microsoft/semantic-kernel installers/semantic_kernel || true
  cd installers/semantic_kernel && pip install -r requirements.txt && cd -
fi

# 12. Auto-GPT (autonomous agent framework)
if [ "$INSTALL_AUTOGPT" = "1" ]; then
  echo "[+] Installing Auto-GPT..."
  git clone https://github.com/Torantulino/Auto-GPT installers/autogpt || true
  cd installers/autogpt && pip install -r requirements.txt && cd -
fi

# 13. LocalAI
if [ "$INSTALL_LOCALAI" = "1" ]; then
  echo "[+] Installing LocalAI..."
  docker run -d --name localai -p 8081:8080 quay.io/go-skynet/local-ai:latest
fi

# 14. MLflow (experiment tracking)
if [ "$INSTALL_MLFLOW" = "1" ]; then
  echo "[+] Installing MLflow..."
  pip install mlflow && mlflow server --backend-store-uri sqlite:///mlflow.db --default-artifact-root ./mlruns --host 0.0.0.0 --port 5000 &
fi

echo "[kOS] Advanced install complete."
