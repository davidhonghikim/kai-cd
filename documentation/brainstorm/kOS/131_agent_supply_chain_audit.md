# 131: Agent Supply Chain & Dependency Audit Protocols

This document outlines the procedures, tools, formats, and automation flows for auditing, verifying, and maintaining the full dependency graph and supply chain of any AI agent or service in the `kAI` and `kOS` ecosystems.

All agents must be traceable, reproducible, and verifiable.

---

## I. Supply Chain Integrity Principles

- **Transparency:** Every file, dependency, and resource must be explicitly defined.
- **Provenance:** All packages must have a known, logged source (repo, author, hash).
- **Reproducibility:** Builds must be deterministic; agent must run the same way across systems.
- **Isolation:** No implicit global dependencies or uncontrolled network calls.
- **Trust Verification:** All third-party tools must pass authenticity and integrity checks.

---

## II. Layered Audit Framework

### A. Level 1 – Dependency Declaration and Hash Lock

- **Manifest Format:** Standardized `agent.toml`, `requirements.lock`, and `manifest.yml`
- **Fields:**
  - `name`, `version`, `hash`, `source`, `license`, `verified`
  - `type`: runtime | build | dev
  - `trust_level`: core | approved | review | unverified

### B. Level 2 – Runtime Hash Verification

- **Tool:** `k-hashwatch`
- **Function:** Verifies at runtime that all dependencies match declared hashes
- **Integration:** Hooked into agent runtime launcher via `kLaunch`
- **Result:** Immediate halt and alert on mismatch

### C. Level 3 – Recursive Supply Chain Map

- **Tool:** `kDepGraph`
- **Output:** Full dependency DAG, including nested transitive dependencies
- **Formats:** JSON, Graphviz DOT, KLP Event Log
- **Usage:** Visual and programmatic audit of provenance and risk

### D. Level 4 – Static Analysis of Binaries

- **Tool:** `kBinAudit`
- **Scope:** Scans compiled files or binaries for unauthorized calls, embedded tokens, known bad signatures
- **Hook:** Part of build process and CI/CD

---

## III. Trust Scoring Model

```yaml
trust_scoring:
  - license: MIT => +1
  - license: GPL => 0
  - license: proprietary => -1
  - source: github.com/kind => +2
  - source: unknown => -3
  - signature: verified => +2
  - maintainer: known-agent => +1
  - dependency_depth: >3 => -1
```

- **Threshold:** Minimum score of `+2` required to pass inclusion
- **Blacklist:** Hashes of known malicious/abandoned packages

---

## IV. KLP Integration (Kind Link Protocol)

- **Every audit result** is encoded as a KLP event:

```json
{
  "type": "audit",
  "agent": "notekeeper.v1",
  "result": "pass",
  "score": 4,
  "signed": true,
  "timestamp": "2025-06-22T02:00Z",
  "toolchain": ["kDepGraph", "kBinAudit"]
}
```

- **All event logs** stored in the agent's audit registry
- **Audit triggers** propagate through federated kOS trust registries

---

## V. CI/CD Enforcement

- **Every push/build** must include `kVerifyDeps` step
- **Blocking Mode:**
  - Any dependency downgrade or unknown source halts the build
  - Logs required justification for exceptions

---

## VI. Agent-Built Dependencies

- **If agent builds from source:**
  - Must log compiler version, flags, environment variables
  - Final artifact hash must match across machines (cross-repro)
  - `kRebuilder` tool tracks build script provenance and signs final artifact

---

## VII. Human Review & Alerts

- **When flagged:** agent must go into review mode
- **UI Display:**
  - Risk score
  - Affected modules
  - Suggested fixes
- **User Prompt:** block, override, or isolate

---

## VIII. Long-Term Verification Plans

- Merkle tree-based audit history
- AI-aided static code quality review
- Agent lineage tracing (agent A was modified by agent B with these diffs...)
- Integration with Nix/Guix for full reproducibility

---

### Changelog

– 2025-06-22 • Initial draft of supply chain trust & audit protocol

---

Next planned doc: **132: Agent Communication Bus – Local, Networked, and Mesh Messaging**

