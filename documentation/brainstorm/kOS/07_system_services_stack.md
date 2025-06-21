# 07: System Services and Fullstack Breakdown

This document outlines the complete system architecture, software stack, service directories, protocols, configuration layouts, and inter-service relationships for the kindOS (kOS) and kindAI (kAI) ecosystem. All components are detailed to support agent coordination, user interface, security, logging, and full modularity.

---

## I. Top-Level Directory Structure (Root)

```text
/kindos-root
├── README.md
├── docker-compose.yml
├── .env
├── .gitignore
├── logs/
├── config/
├── services/
├── agents/
├── frontend/
├── backend/
├── data/
├── scripts/
├── tests/
└── documentation/
```

---

## II. Fullstack Services Directory

```text
/services
├── gateway/                  # Nginx or Caddy config + TLS certs
├── api/                      # FastAPI core services
│   ├── auth/                 # JWT, OAuth2, token validation
│   ├── user/                 # Profiles, configs, permissions
│   ├── agent-orchestrator/  # Agent execution, logging, planning
│   ├── memory/               # Vector DB, embeddings, recall engine
│   ├── artifact/             # Files, images, notes
│   ├── prompt/               # Prompt templates, prompt history
│   ├── security/             # Intrusion detection, vault interfaces
│   └── telemetry/            # Event logs, usage metrics
├── vector-db/               # Qdrant, Chroma, or Weaviate
├── postgres/                # PostgreSQL DB service
├── redis/                   # In-memory cache, Celery broker
├── rabbitmq/                # Optional queue broker
└── vault/                   # Secrets management, Hashicorp Vault
```

---

## III. Frontend Directory Structure

```text
/frontend
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── services/
│   │   ├── prompts/
│   │   ├── dashboard/
│   │   ├── artifacts/
│   │   └── memory/
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── settings.tsx
│   │   └── agent-center.tsx
│   ├── contexts/
│   ├── state/
│   ├── styles/
│   ├── utils/
│   ├── assets/
│   └── App.tsx
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## IV. Backend Directory Layout (FastAPI)

```text
/backend
├── main.py
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── prompts.py
│   │   ├── memory.py
│   │   ├── agents.py
│   │   ├── files.py
│   │   ├── system.py
│   │   └── telemetry.py
│   ├── services/
│   │   ├── vector_store.py
│   │   ├── prompt_engine.py
│   │   ├── memory.py
│   │   └── orchestrator.py
│   └── utils/
├── celery_worker.py
└── requirements.txt
```

---

## V. Configuration Directory (Modular)

```text
/config
├── agents/
│   ├── manifest.json
│   ├── kPlanner:dev.json
│   ├── kExecutor:web.json
│   └── ...
├── services/
│   ├── vector-db.json
│   ├── memory.json
│   ├── gateway.json
│   └── auth.json
├── ui/
│   ├── themes.json
│   ├── components.json
│   └── layout.json
├── security/
│   ├── vault.json
│   ├── keys/
│   └── auth-policies.json
└── system.json
```

---

## VI. Telemetry & Logging

- Logs: `logs/agents`, `logs/system`, `logs/security`
- Format: JSON lines (`.jsonl`) + rotating files
- Visualizer: Grafana Loki, SQLite Viewer UI

---

## VII. Data Directory

```text
/data
├── db_backups/
├── uploads/
├── encrypted/
├── vector_store/
└── telemetry/
```

---

## VIII. System-Level Protocols & APIs

- **Internal API Protocols**: REST + gRPC
- **Realtime**: FastAPI WebSocket / socket.io
- **Agent Comm Layer**: KLP (Kind Link Protocol)
- **Security**: OAuth2, Ed25519, JWT
- **DB Protocols**: Postgres over TCP, Redis PubSub, VectorDB HTTP+gRPC
- **File Transfer**: Signed URL via S3-compatible interface

---

## IX. Security & Privacy Architecture

- **Encrypted Vault**: HashiCorp Vault or custom AES-GCM implementation
- **RBAC**: All access enforced at API and agent layers
- **Signed Tasks**: Agent instructions signed with Ed25519 keys
- **Memory Isolation**: Namespaces + TTL limits per session
- **Audit Trails**: Logged via `kSentinel`, available in UI

---

## X. Agent-Oriented Service Mesh (MeshMap)

```text
/kindos-root/agents
├── kCore/            # Global controller
├── kPlanner/         # Goal breakdown and reasoning
├── kExecutor/        # Subtask execution agents
├── kReviewer/        # Verification agents
├── kSentinel/        # Security enforcement
├── kMemory/          # Embedding + recall
├── kPersona/         # Persona config
├── kBridge/          # External API linkers
└── shared/
    ├── protocols/
    └── taskgraph/
```

---

## XI. Build Tools

- **Frontend**: Vite + TypeScript + Tailwind
- **Backend**: Uvicorn + FastAPI + Celery
- **Containerization**: Docker
- **Monitoring**: Prometheus + Grafana
- **Secrets**: Vault + `.env` + config encryption

---

## XII. Documentation System

- **Docs Engine**: Docusaurus
- **Format**: `.md` files in `documentation/`
- **Search**: Algolia integration optional
- **Style**: Tailwind typography plugin
- **Metadata**: Frontmatter YAML

---

### Changelog

– 2025-06-21 • Initial fullstack and systems breakdown created.

