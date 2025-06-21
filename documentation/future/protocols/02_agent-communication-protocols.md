---
title: "Agent Communication Protocols"
type: "protocol_specification"
status: "future_vision"
priority: "critical"
last_updated: "2024-01-20"
relates_to: ["01_klp-specification.md", "../services/01_prompt-management.md"]
version: "1.0.0"
---

# Agent Communication Protocols

> **Agent Context**: This document provides the complete technical specification for inter-agent communication in the kOS ecosystem. It defines the protocols, message formats, routing mechanisms, and security frameworks that enable secure, scalable, and reliable agent coordination. Implementation teams must follow these specifications exactly to ensure system interoperability.

## Overview

The Agent Communication Protocols define the foundational communication layer for the kOS multi-agent system. This includes the Kind Link Protocol (KLP), message routing, security frameworks, and coordination patterns that enable agents to work together effectively across distributed environments.

**Implementation Status**: Future vision for kOS distributed agent system
**Current Foundation**: Basic service coordination in Kai-CD
**Evolution Path**: Service calls → Agent messages → Distributed protocols

## Core Protocol Architecture

### Protocol Stack

```typescript
// Future: src/kos/protocols/ProtocolStack.ts
export interface ProtocolStack {
  application: ApplicationLayer;
  coordination: CoordinationLayer;
  communication: CommunicationLayer;
  identity: IdentityLayer;
  transport: TransportLayer;
}

export class KindProtocolStack implements ProtocolStack {
  private layers: Map<string, ProtocolLayer> = new Map();
  private messageQueue: MessageQueue;
  private routingTable: RoutingTable;
  private securityManager: SecurityManager;

  constructor(config: ProtocolConfig) {
    this.initializeLayers(config);
    this.setupMessageRouting();
    this.configureSecurity();
  }

  async initializeLayers(config: ProtocolConfig): Promise<void> {
    // Initialize each protocol layer with proper dependencies
    this.layers.set('transport', new TransportLayer(config.transport));
    this.layers.set('identity', new IdentityLayer(config.identity));
    this.layers.set('communication', new CommunicationLayer(config.communication));
    this.layers.set('coordination', new CoordinationLayer(config.coordination));
    this.layers.set('application', new ApplicationLayer(config.application));

    // Establish layer interconnections
    await this.connectLayers();
  }

  async sendMessage(message: AgentMessage): Promise<MessageResult> {
    // Validate message structure
    await this.validateMessage(message);
    
    // Apply security policies
    const secureMessage = await this.securityManager.secureMessage(message);
    
    // Route through protocol stack
    return this.routeMessage(secureMessage);
  }

  private async routeMessage(message: SecureAgentMessage): Promise<MessageResult> {
    try {
      // Pass through each layer in order
      let processedMessage = message;
      
      for (const [layerName, layer] of this.layers) {
        processedMessage = await layer.processOutbound(processedMessage);
      }
      
      // Send via transport layer
      const result = await this.layers.get('transport').send(processedMessage);
      
      return {
        success: true,
        messageId: message.id,
        timestamp: new Date().toISOString(),
        result
      };
    } catch (error) {
      return {
        success: false,
        messageId: message.id,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
```

### Message Format Specification

```typescript
// Future: src/kos/protocols/messages/AgentMessage.ts
export interface AgentMessage {
  // Core message identification
  id: string; // UUID v4
  version: string; // Protocol version (e.g., "1.0.0")
  timestamp: string; // ISO 8601 timestamp
  
  // Routing information
  from: AgentIdentity;
  to: AgentIdentity | AgentGroup;
  route?: RouteHint[];
  
  // Message classification
  type: MessageType;
  priority: MessagePriority;
  ttl?: number; // Time to live in seconds
  
  // Content and metadata
  payload: MessagePayload;
  metadata: MessageMetadata;
  
  // Security and verification
  signature?: string;
  encryption?: EncryptionInfo;
  
  // Delivery and acknowledgment
  requiresAck: boolean;
  correlationId?: string;
  replyTo?: AgentIdentity;
}

export enum MessageType {
  // Basic communication
  PING = 'ping',
  PONG = 'pong',
  
  // Task coordination
  TASK_REQUEST = 'task_request',
  TASK_RESPONSE = 'task_response',
  TASK_UPDATE = 'task_update',
  TASK_CANCEL = 'task_cancel',
  
  // Capability management
  CAPABILITY_QUERY = 'capability_query',
  CAPABILITY_RESPONSE = 'capability_response',
  CAPABILITY_ANNOUNCE = 'capability_announce',
  
  // Agent lifecycle
  AGENT_REGISTER = 'agent_register',
  AGENT_UNREGISTER = 'agent_unregister',
  AGENT_HEARTBEAT = 'agent_heartbeat',
  
  // Trust and security
  TRUST_REQUEST = 'trust_request',
  TRUST_RESPONSE = 'trust_response',
  TRUST_UPDATE = 'trust_update',
  
  // System coordination
  SYSTEM_EVENT = 'system_event',
  SYSTEM_COMMAND = 'system_command',
  SYSTEM_STATUS = 'system_status',
  
  // Custom application messages
  CUSTOM = 'custom'
}

export enum MessagePriority {
  CRITICAL = 0,  // System-critical messages
  HIGH = 1,      // High priority tasks
  NORMAL = 2,    // Standard messages
  LOW = 3,       // Background tasks
  BULK = 4       // Bulk data transfer
}

export interface AgentIdentity {
  id: string;           // Unique agent identifier
  type: AgentType;      // Agent classification
  instance?: string;    // Instance identifier for multi-instance agents
  domain?: string;      // Domain or namespace
  publicKey?: string;   // Public key for verification
}

export interface MessagePayload {
  data: any;                    // Primary message content
  format: PayloadFormat;        // Data format specification
  encoding?: string;            // Content encoding (gzip, etc.)
  schema?: string;              // Schema identifier for validation
  attachments?: Attachment[];   // File or binary attachments
}

export interface MessageMetadata {
  tags: string[];               // Searchable tags
  context: Record<string, any>; // Contextual information
  trace: TraceInfo[];           // Message trace for debugging
  metrics: MessageMetrics;      // Performance and delivery metrics
}
```

