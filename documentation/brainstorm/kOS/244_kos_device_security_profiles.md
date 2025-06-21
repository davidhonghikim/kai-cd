# 244: kOS Device Security Profiles

## Overview
This document defines the security profiles available for devices registered and provisioned into the kOS ecosystem. Each profile enforces specific levels of encryption, access controls, update rules, and interaction policies with other agents, services, and devices.

---

## 1. Security Profile Levels

| Profile | Intended Use Case | Encryption | Auth Mechanism | Update Policy | Permissions Scope |
|--------|--------------------|------------|----------------|----------------|-------------------|
| `kOS-SEC-1` | Basic IoT or sensor nodes | AES-128 | Pre-shared key | Manual | Minimal local execution |
| `kOS-SEC-2` | Trusted edge devices (e.g. cameras, local agents) | AES-256 + TLS | Device certificates | Scheduled OTA | Limited kAI & service access |
| `kOS-SEC-3` | Autonomous compute nodes or assistants | AES-256 + mutual TLS + key pinning | Hardware TPM + identity keychain | Auto with rollback | Full local execution, isolated external comms |
| `kOS-SEC-4` | Critical infrastructure & interop bridges | AES-256-GCM + forward secrecy | Multi-factor agent verification + hardware keys | Manual only | Restricted to verified kOS clusters & signed ops |

---

## 2. Identity and Authentication

- **Device ID:** Derived from MAC, UUIDv7, and key fingerprint
- **Cert Chain:** Devices receive a `kOS Intermediate CA`-signed cert
- **kAI Linking:** Devices must be explicitly paired with user/kAI graph nodes
- **HMAC Verification:** All requests must include time-sensitive HMAC tokens
- **TPM & Secure Enclaves:** Used where supported to store keys and prevent tampering

---

## 3. Policy Enforcement

### A. Access Control
- Permissions are defined via policy manifests linked to device profiles
- Policies include allow/deny rules for:
  - kAI RPC endpoints
  - Service bus channels (via kBus)
  - File and memory access
  - Update and execution rights

### B. Update Security
- OTA packages must:
  - Be signed by authorized `kOS Signing Authority`
  - Include SHA-512 checksums
  - Pass signature and integrity verification before install

- Rollback protection prevents downgrade attacks using update monotonic counters

---

## 4. Communication Hardening

- **Mandatory Transport Encryption:** TLS 1.3 or higher
- **Mutual Authentication:** Required for inter-device or service-device interaction
- **Non-repudiation:** Every message includes:
  - Sender key ID
  - Time-signed nonce
  - MAC signature

---

## 5. Runtime Protection

- **Sandboxing:** Untrusted code is isolated in nsjail/microVMs
- **Memory Lockdown:** Enforce memory page protection for code/data
- **Resource Quotas:** CPU/mem/net usage bounded per security profile
- **Live Audit Hooks:** Injects audit streams to security monitoring agent

---

## 6. Compromise Recovery

- **Quarantine Protocol:**
  - Disconnect from kOS mesh
  - Revoke cert and regenerate keys
  - Clear all persistent credentials
  - Notify kAI Guardian

- **Re-onboarding Flow:** Must re-pass attestation + manual approval

---

## 7. Compliance

- All `kOS-SEC-*` devices comply with:
  - FIPS 140-3 crypto module standards
  - OWASP IoT Top 10 guidelines
  - GDPR/CCPA for user-facing devices
  - NIST SP 800-213 for edge computing

---

## 8. Notes

- Devices cannot downgrade security profiles after provisioning
- Each profile level may have optional enforcement modules (e.g. remote attestation)
- Default profile for unmanaged devices: `kOS-SEC-0` (Read-only, isolated, alert-only)

---

### Changelog
- 2025-06-20: Initial draft completed

