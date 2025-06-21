# 241: kAI Permission System

## Overview

The **kAI Permission System** (KPS) is a secure, extensible, and human-readable framework for managing all levels of agent and module permissions in the Kind AI (kAI) and Kind OS (kOS) ecosystem.

It supports both **user-assigned permissions** and **autonomous negotiation protocols**, allowing decentralized decision-making with centralized audit and override control.

---

## Purpose

- Prevent unauthorized access, commands, and communications across modules
- Define clear roles and capabilities for agents, subagents, apps, APIs, and services
- Support programmable, AI-readable policies with human-readable fallback
- Allow privacy-first audit logs and user notification triggers

---

## Directory Structure

```
kai/
└── permissions/
    ├── policies/
    │   ├── global.yaml
    │   ├── user_overrides.json
    │   ├── system_bootstrap.yaml
    │   └── legacy_migration_rules.yaml
    ├── profiles/
    │   ├── default_user.json
    │   ├── agent_admin.yaml
    │   └── third_party_guest.json
    ├── rulesets/
    │   ├── kAI_core_rules.ts
    │   ├── plugin_integration_rules.ts
    │   └── network_broadcast_limits.ts
    ├── runtime/
    │   ├── active_permissions_cache.json
    │   ├── token_grant_history.log
    │   └── violations_quarantine.json
    ├── interfaces/
    │   ├── api_spec.yaml
    │   └── kps_sdk_adapter.ts
    └── README.md
```

---

## Policy Language

- Based on a superset of JSON Schema with YAML support
- Allows scoped permissions (`allow`, `deny`, `conditional`)
- Supports wildcard matching, rate limits, token expiry
- Compatible with Open Policy Agent (OPA) for advanced scenarios

### Example Policy (YAML)

```yaml
id: webagent-plugin-read
scope: plugin::webagent
rules:
  - action: read
    path: /data/history/**
    conditions:
      time: { between: ["08:00", "22:00"] }
      user_role: ["owner", "auditor"]
  - action: execute
    function: runScraper
    deny_if:
      battery_below: 10%
```

---

## Core Components

### Permission Resolver Engine

- Validates requests using multi-layered policies
- Runs on every action dispatch and service interface call
- Caches results in `runtime/active_permissions_cache.json`

### Grant Tokens

- Temporary permissions granted to agents
- Use for one-off actions, time-limited sessions, or scoped applets

### Violation Quarantine

- Any denied or suspicious activity is logged
- Quarantine optionally blocks agent access
- Triggers optional user alert (depending on profile)

---

## System APIs

All permission decisions are exposed via the `kps` interface:

### kps.checkPermission()

- Params: `{ agent, action, resource, context }`
- Returns: `ALLOW | DENY | CONDITIONAL | QUARANTINE`

### kps.grantTemporaryToken()

- Params: `{ agent, capabilities, duration, context }`
- Returns: Token object, inserted into cache

### kps.auditLog()

- Params: `{ filter, user, agent }`
- Returns: list of permission checks, outcomes, timestamps

---

## Human Interface

- Users can review all permission requests and results in:
  - `🛡️ Permissions` tab in kAI settings
  - `🔒 Security Hub` in kOS dashboard
  - Optional mobile notifications for quarantine or elevated requests

---

## kOS Integration

- `kps` is available as a system daemon
- Accessible by all agents, apps, and system daemons
- Configurable via `/etc/kindos/kps_config.yaml`
- Optional blockchain-anchored signature verification (for audit immutability)

---

## Notes

- Every installed agent must request a permission profile
- Legacy systems should route through `legacy_migration_rules.yaml`
- Permission changes should be cryptographically signed by user profile if `strict_mode` is on

---

## Related Documents

- `160_kOS_Security_Services.md`
- `098_Agent_Trust_Model.md`
- `103_kOS_Audit_Systems.md`

---

**Next:** `242_kAI_User_Customizations.md`

