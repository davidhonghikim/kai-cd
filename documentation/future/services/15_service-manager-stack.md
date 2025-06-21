---
title: "Service Manager Stack and Integration"
description: "Complete service management with registration, routing, and KLP integration"
type: "architecture"
category: "services"
subcategory: "service-management"
context: "kAI/kOS service coordination and KLP integration"
implementation_status: "future"
decision_scope: "system-wide"
complexity: "high"
last_updated: "2025-01-20"
code_references: ["src/services/", "src/klp/", "src/vault/"]
related_documents: ["01_service-architecture.md", "06_klp-protocol-specification.md"]
dependencies: ["KLP protocol", "Vault service", "Service definitions"]
breaking_changes: "None - new service management system"
agent_notes: "Complete service manager with registration, routing, secrets, and KLP integration for modular service coordination"
---

# Service Manager Stack and Integration

## Agent Context

This document specifies the full stack, integration strategies, and protocol specifications for the Kind Service Manager, which handles service registration, routing, secrets, and interaction with the KindLink Protocol (kLP) across kAI and kOS.

**Implementation Guidance**: Use this architecture for implementing comprehensive service management with secure credential handling, dynamic routing, and KLP-based discovery. All service interactions should go through the ServiceManager layer.

## Quick Summary

Central service coordination system handling registration, routing, secrets management, and KLP integration ensuring modular, interchangeable, and secure service interactions.

## I. Purpose

The Service Manager Stack coordinates:
- All local and remote service connectors
- Secure credential vaulting
- API surface normalization
- kLP-based routing and discovery

It ensures that services—whether AI models, vector stores, media generators, or third-party APIs—are modular, interchangeable, and safely routed through the system.

## II. Directory Structure

```typescript
src/
└── services/
    ├── index.ts                        // Entry point for dynamic service loading
    ├── registry/                       // All registered connectors
    │   ├── openai.ts                   // OpenAI service handler
    │   ├── ollama.ts                   // Ollama local runtime
    │   ├── chromadb.ts                 // Chroma DB service
    │   ├── anthropic.ts                // Claude handler
    │   ├── huggingface.ts             // Hugging Face API wrapper
    │   └── ...                         // Other service connectors
    ├── vault/
    │   ├── CredentialManager.ts        // Secure secret interface
    │   └── VaultClient.ts              // Low-level crypto vault client
    ├── dispatcher/
    │   ├── Router.ts                   // Dynamic route resolution (by capability)
    │   └── Middleware.ts               // Middleware hooks for logging, caching, ACL
    └── types/
        ├── ServiceDefinition.ts        // Universal service schema
        ├── CapabilitySchema.ts         // Capability types: chat, gen, vector
        └── AuthSchema.ts               // Auth modes: none, bearer, api_key
```

## III. ServiceDefinition Format

```typescript
interface ServiceDefinition {
  id: string;                         // Unique ID
  name: string;                       // Display name
  description: string;
  baseUrl: string;
  auth: AuthConfig;
  capabilities: Capability[];        // Chat, Vector, Image, Audio, etc.
  isLocal: boolean;                  // Local runtime or remote
  tags?: string[];                   // For grouping, UI filters
  version?: string;
  metadata?: Record<string, any>;
  healthCheck?: {
    endpoint: string;
    interval: number;
    timeout: number;
  };
}

interface AuthConfig {
  type: "none" | "bearer" | "api_key" | "oauth" | "basic";
  headerName?: string;
  tokenPrefix?: string;
  endpoint?: string;
  scope?: string[];
}

// Example service definitions
const openaiService: ServiceDefinition = {
  id: "openai",
  name: "OpenAI",
  description: "OpenAI GPT models and embeddings",
  baseUrl: "https://api.openai.com/v1",
  auth: {
    type: "bearer",
    headerName: "Authorization",
    tokenPrefix: "Bearer"
  },
  capabilities: [
    {
      type: "chat",
      endpoints: { chat: "/chat/completions", models: "/models" },
      parameters: ["temperature", "max_tokens", "top_p"]
    },
    {
      type: "embeddings",
      endpoints: { embed: "/embeddings" },
      parameters: ["model", "input"]
    }
  ],
  isLocal: false,
  tags: ["llm", "embeddings", "commercial"],
  version: "1.0.0",
  healthCheck: {
    endpoint: "/models",
    interval: 60000,
    timeout: 5000
  }
};

const ollamaService: ServiceDefinition = {
  id: "ollama",
  name: "Ollama",
  description: "Local LLM runtime",
  baseUrl: "http://localhost:11434",
  auth: { type: "none" },
  capabilities: [
    {
      type: "chat",
      endpoints: { chat: "/api/generate", models: "/api/tags" },
      parameters: ["temperature", "num_predict", "top_k", "top_p"]
    }
  ],
  isLocal: true,
  tags: ["llm", "local", "privacy"],
  version: "1.0.0"
};
```

