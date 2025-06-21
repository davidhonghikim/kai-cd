# 225: Universal Interface Schema

This document defines the complete schema and data structure used to standardize communication and interfaces across all agents, devices, services, and protocols in the `kOS/kAI` ecosystem.

---

## Overview

The Universal Interface Schema (UIS) ensures modularity, portability, and consistency in how components interact across diverse environments. It supports plug-and-play interfaces for local and distributed modules, providing a standardized contract for:

- Agent messages
- Service interactions
- User interface modules
- Sensor/actuator IO
- Orchestrator routing
- External API bridges

## 🔧 Core Schema Layers

### Layer 0: Envelope Metadata
```json
{
  "schema_version": "1.0.0",
  "timestamp": "2025-06-20T14:38:22Z",
  "uuid": "e8a6d6fc-b398-4017-a6c0-cd3e4f6299b7",
  "auth": {
    "agent_id": "kAI_2345",
    "token": "JWT...",
    "signature": "SHA256-hash"
  }
}
```

### Layer 1: Routing & Target
```json
{
  "source": "agent://kAI2345/user-frontend",
  "target": "service://promptKind/generator",
  "reply_to": "agent://kAI2345/logger"
}
```

### Layer 2: Message Type
```json
{
  "type": "request", // other types: "response", "error", "event", "heartbeat"
  "subtype": "chat",  // other: "command", "config", "stream", "telemetry"
  "priority": "normal", // high, low, deferred
  "ttl": 6000 // milliseconds
}
```

### Layer 3: Payload Structure (Examples)
#### 1. Chat Message
```json
{
  "messages": [
    {"role": "user", "content": "Summarize this document."},
    {"role": "system", "content": "You are an assistant."}
  ],
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 1024
}
```

#### 2. Sensor Telemetry
```json
{
  "device_id": "tempSensor-004",
  "reading": 22.4,
  "unit": "C",
  "battery": 92,
  "location": {
    "lat": 37.7749,
    "lon": -122.4194
  }
}
```

#### 3. Command Control
```json
{
  "action": "reboot",
  "target_device": "device://doorlock-0123",
  "reason": "scheduled_maintenance"
}
```

## 📦 Interface Definitions

### UI Module
```ts
interface UIComponentProps {
  sessionId: string;
  agentId: string;
  mode: 'chat' | 'form' | 'dashboard';
  data: any;
  onSubmit: (result: any) => void;
}
```

### PromptKind Interface
```ts
interface PromptRequest {
  prompt: string;
  context: string[];
  userId: string;
  metadata?: Record<string, any>;
  temperature?: number;
}
```

### kAI Action
```ts
interface AgentAction {
  action: 'respond' | 'route' | 'store' | 'notify';
  payload: any;
  confidence: number;
  explanation?: string;
}
```

## 🔄 Format Compatibility
- JSON: primary transport format
- YAML: config-level transformations
- Protobuf (Planned): for edge/IoT performance boost
- MsgPack (Optional): compact encoding

## 🧩 Plugin Interfacing
Any module, including third-party plugins, must define their interface in:
```
/config/interfaces/{plugin_id}.schema.json
```
And declare:
```json
{
  "type": "plugin",
  "id": "email_notifier",
  "entrypoint": "/services/notifier/entry.py",
  "schema": "/config/interfaces/email_notifier.schema.json"
}
```

## 🛡️ Security Layer
All messages validated against:
- Schema signature hash
- Agent registry (kOS Auth Service)
- Identity token expiration

Encrypted messages:
- AES-256 for body
- SHA-512 for signature

## 📚 Related Docs
- `044_Interface_Protocol_Registry.md`
- `022_KLP_Protocol_Spec.md`
- `067_Plugin_Integration_Contracts.md`
- `097_kOS_Security_Policies.md`

---
### Changelog
- 2025-06-21: Initial version created by agent

Next file to generate: `226_Service_Bridge_Contracts.md`

