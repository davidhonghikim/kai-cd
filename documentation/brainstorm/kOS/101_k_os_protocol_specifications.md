# 101: kOS Protocol Specifications

This document defines the formal communication and interaction protocols that power the kOS distributed ecosystem. It includes message schema, packet formats, synchronization procedures, and trust mechanisms for ensuring reliable, secure, and decentralized interoperability between agents, devices, and services.

---

## I. Protocol Categories

### A. Communication Protocols

- **KindLink Protocol (KLP)** — Core overlay transport, identity negotiation, and trust verification
- **KindRelay** — Gossip/relay-based pub-sub channel mesh for federated data sharing
- **KindCast** — Real-time media, screen, and stream casting over WebRTC/DataChannel

### B. Sync & Storage Protocols

- **KindSync** — File/directory sync protocol using Merkle tree deltas
- **KindState** — CRDT-based distributed state synchronization
- **KindBlock** — Optional blockchain-like event log stream with pluggable consensus

### C. Identity & Trust

- **KindID (KID)** — Decentralized identity specification using Ed25519 keypairs + verifiable credentials
- **TrustLink Graph** — Signed bidirectional trust links for peer authentication
- **Proof-of-Relationship (PoR)** — Lightweight challenge-response handshake for agent familiarity

---

## II. KindLink Protocol (KLP) – Core Overlay

### A. Packet Structure

```json
{
  "ver": 1,
  "msg_id": "ulid",
  "from": "kid:abc...",
  "to": "kid:def...",
  "type": "handshake|data|sync|ping|route",
  "timestamp": 1718895000,
  "sig": "base64(signature)",
  "payload": { ... }
}
```

### B. Supported Message Types

- `handshake` – Identity, trust negotiation
- `data` – Encrypted application payload
- `sync` – Used by KindSync/KindState for delta exchange
- `ping` – Liveness probe
- `route` – Relay forwarding with encapsulated payload

### C. Transport

- Encrypted WebSockets
- Reticulum LoRa mesh
- Direct TCP / Unix domain socket
- UDP hole-punched fallback (browser-compatible)

---

## III. KindSync – Filesystem Synchronization

### A. Sync Model

- Merkle DAG tree generation per file/folder
- Chunking with SHA-256 hash indexing
- Efficient delta sync via hash comparison

### B. Control Packet

```json
{
  "type": "sync",
  "op": "init|delta|chunk|complete",
  "path": "/projects/kindAI/code/",
  "hash": "sha256-root",
  "chunks": [ ... ]
}
```

### C. Modes

- **One-Way Push** – Push from source agent to destination
- **Two-Way Merge** – Full conflict detection and resolution
- **Mirror** – Force mirror from master agent

---

## IV. KindState – CRDT State Sync

- Based on LWW-Element-Set and JSON CRDT (e.g. Y.js)
- Syncs UI state, collaborative settings, preferences
- WebRTC or WebSocket multiplexed transport

```json
{
  "type": "crdt",
  "doc_id": "settings:001",
  "ops": [
    { "path": "/theme", "val": "dark", "ts": 1718895001 }
  ]
}
```

---

## V. KindID (KID) — Decentralized Identity

### A. Key Structure

- `kid:` prefix
- Ed25519 public key (base58 or base64)

### B. Agent Manifest

```json
{
  "kid": "kid:z9K7...",
  "agent_type": "orchestrator",
  "modules": ["PromptManager", "WorkflowRouter"],
  "version": "0.9.8",
  "trust": {
    "level": 3,
    "issued_by": ["kid:z1X9..."],
    "sig": "..."
  }
}
```

---

## VI. TrustLink Graph Protocol

- Signed trust edges between KIDs
- Weighted levels: observer, contributor, core, root
- TTL and validity windows

```json
{
  "from": "kid:abc...",
  "to": "kid:def...",
  "level": 2,
  "expires": 1726540000,
  "sig": "base64(signature)"
}
```

---

## VII. KindBlock (Optional Consensus Log)

- DAG or linear log structure
- Event stream versioning with fork resolution
- Optional consensus methods:
  - Raft
  - Proof-of-Stake Voting
  - Delegated Leader Rounds

```json
{
  "block": 82,
  "parent": "hash-prev",
  "events": [
    { "op": "agent_create", "kid": "..." }
  ],
  "sig": "..."
}
```

---

## VIII. Extensions (Future Spec Modules)

- KindVoice – Audio routing protocol
- KindGraph – Knowledge representation exchange
- KindEvent – Temporal scheduling/callback format
- KindUI – UI state sync across sessions

---

### Changelog

– 2025-06-20 • Initial full protocol specification draft

