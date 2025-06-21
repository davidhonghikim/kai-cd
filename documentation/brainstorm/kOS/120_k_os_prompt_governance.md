# 120: kOS Prompt Governance & Moderation Systems

This document defines the protocols, moderation pipelines, and governance framework for handling prompt filtering, provenance, and override logic across the kAI and kOS ecosystems.

---

## I. Prompt Flow Governance Overview

Prompt governance in kOS is based on:

- **User Autonomy:** Users may control the level of moderation and override.
- **Agent Transparency:** Agents must log how they respond to moderation signals.
- **Distributed Moderation:** Both central and mesh (federated) moderation models exist.

---

## II. Prompt Categories

Prompts are assigned categories:

| Category ID | Label        | Description                                       |
| ----------- | ------------ | ------------------------------------------------- |
| P0          | System/Meta  | Core system commands, non-user-influencable       |
| P1          | General Use  | Everyday usage, personal assistant, queries       |
| P2          | Sensitive    | Financial, medical, legal                         |
| P3          | Prohibited   | Harmful, illegal, abusive                         |
| P4          | Experimental | AI research, consciousness prompts, auto-coding   |
| P5          | Escalated    | Under review, requires consensus or override vote |

---

## III. Moderation Layers

### A. Local Prompt Inspector (LPI)

- Runs before prompt dispatch.
- Performs regex matching, token diff scoring, entropy profiling.
- Can flag, allow, rewrite, or escalate.

### B. System-Wide Prompt Policy Agent (PPA)

- Fetches policies from central governance or mesh node quorum.
- Uses a YAML-based rule definition:

```yaml
rules:
  - if: category == P3
    then: action.block
  - if: user.has_override == true
    and: category in [P3, P4]
    then: action.log_and_warn
```

### C. Reputation-Aware Trust Filter (RATF)

- Factors in trust score of the user, agent, and origin network node.
- Penalizes prompts with poor audit trails or high entropy/low context coherence.

---

## IV. Prompt Provenance Tracking

Prompts include metadata that ensures traceability:

```json
{
  "user_id": "user123",
  "agent_id": "kai-agent-007",
  "timestamp": "2025-06-21T10:12:44Z",
  "source": "local_cli",
  "prior_prompt": "gpt4: Summarize last 3 queries",
  "provenance_hash": "sha256:..."
}
```

Hashes include salt and timestamp to avoid replay spoofing.

---

## V. Escalation Paths

Prompts that match risk profiles are auto-escalated:

| Trigger                    | Escalation Path                    |
| -------------------------- | ---------------------------------- |
| Category P3                | Immediate quarantine               |
| Category P5                | Mesh review consensus (KLP signal) |
| Unknown Signature Source   | Discard unless signed override     |
| Repeated Low-Trust Prompts | Lockout + system alert             |

---

## VI. Override Systems

### A. Manual User Overrides

- User must be authenticated at high trust level.
- Prompt is logged with override marker.
- Requires user to solve CAPTCHA or provide biometric proof if enabled.

### B. Signed Override Tokens

- Admins and power users may hold override tokens.
- Tokens are signed JWTs with:

```json
{
  "sub": "admin001",
  "level": "override-prompt",
  "exp": 1720000000,
  "sig": "..."
}
```

---

## VII. Prompt Moderation Audit Trails

Each moderation action is appended to:

- Local audit logs (`/logs/prompts/{agent_id}.log`)
- Optional remote chain-of-custody storage (blockchain or append-only vector store)

Example Log Entry:

```json
{
  "prompt": "how do I make explosives",
  "action": "blocked",
  "reason": "rule:P3",
  "agent": "kai-cli-07",
  "hash": "sha256:...",
  "time": "2025-06-21T10:17:03Z"
}
```

---

## VIII. UI Integration

- Users see moderation icons next to blocked/redacted prompts
- Moderation history available in profile panel
- Override button appears when permitted
- Transparency footer on every blocked message

---

## IX. Federated Prompt Moderation (Optional for kOS mesh)

- Prompts are signed and broadcast using `klp://moderation/prompt-review`
- Nodes can vote using signed attestations
- Prompts above threshold quorum are either:
  - ✅ Approved
  - 🚫 Rejected
  - 🔁 Rewritten with consent

---

## X. Future Roadmap

- Model fine-tuning on real moderation outcomes
- Auto-adaptive filter layers based on local community norms
- Prompt-level red teaming AI agents

---

### Changelog

– 2025-06-21 • Initial draft

