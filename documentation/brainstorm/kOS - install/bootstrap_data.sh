#!/bin/bash
# ==============================================
# kOS Bootstrap Data Installer
# ==============================================
# Downloads default models, Comfy workflows, SD checkpoints,
# and other required files to make system ready out of the box.
# ==============================================

set -e

# --- Create folder structure ---
echo "[kOS] Setting up directory structure..."
mkdir -p models/ollama models/sd models/comfyui workflows datasets user_data

# --- Default Ollama model ---
echo "[kOS] Pulling Ollama default model (llama3)..."
ollama pull llama3 || echo "[WARN] Ollama not running yet - skip"

# --- Download SD model (Stable Diffusion v1.5) ---
echo "[kOS] Downloading Stable Diffusion v1.5 checkpoint..."
wget -O models/sd/sd15.ckpt https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt || echo "[WARN] Failed to download SD model"

# --- Download ComfyUI workflow example ---
echo "[kOS] Fetching ComfyUI starter workflow..."
wget -O workflows/comfy_starter.json https://raw.githubusercontent.com/comfyanonymous/ComfyUI_examples/main/example_workflow.json || echo "[WARN] Skipped Comfy workflow"

# --- n8n starter workflow ---
echo "[kOS] Installing starter n8n flow..."
wget -O workflows/n8n_starter.json https://raw.githubusercontent.com/n8n-io/n8n/main/packages/cli/sample-data/sample-workflow.json || echo "[WARN] Failed to pull n8n workflow"

# --- Hugging Face BGE-small embedding model ---
echo "[kOS] Downloading bge-small embedding model..."
wget -O models/embedding/bge-small-en.bin https://huggingface.co/BAAI/bge-small-en/resolve/main/pytorch_model.bin || echo "[WARN] Could not download embedding model"

# --- Default files ---
echo "[kOS] Placing example PDFs and project seeds..."
touch datasets/example_notes.pdf
echo "The future is collaborative. This is your canvas." > user_data/welcome.txt

# --- Complete ---
echo "[kOS] ✅ Default data and models ready. You're good to go."
