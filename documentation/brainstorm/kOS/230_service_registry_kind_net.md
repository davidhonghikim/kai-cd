# 230: Service Registry & KindNet Integration

## Overview

This document defines the architecture, configuration, and implementation of the **Service Registry** for `kOS` and its interconnection with the **KindNet** communication fabric. This system is foundational for discovering, connecting, authenticating, and synchronizing distributed services and agents across both local and networked environments.

---

## 📌 Goals

- Enable **automatic service discovery** and health monitoring
- Support **decentralized agent discovery** and communication
- Integrate with **KindLink Protocol (KLP)** for secure inter-agent linking
- Manage metadata for services including type, state, location, and capabilities
- Support both **standalone (kAI)** and **networked (kOS/KindNet)** deployments

---

## 🧱 Directory Structure

```text
/core/service-registry/
├── index.ts                         # Entrypoint for registry logic
├── registry.ts                      # Main Service Registry logic
├── schema.ts                        # Type definitions and metadata contracts
├── heartbeat.ts                     # Health ping and liveness checks
├── discovery/
│   ├── zeroconf.ts                  # mDNS-based local discovery
│   ├── klp-sync.ts                  # KindLink Protocol mesh sync
│   └── cloud-announcer.ts          # Optional WAN/cloud bridge
├── api/
│   └── registryRoutes.ts           # REST/WebSocket APIs for listing services
├── config/
│   └── serviceRegistry.config.ts   # Static and runtime config options
└── utils/
    └── resolver.ts                 # Node/address resolution helpers
```

---

## ⚙️ Configuration (serviceRegistry.config.ts)

```ts
export const serviceRegistryConfig = {
  discovery: {
    enableMDNS: true,
    enableKLP: true,
    enableCloudAnnounce: false,
    cloudEndpoint: 'https://registry.kindnet.org',
  },
  heartbeatInterval: 3000,     // ms
  registryBroadcastInterval: 10000,
  maxUnresponsiveTime: 15000,  // For failure detection
};
```

---

## 🧠 Metadata Schema (schema.ts)

```ts
type ServiceRecord = {
  id: string;
  name: string;
  type: 'agent' | 'service' | 'data-source';
  tags: string[];
  protocols: string[];         // ['http', 'ws', 'klp']
  address: string;
  port?: number;
  health: 'alive' | 'warning' | 'dead';
  lastSeen: number;
  metadata: Record<string, any>;
};
```

---

## 🌐 Discovery Modules

### 🔹 mDNS Zeroconf (zeroconf.ts)

- Advertises `kAI` or `kOS` services over local network
- Listens for `_kind._tcp.local` and `_agent._udp.local`
- Supports `TXT` records for metadata

### 🔹 KindLink Protocol Sync (klp-sync.ts)

- Uses KLP mesh to sync service graphs
- Each node shares its registry delta via signed packets
- Handles replay protection, TTL, and origin tracking

### 🔹 Cloud Announcer (cloud-announcer.ts)

- Optional module for syncing with global `KindNet` registry
- Can be used for remote service lookup, diagnostics, and telepresence
- Requires credentialed access (JWT)

---

## 🔁 Heartbeats & Failure Detection (heartbeat.ts)

- Ping each known service every `heartbeatInterval`
- If no response within `maxUnresponsiveTime`, mark as `dead`
- If service returns after dead state, emit `revived` event

---

## 📡 API Endpoints (registryRoutes.ts)

```ts
GET /registry/list                 // List all known services
GET /registry/:id                 // Get details for a specific service
POST /registry/manual             // Manually register a service (fallback)
GET /registry/health              // Return registry health
```

Supports both **REST** and **WebSocket** updates for live service info:

```ts
/ws/registry-updates              // Emits delta service changes
```

---

## 🔒 Integration with KLP

- All service announcements over KLP must be **digitally signed**
- Trust model via **Web of Trust** or pinned keys
- Messages include `service_id`, `capabilities`, `auth_level`
- Registry maintains **KLP trust context** per remote node

---

## ✅ Final Notes

- All components must be built with fault tolerance and service restart resilience
- Should support cross-platform deployments (mobile, IoT, desktop, servers)
- Registry entries are cached locally and synced incrementally
- Will integrate with `kOS ConfigManager` to allow service priority/overrides

---

Next Document: **231: kOS Agent Bootloader System**