## IV. Capability Types

```typescript
// CapabilitySchema.ts
export type Capability = ChatCapability | VectorCapability | ImageGenCapability | EmbeddingCapability | AudioCapability;

interface ChatCapability {
  type: 'chat';
  endpoints: {
    chat: string;
    models: string;
    stream?: string;
  };
  parameters: ChatParameter[];
  streaming?: boolean;
  contextWindow?: number;
}

interface VectorCapability {
  type: 'vector';
  endpoints: {
    query: string;
    insert: string;
    delete: string;
    collections?: string;
  };
  dimensions?: number;
  distance?: "cosine" | "euclidean" | "dot";
}

interface ImageGenCapability {
  type: 'image_gen';
  endpoints: {
    generate: string;
    models?: string;
  };
  parameters: ImageGenParameter[];
  formats?: string[];
  maxResolution?: { width: number; height: number };
}

interface EmbeddingCapability {
  type: 'embeddings';
  endpoints: {
    embed: string;
    models?: string;
  };
  dimensions: number;
  maxTokens?: number;
}

interface AudioCapability {
  type: 'audio';
  endpoints: {
    transcribe?: string;
    synthesize?: string;
  };
  formats?: string[];
  languages?: string[];
}

// Parameter definitions
interface ChatParameter {
  name: string;
  type: "number" | "string" | "boolean" | "array";
  default?: any;
  min?: number;
  max?: number;
  options?: any[];
  description?: string;
}

interface ImageGenParameter {
  name: string;
  type: "number" | "string" | "boolean";
  default?: any;
  description?: string;
}
```

## V. Credential Security Layer

```typescript
interface CredentialEntry {
  serviceId: string;
  type: AuthConfig['type'];
  value: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
}

class CredentialManager {
  private vault: VaultClient;
  
  constructor(vault: VaultClient) {
    this.vault = vault;
  }
  
  async store(serviceId: string, credential: Omit<CredentialEntry, 'serviceId' | 'createdAt'>): Promise<void> {
    const entry: CredentialEntry = {
      serviceId,
      ...credential,
      createdAt: new Date().toISOString()
    };
    
    await this.vault.store(`service:${serviceId}`, entry);
  }
  
  async get(serviceId: string): Promise<string | null> {
    try {
      const entry = await this.vault.retrieve(`service:${serviceId}`) as CredentialEntry;
      
      // Check expiration
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        await this.vault.delete(`service:${serviceId}`);
        return null;
      }
      
      // Update last used
      entry.lastUsed = new Date().toISOString();
      await this.vault.store(`service:${serviceId}`, entry);
      
      return entry.value;
    } catch (error) {
      return null;
    }
  }
  
  async delete(serviceId: string): Promise<void> {
    await this.vault.delete(`service:${serviceId}`);
  }
  
  async list(): Promise<string[]> {
    const keys = await this.vault.listKeys();
    return keys
      .filter(key => key.startsWith('service:'))
      .map(key => key.replace('service:', ''));
  }
}

// Usage Example
const credentialManager = new CredentialManager(vault);

// Store credentials
await credentialManager.store('openai', {
  type: 'bearer',
  value: 'sk-...',
  metadata: { created_by: 'user', environment: 'production' }
});

// Retrieve credentials (returns decrypted token if authorized)
const token = await credentialManager.get('openai');
```

## VI. Router Resolution Flow

