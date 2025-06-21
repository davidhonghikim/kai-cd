# 148: Self-Healing Mesh Routing and Redundancy Fabric (SHMRF)

This document defines the low-level implementation of the Self-Healing Mesh Routing and Redundancy Fabric (SHMRF), a core infrastructure component of kOS and kAI systems responsible for resilient communication, distributed coordination, and fault-tolerant delivery of agent data and signals.

---

## I. Purpose

SHMRF ensures:

- Automatic rerouting of failed or degraded communication paths
- Redundancy of critical messages, agent state, and decision trees
- Local fallback logic in case of node isolation
- Dynamic mesh expansion or contraction
- Compatibility with low-bandwidth or intermittently-connected environments

---

## II. Architecture Overview

### A. Core Components

- **NodeRouter:** Handles inter-agent packet routing across mesh
- **MeshBeacon:** Broadcasts node presence and health status
- **HealthMonitor:** Tracks uptime, packet loss, CPU/mem usage per node
- **AutoRewireDaemon:** Recalculates optimal routes after node loss or recovery
- **FailoverCache:** Stores shadow copies of recent state messages
- **SyncPulseService:** Periodic syncing of state summaries

### B. Routing Protocols

- Hybrid of:
  - KLP (Kind Link Protocol) overlays
  - Onion Routing for privacy paths
  - Distance-vector mesh learning (gossip-based)
  - Opportunistic flooding for mission-critical events

---

## III. Technical Specifications

### A. Message Handling

```yaml
packet:
  id: UUID
  type: state_update | signal | alert | telemetry
  origin: node_id
  ttl: 32
  redundancy: 3
  route_hint: [node_2, node_4]
  payload:
    enc: AES-256-GCM
    sig: Ed25519
    compression: zstd
```

### B. Node Structure

```json
{
  "id": "node_987654321",
  "location": "device.local",
  "capabilities": ["llm", "sensor", "relay"],
  "status": {
    "health": "OK",
    "latency_ms": 41,
    "neighbors": ["node_A", "node_B"]
  }
}
```

### C. Dynamic Topology

- Each node maintains partial view of mesh
- SHMRF auto-merges new subnetworks
- Respects isolation flags (`quarantine: true`)

---

## IV. Edge Device Resilience

- Low-power standby routing enabled via async UDP
- Cold-start discovery via encrypted UDP broadcast
- Emergency flash-backup of last known instructions
- LoRa-compatible SHMRF-lite mode for rural/offgrid

---

## V. Recovery Scenarios

### A. Node Failure

1. HealthMonitor flags node as dead
2. AutoRewireDaemon re-routes critical paths
3. Missing data replayed from FailoverCache

### B. Network Partition

1. Each subnet switches to internal leadership mode
2. SyncPulseService buffers logs for delayed merge
3. Mesh re-integrates when connection re-established

### C. Agent Migration

1. Old node sends full context via `context_bundle`
2. New node confirms receipt, then publishes new routes

---

## VI. Integration with kOS & kAI

- Agents use SHMRF instead of hardcoded API calls
- Prompts, states, signals sent via encrypted mesh messages
- SHMRF status displayed in kOS dashboard
- Secure by default (onion route + signed + encrypted)

---

## VII. Security Considerations

- Mutual TLS or Noise Protocol for link authentication
- Packet integrity enforced via Ed25519 signatures
- Replay protection with nonce chaining
- Mesh quorums can vote to isolate nodes (KLP action: `mesh_isolate`)

---

## VIII. Future Additions

- Reinforcement Learning-Based Route Optimization
- Agent-to-Agent Intent Channels (AIC)
- Predictive pre-routing of high-likelihood queries
- Incentivized reliability scoring for public nodes (staking)

---

### Changelog

– 2025-06-22 • Initial SHMRF infrastructure draft

