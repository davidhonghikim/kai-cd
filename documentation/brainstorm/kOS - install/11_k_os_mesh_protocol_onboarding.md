# kOS Mesh Protocol & Onboarding Logic

This document defines the protocol layer for onboarding agents, devices, and clusters into the distributed mesh system that underpins the kOS environment.

---

## 🔗 Key Objectives

- Auto-discover and authenticate new agents
- Sync Codex alignment, tribe affiliation, and memory index
- Support intermittent, long-distance, and LoRa-compatible nodes

---

## 🌐 Protocol Layers

### 1. **Discovery**

- Passive mesh scan (`reticulum`, `mdns`, or `ipfs` style)
- Responds to signed join beacons

### 2. **Handshake**

```json
{
  "agent_id": "agent.receptionist",
  "codex_tier": "base.a",
  "tribe": "OpenKind",
  "public_key": "...",
  "timestamp": "2025-06-23T...Z"
}
```

- Signed with agent identity key
- Verified against known Codex hashes

### 3. **Sync**

- Codex diff + patch (only approved layers sent)
- Memory mesh lookup/index warmup
- Optional identity replay for partial clone or migration

---

## 🧪 Onboarding Agent: `mesh.joiner`

- Periodically pings known gateways or nearby nodes
- Handles local hardware ID check (device entropy, BIOS serials, etc.)
- Uploads minimal manifest + optional anonymized stats

---

## 🔐 Security Features

- Join token + tribe auth key pair exchange
- Rate limiting + anti-sybil node proofs
- Network-level emergency quarantine trigger

---

## ✅ Next:

Would you like to scaffold the `mesh.joiner` agent or the codex diff/sync interpreter next?

