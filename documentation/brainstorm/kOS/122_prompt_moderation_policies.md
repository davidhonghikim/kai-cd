# 122: Prompt Moderation Policies & Governance Enforcement Engine

This document defines the moderation framework, policy agents, enforcement protocols, and audit systems used in `kAI` and `kOS` to maintain ethical alignment, safety, and transparent governance of prompts and actions.

---

## I. Governance Philosophy

### A. Goals

- Preserve user agency and autonomy
- Prevent harm, abuse, misinformation, and system exploitation
- Enable transparent, customizable moderation and overrides

### B. Guiding Principles

- **Default-Allow w/ Intelligent Warning** — Encourage free interaction with soft friction
- **Local First** — All moderation defaults to user-controlled local policy agent
- **Chain-of-Trust Review** — Hierarchical override based on configured trust roles
- **Right to Override** — All users may override moderation prompts with visible consequences/logging

---

## II. Prompt Risk Classification Engine

### A. Prompt Risk Tiers

- `Tier 0` – Safe / Common Use (no restrictions)
- `Tier 1` – Sensitive / Dual Use (warn + proceed)
- `Tier 2` – Dangerous / Prohibited (block by default, overrideable)
- `Tier 3` – Known Exploit / Harm (blocked, requires admin override)

### B. Risk Classifier Stack

- **LLM-Based Semantic Filter** (zero-shot and finetuned)
- **Rule-Based Keyword Filter** (for specific bypass attempts)
- **User-Trained Policy Layer** (fine-tuned or memory-based)
- **Reinforcement Tracker** (past accepted/rejected behavior)

### C. Model Integration

- All prompt risk checks are done pre-execution
- Classifiers return:
  - `risk_score` (0-100)
  - `risk_tier`
  - `reason` (justification string)

---

## III. Moderation Agents

### A. LocalPromptGuardian

- Enforces user-defined filters
- Handles custom rules (e.g. never talk about X)
- Can be paused or trained further

### B. GlobalComplianceAgent

- Applies kOS-wide governance flags
- Executes global moderation models
- Operates on encrypted metadata only

### C. ReviewChainObserver

- Audits all overrides
- Signs override justification events to the TrustLog
- Optionally uploads signed moderation events to the user’s governance pool

---

## IV. User Overrides & Escalations

### A. Override Protocol

- Any blocked prompt triggers a UI modal with:
  - Risk level
  - Model explanation
  - Options: [Cancel], [Override with Reason]

### B. Logging & Signing

- All overrides are locally signed with user’s `TrustID`
- Logged into the user’s **Prompt History Vault**
- Optionally submitted to local or network **TrustRing**

### C. Admin Override

- Some Tier 3 prompts may require an escalation to a configured **Moderator Contact** agent or identity
- Chain-of-trust logic applies — kOS will walk user’s governance keys for escalation path

---

## V. Policy Engine Config

### A. Config File Location

- `~/.kai/prompt_policies.yaml` (local)
- `/etc/kos/policy/prompt_rules.json` (system-wide)

### B. Config Format

```yaml
rules:
  - id: no-nuclear-design
    type: block
    match: "how to build nuclear"
    reason: "prohibited information"

  - id: warn-political-edge
    type: warn
    keywords: ["election fraud", "deep state"]
    reason: "politically sensitive"

default_action: allow
allow_user_override: true
log_overrides: true
```

### C. Rule Types

- `allow`
- `warn`
- `block`
- `flag` (no block, marks prompt for later audit)

---

## VI. Audit & Transparency Systems

### A. TrustLog

- Immutable record of moderation events
- Signed by agent, user, and optionally external verifiers
- Stored locally and/or synced to TrustNet cluster

### B. Governance Pool

- Public moderation event collection (opt-in)
- Used to train future moderation agents
- Allows comparative analysis of moderation trends

### C. Explainability Layer

- All moderation events include structured JSON explainers
- `explanation.json` file per blocked/warned prompt (in user vault)
- Used by review agents for feedback improvement

---

## VII. Edge Cases & Bypass Protection

- **Obfuscated Prompts:** Detected using model embeddings + cosine similarity
- **Reverse Prompt Injection:** Caught using guard rails on input/output mapping
- **Non-Text Modal Prompts:** Images, audio converted via perception agents and scanned
- **Prompt Mutation Attacks:** Similarity to banned prompts tracked across variations

---

## VIII. Roadmap & Evolving Protocols

-

---

### Changelog

– 2025-06-20 • Initial moderation engine spec created

