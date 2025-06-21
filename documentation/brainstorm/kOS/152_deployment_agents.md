# 152: Deployment Agents and Provisioning Logic

This document defines the architecture, agents, and operational logic for automated deployment and installation workflows in the `kAI` and `kOS` ecosystems, covering both online and air-gapped (offline) modes.

---

## I. Overview

Deployment agents handle the installation, configuration, update, and upgrade lifecycle of KindOS systems and modules. They operate locally, remotely, or in distributed fashion and can function interactively (via GUI) or headlessly (via CLI/script).

---

## II. Core Agents

### 1. `InstallAgent`

Responsible for first-time setup and bootstrapping.

- **Modes:** GUI / CLI / Airgap / Remote
- **Actions:**
  - Dependency check (hardware, OS, libraries)
  - Prompt user (or accept silent config)
  - Download or read install packages
  - Verify package hashes/signatures
  - Run post-install health check

### 2. `ProvisionAgent`

Prepares the environment after install.

- **Tasks:**
  - Network setup, port binding, and cert gen
  - Initial user creation (vault, credentials, encryption keys)
  - Generate default configs per profile
  - Enable services (scheduler, daemon, etc.)
  - Register node/device with kOS if applicable

### 3. `UpdateAgent`

Performs rolling updates and version migrations.

- **Features:**
  - Patch puller (KLP stream or OTA package)
  - Hot swap or scheduled downtime
  - Data migration handlers
  - Rollback ability + changelog viewer

### 4. `UninstallAgent`

Safely removes or resets system components.

- **Options:**
  - Full wipe (config + data)
  - Soft uninstall (retain vault and artifacts)
  - Export logs before cleanup

### 5. `AgentVerifier`

Ensures deployed components match spec and are trusted.

- **Checks:**
  - Hash and signature verification
  - Config schema conformity
  - Log error scanning (anomaly detection)
  - Integrity of service APIs

---

## III. Supported Deployment Modes

| Mode        | Description                                              |
| ----------- | -------------------------------------------------------- |
| Local GUI   | End-user facing with visual install assistant            |
| Local CLI   | Terminal-based scripted or semi-interactive              |
| Remote Node | Installed from remote `kOS` master node or admin console |
| USB Install | Offline, air-gapped install from signed package bundle   |
| Container   | Docker/Podman/K8s agent-based container bootstrap        |

---

## IV. Configuration Schema (install.config.yaml)

```yaml
version: 1
profile: minimal
install:
  install_dir: /opt/kai
  allow_online: true
  allow_root: false
  init_vault: true
  offline_mode: false
  use_default_user: true
  seed_entropy: hardware_rng
  daemonize_services: true
  systemd_support: true
services:
  - prompt_server
  - vault
  - agent_orchestrator
  - frontend_ui
  - media_stack
```

---

## V. Agent Protocols

Deployment agents operate under strict sandbox and communication rules:

- **RPC over IPC or WebSockets (signed packets)**
- **KLP (Kind Link Protocol)**: For config sync, update streams, logs
- **GPG Signing Required**: All install/update packages signed
- **Audit Trail**: Each agent logs all actions to tamper-evident logs

---

## VI. Provisioning Profiles

| Profile    | Services Included             | Purpose                              |
| ---------- | ----------------------------- | ------------------------------------ |
| `minimal`  | Vault, prompt UI              | Lightweight offline personal use     |
| `fullnode` | All services                  | For swarm or orchestrator node       |
| `kiosk`    | UI, sandboxed AI              | Public interaction terminal          |
| `airgap`   | CLI, vault, local agents only | Secure offline lab or military setup |

---

## VII. Offline/Air-Gap Support

- **Installer USB Format:**

  - `/bootloader/`
  - `/packages/`
  - `/signatures/`
  - `/install.config.yaml`

- **Offline Key Vault Init**

- **Local-only KLP Relay**

- **No OTA unless whitelisted drive inserted**

---

## VIII. Installer GUI (KindSetup)

- **Framework:** Electron.js + Tailwind UI
- **Steps:**
  - Welcome + Language selection
  - License + Transparency notice
  - Install mode selection (Standard / Advanced)
  - Profile selection + Services picker
  - Storage / device / location setup
  - Review config summary
  - Real-time install progress + logs
  - Post-install verification and launch

---

## IX. Security Notes

- All deployment artifacts signed and verifiable
- Configurable install policy (locked profile, auto-timeout, multi-factor)
- Optional remote admin approval required before provisioning

---

### Changelog

– 2025-06-22 • First complete deployment agent architecture writeup

