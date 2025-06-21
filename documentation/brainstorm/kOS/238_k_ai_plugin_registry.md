# 238: kAI Plugin Registry

## Overview

The **kAI Plugin Registry** is a centralized catalog and runtime index of all available, active, and compatible plugins for the kAI ecosystem. It supports user-managed and system-managed registration, versioning, compatibility checks, auditing, and dynamic discovery.

---

## 📦 Plugin Structure Requirements

Each plugin submitted to the registry **must follow** this standardized directory format:

```
kai-plugin-myplugin/
├── plugin.json               # Metadata
├── README.md                 # Usage and documentation
├── src/
│   ├── index.ts              # Plugin entry point
│   └── ...                   # Additional plugin logic
├── manifest.yaml             # Declares capabilities, endpoints, dependencies
├── config/
│   └── default.yaml          # Default plugin configuration
├── assets/                   # Static content (icons, templates)
└── tests/                    # Self-verifying plugin tests
```

---

## 📑 plugin.json Schema

Defines basic plugin metadata:

```json
{
  "id": "kai.plugin.myplugin",
  "name": "MyPlugin",
  "version": "1.0.0",
  "description": "Performs XYZ.",
  "tags": ["task", "web", "automation"],
  "entry": "src/index.ts",
  "engine": {
    "min": "1.0.0",
    "max": "2.0.0"
  },
  "permissions": ["filesystem", "network"],
  "visibility": "public",
  "license": "MIT",
  "author": {
    "name": "Jane AIdev",
    "email": "jane@kind.ai"
  }
}
```

---

## 🛠 Registry Backend Stack

| Component      | Technology                                |
| -------------- | ----------------------------------------- |
| API Framework  | FastAPI (Python)                          |
| Data Store     | PostgreSQL (plugins, audits)              |
| Object Storage | MinIO or S3 (plugin uploads)              |
| Cache          | Redis (index cache)                       |
| Queue          | Celery + Redis (async validation + audit) |
| Vector DB      | Qdrant (semantic plugin discovery)        |
| Web UI         | React (admin + discovery portals)         |
| Access Control | OAuth2 + JWT (user scopes)                |

---

## 🧠 Plugin Discovery and Ranking

### Semantic Search

- Description and capability fields indexed in Qdrant
- Vector embeddings generated from `description`, `tags`, `README.md`
- Supports natural language search ("plugins that summarize news")

### Ranking Factors

- Verified plugins ranked higher
- Plugin health (tests, recent update)
- User rating and usage frequency

---

## 🔍 Dynamic Loading

- Plugin manifests downloaded from registry
- Sandbox instantiated with nsjail per plugin
- Entrypoint bootstraps the execution tree
- Plugin lifecycle hooks:
  - `init()`
  - `onReady()`
  - `onEvent()`
  - `onDestroy()`

---

## 🔐 Plugin Signing & Verification

- Plugins are signed with Ed25519 keys
- Registry verifies signatures during upload
- Agents verify signature before execution
- Tampered or unsigned plugins are blocked

---

## 🔄 Version Management

- Plugins can define multiple versions
- Registry supports `latest`, `stable`, `beta`, and pinning
- Compatible engine versions are declared via `plugin.json`
- Deprecation notices are tracked

---

## 🧪 Auditing & Validation

- Plugins must pass initial automated tests
- Agents can run `selftest()` via lifecycle hook
- Code linting, schema validation, sandbox execution tested
- Manual review can be enabled for critical plugins
- Full audit trail available in registry backend

---

## 🔧 Example Plugin Install Flow

1. User browses registry (via Web UI or API)
2. Selects plugin and installs
3. kAI fetches manifest, verifies signature
4. Sandbox is provisioned
5. Plugin runs `init()` -> `onReady()`
6. Plugin is now part of agent context

---

## ✅ Future Plans

- Plugin auto-update daemon
- UI for custom plugin configuration
- Open plugin marketplace (with tipping)
- Inference-integrated plugin recommendation engine

---

## 📂 Path: `documentation/kai-core/238_kAI_Plugin_Registry.md`

