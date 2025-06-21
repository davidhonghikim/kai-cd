# 198: kOS Device & Agent Bootstrap Protocol

This document outlines the detailed, low-level initialization and bootstrap procedures required for onboarding a new device, digital agent, or node into the kOS ecosystem. This includes both physical devices (IoT, robotics, edge devices) and virtual agents (AI agents, cloud workers, data pipelines).

---

## Overview

The bootstrap protocol defines the minimum viable steps to:

1. Authenticate the device/agent
2. Validate software/hardware integrity
3. Initialize configurations
4. Register with KindLink Protocol (KLP)
5. Sync with the Central Node Directory (CND)
6. Deploy any required system agents

---

## 🧩 Components Involved

| Component         | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| kBootstrap Daemon | Lightweight binary that runs at boot to initiate all other processes         |
| kLink CLI/API     | Interface for registering the agent with KLP                                 |
| Kind Agent Loader | Agent that configures system services & ensures minimal viable functionality |
| kVault            | Secure storage system for local keys and encrypted configuration             |
| kDNS Resolver     | Decentralized service discovery system                                       |
| kValidator        | Component responsible for system health and code signature verification      |

---

## 🔑 Bootstrap Sequence

### 1. Secure Boot Verification (Hardware Devices Only)

- TPM/secure enclave challenge
- kValidator checks OS & bootloader integrity hashes
- Proceed only if hashes match stored trust ledger

### 2. Load kBootstrap

```shell
/etc/init.d/kbootstrap start
```

- Checks `/etc/kos/kos.conf` for environment settings
- Fallbacks to recovery bootstrap image if corrupt

### 3. Device Identity Provisioning

- Check for existing device ID in `/var/kos/device.id`
- If absent, generate and register via `klink register-device`

```bash
klink register-device \
  --type=edge \
  --env=production \
  --init-key=/etc/kos/kos_init_key.pem \
  --out=/var/kos/device.id
```

### 4. Network Initialization

- Run `knetd` to acquire IPv6 and meshNet address
- Peer discovery via `kDNS`

### 5. Load Kind Agent Loader

- Fetch latest config from Kind Configuration Registry (KCR)
- Load: `core.agent.kai`, `core.agent.scheduler`, `core.agent.telemetry`

### 6. Key Exchange & Vault Sync

- Use KLP handshake to validate encryption layer
- Import existing secrets, user profiles, and ACLs into `kVault`

### 7. Node Registration

```bash
klink register-node \
  --id=$(cat /var/kos/device.id) \
  --role=general \
  --capabilities='[ai, comms, storage]' \
  --vault=/mnt/kvault
```

### 8. Start Core Services

- `kai-core` (AI routing core)
- `kai-control` (remote management agent)
- `kai-ui` (if device has display interface)
- `kai-vaultd` (vault synchronization)

---

## 🛠️ Configuration File: `/etc/kos/kos.conf`

```ini
[general]
agent_type = edge
env = production
bootstrap_mode = default
ui_enabled = true

[network]
ipv6_prefer = true
meshnet_enabled = true

[vault]
enabled = true
mount = /mnt/kvault

[logging]
level = debug
output = /var/log/kos_bootstrap.log
```

---

## 🧪 Health & Validation Tests

1. **Signature Check**:
   - `kValidator check-sigs /usr/bin/*`
2. **Agent Ping**:
   - `kai-core ping --self`
3. **DNS Test**:
   - `kDNS query kindai.system`
4. **Vault Integrity**:
   - `kvault verify /mnt/kvault`

---

## 🔄 Re-Bootstrap Triggers

- `kbootstrap --force`
- OS update with `kos-bootstrap-recheck` flag
- Remote `kai-control` issued re-init

---

## 📎 Attachments & Scripts

- `bootstrap-profile-template.yaml`
- `kai-core-agent.conf`
- `sample-device.id`
- `secure-hash-trustlist.sig`

---

## 📘 References

- `197_Klp_Kind_Link_Protocol.md`
- `101_kVault_Spec.md`
- `103_kDNS_Topology.md`
- `120_KAI_Core_Loader.md`

