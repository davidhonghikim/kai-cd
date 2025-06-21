# 115: KindLink Protocol Specification (klp)

This document defines the full specification for the KindLink Protocol (klp), the decentralized, identity-verified, extensible protocol layer used throughout the `kAI` and `kOS` ecosystems to facilitate secure agent-to-agent, agent-to-service, and human-to-agent interaction.

---

## I. Overview

**KindLink Protocol (klp)** provides the foundational communication framework for all inter-agent and system-level communication across `kAI`, `kOS`, mesh networks, cloud APIs, local services, and hardware endpoints.

### Core Features

- ✅ Decentralized Identity Framework (DID-like)
- ✅ Authenticated, signed interactions
- ✅ Multi-protocol transport compatibility
- ✅ Encryption-agnostic payload wrapping
- ✅ Chain-of-trust propagation
- ✅ Agent action provenance and revocation

---

## II. Protocol Layers

### 1. Transport Layer

- Supported transports:
  - `tcp4`, `tcp6`
  - `ws`, `wss`
  - `udp` (optional fallback)
  - `reticulum` (mesh mode)
  - `http(s)` (fallback proxy)

### 2. Identity Layer

- Cryptographic identity schema:

```yaml
id_type: ed25519
public_key: base58-encoded
signature_algorithm: ed25519-dalek
fingerprint: sha3-256
issuer: optional DID or known trust domain
```

### 3. Message Envelope

```json
{
  "header": {
    "source": "agent://publickey@kOS",
    "destination": "agent://publickey@kAI",
    "timestamp": 1718925583,
    "ttl": 60,
    "nonce": "random-bytes",
    "signature": "sig-of-payload",
    "trust": {
      "level": "verified",
      "proof": "link-to-credential.json"
    }
  },
  "payload": {
    "type": "intent.chat.send",
    "data": { "message": "Hello from the mesh" }
  }
}
```

### 4. Payload Routing Schema

- `payload.type`: dot-delimited `domain.subdomain.intent` format
- `payload.data`: schema-defined per message class
- `payload.meta`: optional for trace/audit data

---

## III. Trust Establishment

### 1. Bootstrap Identity

- Local agent must create initial identity file: `identity.kai.json`
- Must contain:
  - Keypair (private never leaves node)
  - Trust domain (if known)
  - Self-signature (bootstraps initial web of trust)

### 2. Chain-of-Trust

- Every received message includes a link to a credential proof (JWT, JSON-LD, signed blob)
- Credential chain is recursively validated:
  - Revocation list
  - Expiry
  - Signature match
  - Trust level (user-defined minimums)

---

## IV. Command Types

| Type                | Example                       | Purpose                          |
| ------------------- | ----------------------------- | -------------------------------- |
| `intent.chat.send`  | Chat message delivery         | Textual or command-style chat    |
| `intent.task.run`   | Run a job/action/plan         | Plan invocation, workflows       |
| `intent.file.send`  | File transfer over klp stream | Data sync, media sharing         |
| `intent.status.req` | Request agent/system state    | Heartbeat, liveness, diagnostics |
| `intent.auth.req`   | Request trust credential      | Bootstrap or confirm identity    |

Custom message types follow the `intent.domain.action` format.

---

## V. Integration Points

### In kAI

- Chat interface routing through `klp-bridge.ts`
- Service definitions tagged as `klp-compatible: true`
- Vaults use klp to synchronize secrets over mesh or secure link

### In kOS

- All services registered in the MCP (now KLP registry)
- Trust level enforcement is centralized in `core-trust` module
- Policies for klp routing managed via `klp-policy.yaml`

### In Reticulum Mesh

- Each node includes a `klp-reticulum-gateway`
- Trust proofs stored in `trustlink.db`
- Cross-peer intent propagation uses `gossip+ttl`

---

## VI. Reference Modules

- `klp-agent-core`
  - Identity & key management
  - Message envelope construction/validation
- `klp-router`
  - Pattern match + route messages
  - TTL + deduplication cache
- `klp-vault-sync`
  - Encrypted vault sync layer
  - Pull-push-delta
- `klp-mesh-adapter`
  - Reticulum bindings
  - Peer handshake & routing table
- `klp-service-adapter`
  - HTTP + WebSocket interface bridge
  - Wraps external services for klp requests

---

## VII. Security Design

- All messages signed; optionally encrypted
- Nonces prevent replay attacks
- TTL enforced to kill stale routes
- Trust levels determine action acceptance:
  - `trusted`
  - `verified`
  - `observed`
  - `anonymous`

---

## VIII. Future Enhancements

- zkProof-based trust attestations
- klp-over-DIDComm v2 compatibility
- Privacy-preserving audit trails
- Identity rotation mechanisms

---

### Changelog

– 2025-06-21 • Initial protocol specification (v0.1)

Next up: **116: klp Registry Schema & Service Directory** — which defines the global and local registry structure for all agents, services, and intents in the klp ecosystem.