## Kind Link Protocol (KLP) Implementation

### Core KLP Engine

```typescript
// Future: src/kos/protocols/klp/KLPEngine.ts
export class KLPEngine {
  private identity: AgentIdentity;
  private keyManager: KeyManager;
  private trustManager: TrustManager;
  private routingTable: RoutingTable;
  private messageStore: MessageStore;
  private eventEmitter: EventEmitter;

  constructor(config: KLPConfig) {
    this.identity = config.identity;
    this.keyManager = new KeyManager(config.keys);
    this.trustManager = new TrustManager(config.trust);
    this.routingTable = new RoutingTable(config.routing);
    this.messageStore = new MessageStore(config.storage);
    this.eventEmitter = new EventEmitter();
  }

  async initializeProtocol(): Promise<void> {
    // Load agent identity and keys
    await this.keyManager.initialize();
    
    // Load trust relationships
    await this.trustManager.loadTrustGraph();
    
    // Initialize routing table
    await this.routingTable.initialize();
    
    // Start protocol services
    await this.startServices();
  }

  async sendMessage(
    to: AgentIdentity,
    payload: MessagePayload,
    options: SendOptions = {}
  ): Promise<SendResult> {
    // Create message envelope
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      version: KLP_VERSION,
      timestamp: new Date().toISOString(),
      from: this.identity,
      to,
      type: options.type || MessageType.CUSTOM,
      priority: options.priority || MessagePriority.NORMAL,
      payload,
      metadata: {
        tags: options.tags || [],
        context: options.context || {},
        trace: [],
        metrics: {
          createdAt: Date.now(),
          size: this.calculateMessageSize(payload)
        }
      },
      requiresAck: options.requiresAck || false
    };

    // Apply security if required
    if (options.encrypt || this.trustManager.requiresEncryption(to)) {
      message.encryption = await this.encryptMessage(message, to);
    }

    if (options.sign || this.trustManager.requiresSignature(to)) {
      message.signature = await this.signMessage(message);
    }

    // Route and send message
    return this.routeAndSend(message);
  }

  async receiveMessage(message: AgentMessage): Promise<void> {
    try {
      // Validate message structure
      await this.validateMessage(message);
      
      // Verify security if present
      if (message.signature) {
        await this.verifySignature(message);
      }
      
      if (message.encryption) {
        message = await this.decryptMessage(message);
      }
      
      // Check trust level
      const trustLevel = await this.trustManager.getTrustLevel(message.from);
      if (trustLevel < this.getRequiredTrustLevel(message.type)) {
        throw new Error(`Insufficient trust level for message type ${message.type}`);
      }
      
      // Store message if required
      if (this.shouldStoreMessage(message)) {
        await this.messageStore.store(message);
      }
      
      // Send acknowledgment if required
      if (message.requiresAck) {
        await this.sendAcknowledgment(message);
      }
      
      // Process message
      await this.processMessage(message);
      
    } catch (error) {
      await this.handleMessageError(message, error);
    }
  }

  private async routeAndSend(message: AgentMessage): Promise<SendResult> {
    // Find route to destination
    const route = await this.routingTable.findRoute(message.to);
    
    if (!route) {
      throw new Error(`No route found to ${message.to.id}`);
    }
    
    // Add routing information
    message.route = route.hops;
    
    // Send via appropriate transport
    const transport = this.getTransport(route.transport);
    const result = await transport.send(message);
    
    // Track message for delivery confirmation
    if (message.requiresAck) {
      this.trackMessage(message.id, result);
    }
    
    return result;
  }

  private async processMessage(message: AgentMessage): Promise<void> {
    // Emit event for message handlers
    this.eventEmitter.emit('message', message);
    
    // Handle system messages
    switch (message.type) {
      case MessageType.PING:
        await this.handlePing(message);
        break;
      case MessageType.CAPABILITY_QUERY:
        await this.handleCapabilityQuery(message);
        break;
      case MessageType.TRUST_REQUEST:
        await this.handleTrustRequest(message);
        break;
      default:
        // Forward to application layer
        this.eventEmitter.emit(`message:${message.type}`, message);
    }
  }
}
```

