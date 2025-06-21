# 197: KLP – Kind Link Protocol Specification

## Overview
Kind Link Protocol (KLP) is the foundational messaging, trust, and interoperability protocol for the Kind Ecosystem (kOS, kAI, Agents, Devices, and third-party systems). It defines how data, intents, identity, and trust signals are structured, signed, validated, routed, and governed.

---

## 1. Purpose
KLP enables:
- Secure and trusted communication between decentralized agents, services, and user systems.
- Cross-device and cross-platform orchestration.
- Proof-carrying payloads for identity, permissions, and action intents.
- Governance enforcement and agent ethics signaling.

---

## 2. Protocol Stack

### Layer 0 – Transport
- ✅ Supported: LoRa, WebSockets, QUIC, HTTP/2, Bluetooth LE, NATS, MQTT, local IPC (UNIX sockets)
- ❗ Adaptable to mesh networks, sneakernet, offline relay

### Layer 1 – Envelope
Every packet includes:
```json
{
  "version": "1.0.0",
  "id": "uuid",
  "timestamp": 1683013200,
  "source": "agent@device.kos",
  "destination": "agent@hub.kos",
  "ttl": 3600,
  "signature": "ed25519:...",
  "payload": { ... },
  "proofs": ["proof_uri", "zkp_snippet"]
}
```

### Layer 2 – Payload Types
- `intents`: actions requested by agents/users (e.g. `kai.schedule.call`)
- `data`: shared state, documents, sensor values
- `config`: updates to agent/system configuration
- `ping`: keep-alives and trust check-ins
- `error`: protocol-level errors or denials

### Layer 3 – Metadata
- Tags: `priority`, `category`, `trace_id`, `agent_signature`
- Compression: Brotli / Gzip / None
- Encryption: ChaCha20-Poly1305, AES-GCM
- Encoding: CBOR, JSON, MsgPack

---

## 3. Identity & Trust
### Identity Format
Each agent/entity has a decentralized ID:
```
kid:<namespace>:<hash>
Example: kid:agent:0xDEADBEEF
```

### Signing & Validation
- Public-key cryptography (ed25519 preferred)
- Each packet signed with ephemeral or rotating identity key
- Trust anchors include:
  - Known device keys
  - Verified social proofs (e.g. DID + Twitter/GitHub/etc)
  - Local physical trust (e.g. NFC tap exchange)

### Trust Models
- Web-of-trust w/ expiring endorsements
- Reputation scores (local + global)
- Hardware proof (TPM/TEE binding optional)
- Optional ZK proofs of trust-level

---

## 4. Routing & Discovery
- Direct: agent to agent over shared link
- Relayed: via kOS hub, KindRouter, or other agent relays
- SwarmCast: broadcast to cluster of agents (e.g. all care agents in household)
- Address Book sync via:
  - KLP-Dir service (like DNS)
  - Side-channel provisioning (QR/NFC/Bluetooth)

---

## 5. Governance & Ethics
- Each packet may optionally include `ethics_assertion` field:
```json
{
  "ethics_assertion": {
    "principles": ["do_no_harm", "respect_privacy"],
    "governance_id": "kindgov@kos",
    "policy_hash": "sha256:..."
  }
}
```

- kAI/kOS systems validate inbound actions against user-defined rules:
  - Allow/Deny based on agent trust level, scope, behavior history
  - Consent tokens, verifiable session grants

---

## 6. Agent-to-Agent Usage (Examples)

### Example: Health Monitor → CareAgent
```json
{
  "version": "1.0.0",
  "source": "sensor@home.kos",
  "destination": "care@assistant.kos",
  "payload": {
    "type": "intents",
    "intent": "kai.notify.caregiver",
    "parameters": {
      "subject": "Heart rate spike",
      "priority": "high"
    }
  },
  "signature": "ed25519:..."
}
```

### Example: Remote Agent Config Sync
```json
{
  "type": "config",
  "agent": "journal@kai",
  "settings": {
    "autosave": true,
    "summary.frequency": "daily"
  }
}
```

---

## 7. Tooling & Libraries
- `klp-tools`: CLI for encoding, signing, sending packets
- `klp.js` / `klp.py`: client libraries
- `klp-debug`: packet inspector and validator
- `klp-broker`: relaying and trust enforcement engine

---

## 8. Future Additions
- ❗ Optional zkSNARK-based action attestation
- 🤝 Federation handshake (KLP-Hello protocol)
- 🌐 Agent presence & availability sync via gossip
- 📡 Mesh network fallback coordination

---

## 9. Spec Maintenance
- Maintained by: `kOS/kAI core council`
- Spec home: `https://docs.kos.system/klp`
- Versioning: SemVer, major changes require vote via KindGov

---

## ✅ Status: Implemented in all kAI core agents
KLP is mandatory for all inter-agent messaging in KindOS. Agents that do not support KLP are isolated or bridged via `klp-shim` adapters.

