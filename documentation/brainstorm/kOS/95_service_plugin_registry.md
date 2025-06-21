# 95: Service & Plugin Registration Framework

This document describes the architecture and configuration system for registering, managing, and integrating internal services, external tools, and third-party plugins into the `kAI` and `kOS` platforms.

---

## I. Overview

The Service & Plugin Registration Framework provides a unified, declarative way to register and configure modular components across the stack:

- **System Services** (e.g., logging, crypto, monitoring)
- **AI Services** (e.g., LLMs, vector databases, inference APIs)
- **Media/Render Tools** (e.g., image generation, audio processing)
- **Custom User Plugins** (e.g., tools, helpers, UI extensions)

It ensures compatibility, isolation, versioning, and trust-level enforcement.

---

## II. File Locations

```
kOS/
├── core/
│   ├── services/
│   │   └── registry.ts         # Service loading and discovery logic
│   ├── plugins/
│   │   └── index.ts            # Plugin runtime manager
│   └── config/
│       └── services.yaml       # Declarative registration manifest
└── user/
    └── plugins/
        ├── plugin-musicgen/
        └── plugin-hardware-audit/
```

---

## III. `services.yaml` Manifest Format

```yaml
services:
  - id: openai
    name: OpenAI Chat
    type: llm
    provider: openai
    endpoint: https://api.openai.com/v1
    auth:
      type: bearer_token
      token_env: OPENAI_API_KEY
    capabilities:
      - chat
      - embeddings
    ui:
      icon: openai.svg
      color: '#10a37f'

  - id: local-qdrant
    name: Local Vector DB
    type: vector_store
    provider: qdrant
    endpoint: http://localhost:6333
    auth:
      type: none
    capabilities:
      - vector_storage
      - similarity_search
    ui:
      icon: database.svg
      color: '#71717a'
```

---

## IV. Service Types

| Type           | Description                         | Examples                     |
| -------------- | ----------------------------------- | ---------------------------- |
| `llm`          | Language models & chat endpoints    | OpenAI, Anthropic, LM Studio |
| `vector_store` | Vector DBs for retrieval            | Qdrant, Chroma, Weaviate     |
| `image_gen`    | Text-to-image or manipulation       | A1111, ComfyUI, Replicate    |
| `media_proc`   | Audio, speech, and video processing | Whisper, Bark, Riffusion     |
| `tools`        | Logic or UI helper services         | Time agent, calendar, search |
| `user_plugin`  | User-added tools and extensions     | Plugin folders in user space |

---

## V. Plugin Lifecycle

### A. Plugin Discovery

Plugins are auto-discovered from `user/plugins/*/plugin.yaml` on load.

```yaml
id: plugin-musicgen
name: AI Music Generator
entrypoint: main.ts
version: 0.2.1
permissions:
  - audio_output
  - llm_access
ui:
  menu: true
  icon: music.svg
```

### B. Plugin Sandboxing

- Each plugin runs in its own sandbox context
- Exposed interfaces limited via `permissions`
- Optionally verified via PGP signature + version hash

### C. Plugin Communication

Plugins use the `ServiceBus` system to:

- Register themselves to system
- Subscribe to messages (`subscribe('event_name')`)
- Call other services (`invoke('vector_store.index', { ... })`)

---

## VI. Trust & Verification

| Trust Level  | Description                         | Enforcement                          |
| ------------ | ----------------------------------- | ------------------------------------ |
| `system`     | Core internal module                | Full access, fixed by kOS/kAI builds |
| `trusted`    | Verified via signature and checksum | Access to sensitive services         |
| `unverified` | Not signed/validated                | Run in isolation with limited access |

---

## VII. Versioning & Upgrades

- Services and plugins declare `version` in their metadata
- kAI supports `semver` compatibility checks
- Update checks via `/.kai/updates.json`

```json
{
  "openai": {
    "latest": "1.8.0",
    "url": "https://kindos.ai/api/service/openai/download"
  }
}
```

---

## VIII. Future Features

- Visual Plugin Marketplace (auto-signed)
- Plugin Testing Sandbox
- WebAssembly Plugin Runtime (for browser-safe code)
- Plugin Dependency Tree Visualizer

---

### Changelog

– 2025-06-20 • Initial draft of plugin/service architecture

