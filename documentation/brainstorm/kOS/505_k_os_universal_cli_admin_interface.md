# 505\_kOS\_Universal\_CLI\_Admin\_Interface

---

## 🔗 Purpose

This document defines the structure, commands, security posture, and modular interface system for the Universal Command Line Interface (CLI) used by administrators and developers within Kind OS (kOS). It provides secure, scriptable, decentralized control over local and distributed agents, modules, and runtime environments.

---

## 🧰 Features

### 🔹 Modular Command Dispatcher

- Supports plugin architecture for commands by agent class, subsystem, or deployment mode
- Auto-discovery of services and registered agents via `kcli scan`

### 🔹 Command Namespaces

| Namespace      | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `kcli agent`   | Manage agent lifecycle, identity, and memory       |
| `kcli service` | Start/stop/query service modules                   |
| `kcli prompt`  | Interact with prompt transformer & validator stack |
| `kcli memory`  | Inspect, prune, or back up memory stores           |
| `kcli net`     | View and manage mesh/trust network configs         |
| `kcli sys`     | Diagnostics, updates, and runtime configs          |
| `kcli audit`   | Export logs, attestations, or session summaries    |

### 🔹 Universal Invocation Format

```bash
kcli [namespace] [action] [flags]
```

Example:

```bash
kcli agent suspend --id lorekeeper-002 --reason "alignment drift"
```

---

## 🔒 Security and Trust Model

- **Admin Keyring Access:** Root-level commands gated by threshold-encrypted keyrings
- **Swarm-Aware Auth:** CLI validates swarm attestation before action (for distributed commands)
- **Audit Mode:** Every command produces a signed execution hash and optional log memo

---

## 🛠️ Extension System

- `~/.kcli/extensions/*.sh` or `.py`
- Dynamically loaded for `kcli x` namespace
- Examples:
  - `kcli x simulate-agent` for training/test rituals
  - `kcli x export-vault` for secure snapshot archiving

---

## 📊 TUI/Hybrid Modes (Optional)

- CLI can launch a local curses-style terminal UI with `kcli tui`
- UI plugins share namespace structure but provide guided interaction

---

## 🧠 Summary

The Universal CLI is the hands and eyes of the system operator. In kOS, all things are agentic—but all agents need a way to be orchestrated, inspected, and aligned. `kcli` is that mechanism: direct, secure, extendable, and swarm-aware.

Next: **506\_kOS\_Agent\_Diagnostics\_Recovery\_Patch\_Network.md**

