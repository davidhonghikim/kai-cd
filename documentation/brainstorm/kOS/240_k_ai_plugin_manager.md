# 240: kAI Plugin Manager – Plugin Registry, UI, and Controls

## Overview

The **kAI Plugin Manager** provides an integrated system to register, manage, configure, and deploy plugins across the `kAI` and `kOS` systems. It supports centralized control (via kOS) and localized override (via user-configurable sandboxes). It plays a vital role in extensibility, allowing external and user-generated modules to integrate into the core agent infrastructure securely and modularly.

---

## 🔌 Plugin Architecture

### Plugin Structure

Each plugin must adhere to a strict directory schema:

```
kai-plugins/
  my-plugin/
    plugin.json
    manifest.yaml
    main.py
    hooks/
      onLoad.py
      onCommand.py
    ui/
      config.schema.json
      settingsForm.tsx
    sandbox/
      logic.test.py
```

### Required Files

- `plugin.json`: Metadata including ID, name, version, author, license, sandbox status.
- `manifest.yaml`: Describes plugin capabilities, permissions, entry points, and extension points.
- `main.py`: Entrypoint for plugin logic.
- `hooks/`: Contains lifecycle methods (`onLoad`, `onUnload`, etc.).
- `ui/`: UI schema and optional admin-facing or user-facing settings.
- `sandbox/`: Tests or logic files running in isolated environments.

---

## 🧠 Plugin Registry System

### Plugin Registration Database

Stored in:

```
/kos/db/plugins.sqlite
```

Tables:

- `registered_plugins` - ID, name, path, checksum, is\_active
- `user_plugins` - user\_id, plugin\_id, config\_blob, sandbox\_id

### Plugin Loading

- Preloaded plugins specified in `kos.config.yaml`
- Dynamic plugins detected via plugin watcher
- User-installed plugins validated, hashed, and sandboxed

---

## 🖥️ Plugin UI and Controls

### Admin UI Features

- Plugin List View (status, type, last updated, controls)
- Detail View (schema config, documentation, source audit, hash check)
- Activation/Deactivation Toggle
- Sandbox Integrity Verifier (linked to kAI Trust Layer)
- Plugin Logs Panel

### User UI Features

- Enable/disable allowed plugins
- Personalize plugin settings
- Run plugin-specific tasks (e.g. schedule routines, execute scripts)

---

## 🔐 Plugin Security

### Verification

- Signed manifests preferred
- Hash-based integrity scan during load
- Permissions declared explicitly in `manifest.yaml`

### Isolation (Sandboxing)

- All non-core plugins run in nsjail or Docker container
- Denied file/network access unless granted
- Plugin runtime memory and CPU quotas

### kAI Trust Layer Hooks

- Audit logs of plugin actions
- Plugin reputation scores
- Optional user trust contract prompts

---

## ⚙️ Configuration System

Stored per plugin in:

```
/kos/config/plugins/my-plugin.config.yaml
```

Schema driven by `config.schema.json` in plugin source.

Auto-generated UI forms allow safe and dynamic user customization.

---

## 📦 Plugin Distribution

Supported formats:

- GitHub Repo (with manifest and tag)
- Zip Archive
- kOS Plugin Registry (future)

Install methods:

- Admin upload
- User install (from whitelisted sources)

---

## 🧪 Testing

### Plugin CI Hooks

- Lint check (Python, JS/TS)
- Schema validation (manifest, config)
- Sandbox execution test

### kAI Plugin Tester Module

- Controlled plugin runner
- Mocked data inputs
- Console log capture

---

## 🌐 Interoperability with kOS

- Shared plugin registry across systems
- Ability to deploy plugins from central governance
- Governance layer can approve or ban plugins via signed policy

---

## Future Plans

- **Plugin Marketplace UI** (filter, rate, review, install)
- **Agent Skill Store** (plugins that inject skills directly into agent memory/runtimes)
- **Federated Plugin Trust Audits** across multiple instances

---

### Changelog

- 2025-06-20: Initial draft (AI agent)

