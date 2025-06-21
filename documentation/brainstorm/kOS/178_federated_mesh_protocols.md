# 178: Federated Mesh Protocols & Inter-Instance Communication (kOS)

This document defines the communication architecture and protocols enabling secure, scalable, and interoperable communication between distributed instances of `kOS` (kindOS) across devices, networks, and organizations.

---

## I. Purpose & Goals

- Enable decentralized coordination of AI agents, users, and resources across `kOS` instances.
- Support peer discovery, secure messaging, trust propagation, shared vector resources, and agent migration.
- Ensure privacy-preserving interoperability with open standards and custom extensions.

---

## II. Mesh Communication Layers

### A. Physical / Transport Layer

| Layer      | Protocol/Tech                     | Notes                    |
| ---------- | --------------------------------- | ------------------------ |
| Networking | IP/UDP/TCP                        | Standard connectivity    |
| Local Mesh | Bluetooth, WiFi Direct, LoRa      | Offline/low-power nodes  |
| Overlay    | Libp2p, NATS, Tor Hidden Services | Node routing abstraction |

### B. Data & Routing Layer

- **KLP (Kind Link Protocol)**: Primary routing spec for agent/user data and system metadata
- **KLP-ID**: 128-bit content-addressable identifier (similar to IPNS + DID hybrid)
- **Address Formats:**
  - `klp://agent.kai.earth/commands`
  - `klp://doc.172.docs.kOS/manifest.json`

### C. Protocol Roles

| Role          | Description                                           |
| ------------- | ----------------------------------------------------- |
| PeerNode      | Full `kOS` instance with local agents                 |
| GatewayNode   | Public relay, ingress point for remote traffic        |
| ArchiveNode   | Long-term artifact/manifest storage                   |
| ValidatorNode | Verifies message integrity, agent certs, trust scores |

---

## III. Federation Capabilities

### A. Peer Discovery

- Via DHT or gossip-based protocol (libp2p, IPFS)
- Agents can locate specialized skills on other instances

### B. Agent Portability

- Agents can be serialized, cryptographically signed, and moved between nodes
- Includes behavioral fingerprint, audit trail, and config snapshot

### C. Federated Indexing

- Shared vector embeddings across nodes using kVectorMesh protocol
- Embedding sharding with locality heuristics
- Retrieval across peers with latency-aware fallback

---

## IV. Message Types

| Type                 | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `TASK_REQUEST`       | Assign or delegate work to another agent |
| `AGENT_MIGRATION`    | Transfer an agent to another instance    |
| `REPUTATION_DELTA`   | Propagate trust/reputation updates       |
| `BROADCAST_ANNOUNCE` | Send system status, events               |
| `VECTOR_SYNC`        | Exchange or sync vector data chunks      |

### Example KLP Message (JSON):

```json
{
  "type": "TASK_REQUEST",
  "source": "klp://node.usa.kai",
  "target": "klp://agent.genie.fr.kai",
  "payload": {
    "task_id": "xyz123",
    "inputs": ["Generate short poem about sunrise"],
    "trust_required": 8.0
  },
  "signature": "0x9f...ea"
}
```

---

## V. Security Architecture

### A. Identity & Verification

- KLP IDs linked to DIDs and/or Web-of-Trust-based identity records
- Messages signed with ECDSA (or Ed25519)
- Revocation lists and key rotation supported

### B. Message Encryption

- AES-256-GCM symmetric encryption per session
- Asymmetric handshake: X25519 / ECDH
- Ephemeral session keys per task/request

---

## VI. Governance & Policy

- Federation policies defined via shared `.klp-policy` manifests
- Includes:
  - Allowed message types
  - Peer allow/block lists
  - Trust thresholds
  - Quota limits

---

## VII. kOS Federation Bootstrap Flow

1. User installs new kOS instance
2. Generates local identity + agent root
3. Connects to public gateway or local mesh
4. Receives peer table from seed node
5. Starts event listener, joins federated trust mesh

---

## VIII. CLI/Daemon Tools

- `kosd` – Core daemon
- `kosctl` – Command-line control tool
  - `kosctl connect peer://node.us.kai`
  - `kosctl trust agent://gamma.0x934...`

---

## IX. Compatibility & Extensibility

- Libp2p plug-in transport model (WebRTC, Tor, QUIC)
- Backward-compatible with ActivityPub, Matrix, NATS
- Export/import via `kind-export.yaml`

---

## X. Use Cases

- Share vector search results with peers
- Migrate agents between offline/online devices
- Publish decentralized blog or research doc via `klp://doc.node.kai/entry1.md`
- Route high-trust tasks to a known node

---

### Changelog

– 2025-06-22 • Initial draft of inter-instance communication architecture for kOS federation

