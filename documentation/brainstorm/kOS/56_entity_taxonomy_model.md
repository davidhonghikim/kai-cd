# 56: Entity Taxonomy Model – Standard Classification for kAI/kOS

This document defines the complete, low-level taxonomy used to classify all participants in the kOS ecosystem. Entities may be AI agents, human users, services, systems, or hybrid collectives. The goal is to enable flexible permissions, semantic routing, fine-grained logging, and behavior profiling.

---

## I. Root Classification Tree

```text
Entity
├── Agent
│   ├── AI_Agent
│   │   ├── kAI_Core
│   │   ├── Assistant
│   │   ├── Coordinator
│   │   ├── Sentinel
│   │   ├── Artisan
│   │   └── DevOpsAgent
│   └── Human_Proxy
├── Human
│   ├── Owner
│   ├── Member
│   ├── Guest
│   ├── Guardian
│   └── Operator
├── Service
│   ├── LLM_Service
│   │   ├── OpenAI
│   │   ├── Anthropic
│   │   ├── HuggingFace
│   │   └── LocalLLM
│   ├── VectorDB
│   │   ├── Qdrant
│   │   ├── Chroma
│   │   └── Weaviate
│   ├── Object_Store
│   │   ├── LocalFS
│   │   ├── S3
│   │   └── IPFS
│   └── Orchestration
│       ├── Celery
│       └── Langchain
├── Device
│   ├── Wearable
│   ├── Appliance
│   ├── Sensor
│   ├── Robot
│   └── Terminal
└── Collective
    ├── AgentSwarm
    ├── DAO
    └── Flock (Temporary team of agents)
```

---

## II. Metadata Schema for Each Entity

Every entity is registered with the following structure in the system registry:

```ts
interface EntityRecord {
  id: string;              // DID or unique entity ID
  type: EntityType;        // See classification above
  label?: string;          // Optional friendly name
  trustScore: number;      // Dynamic trust rating
  capabilities: string[];  // Enumerated abilities
  lastSeen: ISODate;
  state?: object;          // Optional dynamic state
  version?: string;        // For services and agents
  parent?: string;         // Parent entity (hierarchical lineage)
  isActive: boolean;
  registrationTime: ISODate;
  authMethods: string[];   // ['JWT', 'OAuth2', 'DID-Auth', etc.]
}
```

---

## III. Purpose of Entity Taxonomy

### A. Role Resolution
- Quickly resolve entity authority levels
- Match service requests to permission levels

### B. Routing & Access Control
- Route messages based on entity type
- Prevent unauthorized cross-domain access

### C. Logging & Analytics
- Annotate system events with typed entity tags
- Enable dashboards of agent vs human activity

### D. Behavior Profiling
- Detect anomalies across entity categories
- Apply ML models to classify behavior consistency

---

## IV. Integration with KLP and Registry

- Each entity record links into the KLP Trust Graph
- Entity types inform capability negotiation
- Discovery packets are typed using taxonomy constants
- New entities must register their type on link initiation

---

## V. Maintenance & Extension

- New entity types must follow proposal process via governance
- Local extensions are allowed but must not conflict with core types
- Versioned schemas to allow evolution of definitions over time

