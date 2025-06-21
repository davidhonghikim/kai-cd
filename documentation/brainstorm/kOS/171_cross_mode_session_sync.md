# 171: Cross-Mode Agent Session Syncing and Handoff

This document specifies the architecture and implementation for synchronizing agent session state across various interface modes (tab, popup, sidepanel, full app) and devices in the `kAI/kOS` ecosystem.

---

## I. Goals

- Maintain uninterrupted session state regardless of mode (tab, popup, etc.)
- Support seamless session handoff between devices and contexts
- Enable cross-context memory and tool continuity
- Prevent data loss from reloads or mode switching

---

## II. Modes Covered

- **Browser Extension Popup**
- **Tab UI (kai.html)**
- **Sidepanel View (panel.html)**
- **Mobile UI (PWAs / remote access)**
- **Desktop App**
- **Headless API Mode**

---

## III. Key Concepts

### A. Session Identity

- Every session has a unique `session_id`
- Associated with agent state, active tools, messages, logs

### B. Volatile vs. Persistent State

- **Volatile**: in-memory tool chains, scratchpads, streaming buffer
- **Persistent**: history, configs, logs, inputs/outputs

### C. Sync Channels

- WebSocket bridge (local device)
- IndexedDB sync layer
- BroadcastChannel for extension contexts
- KLP-based remote sync (across devices)

---

## IV. Sync Architecture

### A. Local Device Sync (Browser)

#### 1. Popup <-> Tab <-> Sidepanel

- **BroadcastChannel** for state push
- Shared IndexedDB cache for persistent state
- Event listeners to detect opening/closing of other modes

#### 2. IndexedDB Schema

```ts
interface SessionRecord {
  session_id: string;
  agent_id: string;
  created_at: ISODate;
  last_updated: ISODate;
  state_snapshot: JSON;
  history: Array<Message>;
  config: AgentConfig;
  active_tools: string[];
}
```

### B. Cross-Device Sync (Federated)

#### 1. KLP Synchronization Protocol

- Push/pull of session payloads via KLP
- Session sync type: `session_delta`
- Signatures required on deltas

#### 2. Storage

- User-configurable:
  - Local only
  - Synced to kOS mesh
  - Synced to encrypted cloud bucket

#### 3. Conflict Resolution

- Timestamp-based precedence
- Manual merge UI (like Git diffs) for long-lived forks

---

## V. Handoff Protocol

### A. Intent

- A user signals the intent to transfer control of a session to another context or device

### B. Mechanism

- `handoff_signal` message via WebSocket or KLP
- Receiving UI prompts for session takeover
- Optional multi-device active mode (mirror/observe only)

### C. Data Transferred

- Full session payload (state, memory, toolchain, context)
- Runtime resume hooks for voice/audio input, text cursor, etc.

### D. UX Flow

1. User clicks "Switch to Mobile"
2. Generates QR with auth + session\_id
3. Mobile device scans, receives full payload
4. Prompt: "Take over session?"
5. Confirmed -> state loaded -> active handoff

---

## VI. Session Snapshots & Recovery

### A. Autosave Mechanism

- On every significant state change
- Stored in IndexedDB and optionally encrypted cloud
- Up to 10 snapshots per session

### B. Recovery Scenarios

- Tab crash -> restore via IndexedDB
- Cross-tab restore prompt if session is found
- Offline fallback via last snapshot

---

## VII. API

```ts
GET /session/:id
POST /session/:id/sync
POST /session/:id/handoff
POST /session/:id/resume
```

### Events:

- `session:update`
- `session:handoff:init`
- `session:handoff:accept`
- `session:restore`

---

## VIII. Privacy & Security

- Session payloads encrypted with user secret (if configured)
- Deltas signed with Ed25519
- No remote sync without opt-in
- Secure QR scan tokens (JWT scoped to session)

---

## IX. Future Extensions

- Live co-edit sessions (multi-user collaboration)
- Cross-agent session sharing with access policies
- Session export to LLM training or debugging trace
- Trust log generation from session playback

---

### Changelog

– 2025-06-21 • Initial spec for full session handoff & sync protocol

