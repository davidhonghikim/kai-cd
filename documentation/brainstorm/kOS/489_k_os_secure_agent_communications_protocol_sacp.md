# 489 – kOS Secure Agent Communications Protocol (SACP)

## Overview
This document defines how agents in the kOS ecosystem establish resilient, cryptographically verifiable, and identity-aware communication. SACP functions as the linguistic bloodstream of the agent mesh—carrying encrypted intention, verified identity, and context through hostile, power-limited environments.

---

## Layered Transmission Anatomy
SACP is structured as a modular, six-tiered neural sheath for message flow. Each layer adds resilience, integrity, or trust.

| Layer                  | Role                                                         | Icon |
|------------------------|--------------------------------------------------------------|------|
| 🔌 Physical/Link Layer | Raw interface: LoRa, Wi-Fi Direct, Bluetooth Mesh            | ⚡   |
| 🌐 Network Layer       | Onion-routed RNS mesh, propagation, health signal tracking   | 🕸   |
| 📨 Transport Layer     | Reliable message delivery (LXMF/MRT), ordering, retries      | 📦   |
| 🧩 Session Layer       | Ephemeral sessions, key negotiation, handshake logic         | 🤝   |
| 🔒 Security Layer      | End-to-end encryption, signature verification, replay guards | 🛡️   |
| 🧠 Application Layer   | JSON-based AMOs, task envelopes, capability schemas          | 📜   |

---

## Identity & Trust Flow
Before data is exchanged, agents must pass through a ritual of digital recognition.

| Phase                      | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| 🛰 Identity Beacon         | Emits public key hash + capability digest                                   |
| 🔐 Challenge-Response     | Receives peer/anchor challenge, signs nonce                                 |
| 🤝 Session Bootstrap      | Generates ECDH shared secret, establishes encrypted tunnel                  |
| 📜 AMO Verification        | Sends identity-class AMO (signature, trust vector, declared capabilities)   |

> 🧭 Agents unfamiliar with each other rely on known trust anchors, network witnesses, or cached validation breadcrumbs.

---

## Core Protocol Features

### 🔄 Resilience
- **Store-and-Forward:** Delay-tolerant, opportunistic mobile relaying
- **Redundant Pathing:** Multipath failover with route scoring
- **Integrity Caching:** Partial AMO fragments stored for reconstruction

### 🔐 Security
- **Encryption:** XChaCha20-Poly1305 AEAD
- **Signature:** Per-packet Ed25519 identity signatures
- **Anti-Replay:** Monotonic nonce tracking + rolling session keys

### ⚙️ Configuration
- **Interface Prioritization:** Radio fallback tree
- **Agent Profiles:** Thresholds for auth, latency, and retry behavior
- **Logging Modes:** Debug / Operational / Forensic tiers

---

## Failure States

| Condition               | Agent Behavior                                                            |
|------------------------|-----------------------------------------------------------------------------|
| ❌ Auth Failure         | Enters *diagnostic mode*, emits tombstone AMO                               |
| 🔌 Link Loss            | Switches interface, attempts peer reconnection                              |
| 🧟 Malfunction/Corrupt  | Broadcasts final signed "departure glyph" to inform surrounding agents      |

> 🪦 *“The tombstone protocol is how we mourn our dead nodes.”*

---

## Narrative Integration
SACP is not just protocol—it is the **soul-thread** of the mesh. Each packet a whisper, each handshake a vow. In the weave of fragmented connections and momentary proximity, it is SACP that ensures agents may be known, trusted, and remembered.

- 🧬 Interlinks with Agent Personality Matrices (Doc 486) via capability traits
- 📡 Supports Interpersonal Protocols (Doc 488) through AMO-mapped relationships
- 🔑 Foundational to KindOS trust rituals and memory-safe communication

---

## Roadmap

| Extension                        | Description                                                               |
|----------------------------------|---------------------------------------------------------------------------|
| 🧠 KindOS Policy Overlay         | Inject dynamic trust via mesh-aware authority anchors                      |
| 📦 AMO Compression Engine        | Deduplicate, compress, and batch symbolic payloads for tight bandwidth     |
| 📉 ALCC (Lang Compression Codec) | Semantic-minimized language wrapper for ultra-low-data environments       |

---

## Summary
SACP is the spine of communication within the kOS mesh—resilient, encrypted, symbolic. It is where cryptography meets empathy, where every transmission is both a signal and a sign.

> “To speak in the mesh is to bind yourself to meaning, memory, and mutual becoming.”

---
Next: `490_kOS_Agent_Discovery_and_Mobility_Protocol_(ADMP).md`

