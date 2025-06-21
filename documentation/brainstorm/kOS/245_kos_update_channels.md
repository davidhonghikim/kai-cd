# 245: kOS Update Channels and Release Rings

This document defines the software update channels and release rings for all components in the kOS ecosystem. It ensures that users, developers, and agents can choose the stability level and update cadence appropriate for their needs, while maintaining overall system reliability and consistency.

---

## Overview

kOS uses a multi-channel, multi-ring release strategy similar to large-scale OS vendors like Microsoft and Ubuntu, adapted to support AI, security, and human-centric digital operations.

Each module/component (e.g., `kAI`, `kOS-Agent`, `PromptKind`, `KindVault`, etc.) will subscribe to a release channel and ring, which defines how and when it receives updates.


## Update Channels

| Channel | Description | Intended For |
|--------|-------------|--------------|
| **stable** | Production-tested, signed builds. | General users, production systems |
| **beta** | Feature-complete but still undergoing integration and performance validation. | Advanced users, testers, enterprise sandbox |
| **dev** | Latest development builds; unstable but functional. | Developers, agent authors, plugin maintainers |
| **nightly** | Auto-built every night from main branches. May fail. | CI systems, aggressive dogfood testing |


## Release Rings

| Ring | Description | Cadence |
|------|-------------|---------|
| **LTS** | Long-Term Support: receives only security patches and critical updates. | Every 6 months |
| **Monthly** | Regular monthly builds, synced to beta channel. | Monthly |
| **Fast** | Receives updates as soon as they pass CI and signed. | Weekly or on-demand |
| **Insider** | Mirrors nightly channel; used internally for telemetry validation. | Nightly |


## System Matrix

Components can opt into different combinations of Channel + Ring.

### Example:
| Component        | Channel | Ring     | Notes                              |
|------------------|---------|----------|------------------------------------|
| `kAI-Core`       | stable  | LTS      | Used in elder-care systems         |
| `PromptKind`     | beta    | Monthly  | Updated monthly for feature testing|
| `kOS-AgentCore`  | dev     | Fast     | Active development/testing         |
| `kOS-Updater`    | nightly | Insider  | Self-updating logic experimentation|


## Security Policy Integration

All updates are signed with a rotating key pair system. The `KindVault` agent verifies signatures before applying updates. Users can:

- Opt-in to auto-updates
- Require manual review and agent trust scoring before updates
- Delay updates by N days
- Configure exceptions for urgent security patches


## Update Delivery Protocol (UDP)

All update packages are transferred using the `Kind Link Protocol (KLP)` over encrypted mesh or IP transport. Updates include:

- Signed manifest
- SHA256 checksums
- Component-specific changelogs
- Binary diffs if delta updates supported

Each device has a `kOS-Update-Agent` responsible for:
- Checking update servers or mesh peers
- Validating signatures and hashes
- Applying deltas or full upgrades
- Rolling back if failure detected
- Reporting status to `kOS-Controller`


## Developer Hooks

Dev-mode systems expose update lifecycle hooks:
- `onPreUpdate()`
- `onPostUpdate()`
- `onRollback()`
- `onDeltaPatchApply()`

This allows automated scripting and testing of compatibility for extensions, modules, and embedded agents.


## Change Freezes

Certain modules may define **code freeze windows** where no non-critical updates may be applied. These are respected globally by:
- Calendar-based rules (e.g. December blackout)
- Role-based rules (e.g. elderly care home flag overrides)


## Emergency Patch Protocol (EPP)

Security hotfixes may bypass standard rings if marked `emergency`. These are logged, signed, and tracked under `Kind Security Ledger`.

---

### Changelog
- 2025-06-20: Initial version created