### Trust Management System

```typescript
// Future: src/kos/protocols/trust/TrustManager.ts
export class TrustManager {
  private trustGraph: TrustGraph;
  private trustPolicies: TrustPolicy[];
  private reputationEngine: ReputationEngine;
  private challengeManager: ChallengeManager;

  constructor(config: TrustConfig) {
    this.trustGraph = new TrustGraph(config.graph);
    this.trustPolicies = config.policies;
    this.reputationEngine = new ReputationEngine(config.reputation);
    this.challengeManager = new ChallengeManager(config.challenges);
  }

  async getTrustLevel(agent: AgentIdentity): Promise<number> {
    // Get direct trust relationship
    const directTrust = await this.trustGraph.getDirectTrust(agent.id);
    
    if (directTrust) {
      return directTrust.level;
    }
    
    // Calculate transitive trust
    const transitiveTrust = await this.calculateTransitiveTrust(agent);
    
    // Get reputation score
    const reputation = await this.reputationEngine.getReputation(agent.id);
    
    // Combine scores using trust policy
    return this.combineTrustScores(transitiveTrust, reputation);
  }

  async establishTrust(
    agent: AgentIdentity,
    trustLevel: number,
    evidence: TrustEvidence[]
  ): Promise<TrustRelationship> {
    // Validate trust evidence
    for (const evidence_item of evidence) {
      await this.validateEvidence(evidence_item);
    }
    
    // Create trust relationship
    const relationship: TrustRelationship = {
      from: this.identity.id,
      to: agent.id,
      level: trustLevel,
      evidence,
      createdAt: new Date().toISOString(),
      expiresAt: this.calculateExpiry(trustLevel),
      signature: await this.signTrustRelationship(agent, trustLevel)
    };
    
    // Store in trust graph
    await this.trustGraph.addTrustRelationship(relationship);
    
    // Broadcast trust update if configured
    if (this.shouldBroadcastTrust(relationship)) {
      await this.broadcastTrustUpdate(relationship);
    }
    
    return relationship;
  }

  async challengeAgent(agent: AgentIdentity): Promise<ChallengeResult> {
    // Create challenge based on agent capabilities
    const challenge = await this.challengeManager.createChallenge(agent);
    
    // Send challenge to agent
    const response = await this.sendChallenge(agent, challenge);
    
    // Verify response
    const result = await this.challengeManager.verifyResponse(challenge, response);
    
    // Update trust based on result
    if (result.success) {
      await this.increaseTrust(agent, result.score);
    } else {
      await this.decreaseTrust(agent, result.penalty);
    }
    
    return result;
  }

  private async calculateTransitiveTrust(agent: AgentIdentity): Promise<number> {
    // Find trust paths to agent
    const paths = await this.trustGraph.findTrustPaths(this.identity.id, agent.id);
    
    if (paths.length === 0) {
      return 0;
    }
    
    // Calculate trust for each path
    const pathTrusts = paths.map(path => {
      return path.reduce((trust, edge) => trust * edge.level, 1.0);
    });
    
    // Return maximum path trust
    return Math.max(...pathTrusts);
  }
}

export interface TrustRelationship {
  from: string;
  to: string;
  level: number;           // 0.0 to 1.0
  evidence: TrustEvidence[];
  createdAt: string;
  expiresAt?: string;
  signature: string;
  metadata?: Record<string, any>;
}

export interface TrustEvidence {
  type: EvidenceType;
  source: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export enum EvidenceType {
  DIRECT_INTERACTION = 'direct_interaction',
  THIRD_PARTY_ATTESTATION = 'third_party_attestation',
  CAPABILITY_DEMONSTRATION = 'capability_demonstration',
  REPUTATION_SCORE = 'reputation_score',
  CHALLENGE_RESPONSE = 'challenge_response'
}
```

## Agent Discovery and Registration

### Discovery Protocol

