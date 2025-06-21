# 82: Agent Licensing & Compliance

This document defines the licensing models, legal identifiers, usage boundaries, and compliance verification protocols for agents operating within the `kAI` and `kOS` environments.

---

## I. Licensing Models

### A. Open Source Licenses (OSL)

- **MIT** — Permissive, allows reuse with attribution
- **Apache 2.0** — Patent-safe and permissive
- **GPLv3** — Copyleft, share-alike requirement
- **MPL 2.0** — File-level copyleft for business compatibility

### B. Commercial Licenses (CL)

- **Single-Use License** — One-time fee, per-user installation
- **Subscription License** — Time-based with renewals
- **Enterprise License** — Multi-agent deployment, unlimited users

### C. Hybrid License (HL)

- OSS core with paid advanced modules
- Example: Core scheduler is GPL, but analytics engine is CL

---

## II. License Metadata File

Every agent must contain a `license.meta.yaml` file in its root directory:

```yaml
id: kind-agent-chatcoach
license: MIT
version: 1.2.0
maintainer: Stone Monk AI Labs
copyright: 2025 Stone Monk AI
compliance:
  logging: required
  telemetry: optional
  audit_ready: true
  expiration: none
```

---

## III. Licensing Enforcement Features

### A. Runtime License Validator

- Validates license meta before agent starts
- Displays non-blocking warning for OSS
- Halts startup for expired CL/HL keys

### B. Online Verification System (for CL)

- Endpoint: `https://license.kind.ai/api/validate`
- Payload:

```json
{
  "agent_id": "kind-agent-vault",
  "license_key": "abc123-xyz",
  "fingerprint": "SHA-256 machine+env hash"
}
```

- Response includes validity, expiry, and license type

### C. Offline Validation Fallback

- For edge deployments or airgapped systems
- Requires signed `.lic` token file issued by license server
- Token includes:
  - Agent fingerprint
  - Expiration timestamp
  - Encrypted checksum

---

## IV. Usage Boundaries & Quotas

| License Type | Max Instances | Time Limit | Features Gated          |
| ------------ | ------------- | ---------- | ----------------------- |
| OSL (MIT)    | ∞             | ∞          | None                    |
| CL (Single)  | 1             | ∞          | Agent chaining          |
| CL (Sub)     | 5             | 1 year     | UI analytics, telemetry |
| HL           | Variable      | Variable   | Paid modules            |

---

## V. Compliance Audit System

### A. Self-Report Mechanism

- Agents generate `usage.audit.json` with:
  - Start/stop timestamps
  - Host ID hash
  - Feature usage logs
  - Anonymized user interaction counts

### B. Audit Collection Endpoint

- `POST /compliance/report`
- Optional opt-out via agent config

### C. Audit Token Chain

- All agent audit logs signed
- Aggregated using trust-chain anchor metadata
- Viewable via kAI Compliance UI

---

## VI. Legal Identifiers

- `license_id`: Must match SPDX standard if OSS
- `license_key`: UUIDv4 or signed token for commercial use
- `copyright`: Human-readable and machine-readable

---

## VII. Revocation & Expiry

- Expired licenses trigger fallback to limited OSS mode (if available)
- Manual revocation publishes `revoke.json` entry to KindLedger
- Agents are expected to validate revocation list every 24 hours

---

## VIII. Future Expansion

- Decentralized License Graph (DLG) using KindLink
- Smart Contract Licensing for DAO-issued agent modules
- License Token Marketplace for redistributable AI agents
- Regional license compliance validator (EU/US/ASIA law overlays)

---

### Changelog

– 2025-06-20 • Initial compliance and licensing specification

