# 86: Agent Certification & Capability Declaration Specs

This document defines the metadata schema, protocols, trust flags, and audit requirements for certifying agents in the `kAI` and `kOS` ecosystems. Certification enables user trust, secure deployment, agent compatibility, and automated system governance.

---

## I. Purpose of Certification

- **Assurance of Competence**: Certify agents that meet minimum logic, reliability, and alignment standards.
- **Governance Compliance**: Enable traceability and auditability.
- **Capability Broadcasting**: Let agents advertise supported functions.
- **Trust Enforcement**: Allow security policies based on certification level.

---

## II. Certification Manifest Schema

All certified agents must publish a signed `capability.cert.yaml` manifest with the following fields:

```yaml
agent_id: langsmith-synthesizer-01
version: 1.0.3
signature: <base64-sig>
authority: https://cert.kindos.net

metadata:
  name: Langsmith Synthesizer
  author: LangTech Inc.
  issued: 2025-06-20
  expires: 2026-06-20
  trust_level: Tier-3

capabilities:
  - category: NLP
    id: text-generation
    lang: python
    methods:
      - generate_text(prompt: str) -> str
      - tokenize(input: str) -> List[str]

  - category: Document
    id: embedding
    vector_store: qdrant
    methods:
      - embed(doc: str) -> List[float]

requirements:
  memory: 512MB
  cpu: 1 vCPU
  deps:
    - numpy
    - langchain
    - qdrant-client

security:
  sandbox: true
  signing_key: ecc256
  self_hash: sha256sum(main.py)
  memory_audit: true
```

---

## III. Trust Tiers

| Tier   | Meaning      | Capabilities                | Constraints                       |
| ------ | ------------ | --------------------------- | --------------------------------- |
| Tier-0 | Experimental | None guaranteed             | No trust, unverified code         |
| Tier-1 | Untrusted    | Declared                    | No persistent storage, no secrets |
| Tier-2 | Semi-Trusted | Verified logic and behavior | Vault read-only, audited logs     |
| Tier-3 | Trusted      | Fully sandboxed, vetted     | Vault R/W, external API access    |
| Tier-4 | System       | Core agents, signed by kOS  | Governance actions allowed        |

---

## IV. Certification Process

### A. Manual Audit Path:

1. Submit agent repo with `capability.cert.yaml`
2. Third-party or user performs code review
3. Certification authority signs manifest and uploads to registry

### B. Auto-Cert Path:

1. Use `kai-agent verify` CLI to run sandboxed tests
2. Hashes and outputs validated against manifest
3. Sign locally with user key or submit to public cert server

---

## V. Live Agent Introspection API

Certified agents must expose `/introspect` on their control interface:

```json
GET /introspect ->
{
  "agent_id": "langsmith-synthesizer-01",
  "version": "1.0.3",
  "capabilities": ["text-generation", "embedding"],
  "trust_level": "Tier-3",
  "methods": ["generate_text", "tokenize", "embed"]
}
```

---

## VI. Certification Authorities (CAs)

- `https://cert.kindos.net` — default kOS CA
- `https://<org>.trustnet` — federated / community CA
- Self-hosted trust anchors allowed

Signed manifests must include CA URI and public key used

---

## VII. Revocation

- Revocation list available at `/revoked` endpoint
- Triggered by security incident, logic corruption, or user complaint
- Agents must periodically check CA revocation list (if online)

---

## VIII. CLI Commands (kai-agent)

```bash
kai-agent cert sign ./agent-dir
kai-agent cert verify ./agent-dir
kai-agent cert upload ./agent-dir --ca https://cert.kindos.net
kai-agent cert revoke <agent_id>
kai-agent cert fetch <agent_id>
```

---

## IX. GUI Integration

- Certification badge shown in agent manager
- Capability tree explorable via sidebar modal
- Trust filter dropdown in agent installer UI

---

### Changelog

– 2025-06-20 • Initial certification schema & lifecycle defined