```typescript
// Future: src/kos/protocols/discovery/DiscoveryProtocol.ts
export class DiscoveryProtocol {
  private discoveryMethods: DiscoveryMethod[];
  private agentRegistry: AgentRegistry;
  private broadcastManager: BroadcastManager;
  private discoveryCache: DiscoveryCache;

  constructor(config: DiscoveryConfig) {
    this.discoveryMethods = this.initializeDiscoveryMethods(config);
    this.agentRegistry = new AgentRegistry(config.registry);
    this.broadcastManager = new BroadcastManager(config.broadcast);
    this.discoveryCache = new DiscoveryCache(config.cache);
  }

  async discoverAgents(criteria: DiscoveryCriteria): Promise<AgentInfo[]> {
    const results: AgentInfo[] = [];
    
    // Try each discovery method
    for (const method of this.discoveryMethods) {
      if (method.supports(criteria)) {
        try {
          const agents = await method.discover(criteria);
          results.push(...agents);
        } catch (error) {
          console.warn(`Discovery method ${method.name} failed:`, error);
        }
      }
    }
    
    // Deduplicate and validate results
    const uniqueAgents = this.deduplicateAgents(results);
    const validatedAgents = await this.validateDiscoveredAgents(uniqueAgents);
    
    // Cache results
    await this.discoveryCache.store(criteria, validatedAgents);
    
    return validatedAgents;
  }

  async announceAgent(agent: AgentInfo): Promise<void> {
    // Validate agent information
    await this.validateAgentInfo(agent);
    
    // Sign announcement
    const announcement: AgentAnnouncement = {
      agent,
      timestamp: new Date().toISOString(),
      signature: await this.signAnnouncement(agent)
    };
    
    // Broadcast via all available methods
    await this.broadcastManager.broadcast(announcement);
    
    // Register locally
    await this.agentRegistry.register(agent);
  }

  async registerAgent(
    agent: AgentInfo,
    capabilities: AgentCapability[]
  ): Promise<RegistrationResult> {
    try {
      // Validate registration data
      await this.validateRegistration(agent, capabilities);
      
      // Check for conflicts
      const existingAgent = await this.agentRegistry.findById(agent.id);
      if (existingAgent) {
        throw new Error(`Agent ${agent.id} already registered`);
      }
      
      // Create registration record
      const registration: AgentRegistration = {
        agent,
        capabilities,
        registeredAt: new Date().toISOString(),
        status: RegistrationStatus.ACTIVE,
        signature: await this.signRegistration(agent, capabilities)
      };
      
      // Store registration
      await this.agentRegistry.store(registration);
      
      // Announce to network
      await this.announceAgent(agent);
      
      return {
        success: true,
        registrationId: registration.id,
        timestamp: registration.registeredAt
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async queryCapabilities(query: CapabilityQuery): Promise<CapabilityMatch[]> {
    // Search local registry first
    const localMatches = await this.agentRegistry.searchCapabilities(query);
    
    // If insufficient results, query network
    if (localMatches.length < query.minResults) {
      const networkMatches = await this.queryNetworkCapabilities(query);
      localMatches.push(...networkMatches);
    }
    
    // Rank matches by relevance and trust
    const rankedMatches = await this.rankCapabilityMatches(localMatches, query);
    
    return rankedMatches.slice(0, query.maxResults);
  }

  private async queryNetworkCapabilities(
    query: CapabilityQuery
  ): Promise<CapabilityMatch[]> {
    const queryMessage: AgentMessage = {
      id: crypto.randomUUID(),
      version: KLP_VERSION,
      timestamp: new Date().toISOString(),
      from: this.identity,
      to: { id: 'broadcast', type: AgentType.BROADCAST },
      type: MessageType.CAPABILITY_QUERY,
      priority: MessagePriority.NORMAL,
      payload: {
        data: query,
        format: PayloadFormat.JSON
      },
      metadata: {
        tags: ['capability-query'],
        context: {},
        trace: [],
        metrics: { createdAt: Date.now(), size: 0 }
      },
      requiresAck: false
    };
    
    // Broadcast query and collect responses
    const responses = await this.broadcastAndCollect(queryMessage, query.timeout);
    
    // Process responses
    const matches: CapabilityMatch[] = [];
    for (const response of responses) {
      if (response.type === MessageType.CAPABILITY_RESPONSE) {
        matches.push(...response.payload.data.matches);
      }
    }
    
    return matches;
  }
}

export interface DiscoveryCriteria {
  agentType?: AgentType;
  capabilities?: string[];
  domain?: string;
  minTrustLevel?: number;
  maxDistance?: number;
  timeout?: number;
  minResults?: number;
  maxResults?: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  version: string;
  description?: string;
  endpoint: string;
  publicKey: string;
  capabilities: string[];
  metadata: Record<string, any>;
}

export interface AgentCapability {
  name: string;
  version: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
  requirements?: CapabilityRequirement[];
  metadata: Record<string, any>;
}
```

## Message Routing and Transport

### Routing Engine

