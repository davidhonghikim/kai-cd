# 183: Service Registry System – Dynamic Agent and Service Registration Protocol

## Overview

This document defines the full specification and implementation details for the Service Registry System within kOS and kAI. It ensures dynamic discovery, secure registration, and metadata synchronization of all services, agents, APIs, and tools across the distributed ecosystem.

---

## 🧠 Purpose

To allow all system components (agents, APIs, services, nodes, devices, apps, etc.) to register themselves with a centralized or federated registry and make their capabilities discoverable and secure.

---

## 🔧 Core Components

### 1. **Service Registry API (SR-API)**

- FastAPI-based REST and WebSocket interface
- Exposed on `/api/services` (REST) and `/ws/registry` (WebSocket)
- Handles:
  - Registration
  - De-registration
  - Updates
  - Discovery queries

### 2. **Service Metadata Schema**

- Fully defined in `schemas/service_schema.py`
- Key fields:
  ```json
  {
    "id": "string (uuid or unique hash)",
    "name": "Readable name",
    "type": "agent | tool | service | api | device | node",
    "tags": ["text", "vector", "llm", "vision"],
    "url": "http://...",
    "protocol": "http | https | ws | klp",
    "auth": {
      "type": "none | api_key | jwt | oauth",
      "token": "optional"
    },
    "endpoints": [
      {
        "path": "/chat",
        "method": "POST",
        "description": "Chat endpoint"
      }
    ],
    "heartbeat": "timestamp",
    "status": "active | offline | degraded",
    "owner": "agent_id | user_id",
    "visibility": "public | private | internal"
  }
  ```

### 3. **Database Backends**

- Uses PostgreSQL with SQLAlchemy (primary)
- Optional: Redis for short TTL live service cache
- Future: Neo4j (to visualize service relationships)

### 4. **KLP Integration (Kind Link Protocol)**

- All services use `klp://service-id` routing under secure mesh or p2p
- Syncs registry metadata across trusted federations

### 5. **Security & Validation**

- JWT-based auth for all registry API operations
- Signature validation for remote metadata updates (signed JSON)
- Public/private ACL enforcement per service

---

## 🔁 API Routes

### REST

- `POST /api/services/register`
- `GET /api/services`
- `GET /api/services/{id}`
- `POST /api/services/{id}/heartbeat`
- `DELETE /api/services/{id}`

### WebSocket

- `ws://<host>/ws/registry`
- Broadcast service changes, new registrations, offline alerts
- All agents auto-subscribe on boot

---

## 💡 Features

- 🔍 **Dynamic Discovery**: Query all services by tag/type/owner/status
- 🧠 **Smart Routing**: Used by orchestrators to delegate tasks
- 🕵️‍♀️ **Trustable Metadata**: Each service defines what it is capable of, with cryptographic integrity
- ⛓️ **Federation Ready**: kOS nodes exchange registry states using signed block-syncs
- 🚦 **Status Reporting**: Each service emits heartbeat pings or is marked offline

---

## 📦 Directory Structure

```
kos/
└── core/
    └── registry/
        ├── __init__.py
        ├── service_model.py     # SQLAlchemy ORM
        ├── service_routes.py    # FastAPI routers
        ├── klp_registry_sync.py # KLP sync handler
        ├── redis_cache.py       # Fast service cache
        └── schemas/
            └── service_schema.py
```

---

## 🛠️ Agent Integration

Each agent that supports capabilities should:

- Register with the service registry on startup
- Maintain status via periodic heartbeats
- Re-register if schema changes
- Unregister on graceful shutdown
- Use registry for service discovery instead of hardcoding endpoints

---

## 🧪 Testing Plan

1. Register dummy service → assert presence
2. Issue discovery query → validate filtering
3. Kill service → heartbeat timeout marks as offline
4. Test federation sync via `klp_registry_sync.py`
5. Attempt unauthorized registration → validate rejection

---

## ✅ Status

- Core spec complete
- Redis + PostgreSQL integration validated
- Federation sync and trust chain integration pending

---

## 🧭 Next Document: `184_Permission_Token_System.md` – defines scoped capability access tokens, agent/service delegation rights, and how agents prove what they’re allowed to do.