```typescript
interface RouteRequest {
  capability: string;
  serviceId?: string;
  preferences?: {
    local?: boolean;
    cost?: "low" | "medium" | "high";
    latency?: "low" | "medium" | "high";
    privacy?: "low" | "medium" | "high";
  };
  fallback?: boolean;
}

interface RouteResult {
  service: ServiceDefinition;
  endpoint: string;
  auth?: {
    type: string;
    token: string;
  };
  metadata: {
    isLocal: boolean;
    estimatedCost?: number;
    estimatedLatency?: number;
  };
}

class ServiceRouter {
  private services: Map<string, ServiceDefinition> = new Map();
  private credentialManager: CredentialManager;
  private healthChecker: HealthChecker;
  
  constructor(credentialManager: CredentialManager) {
    this.credentialManager = credentialManager;
    this.healthChecker = new HealthChecker();
  }
  
  async route(request: RouteRequest): Promise<RouteResult> {
    // 1. Find services with required capability
    const candidates = this.findCapableServices(request.capability);
    
    // 2. Filter by preferences
    const filtered = this.filterByPreferences(candidates, request.preferences);
    
    // 3. Check health and availability
    const healthy = await this.filterHealthy(filtered);
    
    // 4. Select best match
    const selected = this.selectBest(healthy, request.preferences);
    
    if (!selected) {
      throw new Error(`No available service for capability: ${request.capability}`);
    }
    
    // 5. Get credentials and prepare auth
    const auth = await this.prepareAuth(selected);
    
    // 6. Get capability endpoint
    const capability = selected.capabilities.find(c => c.type === request.capability);
    const endpoint = this.resolveEndpoint(selected, capability);
    
    return {
      service: selected,
      endpoint,
      auth,
      metadata: {
        isLocal: selected.isLocal,
        estimatedCost: this.estimateCost(selected),
        estimatedLatency: this.estimateLatency(selected)
      }
    };
  }
  
  private findCapableServices(capability: string): ServiceDefinition[] {
    return Array.from(this.services.values())
      .filter(service => 
        service.capabilities.some(cap => cap.type === capability)
      );
  }
  
  private filterByPreferences(services: ServiceDefinition[], preferences?: RouteRequest['preferences']): ServiceDefinition[] {
    if (!preferences) return services;
    
    return services.filter(service => {
      if (preferences.local !== undefined && service.isLocal !== preferences.local) {
        return false;
      }
      
      // Additional filtering logic based on cost, latency, privacy preferences
      return true;
    });
  }
  
  private async filterHealthy(services: ServiceDefinition[]): Promise<ServiceDefinition[]> {
    const healthChecks = await Promise.allSettled(
      services.map(service => this.healthChecker.check(service))
    );
    
    return services.filter((_, index) => 
      healthChecks[index].status === 'fulfilled' && 
      (healthChecks[index] as PromiseFulfilledResult<boolean>).value
    );
  }
  
  private selectBest(services: ServiceDefinition[], preferences?: RouteRequest['preferences']): ServiceDefinition | null {
    if (services.length === 0) return null;
    if (services.length === 1) return services[0];
    
    // Score services based on preferences
    const scored = services.map(service => ({
      service,
      score: this.scoreService(service, preferences)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0].service;
  }
  
  private scoreService(service: ServiceDefinition, preferences?: RouteRequest['preferences']): number {
    let score = 100;
    
    // Prefer local services for privacy
    if (preferences?.privacy === "high" && service.isLocal) score += 20;
    if (preferences?.privacy === "low" && !service.isLocal) score += 10;
    
    // Prefer fast services for low latency
    if (preferences?.latency === "low" && service.isLocal) score += 15;
    
    // Cost considerations (local services are typically "free")
    if (preferences?.cost === "low" && service.isLocal) score += 25;
    
    return score;
  }
  
  private async prepareAuth(service: ServiceDefinition): Promise<RouteResult['auth']> {
    if (service.auth.type === "none") return undefined;
    
    const token = await this.credentialManager.get(service.id);
    if (!token) {
      throw new Error(`No credentials found for service: ${service.id}`);
    }
    
    return {
      type: service.auth.type,
      token
    };
  }
  
  private resolveEndpoint(service: ServiceDefinition, capability: any): string {
    const baseUrl = service.baseUrl.replace(/\/$/, '');
    const path = capability.endpoints[Object.keys(capability.endpoints)[0]];
    return `${baseUrl}${path}`;
  }
}
```

