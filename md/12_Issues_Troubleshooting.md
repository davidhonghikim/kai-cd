# 🔧 Issues & Troubleshooting

This document is a living log of known issues, potential challenges, and troubleshooting steps for common problems.

## ❗ Known Issues

- (None at this time)
    - This section should be updated as bugs are identified.

## 🧠 Potential Challenges & Architectural Hurdles

This section outlines foreseeable challenges that will require careful thought and implementation.

#### 1. Complex Capability: ComfyUI Graph Execution
- Challenge: The ComfyUI API is not a simple request-response model. It requires constructing a "workflow" or "graph" in a specific JSON format.
- Implication: This will require a new `Capability` type, `graph_execution`, and a UI for managing graph workflows.

#### 2. State Management for Dynamic UI
- Challenge: The UI is generated dynamically from service definitions. Managing the state for a form that can have any number and type of inputs can be complex.
- Implication: Requires a robust state management solution (Zustand is used) and a well-designed structure to hold the form state for the currently active service.

#### 3. Cross-Origin Resource Sharing (CORS)
- Challenge: The extension makes API requests from a `chrome-extension://` origin to `http://localhost`, which browsers block by default.
- Solution: The `ServiceDefinition` for each service must include the correct command-line arguments to launch the service with the proper CORS headers.

#### 4. API Response Variation
- Challenge: The exact structure of API responses differs between services (e.g., A1111's image array vs. OpenAI's chat choices).
- Implication: UI components must be written defensively to handle different response schemas. The application now uses toast notifications to show users what went wrong.

#### 5. Build Tooling and Linter Configuration
- Challenge: The project's linter requires `type`-only imports for TypeScript types (`import type { ... } from '...'`).
- Implication: Forgetting `import type` will cause the build to fail.

## 🛠️ Troubleshooting

### "Failed to fetch" or "CORS" Error in Browser Console

- Symptom: You try to interact with a service and see a network error in the developer console related to CORS. A toast notification will also appear, displaying the "Failed to fetch" message.
- Cause: The target AI service (e.g., A1111, Ollama) was not started with the necessary flags to allow requests from other origins.
- Fix:
    1.  Stop the AI service.
    2.  Consult the `configuration.help.instructions` for that service within its definition file in `src/connectors/definitions/`.
    3.  Restart the service using the exact command-line arguments specified. 