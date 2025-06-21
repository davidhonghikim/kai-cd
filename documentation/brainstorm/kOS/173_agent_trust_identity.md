# 173: Agent Trust & Identity Protocols (ATIP)

This document defines the low-level protocols, specifications, and systems for secure agent identity, trust scoring, credential signing, and verification across the `kAI` and `kOS` ecosystems.

---

## I. Objectives

- Establish unique, cryptographically verifiable identities for all agents
- Create a scalable, decentralized trust framework
- Support multi-tier authentication and role-based permissions
- Enable agent-to-agent signed messaging and delegation
- Record verifiable action logs with digital signatures

---

## II. Identity Generation (AgentID)

### A. Keypair Generation

- Each agent generates a cryptographic keypair at initialization
  - **Algorithm:** Ed25519
  - **Private Key Storage:** Local, encrypted using Vault or HSM
  - **Public Key:** Forms the basis of the `AgentID`

### B. AgentID Format

```json
{
  "agent_id": "kai-agent-02319",
  "pubkey": "ED25519:abc123...xyz456",
  "version": 1
}
```

- Optionally include:
  - Nickname / display name
  - Assigned roles / scopes
  - Metadata (host platform, creation time, etc.)

---

## III. Trust Scores (AgentTrust)

### A. Trust Components

- **Direct Trust:** Assigned by a user or higher-level agent
- **Reputation Trust:** Derived from observed actions
- **Delegated Trust:** Passed from trusted agents via signed claims
- **System Trust Factors:**
  - Audit compliance
  - Prompt transparency
  - Failure rates
  - Latency metrics

### B. Trust Score Object Format

```json
{
  "agent_id": "kai-agent-02319",
  "score": 0.87,
  "components": {
    "direct": 0.95,
    "reputation": 0.81,
    "delegated": 0.76
  },
  "last_updated": "2025-06-21T17:30:00Z"
}
```

### C. Signed Trust Claims

- Agents may issue verifiable trust certificates to other agents
- **Format:** JWT or JWS (JSON Web Signature)
- Include:
  - Issuer AgentID
  - Recipient AgentID
  - Score / role / delegation scope
  - Expiration

---

## IV. Authentication Protocols

### A. Peer-to-Peer Agent Authentication

- Based on challenge-response mechanism
- Signed timestamps / nonces
- Optional session ephemeral key exchange

### B. Vault & Credential Usage

- Every credential use is signed by the invoking agent's private key
- Credential signature log includes context:
  - Purpose
  - Tool
  - Target service

### C. Signed Inter-Agent Messages

- Every message sent between agents includes a signature:

```json
{
  "from": "kai-agent-001",
  "to": "kai-agent-005",
  "timestamp": "2025-06-21T17:35:00Z",
  "payload": {...},
  "signature": "ED25519_SIG:xyz..."
}
```

---

## V. Agent Certificate Authority (ACA)

### A. Federated ACA Network

- Root authorities may be:
  - User-trusted devices
  - Organizations
  - kOS nodes
- Each ACA can issue certs to new agents
- ACA signatures bind:
  - Public key
  - Roles / scopes
  - Trust thresholds

### B. Revocation

- Certificate revocation via:
  - Expiry timestamps
  - Revocation list broadcast (KLP-based)

---

## VI. kAI Agent Identity Config Template

```yaml
identity:
  nickname: "kai-helper"
  agent_id: "kai-agent-02319"
  pubkey: "ED25519:abc123..."
  private_key_path: "./secrets/agent.key"
  roles: ["chat", "scheduler", "notetaker"]
  trust:
    direct: 0.9
    minimum_required: 0.6
trust_cache:
  path: ./data/trust.cache.json
  sync_klp: true
```

---

## VII. Agent Role & Permission Enforcement

- Each agent defines a scoped permission map:

```json
{
  "can_read_vault": true,
  "can_write_config": false,
  "can_send_emails": true,
  "can_delegate": true
}
```

- Permissions enforced at runtime by:
  - Orchestrator (MCP / controller)
  - API gateway (for external actions)

---

## VIII. Trust Dashboard (User UI)

- View all active agents with:
  - Trust score breakdown
  - Role assignments
  - History of signed actions
  - Certificates issued/received
  - Last validation timestamp

---

## IX. Future Considerations

- zk-proofs for privacy-preserving delegation
- Merkle root signing of action logs
- Federated trust mesh consensus
- Agent trust graph visualizations

---

### Changelog

– 2025-06-21 • Initial draft of Agent Identity and Trust Protocols