## VII. kLP Integration (KindLink Protocol)

### A. Service Discovery

```typescript
interface KLPServiceAnnouncement {
  serviceId: string;
  host: string;
  capabilities: string[];
  version: string;
  signature: string;
  ttl: number;
  metadata?: Record<string, any>;
}

class KLPServiceDiscovery {
  private klpClient: KLPClient;
  private router: ServiceRouter;
  
  constructor(klpClient: KLPClient, router: ServiceRouter) {
    this.klpClient = klpClient;
    this.router = router;
  }
  
  async announceService(service: ServiceDefinition): Promise<void> {
    const announcement: KLPServiceAnnouncement = {
      serviceId: service.id,
      host: service.baseUrl,
      capabilities: service.capabilities.map(c => c.type),
      version: service.version || "1.0.0",
      signature: await this.signAnnouncement(service),
      ttl: 3600, // 1 hour
      metadata: {
        isLocal: service.isLocal,
        tags: service.tags
      }
    };
    
    await this.klpClient.publish('service:announce', announcement);
  }
  
  async discoverServices(capability?: string): Promise<KLPServiceAnnouncement[]> {
    const announcements = await this.klpClient.query('service:discover', { capability });
    
    // Verify signatures
    const verified = await Promise.all(
      announcements.map(async (announcement) => {
        const isValid = await this.verifyAnnouncement(announcement);
        return isValid ? announcement : null;
      })
    );
    
    return verified.filter(Boolean) as KLPServiceAnnouncement[];
  }
  
  async registerRemoteService(announcement: KLPServiceAnnouncement): Promise<void> {
    const service: ServiceDefinition = {
      id: `remote:${announcement.serviceId}`,
      name: announcement.serviceId,
      description: `Remote service via KLP`,
      baseUrl: announcement.host,
      auth: { type: "none" }, // Will be handled by KLP
      capabilities: announcement.capabilities.map(cap => ({
        type: cap as any,
        endpoints: { [cap]: `/${cap}` }
      })),
      isLocal: false,
      tags: ["remote", "klp"],
      version: announcement.version,
      metadata: announcement.metadata
    };
    
    this.router.registerService(service);
  }
  
  private async signAnnouncement(service: ServiceDefinition): Promise<string> {
    const payload = JSON.stringify({
      serviceId: service.id,
      host: service.baseUrl,
      capabilities: service.capabilities.map(c => c.type),
      timestamp: Date.now()
    });
    
    return await this.klpClient.sign(payload);
  }
  
  private async verifyAnnouncement(announcement: KLPServiceAnnouncement): Promise<boolean> {
    const payload = JSON.stringify({
      serviceId: announcement.serviceId,
      host: announcement.host,
      capabilities: announcement.capabilities,
      timestamp: Date.now() // This should be from the announcement
    });
    
    return await this.klpClient.verify(payload, announcement.signature);
  }
}
```

### B. Federated Service Calls

```typescript
class KLPServiceProxy {
  private klpClient: KLPClient;
  
  async callRemoteService(
    serviceId: string, 
    method: string, 
    params: any
  ): Promise<any> {
    const contract: FederatedAction = {
      actionId: crypto.randomUUID(),
      from: await this.klpClient.getDID(),
      participants: [await this.resolveServiceDID(serviceId)],
      intent: `service:${serviceId}:${method}`,
      scope: {
        permissions: ["service.call"],
        resources: [serviceId],
        constraints: { method, maxRetries: 3 }
      },
      expiry: Date.now() + 60000, // 1 minute
      signatures: []
    };
    
    const signedContract = await this.klpClient.signContract(contract);
    return await this.klpClient.executeContract(signedContract, params);
  }
  
  private async resolveServiceDID(serviceId: string): Promise<DID> {
    // Resolve service ID to DID via KLP registry
    return await this.klpClient.resolve(`service:${serviceId}`);
  }
}
```

