# 151: Kind Prompt Exchange & PromptKind Marketplace (PromptSync)

This document defines the architecture, interface, protocols, and usage flows for the PromptSync system, encompassing both the PromptKind Exchange (community-driven) and Kind Prompt Marketplace (verified commercial modules).

PromptSync is designed to facilitate secure, interoperable, versioned sharing of prompts, agents, personalities, and workflows across the `kAI`/`kOS` ecosystem and with third-party platforms.

---

## I. Overview

**PromptSync Goals:**

- Enable rapid onboarding and prompt reusability
- Provide trusted exchange formats with metadata and signatures
- Support versioning, rollback, and update notifications
- Allow monetization and licensing of premium prompts

---

## II. Key Features

### A. PromptKind Exchange (Open)

- Publicly shared prompts, templates, workflows
- Search, tag, fork, remix, and version control
- Community reviews, star ratings, abuse flagging
- Git-style prompt diffing and change logs

### B. Kind Prompt Marketplace (Verified + Paid)

- Vendor-verified premium prompt packs
- Enterprise-level license management
- Royalty tracking and seller dashboards
- DRM and integrity checks (opt-in)

---

## III. Prompt Package Format (.promptkind)

A `.promptkind` archive is a self-contained portable unit with all required metadata, structure, and optional assets.

### A. Required Structure

```
promptkind_package/
├── manifest.yaml
├── prompt.md
├── metadata.json
├── preview.png
├── license.txt
├── changelog.md
└── assets/
    └── ...
```

### B. Manifest Fields

```yaml
id: promptkind.superhelper.v1
name: Super Helper Agent Prompt
version: 1.2.0
created: 2025-06-22
updated: 2025-07-01
authors:
  - name: "Alice Agent"
    url: "https://kindmarket.ai/u/alice"
license: MIT
entry: prompt.md
tags: [assistant, productivity, taskflow, verified]
dependencies:
  - kind-runtime >= 1.4.0
  - kAI-agent-core >= 2.0.0
```

### C. Security

- SHA256 checksums and prompt fingerprinting
- Optional GPG signature for manifest
- Vendor identity verification for commercial packages

---

## IV. Marketplace Interface

### A. User Interface Elements

- Browsable storefront with filterable categories
- Individual prompt detail pages with previews and sample runs
- Install, clone, or test-run options
- Subscription or one-time purchase flows (for commercial items)

### B. Developer Tools

- Upload wizard with manifest autogeneration
- Prompt version manager (diffs, notes, rollback)
- Integration testing with live kAI agents

---

## V. API (PromptSync Endpoint)

```http
GET /api/prompts/:id
POST /api/prompts/:id/install
POST /api/prompts/upload
GET /api/prompts/search?q=
```

Supports both anonymous access and signed, rate-limited auth for uploads/updates.

---

## VI. kAI Integration

- `PromptManagerAgent` supports `.promptkind` package loading
- Local prompt library displayed in Prompt Vault UI
- Auto-suggestion of updates based on version hash
- Unified prompt search across local + cloud
- Automatic rollback or side-by-side testing of new prompt versions

---

## VII. Licensing & Monetization

- Free or paid prompts (defined in manifest)
- Subscription tiers or pay-per-use
- PromptKind Revenue Share Program (70/30 default split)
- Optional DRM: restrict sharing, enforce installation domain

---

## VIII. Federation Support

- PromptKind mirrors for decentralized hosting
- P2P Prompt discovery via KLP-based metadata relay
- kOS nodes can act as prompt registries

---

## IX. Trust & Moderation

- Verified authors via Kind ID (KID)
- Prompt health score: usage stats + flagged issue ratio
- Trusted Prompt Seal for audited packages
- Community moderators with version revert rights

---

### Changelog

– 2025-06-22 • Initial PromptSync & PromptKind design draft

