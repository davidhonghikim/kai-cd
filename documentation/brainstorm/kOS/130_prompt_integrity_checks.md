# 130: Prompt Fingerprinting & Integrity Validation

This document defines the mechanisms by which all prompts in the `kAI` and `kOS` ecosystems are securely identified, validated, and traced. The goal is to ensure prompt integrity, detect tampering, enable accountability, and support agent reproducibility.

---

## I. Objectives

- Assign unique, reproducible hashes to prompts (text + metadata)
- Detect prompt drift, unauthorized mutation, or prompt injection
- Enable backward tracking of prompt versions and usage contexts
- Provide decentralized signature mechanisms for provenance

---

## II. Prompt Fingerprinting System (PFS)

### A. Fingerprint Composition

```yaml
prompt_id: uuidv4
sha256_hash: "abc123..."
version: v3.1
created_at: 2025-06-21T14:44:00Z
author: agent://kAI-003
scope: system | agent | ephemeral | private
```

- **sha256\_hash**: Covers prompt body, context, system prompt, and parameters
- **prompt\_id**: UUID for cross-agent reference
- **scope**: Controls where the fingerprint is stored (public ledger, private store, etc.)

### B. Storage Targets

- **Public Ledger (KLP)**: For widely reused prompts (public tools, community agents)
- **Private Vault**: For sensitive or personal prompts
- **Agent Memory**: Ephemeral prompts for inline use only

---

## III. Integrity Checkpoints

### A. At Runtime

- Agents check hash of active prompt against declared fingerprint
- On mismatch, trigger warning, halt, or fallback to last valid state

### B. At Submission

- All prompt changes go through a canonicalizer to normalize formatting before hashing
- Optional signature using agent identity keypair (ECDSA, Ed25519)

---

## IV. Prompt Provenance Chain

Prompts used across agents/environments record:

```json
[
  {
    "prompt_id": "...",
    "agent_id": "agent://kai-003",
    "used_at": "2025-06-21T14:55:30Z",
    "context": "build_docs",
    "input_hash": "...",
    "output_hash": "..."
  },
  ...
]
```

- Enables forensic auditing
- Can track evolution over time

---

## V. Tamper Detection Policies

| Action              | On Mismatch    | Logging  | Recovery                 |
| ------------------- | -------------- | -------- | ------------------------ |
| System Prompt       | Block & Notify | Critical | Restore previous hash    |
| User Prompt         | Soft Warn      | Medium   | Prompt rerun or ask user |
| Hidden Agent Prompt | Auto-Halt      | High     | Disable agent instance   |

---

## VI. Fingerprinting API

```ts
POST /prompt/fingerprint
{
  prompt: "...",
  metadata: { author: 'kai-003', scope: 'agent' }
}

// Response
{
  id: "uuid...",
  hash: "sha256...",
  version: "v1",
  signed_by: "agent://kai-003",
  public: true
}
```

---

## VII. Agent Enforcement Hooks

- `beforePromptUse()` – Validates fingerprint before generation
- `afterPromptSubmit()` – Generates new fingerprint if accepted
- `onPromptMismatch()` – Handles resolution strategies

---

## VIII. Optional Features

- **Prompt Diff Viewer**: Visual changes between versions
- **Prompt Expiry Tags**: Auto-retire stale prompts
- **Trust Score Inheritance**: Reused prompt inherits creator's trust profile

---

### Changelog

– 2025-06-21 • Initial prompt fingerprinting and validation architecture