```typescript
// Future: src/kos/protocols/routing/RoutingEngine.ts
export class RoutingEngine {
  private routingTable: RoutingTable;
  private topologyManager: TopologyManager;
  private loadBalancer: LoadBalancer;
  private failoverManager: FailoverManager;

  constructor(config: RoutingConfig) {
    this.routingTable = new RoutingTable(config.table);
    this.topologyManager = new TopologyManager(config.topology);
    this.loadBalancer = new LoadBalancer(config.loadBalancing);
    this.failoverManager = new FailoverManager(config.failover);
  }

  async findRoute(
    destination: AgentIdentity,
    options: RoutingOptions = {}
  ): Promise<Route | null> {
    // Check for direct route
    const directRoute = await this.routingTable.getDirectRoute(destination.id);
    if (directRoute && this.isRouteViable(directRoute, options)) {
      return directRoute;
    }
    
    // Find multi-hop routes
    const multiHopRoutes = await this.findMultiHopRoutes(destination, options);
    
    if (multiHopRoutes.length === 0) {
      return null;
    }
    
    // Select best route based on criteria
    return this.selectBestRoute(multiHopRoutes, options);
  }

  async updateRoute(route: Route): Promise<void> {
    // Validate route
    await this.validateRoute(route);
    
    // Update routing table
    await this.routingTable.updateRoute(route);
    
    // Notify topology manager
    await this.topologyManager.notifyRouteUpdate(route);
    
    // Broadcast route update if necessary
    if (this.shouldBroadcastRoute(route)) {
      await this.broadcastRouteUpdate(route);
    }
  }

  async handleRouteFailure(route: Route, error: Error): Promise<void> {
    // Mark route as failed
    await this.routingTable.markRouteFailed(route.id, error);
    
    // Find alternative routes
    const alternatives = await this.findAlternativeRoutes(route);
    
    // Update routing table with alternatives
    for (const alternative of alternatives) {
      await this.routingTable.addRoute(alternative);
    }
    
    // Notify failover manager
    await this.failoverManager.handleRouteFailure(route, alternatives);
  }

  private async findMultiHopRoutes(
    destination: AgentIdentity,
    options: RoutingOptions
  ): Promise<Route[]> {
    const routes: Route[] = [];
    const maxHops = options.maxHops || 5;
    const visited = new Set<string>();
    
    // Use Dijkstra's algorithm to find shortest paths
    const queue = new PriorityQueue<RouteCandidate>();
    queue.enqueue({
      destination: this.identity.id,
      hops: [],
      cost: 0,
      latency: 0
    }, 0);
    
    while (!queue.isEmpty() && routes.length < (options.maxRoutes || 10)) {
      const candidate = queue.dequeue();
      
      if (visited.has(candidate.destination)) {
        continue;
      }
      
      visited.add(candidate.destination);
      
      if (candidate.destination === destination.id) {
        routes.push({
          id: crypto.randomUUID(),
          destination: destination.id,
          hops: candidate.hops,
          cost: candidate.cost,
          latency: candidate.latency,
          reliability: this.calculateReliability(candidate.hops),
          lastUpdated: new Date().toISOString()
        });
        continue;
      }
      
      if (candidate.hops.length >= maxHops) {
        continue;
      }
      
      // Find neighbors
      const neighbors = await this.routingTable.getNeighbors(candidate.destination);
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          const newCandidate: RouteCandidate = {
            destination: neighbor.id,
            hops: [...candidate.hops, {
              agentId: neighbor.id,
              transport: neighbor.transport,
              cost: neighbor.cost
            }],
            cost: candidate.cost + neighbor.cost,
            latency: candidate.latency + neighbor.latency
          };
          
          queue.enqueue(newCandidate, newCandidate.cost);
        }
      }
    }
    
    return routes;
  }

  private selectBestRoute(routes: Route[], options: RoutingOptions): Route {
    // Score routes based on criteria
    const scoredRoutes = routes.map(route => ({
      route,
      score: this.scoreRoute(route, options)
    }));
    
    // Sort by score (higher is better)
    scoredRoutes.sort((a, b) => b.score - a.score);
    
    return scoredRoutes[0].route;
  }

  private scoreRoute(route: Route, options: RoutingOptions): number {
    let score = 0;
    
    // Prefer shorter routes
    score += (10 - route.hops.length) * (options.preferShortRoutes ? 2 : 1);
    
    // Prefer lower latency
    score += (1000 - route.latency) / 100 * (options.preferLowLatency ? 2 : 1);
    
    // Prefer higher reliability
    score += route.reliability * 10 * (options.preferReliable ? 2 : 1);
    
    // Prefer lower cost
    score += (100 - route.cost) / 10 * (options.preferLowCost ? 2 : 1);
    
    return score;
  }
}

export interface Route {
  id: string;
  destination: string;
  hops: RouteHop[];
  cost: number;
  latency: number;
  reliability: number;
  lastUpdated: string;
  metadata?: Record<string, any>;
}

export interface RouteHop {
  agentId: string;
  transport: TransportType;
  cost: number;
  metadata?: Record<string, any>;
}

export interface RoutingOptions {
  maxHops?: number;
  maxRoutes?: number;
  preferShortRoutes?: boolean;
  preferLowLatency?: boolean;
  preferReliable?: boolean;
  preferLowCost?: boolean;
  excludeAgents?: string[];
  requireCapabilities?: string[];
}
```