## VIII. Middleware Extensions

```typescript
interface MiddlewareHook {
  onRequest?(req: ServiceRequest): Promise<ServiceRequest>;
  onResponse?(res: ServiceResponse): Promise<ServiceResponse>;
  onError?(err: Error, req: ServiceRequest): Promise<Error>;
  filter?(service: ServiceDefinition): boolean;
}

interface ServiceRequest {
  serviceId: string;
  method: string;
  params: any;
  headers: Record<string, string>;
  metadata: Record<string, any>;
}

interface ServiceResponse {
  data: any;
  headers: Record<string, string>;
  status: number;
  metadata: Record<string, any>;
}

class ServiceMiddleware {
  private hooks: MiddlewareHook[] = [];
  
  use(hook: MiddlewareHook): void {
    this.hooks.push(hook);
  }
  
  async processRequest(req: ServiceRequest): Promise<ServiceRequest> {
    let processedReq = req;
    
    for (const hook of this.hooks) {
      if (hook.onRequest) {
        processedReq = await hook.onRequest(processedReq);
      }
    }
    
    return processedReq;
  }
  
  async processResponse(res: ServiceResponse): Promise<ServiceResponse> {
    let processedRes = res;
    
    for (const hook of this.hooks) {
      if (hook.onResponse) {
        processedRes = await hook.onResponse(processedRes);
      }
    }
    
    return processedRes;
  }
  
  async processError(err: Error, req: ServiceRequest): Promise<Error> {
    let processedErr = err;
    
    for (const hook of this.hooks) {
      if (hook.onError) {
        processedErr = await hook.onError(processedErr, req);
      }
    }
    
    return processedErr;
  }
}

// Built-in middleware implementations
class LoggingMiddleware implements MiddlewareHook {
  async onRequest(req: ServiceRequest): Promise<ServiceRequest> {
    console.log(`[${new Date().toISOString()}] Service call: ${req.serviceId}.${req.method}`);
    return req;
  }
  
  async onResponse(res: ServiceResponse): Promise<ServiceResponse> {
    console.log(`[${new Date().toISOString()}] Service response: ${res.status}`);
    return res;
  }
  
  async onError(err: Error): Promise<Error> {
    console.error(`[${new Date().toISOString()}] Service error:`, err.message);
    return err;
  }
}

class RetryMiddleware implements MiddlewareHook {
  constructor(private maxRetries: number = 3, private backoff: number = 1000) {}
  
  async onError(err: Error, req: ServiceRequest): Promise<Error> {
    const retryCount = req.metadata.retryCount || 0;
    
    if (retryCount < this.maxRetries && this.isRetryableError(err)) {
      req.metadata.retryCount = retryCount + 1;
      
      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, this.backoff * Math.pow(2, retryCount))
      );
      
      throw new RetryableError(err.message, req);
    }
    
    return err;
  }
  
  private isRetryableError(err: Error): boolean {
    return err.message.includes('timeout') || 
           err.message.includes('connection') ||
           err.message.includes('502') ||
           err.message.includes('503');
  }
}

class CircuitBreakerMiddleware implements MiddlewareHook {
  private failures: Map<string, number> = new Map();
  private lastFailure: Map<string, number> = new Map();
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  filter(service: ServiceDefinition): boolean {
    const failures = this.failures.get(service.id) || 0;
    const lastFailure = this.lastFailure.get(service.id) || 0;
    
    if (failures >= this.threshold) {
      const timeSinceLastFailure = Date.now() - lastFailure;
      return timeSinceLastFailure > this.timeout;
    }
    
    return true;
  }
  
  async onError(err: Error, req: ServiceRequest): Promise<Error> {
    const current = this.failures.get(req.serviceId) || 0;
    this.failures.set(req.serviceId, current + 1);
    this.lastFailure.set(req.serviceId, Date.now());
    
    return err;
  }
  
  async onResponse(res: ServiceResponse): Promise<ServiceResponse> {
    // Reset failure count on successful response
    if (res.status < 400) {
      this.failures.delete(res.metadata.serviceId);
      this.lastFailure.delete(res.metadata.serviceId);
    }
    
    return res;
  }
}
```

