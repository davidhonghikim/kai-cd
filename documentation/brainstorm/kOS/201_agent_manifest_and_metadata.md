# 201: Agent Manifest and Metadata Specification

This document defines the official metadata format and manifest schema for all agents in the `kAI` ecosystem. The manifest enables introspection, lifecycle management, and compatibility enforcement by the `kOS` agent orchestration layer.

---

## 🧬 Purpose of the Agent Manifest

The agent manifest (`manifest.json` or `manifest.yaml`) is a machine-readable file that:

- Describes the agent’s capabilities, dependencies, interfaces, personality, and purpose
- Enables dynamic discovery, validation, and orchestration by the agent host
- Acts as the source of truth for agent configuration, dependencies, and trust metadata

---

## 📦 Location and File Format

Every agent **must** contain a manifest at:

```
agent_root/
  manifest.yaml  # preferred (or manifest.json)
```

YAML is preferred for readability. JSON is accepted for environments requiring strict parsing.

---

## 🧾 Manifest Structure

```yaml
id: "agent.promptkind.storyweaver"
name: "StoryWeaver"
version: "1.4.2"
description: "Narrative generation and storytelling assistant"
author: "Kind AI Team"
license: "MIT"

persona:
  name: "Elyra"
  role: "Creative guide and narrative architect"
  tone: "inspiring, imaginative"
  language: "en"
  default_prompt: "You are Elyra, a myth-maker and dream-crafter..."

capabilities:
  - chat
  - text-generation
  - plot-outline
  - emotional-analysis

entry:
  type: "llm"
  handler: "main.py"

interfaces:
  - type: "http"
    route: "/storyweaver"
    methods: [POST]
  - type: "cli"
    command: "python main.py"

requirements:
  python: ">=3.9"
  packages:
    - openai
    - langchain
    - pyyaml

storage:
  persistent:
    - name: "stories"
      type: "filesystem"
      path: "./data/stories"
  volatile:
    - name: "cache"
      type: "redis"
      host: "localhost"
      port: 6379

secrets:
  - OPENAI_API_KEY
  - STORY_VAULT_TOKEN

trust:
  signed: true
  fingerprint: "a9b4:d123:beef:4567"
  issued_by: "Kind Authority"
  expires: "2026-12-31"

permissions:
  network: true
  file_access: ["./data/stories"]
  subprocesses: false

lifecycle:
  init: "setup.py"
  healthcheck: "healthcheck.py"
  cleanup: "cleanup.py"

conforms_to:
  - "spec.kai.agent.v1"
```

---

## 🔍 Field Definitions

| Field         | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| `id`          | Globally unique agent identifier (reverse-DNS format recommended) |
| `name`        | Human-friendly name                                               |
| `version`     | SemVer-compliant version string                                   |
| `description` | Short agent purpose summary                                       |
| `author`      | Creator or publisher                                              |
| `license`     | SPDX identifier or license string                                 |

### Persona Block

- `name`, `role`, `tone`, `language`: used to construct default prompts and for identity in chats

### Capabilities

Standardized tags such as `chat`, `search`, `planning`, `vision`, `sql`, `api-call`, etc.

### Entry & Interfaces

Defines how the agent can be invoked (LLM handler, REST, CLI, etc.)

### Requirements

Python version and required packages (optional version constraints)

### Storage

Describes expected storage types and access patterns

### Secrets

Names of environment variables that must be set or injected

### Trust

Cryptographic signing information for integrity and provenance

### Permissions

Explicit required permissions for resource access (sandbox enforcement)

### Lifecycle

Defines startup, healthcheck, and shutdown logic hooks

### Conformance

Specifies the standard version(s) this manifest follows for compatibility

---

## 🧪 Example Usage

The agent orchestrator (`kOS`) will:

- Parse the manifest to register capabilities
- Resolve dependencies and secrets
- Mount data volumes or sandbox as defined
- Apply runtime policies for network, storage, memory, etc.

---

## ✅ Manifest Linter Tool

Included in the agent SDK:

```bash
kai lint manifest.yaml
```

- Checks version and schema compliance
- Warns on missing required fields
- Verifies signature (if applicable)

---

## 🧱 Future Extensions

Planned fields include:

- `pricing`: cost-per-token or rate limits
- `embedding_models`: for agents providing vector services
- `plugin_hooks`: if extensibility is needed (e.g., add-on support)

---

### Changelog

- 2025-06-21 • Initial complete draft by Kind AI agent