## Security and Encryption

### Security Manager

```typescript
// Future: src/kos/protocols/security/SecurityManager.ts
export class SecurityManager {
  private keyManager: KeyManager;
  private encryptionEngine: EncryptionEngine;
  private signatureEngine: SignatureEngine;
  private securityPolicies: SecurityPolicy[];
  private auditLogger: AuditLogger;

  constructor(config: SecurityConfig) {
    this.keyManager = new KeyManager(config.keys);
    this.encryptionEngine = new EncryptionEngine(config.encryption);
    this.signatureEngine = new SignatureEngine(config.signatures);
    this.securityPolicies = config.policies;
    this.auditLogger = new AuditLogger(config.audit);
  }

  async secureMessage(message: AgentMessage): Promise<SecureAgentMessage> {
    const secureMessage: SecureAgentMessage = { ...message };
    
    // Apply security policies
    const policy = this.getSecurityPolicy(message);
    
    // Encrypt if required
    if (policy.requiresEncryption) {
      secureMessage.encryption = await this.encryptMessage(message);
    }
    
    // Sign if required
    if (policy.requiresSignature) {
      secureMessage.signature = await this.signMessage(message);
    }
    
    // Add security metadata
    secureMessage.securityLevel = policy.level;
    secureMessage.securityMetadata = {
      policyId: policy.id,
      appliedAt: new Date().toISOString(),
      keyId: await this.keyManager.getCurrentKeyId()
    };
    
    // Log security action
    await this.auditLogger.logSecurityAction({
      action: 'message_secured',
      messageId: message.id,
      policyId: policy.id,
      timestamp: new Date().toISOString()
    });
    
    return secureMessage;
  }

  async encryptMessage(message: AgentMessage): Promise<EncryptionInfo> {
    // Get recipient's public key
    const recipientKey = await this.keyManager.getPublicKey(message.to.id);
    
    if (!recipientKey) {
      throw new Error(`No public key found for ${message.to.id}`);
    }
    
    // Generate session key
    const sessionKey = await this.encryptionEngine.generateSessionKey();
    
    // Encrypt payload with session key
    const encryptedPayload = await this.encryptionEngine.encryptWithSessionKey(
      JSON.stringify(message.payload),
      sessionKey
    );
    
    // Encrypt session key with recipient's public key
    const encryptedSessionKey = await this.encryptionEngine.encryptWithPublicKey(
      sessionKey,
      recipientKey
    );
    
    return {
      algorithm: 'AES-256-GCM',
      keyExchange: 'RSA-OAEP',
      encryptedPayload,
      encryptedSessionKey,
      iv: this.encryptionEngine.getLastIV(),
      keyId: recipientKey.id
    };
  }

  async decryptMessage(message: SecureAgentMessage): Promise<AgentMessage> {
    if (!message.encryption) {
      return message;
    }
    
    // Get our private key
    const privateKey = await this.keyManager.getPrivateKey(message.encryption.keyId);
    
    if (!privateKey) {
      throw new Error(`Private key not found for decryption`);
    }
    
    // Decrypt session key
    const sessionKey = await this.encryptionEngine.decryptWithPrivateKey(
      message.encryption.encryptedSessionKey,
      privateKey
    );
    
    // Decrypt payload
    const decryptedPayload = await this.encryptionEngine.decryptWithSessionKey(
      message.encryption.encryptedPayload,
      sessionKey,
      message.encryption.iv
    );
    
    // Parse payload
    const payload = JSON.parse(decryptedPayload);
    
    // Log decryption
    await this.auditLogger.logSecurityAction({
      action: 'message_decrypted',
      messageId: message.id,
      timestamp: new Date().toISOString()
    });
    
    return {
      ...message,
      payload
    };
  }

  async signMessage(message: AgentMessage): Promise<string> {
    // Create canonical message representation
    const canonicalMessage = this.canonicalizeMessage(message);
    
    // Get signing key
    const signingKey = await this.keyManager.getSigningKey();
    
    // Create signature
    const signature = await this.signatureEngine.sign(canonicalMessage, signingKey);
    
    // Log signing action
    await this.auditLogger.logSecurityAction({
      action: 'message_signed',
      messageId: message.id,
      keyId: signingKey.id,
      timestamp: new Date().toISOString()
    });
    
    return signature;
  }

  async verifySignature(message: SecureAgentMessage): Promise<boolean> {
    if (!message.signature) {
      return false;
    }
    
    // Get sender's public key
    const publicKey = await this.keyManager.getPublicKey(message.from.id);
    
    if (!publicKey) {
      throw new Error(`No public key found for ${message.from.id}`);
    }
    
    // Create canonical message representation (without signature)
    const messageWithoutSignature = { ...message };
    delete messageWithoutSignature.signature;
    const canonicalMessage = this.canonicalizeMessage(messageWithoutSignature);
    
    // Verify signature
    const isValid = await this.signatureEngine.verify(
      canonicalMessage,
      message.signature,
      publicKey
    );
    
    // Log verification
    await this.auditLogger.logSecurityAction({
      action: 'signature_verified',
      messageId: message.id,
      valid: isValid,
      timestamp: new Date().toISOString()
    });
    
    return isValid;
  }

  private getSecurityPolicy(message: AgentMessage): SecurityPolicy {
    // Find applicable security policy
    for (const policy of this.securityPolicies) {
      if (this.policyApplies(policy, message)) {
        return policy;
      }
    }
    
    // Return default policy
    return this.getDefaultSecurityPolicy();
  }

  private policyApplies(policy: SecurityPolicy, message: AgentMessage): boolean {
    // Check message type
    if (policy.messageTypes && !policy.messageTypes.includes(message.type)) {
      return false;
    }
    
    // Check agent types
    if (policy.agentTypes && !policy.agentTypes.includes(message.from.type)) {
      return false;
    }
    
    // Check priority
    if (policy.minPriority && message.priority > policy.minPriority) {
      return false;
    }
    
    // Check destination
    if (policy.destinations && !policy.destinations.includes(message.to.id)) {
      return false;
    }
    
    return true;
  }

  private canonicalizeMessage(message: Partial<AgentMessage>): string {
    // Create deterministic string representation
    const canonicalFields = {
      id: message.id,
      version: message.version,
      timestamp: message.timestamp,
      from: message.from,
      to: message.to,
      type: message.type,
      payload: message.payload
    };
    
    return JSON.stringify(canonicalFields, Object.keys(canonicalFields).sort());
  }
}

export interface SecurityPolicy {
  id: string;
  name: string;
  level: SecurityLevel;
  requiresEncryption: boolean;
  requiresSignature: boolean;
  messageTypes?: MessageType[];
  agentTypes?: AgentType[];
  minPriority?: MessagePriority;
  destinations?: string[];
  metadata?: Record<string, any>;
}

export enum SecurityLevel {
  PUBLIC = 0,
  INTERNAL = 1,
  CONFIDENTIAL = 2,
  SECRET = 3,
  TOP_SECRET = 4
}

export interface EncryptionInfo {
  algorithm: string;
  keyExchange: string;
  encryptedPayload: string;
  encryptedSessionKey: string;
  iv: string;
  keyId: string;
}
```

