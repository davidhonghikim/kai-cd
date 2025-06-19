# 18_ServicesAutomation.md
# ChatDemon Service Integration Guide - Automation

**Title:** Service Integration Guide - Automation

**Overview:** This guide details the integration of workflow automation services into ChatDemon.

**Goal:** To allow users to automate tasks and workflows triggered by AI interactions.

**Supported Services:**

*   n8n: Connects to a running n8n instance.
*   Huginn: Connects to a running Huginn instance.
*   Node-RED: Connects to a running Node-RED instance.

*(You will need to determine the specific APIs and workflows that you want to expose from these services)*

**Connector Implementation (Example for n8n):**

```typescript
interface AutomationConnector {
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getWorkflows(): Promise<Workflow[]>;
    executeWorkflow(workflowId: string, data: any): Promise<ExecutionResult>; // Execute and return result
    getSettings(): Promise<AutomationSettings>;
    updateSettings(settings: AutomationSettings): Promise<void>;
    getErrorMessage(): string | null;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
}

interface ExecutionResult {
    status: string; // "success", "failure", etc.
    data: any;       // Result data
}

interface AutomationSettings {
    url: string;       // N8N URL (e.g., "http://localhost:5678")
    apiKey?: string;     // API key for authentication
}

Implementation Notes:
n8n Connector:
Connects to the n8n API.
Allows listing available workflows.
Allows triggering workflows with data from the ChatDemon UI (e.g., the LLM response).
Receives the workflow execution status and results.
Huginn and Node-RED Connectors:
Implement similar connection and execution patterns appropriate to each service.
Default Configurations:
n8n:
ID: n8n
Name: n8n Automation
URL: http://localhost:5678 (default)
API Key: (Optional - depends on n8n instance)
Active: false
(Details on n8n API endpoints)
Workflow for Triggering Automation (for Coding Agent):
The user configures an automation trigger action
When triggered, the prompt data and relevant information will pass onto the workflow action
The background script retrieves the appropriate Automation Connector.
The connector sends any relevant options to the service's API (or communicates with the service's UI via iframes).
The service will execute the action and return to the connector
The workflow will be updated.
Error Handling:
Implement robust error handling to catch connection errors, API errors, and workflow execution failures.
Security Considerations:
Implement validation for any input you put to the tool.