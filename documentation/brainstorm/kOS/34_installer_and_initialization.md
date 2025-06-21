# 34: Installer and Initialization System (kAI / kOS)

This document outlines the complete setup, installation, and initialization logic for deploying kAI and kOS in both standalone and integrated environments. It includes OS-level prerequisites, service scaffolding, dependency management, runtime verifications, and post-install configuration workflows.

---

## I. Installation Modes

### A. Standalone Installation (kAI only)

- For local, private use (browser extension, desktop, or mobile)
- Limited services (LLM access, basic vault, chat UI)
- Self-contained deployment with default configs

### B. Integrated Installation (kAI + kOS)

- Full suite: central orchestrator, agent coordination, distributed mesh
- kOS services include storage, registry, inter-agent routing, logging
- Requires cloud, local mesh, or private server

---

## II. Directory Structure

```text
installer/
├── cli/
│   ├── init.ts                    # Entry point for CLI bootstrapping
│   ├── commands/
│   │   ├── install.ts            # Primary installer logic
│   │   ├── upgrade.ts            # Version detection and upgrading
│   │   └── uninstall.ts          # Graceful uninstall and backup
│   └── utils/
│       ├── detectEnv.ts          # Detect OS, CPU, memory, GPU, Docker
│       ├── verifyDeps.ts         # Check required dependencies
│       ├── promptUser.ts         # Interactive prompts and config
│       └── logInstall.ts         # Append install logs to kLog
├── manifests/
│   ├── default.yaml              # Default profile and services
│   ├── dev.yaml                  # Dev mode profile
│   └── secure.yaml               # Hardened deployment profile
└── assets/
    ├── logo.png
    └── examples/
        ├── minimal_setup.sh
        └── docker_compose.yaml
```

---

## III. Prerequisites

### OS-Level

- ✅ Linux/macOS/Windows (WSL2 for Win)
- ✅ 4GB+ RAM, 20GB+ disk space
- ✅ Docker + Docker Compose
- ✅ Node.js >= 18.x
- ✅ Python >= 3.11 (venv required)
- ✅ Git

### Optional

- 🔒 GPG / SSH / PGP installed (for vault and key generation)
- 🎨 `tput` support for colorized CLI

---

## IV. Installation Workflow

### Step-by-Step

1. **Start Installer:**

   ```bash
   npx kind init
   ```

2. **Environment Detection:**

   - OS: Ubuntu 22.04 / Mac / Windows
   - Detects GPU (NVIDIA/AMD) for LLM acceleration
   - Checks for Docker, Python, Node.js, Git

3. **Prompt User Profile:**

   - Standalone (basic tools, local vault)
   - Developer Mode (agent builder CLI, mock tools)
   - Full kOS Node (mesh, vector db, multi-agent routing)

4. **Download Config Template:**

   - Based on profile: `default.yaml`, `secure.yaml`
   - Auto-populates service URLs, ports, auth methods

5. **Install Core Components:**

   - kAI client frontend (React, Vite)
   - FastAPI backend and agent orchestrator
   - Redis (jobs, pub/sub, short-term memory)
   - PostgreSQL or SQLite (metadata + app data)
   - Vault service (if enabled)
   - Optional: Qdrant (vector DB), Ollama (LLM), Local LLM support

6. **Validate Services:**

   - Ping core endpoints: `localhost:9991`, `vault:3000`, etc.
   - Liveness/readiness probes

7. **Finalize and Save Configuration:**

   - Encrypt secrets via AES
   - Save profile to `~/.kindai/config.json`

8. **Start Services:**

   ```bash
   docker-compose up -d
   npm run dev
   ```

---

## V. Post-Install

- ✅ Open browser: `http://localhost:9991`
- ✅ Login or create profile
- ✅ Connect services: OpenAI, Ollama, etc.
- ✅ Import saved vault backup (optional)
- ✅ Enable agent roles and permissions
- ✅ Test system with bootstrap agent

---

## VI. Example Docker Compose (Secure kOS Node)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: kindai
      POSTGRES_PASSWORD: secure123
    volumes:
      - ./data/postgres:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    restart: always

  api:
    build: ./backend
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "9991:80"
    depends_on:
      - api

  qdrant:
    image: qdrant/qdrant
    volumes:
      - ./data/qdrant:/qdrant/storage
    ports:
      - "6333:6333"
```

---

## VII. Install Profile YAML Schema

```yaml
profile: "developer"
services:
  vector_db: "qdrant"
  llm_backend: "ollama"
  vault: true
  pubsub: "redis"
  log_level: "debug"
  agent_roles:
    - orchestrator
    - chat_agent
    - file_agent
    - planner
  ports:
    api: 8000
    frontend: 9991
    vault: 3000
    qdrant: 6333
```

---

## VIII. Upgrade/Uninstall Paths

### Upgrade

```bash
npx kind upgrade
```

- Checks latest version from GitHub
- Backups `~/.kindai/config.json`
- Applies diffs to manifests and agent logic

### Uninstall

```bash
npx kind uninstall
```

- Stops all containers
- Prompts to delete config and data
- Cleans `~/.kindai`, containers, volumes

---

## IX. Future Enhancements

| Feature                   | Target Version |
| ------------------------- | -------------- |
| Interactive GUI Installer | 1.2            |
| ARM64 + mobile support    | 1.3            |
| Auto-proxy config         | 1.4            |
| Plugin system             | 2.0            |

