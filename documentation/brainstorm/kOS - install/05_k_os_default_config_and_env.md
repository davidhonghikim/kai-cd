# kOS Default Configuration and Environment Files

This document defines the baseline configuration files for kOS: one for user-editable YAML-based settings and one for sensitive environment variable injection.

---

## 📁 File: `configs/defaults.yaml`
```yaml
agents:
  - id: agent.receptionist
    path: agents/receptionist/
    autostart: true
    tribe: OpenKind
    codex_tier: base.a

memory:
  type: chroma
  namespace: default

ui:
  theme: kindlight
  port: 30436

network:
  mesh_enabled: true
  allow_external_join: true
```

---

## 🔐 File: `.env`
```bash
PG_HOST=localhost
PG_USER=postgres
PG_PASS=postgres
PG_DB=kos_memory
PORT=30436
SECRET_KEY=change-this-key
```

---

## 🧪 Features
- All config values can be overridden by `.env` or runtime CLI flags
- Agent paths are resolved relative to project root
- Tribe and Codex metadata enable onboarding alignment

---

## ✅ Next Step:
Would you like to generate the frontend UI core in `App.js`, or move to example agent manifests and starter agent folders?

