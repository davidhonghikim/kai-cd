# 229: PromptKind Configuration System

## Overview

The PromptKind Configuration System governs the core operational parameters, environmental variables, agent behavior flags, module-specific settings, and user preferences for the kOS and kAI systems. It is designed for maximum flexibility, modularity, and transparency.

Configurations can be user-defined, agent-specified, dynamically updated, or inherited across layers, enabling seamless control over system behavior at runtime.

---

## Configuration Types

### 1. **System-Level Configs** (Located in `config/system/`)

- Global parameters for entire kOS/kAI instance
- Define service roots, security rules, default directories, global variables

#### Example: `config/system/core.yaml`

```yaml
system_id: kos_001
promptkind_version: 0.9.4
log_level: info
storage_mode: local
secure_mode: true
root_namespace: "kindai"
api_gateway_port: 9000
http_proxy: ""
```

### 2. **Agent-Level Configs** (Located in `config/agents/`)

- Unique settings for each agent (e.g., personalities, behaviors, permissions)

#### Example: `config/agents/assistant.yaml`

```yaml
agent_id: assistant
persona: "Helpful Researcher"
default_model: gpt-4o
context_window: 64k
active_roles:
  - researcher
  - summarizer
default_temperature: 0.3
auto_trace: true
auto_document: true
permissions:
  can_access_network: true
  can_read_secrets: false
```

### 3. **User-Level Configs** (Located in `config/users/`)

- Preferences and policies per user
- Identity, language, display mode, personal data vault path

#### Example: `config/users/alex.yaml`

```yaml
user_id: alex
language: en
personal_vault_path: "/data/vaults/alex"
dark_mode: true
preferred_editor: "vscode"
profile:
  full_name: Alex Monroe
  timezone: America/New_York
  accessibility:
    text_to_speech: true
    font_scaling: 1.2
```

### 4. **Module Configs** (Located in `config/modules/<module_name>.yaml`)

- Loaded per functional module or plugin (e.g., vector store, file manager, prompt router)

#### Example: `config/modules/vector.yaml`

```yaml
vector_db:
  backend: qdrant
  host: 127.0.0.1
  port: 6333
  namespace_prefix: "kindai_embeds"
  embedding_model: all-MiniLM-L6-v2
  cache_ttl_seconds: 600
```

---

## Configuration System Components

### A. Configuration Manager (Core Service)

- Loads and merges configuration files from disk
- Supports `.yaml`, `.json`, and `.env` formats
- Exposes API via CLI and HTTP
- Runtime reloadable via signals or commands (`configctl reload`)

### B. Schema Validator

- Uses JSON Schema or Pydantic-based schema validation
- Validates structure and types during load
- Rejects invalid configs and provides helpful error messages

### C. Config Diff & Patch Tool

- CLI/Agent tool for viewing config diffs and applying patches
- Useful for synchronizing updates across clusters

```bash
$ configctl diff --agent assistant
$ configctl patch config/agents/assistant.yaml --with config/patches/personality_alt.yaml
```

---

## Configuration Inheritance & Overrides

- **System > Agent > User > Session**
- Highest specificity always overrides lower
- Environment variables can override any file-defined setting
- Agents can request scoped overrides for specific tools/modules

```yaml
# Override in runtime session:
overrides:
  context_window: 16k
  permissions.can_access_network: false
```

---

## Dynamic Configuration Access in Code

### Python Example

```python
from kind_config import ConfigManager

agent_config = ConfigManager.get_agent_config("assistant")
model = agent_config.get("default_model")

if agent_config.get("permissions.can_access_network"):
    fetch_web_data()
```

### JavaScript/Frontend Example

```js
const config = await fetch('/api/config/user/alex');
if (config.dark_mode) enableDarkMode();
```

---

## Security & Audit

- All config loads logged with checksum
- Config changes must be signed in secure mode
- Encrypted fields supported (e.g., credentials)
- Vault path declarations are sandboxed and cannot access outside `/data/vaults/`

---

## UI Integration

- Config Editor built into `/settings` view in the UI
- Searchable, tabbed editor by config category
- Validation, linting, autocomplete with live save option

---

## Example Directory Structure

```
config/
├── system/
│   └── core.yaml
├── agents/
│   ├── assistant.yaml
│   └── vision.yaml
├── users/
│   ├── alex.yaml
│   └── dana.yaml
├── modules/
│   ├── vector.yaml
│   ├── prompts.yaml
│   └── storage.yaml
├── schemas/
│   └── config_schema.json
├── patches/
│   └── personality_alt.yaml
└── secrets.env
```

---

## Summary

The PromptKind Configuration System is a foundational part of kOS/kAI that empowers runtime flexibility, human and agent customization, modular scalability, and secure interoperability. With its layered structure and tooling support, it ensures maintainable control across local and networked deployments.

