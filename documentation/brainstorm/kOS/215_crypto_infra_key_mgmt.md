# 215: Core Cryptographic Infrastructure & Key Management

This document details the complete cryptographic architecture of the kOS and kAI systems, including how cryptographic keys, signatures, vaults, trust layers, and secure communication are managed across modular components and distributed environments.

---

## I. Objectives

- Enable secure identity and message verification for all agents and modules
- Provide zero-trust, cryptographically verified interactions
- Allow for plug-and-play cryptographic libraries or hardware backends
- Enforce key lifecycle best practices and access control

---

## II. Cryptographic Primitives Used

| Function                | Algorithm(s)                  |
| ----------------------- | ----------------------------- |
| Encryption (Symmetric)  | AES-256-GCM                   |
| Encryption (Asymmetric) | RSA-4096, ECC (X25519, P-384) |
| Hashing                 | SHA-256, BLAKE2b, SHA3        |
| Signing                 | Ed25519, RSA-PSS              |
| Key Derivation          | Argon2id, PBKDF2              |
| Password Hashing        | bcrypt, scrypt                |
| Authenticated Channels  | TLS 1.3, Noise Protocol       |

---

## III. Key Categories

1. **Root Identity Keys** – Created during kOS/kAI install. Stored securely in local vault (or HSM).
2. **Agent Identity Keys** – Unique to each AI agent (personality or role module).
3. **Session Keys** – Ephemeral, generated per secure channel.
4. **API Access Keys** – Tokens or JWTs used to access external or local APIs.
5. **Encryption Keys** – For secure storage, file encryption, artifact encryption.
6. **Signing Keys** – Used to sign actions, commands, messages.

---

## IV. Key Management System (KMS)

A pluggable internal or external KMS (like HashiCorp Vault, AWS KMS, or self-hosted OpenKMS) is used to:

- Generate and rotate all critical keys
- Store master secrets securely
- Provide access-controlled encryption and decryption
- Support key expiration and revocation
- Expose API for cryptographic functions to internal modules

**kOS default:** Local lightweight KMS using AES-256-GCM, protected by device fingerprint and optional password/diceware phrase.

**Enterprise:** Support for HSMs, YubiKeys, TPM 2.0, or remote Vaults.

---

## V. Vault System

Every instance of kAI or kOS includes a local secure vault system for secrets, config, user credentials, and key storage.

**Features:**

- AES-256 encryption with auto-lock
- Unlock via password, biometric, hardware token
- Secrets tagged and scoped by module, service, or agent
- Encrypted export/import capability

**Directory:** `~/.kind/vault/`

---

## VI. Identity Verification & Trust

All agents and services establish identity via cryptographically signed metadata and communication:

- Each agent includes a signed identity package
- All inter-agent communication is signed + optionally encrypted
- Trusted root fingerprints are stored in a system-wide truststore

**Trust Levels:**

- `trusted_root`
- `local_module`
- `external_verified`
- `external_unverified`
- `revoked`

**Truststore Location:** `~/.kind/truststore.json`

---

## VII. Message Signing and Integrity

Every critical log, artifact, action, and agent response includes:

- `msg_hash`: SHA-256 of content
- `msg_sig`: Ed25519 signature
- `agent_id`: Key fingerprint of the sender

This ensures tamper-resistance and attribution.

---

## VIII. Communication Layer Security

### A. Local Inter-Process

- Uses UNIX domain sockets or local TCP with ephemeral AES keys

### B. Mesh & Remote Agent Comms

- Noise Protocol Framework
- Optional integration with secure overlays like Reticulum
- End-to-End Encryption with key rotation

### C. External Service Access

- TLS 1.3 or native provider encryption (e.g., OpenAI over HTTPS)
- Tokens and credentials pulled from vault via access-controlled session

---

## IX. User Keychain

Accessible via the kAI GUI or CLI, the user keychain handles:

- Vault secrets
- PGP/SSH key pairs
- WebAuthn/U2F credentials
- API tokens
- Diceware master phrases

**Backup Options:**

- Encrypted local backup (GPG encrypted)
- USB export to YubiKey-compatible formats

---

## X. Hardware Integration (Optional)

- **TPM 2.0**: Used for system boot validation and encryption key unsealing
- **YubiKey**: Two-factor agent unlock and SSH/GPG key storage
- **HSM**: For enterprise-grade key protection

---

## XI. API for Internal Modules

All internal modules interact with cryptographic functions via a unified interface:

```ts
// pseudo API signature
crypto.sign(data: Buffer, keyID: string): string
crypto.verify(sig: string, data: Buffer, keyID: string): boolean
crypto.encrypt(data: Buffer, keyID: string): Buffer
crypto.decrypt(data: Buffer, keyID: string): Buffer
crypto.generateKeyPair(alg: 'ed25519' | 'rsa', opts?): KeyPair
```

---

## XII. Future Enhancements

- zk-SNARK support for zero-knowledge agent proofing
- DID (Decentralized Identity) integration
- Hardware attestation APIs for agent trust provenance
- Quantum-safe key negotiation (post-quantum crypto fallback)

---

### Changelog

- 2025-06-20 • Initial full system architecture draft

