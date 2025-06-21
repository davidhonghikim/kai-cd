# 172: kOS / kAI Prompt Management System – Architecture, Schema, and Prompt Audit Trail

This document defines the system used to manage all prompt templates, prompt executions, and prompt metadata across `kAI` agents and the `kOS` operating stack. It also defines the auditability, organization, and synchronization of prompts for agent coordination and traceability.

---

## I. Objectives

- Centralized prompt repository with namespacing and versioning
- Full metadata schema for each prompt execution
- Runtime prompt interpolation, evaluation, and context injection
- Agent-aware prompt traceability and debugging
- Distributed synchronization via KLP (Kind Link Protocol)

---

## II. Prompt Repository Structure

Directory layout inside the system config dir (e.g., `~/.kos/prompts/`):

```
~/.kos/prompts/
├── default/
│   ├── agent_init.md
│   ├── agent_summary.md
│   └── persona/
│       ├── kind_helper.md
│       └── researcher.md
├── system/
│   ├── system_orchestrator.md
│   └── trust_verifier.md
├── projects/
│   ├── my_custom_bot/
│   │   ├── preamble.md
│   │   └── tools_summary.md
└── registry.json
```

---

## III. Prompt Metadata Schema

Each prompt template and execution is registered and versioned with the following structure:

```json
{
  "id": "persona/kind_helper",
  "version": "1.2.0",
  "description": "Helper personality for Kind AI agents",
  "author": "dev@kind.ai",
  "last_updated": "2025-06-20T10:12:45Z",
  "tags": ["persona", "helper"],
  "params": ["$agent_name", "$user_name"],
  "path": "~/.kos/prompts/default/persona/kind_helper.md"
}
```

- **params** are placeholders used inside the markdown template
- Metadata is stored in `registry.json` and loaded at runtime

---

## IV. Runtime Prompt Injection

At runtime, prompts are compiled with actual parameters using a context interpolation engine.

**Example:**

```md
Welcome $user_name, I'm $agent_name. How can I help you today?
```

### Steps:

1. Load `prompt_id`
2. Resolve params from runtime context (e.g., user profile, session info)
3. Interpolate to string
4. Log final interpolated prompt string to execution log (for replay)

---

## V. Prompt Execution Trace

For every invocation of a prompt, an entry is written to a local audit log:

```json
{
  "timestamp": "2025-06-20T13:22:11Z",
  "agent": "kai://agent/assistant",
  "prompt_id": "persona/kind_helper",
  "version": "1.2.0",
  "input_context": {
    "user_name": "Alex",
    "agent_name": "kAI"
  },
  "interpolated_text": "Welcome Alex, I'm kAI. How can I help you today?",
  "output_summary": "Responded with intro message"
}
```

These are written in append-only JSONL files: `~/.kos/logs/prompts_audit.jsonl`

---

## VI. Prompt Testing & Debugging Tool

CLI tool: `kai-prompt-tester`

```bash
kai-prompt-tester --prompt persona/kind_helper \
  --param user_name=Alex \
  --param agent_name=kAI
```

Features:

- Render final string to stdout
- Show used template, metadata, and timestamp
- Add `--log` to append to audit trail
- Add `--diff` to see differences with previous version

---

## VII. Prompt Versioning System

Prompts are versioned using semver. Prompt registry supports multiple versions.

- If `latest` version is desired, omit version key in config.
- Rollback and diff tools available in `kai-prompt-manager`

---

## VIII. Prompt Synchronization (KLP)

Via Kind Link Protocol:

- `klp://hub.prompts.sync/` provides federated sync
- Prompts with `sync: true` in metadata will be uploaded/downloaded
- Includes metadata signing (Ed25519)
- Supports project-level prompt bundling

---

## IX. Agent-Specific Prompt Profiles

Each agent can have its own prompt context chain (e.g., `init`, `persona`, `summary`, `fallback`).

Example config in agent profile:

```yaml
prompts:
  init: default/agent_init
  persona: persona/kind_helper
  fallback: system/fallback_handler
```

---

## X. Future Enhancements

- Prompt diff visualization in UI
- LLM-tuned prompt linting
- Prompt quality rating system (via feedback agents)
- Embedding + clustering of prompt corpus
- Project-level prompt overrides

---

### Changelog

– 2025-06-21 • Initial full implementation spec for prompt management

