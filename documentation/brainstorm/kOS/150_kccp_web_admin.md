# 150: Kind Cloud Control Panel (kCCP) – Web Admin for Users, Orgs, and Agents

This document defines the architecture, frontend/backend structure, APIs, component logic, and system integration of the **Kind Cloud Control Panel (kCCP)**. This web-based UI and API suite manages users, agent instances, organizations, services, resource usage, billing, audit logs, and infrastructure policies within the Kind ecosystem.

---

## I. Purpose

kCCP provides:

- A centralized admin interface for users, organizations, and admins
- Lifecycle management for agents (deployment, status, logs)
- Organization and team management
- Service key, billing, and quota controls
- Agent diagnostics and audit logs
- Integration with kOS, kAI, and KindHub

---

## II. Technology Stack

### Frontend:

- **Framework**: React.js (with Next.js optional for SSR)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts/UI Widgets**: Recharts, React Query, Lucide Icons
- **State**: Jotai or Zustand (swappable)
- **Auth UI**: NextAuth.js or Clerk.js
- **Forms**: React Hook Form + Zod

### Backend:

- **API Framework**: FastAPI
- **ORM**: SQLAlchemy + asyncpg
- **Auth**: JWT (via OAuth2/OIDC)
- **Task Queue**: Celery
- **Database**: PostgreSQL
- **Cache**: Redis
- **Vector DB**: Qdrant (for logs, agents)

---

## III. Directory Structure

```text
/kccp
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── models
│   │   ├── routers
│   │   ├── services
│   │   ├── schemas
│   │   └── auth
│   ├── celery_worker.py
│   ├── Dockerfile
│   └── config.py
├── frontend
│   ├── pages
│   ├── components
│   ├── lib
│   ├── hooks
│   └── styles
├── docker-compose.yml
└── README.md
```

---

## IV. Core Features

### 1. User Dashboard

- Personal agents list and deployment status
- Billing summary and usage breakdown
- API keys and tokens
- Real-time logs and errors

### 2. Organization Management

- Invite users and assign roles
- Define agent scopes and policies
- Billing per-org or per-user
- SSO support

### 3. Agent Registry & Lifecycle

- Deploy, pause, delete agents
- View config, logs, memory, interactions
- Restore from snapshot
- Create templates and roles

### 4. Service Keys & Quotas

- Issue per-service API tokens
- Set quota (per minute/hour/day)
- Throttling rules and IP restrictions
- Usage breakdown by agent or endpoint

### 5. Infrastructure & Resource Management

- Container health, storage, bandwidth
- Auto-scaling policies (via Celery triggers)
- Offline alerts and agent resurrection

### 6. Security, Audit & Compliance

- Access logs (admin, user, system)
- Agent prompt diffs and rollback
- Export logs as signed bundle (KLP format)
- Rule engine for flagging anomalous behavior

---

## V. API Overview

| Endpoint               | Method | Auth        | Description           |
| ---------------------- | ------ | ----------- | --------------------- |
| `/api/agents/`         | GET    | JWT         | List user agents      |
| `/api/agents/deploy`   | POST   | JWT         | Launch new agent      |
| `/api/orgs/`           | GET    | JWT (admin) | List orgs and configs |
| `/api/logs/{agent_id}` | GET    | JWT         | Fetch logs            |
| `/api/keys/rotate`     | POST   | JWT         | Rotate API key        |
| `/api/usage/billing`   | GET    | JWT         | Get billing summary   |

---

## VI. Integration

- **kOS Sync**: Pull agent and org metadata to local OS nodes
- **KindHub**: Pull templates and deploy into KindCloud or local
- **KLP Sync**: All audit, billing, and policy exports use Kind Link Protocol
- **kAI**: Agent logs and runtime events streamed to kCCP

---

## VII. Security Model

- JWT (access tokens) + refresh tokens via OAuth2
- Multi-tenant RBAC
- Rate-limiting + IP throttling
- TLS mandatory (HTTPS only)
- Agent action logging immutable
- 2FA for admins (TOTP + WebAuthn optional)

---

## VIII. Future Enhancements

- Kubernetes-native deployment UI
- Custom telemetry dashboards (agent-defined)
- Agent marketplace with role-based install
- Rule-based log alerting system

---

### Changelog

- 2025-06-22 • Initial release of kCCP architecture doc

---

Next planned doc: **151: Kind Prompt Exchange & PromptKind Marketplace (PromptSync)**

