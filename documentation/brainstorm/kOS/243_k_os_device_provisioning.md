# 243: kOS Device Provisioning – Protocols, Interfaces, and Lifecycle

## Overview

This document provides the detailed blueprint for provisioning, configuring, and managing devices across the kOS ecosystem. It covers both initial setup and ongoing lifecycle management, supporting automated provisioning, identity management, and secure communications.

---

## 🔧 Provisioning Workflow

### A. Device Onboarding Sequence

1. **Initialization**

   - Trigger: Physical or virtual device powered on for the first time
   - Boot firmware identifies kOS-compatible signature

2. **Handshake with Local MCP Node / Provisioning Server**

   - Discovery via local broadcast or kDNS (Kind Distributed Naming Service)
   - Mutual key exchange (Elliptic Curve Diffie-Hellman + Identity Certificate)
   - Assign temporary provisioning session token

3. **Identity Assignment**

   - Request signed `kID` (Kind Identity Token) from a verified Authority Node
   - Assign unique, hierarchical `device_id`, `group_id`, and optionally `user_id`

4. **Role Definition & Capability Sync**

   - Determine role: sensor, actuator, compute, AI companion, gateway, etc.
   - Receive minimal config profile: firmware channel, allowed protocols, health checks

5. **Secure Storage Setup**

   - Initialize TPM / secure enclave or software vault
   - Provision device-specific credentials and secret keys

6. **Finalization**

   - Lockdown bootloader (optional)
   - Persist config
   - Report to orchestrator or parent node

### B. Supported Protocols

| Protocol           | Purpose               | Encryption         | Notes                                           |
| ------------------ | --------------------- | ------------------ | ----------------------------------------------- |
| KLP                | Kind Link Protocol    | End-to-End         | Base protocol for all mesh/device communication |
| kDNS               | Discovery / Naming    | Signed DNS packets | Blockchain-backed hostname resolution           |
| WebSocket          | Real-time streaming   | TLS 1.3            | Optional fallback                               |
| MQTT               | Sensor streams        | TLS / Mutual Auth  | For lightweight edge messaging                  |
| HTTPS              | Provisioning / Config | TLS 1.3            | REST API fallback                               |
| SSH (kSecureShell) | Admin access          | Encrypted          | Only for high-trust devices                     |

---

## 🧩 Identity & Certificates

### A. Identity Types

- **DeviceID:** Immutable physical identifier
- **KindID (kID):** Signed unique digital identity
- **SessionToken:** Temporary access token during provisioning

### B. Certificate Infrastructure

- x509v3 with custom kOS extensions
- Signed by Kind Authority Node (KAN)
- Revocation handled via KLP CRLs

---

## 🔐 Secure Config Vault

### A. Config File Path (Unix)

```
/etc/kos/config.yaml
/etc/kos/identity.cert
/etc/kos/secrets/
```

### B. Sample Config Structure

```yaml
identity:
  device_id: "kdev-7f4ac3"
  kind_id: "k:auth/kdev-7f4ac3/001"
  cert_path: "/etc/kos/identity.cert"

network:
  protocol: "klp"
  discovery_method: "kDNS"
  fallback: ["https", "mqtt"]

services:
  capabilities:
    - telemetry
    - voice-assistant
    - local-orchestration
  allowed_endpoints:
    - "*.kai.local"
    - "control.kos"

secrets:
  vault: "/etc/kos/secrets"
  encryption: "aes-256-gcm"
```

---

## 📦 Provisioning Tools

### A. `kosctl`

Command-line tool for managing devices:

```bash
kosctl enroll --device my-kos-node --role gateway
kosctl list
kosctl update-firmware --device kdev-123
kosctl regen-cert --device kdev-007
```

### B. Web Dashboard

- Enroll, inspect, and manage devices
- QR code or NFC-based quick provisioning
- View identity chain, logs, and metrics

### C. Remote Provisioning Kit (RPK)

- Used to flash and enroll devices remotely
- Secure USB + kOS provisioning binary

---

## 📋 Device Roles & Classifications

| Role         | Description                    | Notes                          |
| ------------ | ------------------------------ | ------------------------------ |
| Gateway      | Routes mesh + external traffic | High trust, often wired        |
| Sensor       | Reports environmental data     | Low power profile              |
| Companion    | AI/Human interface             | May have biometrics and camera |
| Compute Node | Runs services or agents        | Often in clusters              |
| Actuator     | Performs physical action       | Requires real-time response    |
| Relay        | Mesh repeater                  | No data generation             |

---

## 🛠 Firmware Channeling

- **Stable:** Default secure OTA
- **Beta:** Experimental features
- **Dev:** For local testing/devices only

Configurable via `kosctl` or UI.

```bash
kosctl set-channel --device kdev-445 --channel dev
```

---

## 🔁 Lifecycle Management

### A. Health Check & Heartbeat

- Sent via KLP at interval (default 60s)
- Includes CPU, RAM, uptime, errors

### B. Orchestration API

- Devices report to orchestrator agent
- Accept push updates, config changes, and logs

### C. Decommissioning

- Run:

```bash
kosctl decommission --device kdev-999
```

- Revokes all keys
- Wipes local secrets

---

## 🧠 Future Extensions

- **Self-sovereign provisioning** (agent-attested bootstrap)
- **Portable device profiles** synced to user identity
- **Post-quantum crypto** (support via Falcon/SPHINCS)

---

### Changelog

– 2025-06-20 • Initial draft (AI agent)