## Performance and Monitoring

### Performance Monitor

```typescript
// Future: src/kos/protocols/monitoring/PerformanceMonitor.ts
export class PerformanceMonitor {
  private metricsCollector: MetricsCollector;
  private performanceAnalyzer: PerformanceAnalyzer;
  private alertManager: AlertManager;
  private dashboardManager: DashboardManager;

  constructor(config: MonitoringConfig) {
    this.metricsCollector = new MetricsCollector(config.metrics);
    this.performanceAnalyzer = new PerformanceAnalyzer(config.analysis);
    this.alertManager = new AlertManager(config.alerts);
    this.dashboardManager = new DashboardManager(config.dashboard);
  }

  async trackMessagePerformance(
    message: AgentMessage,
    startTime: number,
    endTime: number,
    result: MessageResult
  ): Promise<void> {
    const metrics: MessageMetrics = {
      messageId: message.id,
      messageType: message.type,
      priority: message.priority,
      fromAgent: message.from.id,
      toAgent: message.to.id,
      
      // Timing metrics
      duration: endTime - startTime,
      queueTime: message.metadata.metrics.queueTime || 0,
      processingTime: message.metadata.metrics.processingTime || 0,
      networkTime: message.metadata.metrics.networkTime || 0,
      
      // Size metrics
      payloadSize: message.metadata.metrics.size,
      totalSize: this.calculateTotalMessageSize(message),
      
      // Result metrics
      success: result.success,
      errorType: result.error ? this.classifyError(result.error) : null,
      
      // Context
      timestamp: new Date().toISOString(),
      routeHops: message.route?.length || 0,
      securityLevel: message.securityLevel || SecurityLevel.PUBLIC
    };
    
    // Collect metrics
    await this.metricsCollector.collect(metrics);
    
    // Analyze performance
    const analysis = await this.performanceAnalyzer.analyze(metrics);
    
    // Check for alerts
    if (analysis.alertConditions.length > 0) {
      await this.alertManager.processAlerts(analysis.alertConditions);
    }
    
    // Update dashboard
    await this.dashboardManager.updateMetrics(metrics);
  }

  async generatePerformanceReport(
    timeRange: TimeRange,
    filters: PerformanceFilters = {}
  ): Promise<PerformanceReport> {
    // Query metrics data
    const metrics = await this.metricsCollector.query(timeRange, filters);
    
    // Generate analysis
    const analysis = await this.performanceAnalyzer.generateReport(metrics);
    
    return {
      timeRange,
      filters,
      summary: {
        totalMessages: metrics.length,
        successRate: this.calculateSuccessRate(metrics),
        averageLatency: this.calculateAverageLatency(metrics),
        throughput: this.calculateThroughput(metrics, timeRange),
        errorRate: this.calculateErrorRate(metrics)
      },
      trends: analysis.trends,
      topPerformers: analysis.topPerformers,
      bottlenecks: analysis.bottlenecks,
      recommendations: analysis.recommendations,
      alerts: await this.alertManager.getAlerts(timeRange)
    };
  }

  async optimizePerformance(): Promise<OptimizationResult> {
    // Analyze current performance
    const currentMetrics = await this.getCurrentMetrics();
    const analysis = await this.performanceAnalyzer.analyze(currentMetrics);
    
    // Generate optimization recommendations
    const recommendations = await this.generateOptimizations(analysis);
    
    // Apply automatic optimizations
    const appliedOptimizations: AppliedOptimization[] = [];
    
    for (const recommendation of recommendations) {
      if (recommendation.autoApply && recommendation.confidence > 0.8) {
        try {
          await this.applyOptimization(recommendation);
          appliedOptimizations.push({
            recommendation,
            applied: true,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          appliedOptimizations.push({
            recommendation,
            applied: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    return {
      analysis,
      recommendations,
      appliedOptimizations,
      estimatedImprovement: this.estimateImprovement(appliedOptimizations)
    };
  }

  private async applyOptimization(
    recommendation: OptimizationRecommendation
  ): Promise<void> {
    switch (recommendation.type) {
      case OptimizationType.ROUTING_OPTIMIZATION:
        await this.optimizeRouting(recommendation);
        break;
      case OptimizationType.CACHING_OPTIMIZATION:
        await this.optimizeCaching(recommendation);
        break;
      case OptimizationType.LOAD_BALANCING:
        await this.optimizeLoadBalancing(recommendation);
        break;
      case OptimizationType.RESOURCE_ALLOCATION:
        await this.optimizeResourceAllocation(recommendation);
        break;
      default:
        throw new Error(`Unknown optimization type: ${recommendation.type}`);
    }
  }
}

export interface MessageMetrics {
  messageId: string;
  messageType: MessageType;
  priority: MessagePriority;
  fromAgent: string;
  toAgent: string;
  
  // Timing
  duration: number;
  queueTime: number;
  processingTime: number;
  networkTime: number;
  
  // Size
  payloadSize: number;
  totalSize: number;
  
  // Result
  success: boolean;
  errorType: string | null;
  
  // Context
  timestamp: string;
  routeHops: number;
  securityLevel: SecurityLevel;
}

export interface PerformanceReport {
  timeRange: TimeRange;
  filters: PerformanceFilters;
  summary: PerformanceSummary;
  trends: PerformanceTrend[];
  topPerformers: AgentPerformance[];
  bottlenecks: PerformanceBottleneck[];
  recommendations: OptimizationRecommendation[];
  alerts: Alert[];
}
```

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Basic message format and envelope structure
- Simple point-to-point communication
- Basic identity and key management
- Local agent registry

### Phase 2: Security and Trust (Months 4-6)
- Encryption and signature implementation
- Trust management system
- Challenge-response protocols
- Security policy enforcement

### Phase 3: Discovery and Routing (Months 7-9)
- Agent discovery protocols
- Multi-hop routing implementation
- Load balancing and failover
- Network topology management

### Phase 4: Advanced Features (Months 10-12)
- Performance monitoring and optimization
- Advanced trust algorithms
- Federation protocols
- Governance integration

## Code References

- Current service coordination: `src/store/serviceStore.ts`
- Message handling: `src/utils/apiClient.ts`
- Configuration management: `src/config/`
- UI communication: `src/components/CapabilityUI.tsx`

## Metrics and KPIs

- **Message Delivery Rate**: Percentage of messages successfully delivered
- **Average Latency**: Mean time for message delivery
- **Trust Score Distribution**: Distribution of trust levels across agents
- **Discovery Success Rate**: Percentage of successful agent discoveries
- **Protocol Compliance**: Adherence to KLP specifications
- **Security Incident Rate**: Number of security violations per time period

---

*This document serves as the definitive specification for agent communication protocols in the kOS ecosystem. All implementation teams must adhere to these specifications to ensure system interoperability and security.* 