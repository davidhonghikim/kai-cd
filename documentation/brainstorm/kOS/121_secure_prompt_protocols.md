# 121: Secure Prompt Protocols & Prompt Agent Specifications

This document establishes the standard definitions, behaviors, and enforcement mechanisms for handling secure, signed, and privacy-preserving prompts in the `kAI` and `kOS` systems. It includes the prompt metadata structure, verification rules, audit logging requirements, and specifications for dedicated Prompt Agents.

---

## I. Prompt Metadata Schema

Every prompt must be encapsulated in a signed metadata envelope:

```json
{
  "id": "prompt-xyz-56789",
  "author": "kAI://user-19284",
  "timestamp": "2025-06-20T15:00:00Z",
  "type": "instruction|chat|system|embedding|promptlet",
  "language": "en",
  "tags": ["secure", "confidential", "dev-agent"],
  "signature": "ed25519::j38Z...==",
  "content": "Please generate 10 brand names for a new AI-powered toothbrush."
}
```

### Signature Rules:

- **Ed25519 or ECDSA**
- Signing key must be traceable to a `Kind Identity`
- Invalid or unverifiable prompts will be rejected by secure prompt agents

---

## II. Prompt Classification System

| Type          | Description                                | Security Level |
| ------------- | ------------------------------------------ | -------------- |
| `instruction` | Command for a task or function             | 🟨 Medium      |
| `chat`        | Conversational exchange                    | ⬜ Low          |
| `system`      | System-level prompt or operational command | 🟥 High        |
| `embedding`   | Text meant for vectorization               | 🟨 Medium      |
| `promptlet`   | Encapsulated micro-routine                 | 🟦 Variable    |

Prompt metadata determines routing and permission levels for agent access.

---

## III. Prompt Agent Responsibilities

A `PromptAgent` is a special-purpose AI module responsible for:

1. **Prompt Validation**

   - Verify digital signature
   - Check metadata completeness
   - Enforce schema conformance

2. **Classification & Routing**

   - Assign to the correct pipeline (LLM, embedding, execution)
   - Enforce security policies based on tags and type

3. **Encryption Support**

   - Optional encryption using recipient public key
   - Symmetric AES encryption for stored prompt archives

4. **Audit Logging**

   - Log prompt usage with hash-only records
   - Redact sensitive content in logs by default
   - Store origin traceability in `kOS AuditChain`

5. **Anomaly Detection**

   - Detect prompt injection attempts
   - Flag adversarial content using token-level filters

---

## IV. Secure Prompt Transmission Protocol (SPTP)

The SPTP defines how prompts travel securely between agents and services:

- **Transport:** HTTPS, LoRa+Reticulum with encrypted overlay
- **Integrity:** SHA-256 with signature
- **Replay Protection:** Timestamp + Nonce fields
- **Confidentiality:** Optional PGP or Kind-Shared Symmetric Key
- **Delivery Modes:**
  - Synchronous (direct task invocation)
  - Queued (stored in PromptQueue with TTL)
  - Multicast (multiple agents evaluating in parallel)

---

## V. PromptChain Support

Prompts can form chains or cascades:

- Each prompt in the chain has its own ID and parent ID
- PromptChainAgents evaluate semantic dependencies and origin paths
- Enable stepwise debugging, version tracking, and rollback

---

## VI. Secure Prompt Storage (Vault Mode)

When a user enables Secure Vault Prompt Mode:

- Prompts are stored AES-256 encrypted in the PromptVault
- User can tag prompts as `never-export`, `ephemeral`, or `review-required`
- Prompt review policies are enforced before reuse in public agents

---

## VII. Governance & Moderation Hooks

- Integration with `PromptModerationAgent`
- Enforce `PromptPolicySet` objects (e.g., no hate speech, PII restrictions)
- Prompts violating policy are flagged, not deleted
- Violation counts are included in user trust profile

---

## VIII. Example Prompt Flow

1. User creates secure prompt in UI
2. PromptAgent signs + classifies
3. Prompt stored (if enabled) + routed to model
4. ExecutionAgent logs the call using metadata hash
5. Result returned + attached to PromptTrace

---

## IX. Prompt Agent Configuration (prompt.config.yaml)

```yaml
id: prompt-agent-kai
runtime: nodejs18
entrypoint: ./src/agents/prompt-handler.ts
verify_signatures: true
auto_encrypt: true
audit_enabled: true
default_policy: strict
sensitive_tag_blocklist:
  - child
  - medical
```

---

## X. Future Roadmap

- Prompt watermarking for LLM source-tracing
- TrustedPromptVault standard for federated prompt storage
- Prompt reputation scoring (per creator, per domain)

---

### Changelog

– 2025-06-20 • Initial draft with full protocol and agent specs

