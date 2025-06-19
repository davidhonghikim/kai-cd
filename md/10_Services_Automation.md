# 🤖 10: Services - Automation

This document covers the planned integration of automation and workflow services, such as n8n.

*(Note: This is a placeholder document. The features described here are planned but not yet implemented.)*

## Core Capability: `automation`

The goal of this integration is to allow users to trigger and interact with automation workflows defined in external platforms directly from the Kai-CD interface.

### Planned `automation` Capability Schema
- `capability`: `'automation'`
- `endpoints`:
    - `listWorkflows`: Get a list of all available workflows.
    - `getWorkflow`: Get the details and input parameters for a specific workflow.
    - `executeWorkflow`: Trigger a workflow run.
- `parameters`:
    - The parameters for this capability will be highly dynamic. The UI will need to:
        1. Call `listWorkflows` to populate a dropdown.
        2. When a workflow is selected, call `getWorkflow` to retrieve its specific input schema.
        3. Dynamically render a form based on the retrieved schema.

## Planned Integrations
- **n8n:** A popular, open-source, self-hostable workflow automation tool.

## Use Cases
- *Automated Content Pipelines:* Use an LLM in Kai-CD to generate text, then pass it to an n8n workflow that posts it to a blog or social media.
- *Data Processing:* Generate data or images and send them to a workflow that processes and stores them.
- *Triggering Complex Actions:* Use a simple chat command to trigger a complex, multi-step automation in a connected n8n instance. 