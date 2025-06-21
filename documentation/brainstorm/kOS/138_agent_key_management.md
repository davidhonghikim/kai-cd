# 138: Multi-Agent Identity, Credentialing & Key Management

This document outlines the architecture and mechanisms for secure, scalable, and interoperable identity and credentialing of agents within the `kAI` and `kOS` ecosystems. It defines key generation, assignment, verification, revocation, and synchronization protocols.

---

## I. Identity Fundamentals

Every agent within `kOS` or `kAI` must be uniquely identifiable via cryptographic identity and linked to:

- A role and permission scope
- A trust and reputation graph
- A credential ledger

### Identity = KeyPair + Signature History + Contextual Tags

---

## II. Key Types

### 1. Agent Operational Keys (AOK)

- **Type:** Ed25519 or ECDSA
- **Use:** Signing messages, state logs, model diffs, and audit trails
- **Lifespan:** Rotatable, short-lived (e.g. 1 week)

### 2. Agent Master Keys (AMK)

- **Type:** RSA 4096 / ECC-512
- **Use:** Signing subordinate keys, revocation lists
- **Lifespan:** Long-term, hardware-backed or anchored in vault

### 3. Communication Keys (CK)

- **Type:** X25519
- **Use:** P2P message encryption (KLP), swarm sync, auth channels

### 4. Interop API Keys (IAK)

- **Type:** OAuth2/OIDC JWTs or custom KLP-tokens
- **Use:** Cross-protocol interface auth, cloud API access

---

## III. Identity Creation

### Agent Genesis Flow

1. Generate master keypair (AMK) on secure enclave / HSM / Vault
2. Derive operational + communication keys
3. Assign metadata:
   - Agent ID (DID / UUID)
   - Type (Service, System, App, Companion, Worker, etc)
   - Role Scope (read-only, editor, executor, orchestrator...)
   - Zone (user, mesh, org, global)
4. Register on:
   - Local Agent Registry
   - Optional Federated TrustNet

### Example YAML Record

```yaml
id: agent://kOS/companion@kindai.local
amk: AMK-k123456abcdef...
aok: AOK-h98asd7ff...
ck: X25519-y1k90sd...
role: companion
zone: local
trust_rating: 0.8
capabilities:
  - llm_chat
  - schedule_management
  - security_monitor
```

---

## IV. Verification & Revocation

### 1. Signature Verification

- Every signed event must include a valid agent header:
  - `agent_id`, `sig`, `pub_key`, `timestamp`, `nonce`
- Cross-check against current registry or revocation list

### 2. Revocation

- Agents can be revoked at:
  - AOK level (temporary suspension)
  - AMK level (full identity revocation)
- Revocation Ledger (RLP): Append-only log of invalidated keys
- Propagated via TrustNet with CRL-style compression

---

## V. Trust Anchors and Certification

### Certification Chains

- High-trust agents (e.g. `kOS root`, org AI) sign certs for sub-agents
- Chain-of-trust can be verified locally or via federated proof

### External Cert Import

- Accept 3rd-party agents by:
  - Providing signed key + role mapping
  - Verifying identity via KLP or bridge protocol

### Trust Graph

- Graph database maintains relations:
  - Signed-by
  - Trusted-with
  - Co-deployed
  - Performance

---

## VI. Identity Sync & Audit

### Sync Methods

- P2P via Kind Link Protocol (KLP)
- gRPC Mesh API
- Blockchain anchor (optional): timestamped hash + metadata

### Audit Features

- Per-agent changelog
- Signed activity digests
- Rotating activity proofs / zero-knowledge log summaries

### Vault Export Format (Encrypted)

```json
{
  "agent_id": "companion-345",
  "keys": {
    "amk": "...",
    "aok": "...",
    "ck": "..."
  },
  "certs": ["org-root", "user-delegation"],
  "trust": 0.75,
  "revoked": false
}
```

---

## VII. Backup & Recovery

### Recommended Practices

- AMKs stored in hardware vault or printed QR w/ Shamir split
- Regularly rotate AOKs
- Use biometric fallback for local-only agents
- Daily backup of communication keys for sync continuity

### Recovery Protocol

1. Verify user/device fingerprint
2. Recreate new AMK, re-sign with old root if available
3. Trigger swarm override vote if no valid root exists

---

## VIII. Future Options

- DID-based universal identifiers
- Blockchain-based timestamping of trust certs
- Decentralized biometric anchor layer
- Post-quantum key support (KYBER, Falcon)

---

### Changelog

– 2025-06-21 • Initial full credentialing architecture

---

Next: **139: Agent Societies & Social Graphs in Kind AI**

