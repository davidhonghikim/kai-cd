# 🧠 kOS — Kind OS

Welcome to **kOS**, the Kind OS — an all-in-one, agent-powered operating system that runs anywhere, does everything, and configures itself around you.

---

## 🌐 One OS to Rule Them All

✅ Fully Automated  
✅ USB / VM / Docker / PXE / Native  
✅ Modular Agent Architecture  
✅ Full Stack LLM + Image + Workflow + Dev + UI + Cloud Integrations  

---

## 🚀 Quick Start

### 🔧 Prerequisites
- Linux/macOS or WSL2
- Python 3.8+
- Docker + Docker Compose
- 20GB+ free space recommended

### 🖥️ Install & Deploy
```bash
curl -s https://kindos.dev/install.sh | bash
cd /opt/kos
./deploy.sh
```

You can also boot from ISO or PXE for live USB or server installation.

---

## 🧩 System Overview

### 🔁 Agents
| Name | Role |
|------|------|
| `agent_init` | Detect, provision, and bootstrap |
| `agent_ui` | Web + CLI UI manager |
| `agent_dev` | Code generation, test, git CI/CD |
| `agent_creator` | Image, video, text generation & publishing |
| `agent_ops` | Deploy and monitor local/remote services |
| `agent_comms` | Integrate with Telegram, Slack, Email, SMS |

### 🔌 Services
| Tool | Port |
|------|------|
| OpenWebUI | 3000 |
| Ollama | 11434 |
| A1111 | 7860 |
| ComfyUI | 8188 |
| n8n | 5678 |
| ChromaDB | 8000 |
| Weaviate | 8080 |
| Postgres | 5432 |
| Tailscale | Auto Mesh |
| K8s Dashboard | 8001 |

---

## 📂 Project Structure
```
kOS/
├── deploy.sh              # main deploy script
├── kos_install.sh         # standalone OS bootstrapper
├── defaults.yaml          # agent & service profile presets
├── init_agents.py         # agent launcher
├── agent_memory.py        # vector/structured memory system
├── ui_server.py           # REST/WebSocket UI backend
├── docker/core.yml        # full dockerized stack
├── docs/                  # usage, agents, dev guides
├── agents/                # agent logic (modular)
```

---

## 🔮 Coming Soon
- AI-enhanced mobile PWA
- Local-first full IDE integration
- Plugin marketplace + no-code interface

---

## ⚖️ License
Open-source under MIT / AGPL with community clauses. Respect and kindness required.

---

Welcome to a more helpful world. Welcome to **Kind OS** 🕊️
