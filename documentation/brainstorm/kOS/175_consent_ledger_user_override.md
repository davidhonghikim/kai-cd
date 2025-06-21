# 175: Consent Ledger and User Override System Specification

This document defines the architecture, protocols, and enforcement logic for a secure, auditable consent ledger and user override system in the kAI/kOS ecosystem. This infrastructure ensures human sovereignty, legal compliance (e.g., GDPR, HIPAA, CCPA), and trust in automated agent behavior.

---

## I. System Goals

- Immutable record of all user consents granted or revoked
- Local-first enforcement of user control and override rights
- Cross-agent enforceable rules via consent propagation
- Support for granular, revocable, and time-bound consent
- Self-contained modules compatible with offline-first systems

---

## II. Key Concepts & Definitions

### A. Consent Ledger

A cryptographically-signed append-only record of explicit user permissions (grants and revocations) stored locally and optionally federated via KLP (Kind Link Protocol).

### B. Consent Token

A signed, verifiable data structure containing consent scope, source, timestamps, and user/public key signature.

### C. Override System

A subsystem that intercepts agent actions and checks against the active consent state. Users can override decisions in real time with justification logging.

---

## III. Data Structures

### A. Consent Token Format

```json
{
  "id": "uuidv4",
  "issued_at": "2025-06-22T17:01:00Z",
  "expires_at": "2025-07-22T17:01:00Z",
  "agent_id": "kai-001",
  "action": "read_email",
  "target": "user@example.com",
  "granted": true,
  "signature": "base64-ed25519-sig"
}
```

### B. Override Log Format

```json
{
  "timestamp": "2025-06-22T17:22:00Z",
  "agent_id": "kai-001",
  "action": "read_email",
  "target": "user@example.com",
  "override_by": "user_local_id",
  "reason": "Context changed",
  "outcome": "action_blocked"
}
```

---

## IV. Storage & Transport

- **Local Store:** Append-only encrypted JSON log (AES-GCM)
- **Sync Format:** Delta patches or Merkle tree diff via KLP
- **Audit Backup:** Signed, compressed weekly snapshots

---

## V. Enforcement Layer

### A. Real-Time Enforcement

- All agents must query `ConsentManager.check(action, target)` before performing restricted operations.
- Fallback: deny access if consent check fails.

### B. Override Actions

- Immediate user override possible via:
  - Notification UI popup
  - System hotkey trigger
  - Mobile app override action
- Must be logged and confirmed

### C. Consent Expiry Handling

- Auto-revoke on expiry unless renewed
- Notification system warns users 48 hours before expiration

---

## VI. Consent Manager API

```ts
interface ConsentManager {
  hasConsent(agentId: string, action: string, target: string): boolean;
  grantConsent(token: ConsentToken): void;
  revokeConsent(tokenId: string): void;
  listConsents(agentId?: string): ConsentToken[];
  getConsent(tokenId: string): ConsentToken;
  overrideAction(agentId: string, action: string, target: string, reason: string): void;
}
```

---

## VII. UI Interfaces

- **Consent Dashboard:** View, grant, revoke consents
- **Consent Expiry Notifications:** Modal + system tray warning
- **Override Alert Popup:** Shows agent, action, justification prompt
- **Audit View:** Browse history of overrides and expired/denied tokens

---

## VIII. Integration with kOS + kAI

- Core dependency for every kAI service wrapper (chat, file access, memory, etc.)
- kOS background daemon watches ledger changes, syncs via KLP to remote log authorities if enabled
- Vault and credential services require consent to unlock

---

## IX. Security Considerations

- Ed25519 signing required for all consent and override events
- Audit trail hashed and checkpointed
- Tamper-evident logs; rollback invalidation supported
- Optionally anchored to blockchain for compliance (via KLP)

---

## X. Sample Consent Policies

| Action        | Target       | Scope         | Duration     | Default            |
| ------------- | ------------ | ------------- | ------------ | ------------------ |
| read\_email   | user inbox   | single sender | 1 day        | deny               |
| run\_script   | terminal     | any           | session only | deny               |
| write\_memory | global notes | persistent    | 7 days       | allow with logging |

---

### Changelog

– 2025-06-22 • Initial spec with full consent management and override flow