## IX. Service Lifecycle Management

```typescript
interface ServiceStatus {
  id: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  lastCheck: string;
  responseTime?: number;
  errorRate?: number;
  metadata?: Record<string, any>;
}

class ServiceOrchestrator {
  private services: Map<string, ServiceDefinition> = new Map();
  private statuses: Map<string, ServiceStatus> = new Map();
  private middleware: ServiceMiddleware;
  
  constructor(middleware: ServiceMiddleware) {
    this.middleware = middleware;
  }
  
  async registerService(service: ServiceDefinition): Promise<void> {
    this.services.set(service.id, service);
    
    // Initialize status
    this.statuses.set(service.id, {
      id: service.id,
      status: "unknown",
      lastCheck: new Date().toISOString()
    });
    
    // Start health checking if configured
    if (service.healthCheck) {
      this.startHealthCheck(service);
    }
    
    // Announce via KLP if enabled
    if (this.klpEnabled) {
      await this.klpDiscovery.announceService(service);
    }
  }
  
  async unregisterService(serviceId: string): Promise<void> {
    this.services.delete(serviceId);
    this.statuses.delete(serviceId);
    this.stopHealthCheck(serviceId);
  }
  
  async callService(
    serviceId: string, 
    method: string, 
    params: any
  ): Promise<any> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    
    // Check if service is available
    const status = this.statuses.get(serviceId);
    if (status?.status === "unhealthy") {
      throw new Error(`Service unhealthy: ${serviceId}`);
    }
    
    // Create request
    const request: ServiceRequest = {
      serviceId,
      method,
      params,
      headers: {},
      metadata: { timestamp: Date.now() }
    };
    
    try {
      // Process through middleware
      const processedReq = await this.middleware.processRequest(request);
      
      // Make actual service call
      const response = await this.makeServiceCall(service, processedReq);
      
      // Process response through middleware
      const processedRes = await this.middleware.processResponse(response);
      
      return processedRes.data;
    } catch (error) {
      // Process error through middleware
      const processedErr = await this.middleware.processError(error as Error, request);
      throw processedErr;
    }
  }
  
  private async makeServiceCall(
    service: ServiceDefinition, 
    request: ServiceRequest
  ): Promise<ServiceResponse> {
    // Implementation depends on service type and capability
    // This would delegate to specific service connectors
    throw new Error("Not implemented");
  }
  
  private startHealthCheck(service: ServiceDefinition): void {
    if (!service.healthCheck) return;
    
    const interval = setInterval(async () => {
      try {
        const start = Date.now();
        const response = await fetch(
          `${service.baseUrl}${service.healthCheck!.endpoint}`,
          { timeout: service.healthCheck!.timeout }
        );
        
        const responseTime = Date.now() - start;
        const healthy = response.ok;
        
        this.statuses.set(service.id, {
          id: service.id,
          status: healthy ? "healthy" : "degraded",
          lastCheck: new Date().toISOString(),
          responseTime,
          metadata: { httpStatus: response.status }
        });
      } catch (error) {
        this.statuses.set(service.id, {
          id: service.id,
          status: "unhealthy",
          lastCheck: new Date().toISOString(),
          metadata: { error: (error as Error).message }
        });
      }
    }, service.healthCheck.interval);
    
    // Store interval for cleanup
    this.healthCheckIntervals.set(service.id, interval);
  }
}
```

## X. Future Enhancements

| Feature                    | Target Version | Description |
|---------------------------|----------------|-------------|
| Service mesh integration  | v1.5           | Istio/Linkerd integration for microservices |
| Auto-scaling policies     | v1.4           | Automatic service scaling based on load |
| Service versioning        | v1.3           | Blue-green deployments and version management |
| Performance analytics     | v1.2           | Detailed metrics and performance tracking |
| Plugin marketplace        | v2.0           | Community-driven service connector ecosystem |

## XI. Related Documentation

- **Service Architecture**: See `01_service-architecture.md`
- **KLP Protocol**: See `06_klp-protocol-specification.md`
- **Security Framework**: See `02_data-storage-and-security.md`
- **Configuration Management**: See `07_configuration-layers-and-control.md`
