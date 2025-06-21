# 167: Federated Agent Credentialing & Decentralized Identity (DID/kID)

This document defines the decentralized identity and credentialing system powering the trust framework for kAI agents, kOS services, and human users across the Kind ecosystem.

---

## I. Purpose & Objectives

- Enable decentralized, cryptographically verifiable identities for all agents, humans, and services.
- Support progressive disclosure and zero-knowledge proofs of credentials.
- Federate trust across devices, organizations, and social contracts.
- Allow composable identity stacks for multi-role entities.

---

## II. kID: Kind Identity Specification

### A. Structure
```json
{
  "kid": "did:klp:node123:agent456",
  "publicKey": "ed25519:abc123",
  "controllers": ["did:klp:node123:admin"],
  "service": [
    { "type": "PromptSync", "endpoint": "https://node1.kos/prompt" },
    { "type": "VectorQuery", "endpoint": "https://node1.kos/vector" }
  ],
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-06-22T08:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:klp:node123#key-1",
    "signatureValue": "xyz..."
  }
}
```

### B. Components
- `kid`: Unique DID identifier within KLP.
- `publicKey`: Core cryptographic anchor.
- `controllers`: Entities authorized to revoke, rotate, or delegate.
- `service`: Optional discovery endpoints.
- `proof`: Cryptographic proof of identity document integrity.

### C. Naming Convention
- `did:klp:<cluster_id>:<entity_id>`
- Examples:
  - `did:klp:school123:teacher456`
  - `did:klp:home789:device42`

---

## III. Credentialing System

### A. Verifiable Credentials (VCs)
- Self-signed or issued by trusted authorities
- JWT or JSON-LD encoded
- Include claim, issuer, expiration, revocation logic

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AgentRoleCredential"],
  "issuer": "did:klp:org:kindfoundation",
  "credentialSubject": {
    "id": "did:klp:home123:kai005",
    "role": "HomeAssistant",
    "trustLevel": "high",
    "permissions": ["schedule_tasks", "query_weather"]
  },
  "issuanceDate": "2025-06-20T00:00:00Z",
  "expirationDate": "2026-06-20T00:00:00Z",
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-06-20T00:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:klp:org:kindfoundation#key-1",
    "signatureValue": "..."
  }
}
```

### B. Credential Types
- `AgentRoleCredential`
- `HumanIdentityCredential`
- `ServiceContractCredential`
- `CapabilityGrant`
- `AuditRight`

---

## IV. Trust Verification Protocols

### A. kID Registry Nodes (Self-Hosted or Federated)
- Serve DID documents
- Provide revocation registries
- Enable DID resolution and discovery

### B. Trust Score Calculation
- Combine verified credentials, audit logs, uptime, behavior
- Scored and signed by:
  - Local kOS hosts
  - Parent agents
  - End-users
  - Federated registries

### C. ZKP-enabled Disclosures
- Present only proof of role or capability, not full credential
- Useful for private contexts, minimal disclosure policies

---

## V. DID Resolution Examples

### Agent-to-Agent:
1. `kai-a` queries `kai-b` for identity.
2. `kai-b` returns DID document + latest role credential.
3. `kai-a` verifies proof, permissions, and optionally trust level.

### Service Onboarding:
- New service presents signed kID + contract credential
- Host verifies trust chain
- kOS logs onboarding and assigns access scope

---

## VI. Integration with kOS

### A. Local Identity Hub
- Manages private keys
- Signs kID proofs, issues credentials
- Synchronizes with federation if enabled

### B. Policy Enforcement Layer
- Validates identity & capabilities before API access
- Tracks per-session trust levels

### C. Agent Bootstrap Protocol
- Temporary anonymous ID with limited capability
- Upgrades after credential verification or delegation

---

## VII. Security Considerations
- Rotate keys periodically
- Revocation propagation across KLP
- Monitor for identity collision attempts
- Secure enclave recommended for key storage

---

### Changelog
– 2025-06-22 • Initial draft of federated kID identity & credentialing spec

