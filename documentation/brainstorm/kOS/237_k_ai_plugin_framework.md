# 237: kAI Plugin Framework

This document defines the architecture, standards, and engineering protocols for developing and managing plugins (or "skills") in the Kind AI (kAI) system. It is intended for engineers building the plugin runtime, plugin creators, and system maintainers.

---

## Overview

The kAI Plugin Framework enables external or user-developed modules to extend the capabilities of kAI without modifying the core. This architecture supports modularity, sandboxing, upgradability, permissions control, dependency resolution, and remote fetching.

Plugins are designed to:

- Add new skills, tools, or services.
- Integrate with external APIs, databases, sensors, or user-defined systems.
- Be securely installed, configured, sandboxed, and updated.

---

## 🧱 Plugin Structure

Every plugin is a self-contained directory with the following structure:

```txt
myplugin/
├── plugin.json            # Manifest definition
├── main.py                # Entrypoint logic
├── schema.json            # Input/output contract
├── config.yaml            # Default config (optional)
├── permissions.json       # Required capabilities
├── assets/                # Static assets (optional)
└── tests/                 # Plugin-level tests
```

---

## 📦 Plugin Manifest (plugin.json)

Defines metadata and runtime hooks:

```json
{
  "id": "weather.forecast",
  "name": "Weather Forecast Plugin",
  "version": "1.2.3",
  "description": "Provides weather forecasts from multiple providers.",
  "entrypoint": "main.py",
  "schema": "schema.json",
  "permissions": "permissions.json",
  "tags": ["weather", "utility"],
  "hooks": {
    "on_load": "init_plugin",
    "on_unload": "cleanup_plugin"
  }
}
```

---

## 🔐 Permissions (permissions.json)

Declare the capabilities the plugin requires:

```json
{
  "filesystem": false,
  "network": ["https://api.openweathermap.org"],
  "llm_access": true,
  "filesystem_scope": "sandbox"
}
```

Permissions are enforced by the sandbox runtime. Unsafe plugins must be reviewed or denied.

---

## ⚙️ Plugin Lifecycle Hooks

Plugins can define Python functions in `main.py` to hook into the runtime:

- `init_plugin(config: dict) -> None`
- `cleanup_plugin() -> None`
- `handle_input(input: dict) -> dict`
- Optional: `stream_handler(input: dict) -> Generator`

These hooks are auto-detected from the manifest and run in a namespaced environment.

---

## 🧪 Plugin I/O Contract (schema.json)

Defines required input and expected output with JSON Schema:

```json
{
  "input": {
    "type": "object",
    "properties": {
      "city": {"type": "string"}
    },
    "required": ["city"]
  },
  "output": {
    "type": "object",
    "properties": {
      "temperature": {"type": "number"},
      "conditions": {"type": "string"}
    },
    "required": ["temperature", "conditions"]
  }
}
```

---

## 🧩 Plugin Types

| Type    | Description                                           |
| ------- | ----------------------------------------------------- |
| Skill   | General-purpose modules callable by agents            |
| Sensor  | Interfaces for hardware or software signals           |
| Service | Long-lived tasks (e.g. media server, reminder daemon) |
| Wrapper | Integrations for other APIs/tools (e.g. Discord bot)  |
| Runtime | Plugin that enables new plugin execution environments |

---

## 🔐 Security Model

- All plugins run in isolated subprocesses or VMs.
- Sandboxed I/O via IPC or shared memory.
- No unrestricted network or filesystem access by default.
- Permissions must be whitelisted by user or policy engine.
- Cryptographically signed manifests recommended for third-party plugins.

---

## 📦 Plugin Registry Support

kAI can be configured to load plugins from:

- Local folders (`~/.kai/plugins/`)
- Git repositories (`git://...` or `https://github.com/...`)
- Remote plugin registries (e.g. `registry.kaios.dev`)

Registry metadata follows Open Container Initiative (OCI) or a simplified plugin-index format.

---

## 🔁 Hot Reloading Support

Plugins may opt into hot-reloading by emitting:

```python
__hot_reload__ = True
```

The runtime then watches for changes and reloads safely if lifecycle hooks are respected.

---

## 🔬 Development Tools

`kai plugin` CLI provides:

- `kai plugin init <name>` – Scaffold plugin
- `kai plugin validate <path>` – Lint schema/manifest
- `kai plugin run <path> --input file.json` – Dry-run plugin
- `kai plugin install <source>` – Install and register
- `kai plugin sandbox` – Test sandbox behavior

---

## 🧠 Integration with Agent Orchestrator

Agents discover plugins via:

- Plugin tags and declared capabilities
- PromptToolKit-integrated summaries
- Permission constraints (e.g. no LLM access)

Orchestrator dynamically loads and instantiates based on agent plans and context.

---

## 📁 Directory Layout in System

```txt
.kai/
├── plugins/
│   ├── weather.forecast/
│   ├── local.database/
│   └── mycompany.internal/
└── plugin_cache/
    └── registry-metadata.json
```

---

## 📘 Documentation Requirements

Each plugin **must** include:

- README.md with usage, examples, config options
- LICENSE
- CHANGELOG.md (versioned plugins)
- Sample `config.yaml`

---

## 🔚 Summary

The kAI Plugin Framework enables scalable, secure, and modular extension of the Kind AI ecosystem. With strict sandboxing, manifest enforcement, clear lifecycle hooks, and CLI tooling, developers can safely add new functionality without compromising system integrity.

Next steps:

- Implement Plugin Runtime Interface in `kai-core`
- Develop sandbox manager service
- Integrate with `kAI Agent Runtime` and `PromptKind`

