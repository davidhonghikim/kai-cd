# 106: Prompt Manager Architecture & PromptOps Guidelines

This document defines the complete architecture and operational practices for the Prompt Manager in the `kAI/kOS` system, supporting centralized prompt workflows, prompt injection safety, multi-agent version control, and distributed delivery to edge agents.

---

## I. System Overview

### A. Purpose

- Central control system for managing prompts across all agents
- Maintain consistency, safety, and customization of agent behavior
- Integrate prompt logic into UI, services, agents, and developer pipelines

### B. Supported Prompt Types

- **System Prompts** (boot/init personality)
- **Instruction Prompts** (task-specific)
- **Reflex Prompts** (event/trigger based)
- **RAG Templates** (retrieval-augmented query formatters)
- **Dialog Scripts** (chat sequences for simulation or tutorials)
- **Safety Injection Rules** (sanitization and fallback prompts)

---

## II. Directory Layout (Central Repository)

```plaintext
/prompt-manager/
├── config/
│   ├── prompt_roles.yaml         # Role-specific prompt assignments
│   ├── injection_rules.yaml      # Regex + fallback prompt mappings
│   ├── environment_tags.yaml     # Tag-based prompt injection (dev, prod, etc)
├── ui/
│   └── prompt_editor.tsx         # GUI prompt editor component
├── registry/
│   ├── agents/
│   │   └── planner_agent.md
│   ├── workflows/
│   │   └── onboarding_dialog.md
│   ├── core/
│   │   ├── system_default.md
│   │   └── fallback_persona.md
├── pipelines/
│   ├── test_runner.py            # Unit testing prompts
│   ├── hallucination_detector.py # Heuristic safety analyzer
│   └── version_sync.py           # GitOps + CDN deployer
├── sandbox/
│   ├── prompt_playground.ipynb   # Local experimentation notebook
│   └── behavior_tracer.py        # Prompt impact analysis
├── vault/
│   ├── encrypted_prompts/        # AES-256 secured versions
│   └── signed_hashes.json        # Integrity verification
```

---

## III. Core Modules

### A. Prompt Registry

- Markdown-based with YAML headers
- Each file contains:
  - `id`, `agent`, `role`, `version`, `status`
  - Prompt body in markdown
- Stored in Git with CI audit trail

### B. Prompt Router

- Intercepts prompt request from agents
- Applies rules from:
  - `prompt_roles.yaml` (agent-type logic)
  - `injection_rules.yaml` (e.g., emergency override, censoring)
  - `environment_tags.yaml` (e.g., verbose mode, safe mode)

### C. Prompt Editor UI

- Tree view of agents and prompt slots
- Git-integrated change history
- Role-based prompt testing sandbox

### D. PromptOps CLI

```bash
# Validate a new prompt
promptops validate registry/agents/trust_guardian.md

# Deploy to beta agents
promptops deploy registry/core/system_default.md --env beta

# Test injection safety
promptops scan --all --strict
```

---

## IV. PromptOps Best Practices

- ✅ Separate personality from instructions

- ✅ Always include fallback safety prompt

- ✅ Use structured delimiters for prompt sections

- ✅ Test edge-case queries (adversarial testing)

- ✅ Log and trace output generation path

- ❌ Do not modify live prompts without changelog entry

- ❌ Do not deploy unvalidated prompt sets to production agents

---

## V. Prompt Versioning

- All prompts have semantic versioning
- Tracked in Git history with changelog comments
- CDN Deployer generates hash-stamped prompt packs for edge agents

---

## VI. Prompt Security & Safety Controls

- AES-256 storage of sensitive prompts (vault layer)
- SHA-256 hash verification on load
- Built-in hallucination detector flags dangerous outputs
- Support for auto-redaction + fallback switching

---

## VII. Integration Points

- `kAI` Browser Extension: Local editable prompt workspace
- `kOS` Core Agents: Loaded via prompt router API
- Workflow Engine: Injected into task templates
- Persona System: Prompts aligned with persona JSON definitions

---

## VIII. Roadmap

- 🔄 Multi-language prompt translations
- 🌐 Web-based prompt marketplace
- 🔍 Prompt-Audit GPT agent (auto-reasoning verifier)
- 🧠 Prompt co-evolution model via reinforcement

---

### Changelog

- 2025-06-21 • Initial architecture draft

