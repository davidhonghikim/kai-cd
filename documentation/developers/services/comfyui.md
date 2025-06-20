# ComfyUI Service Documentation

This document provides a detailed overview of the integration between Kai-CD and ComfyUI. Unlike other services with simple REST endpoints, ComfyUI operates on a graph-based system, which requires a more sophisticated integration.

-   **GitHub Repository:** [https://github.com/comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI)
-   **Official API Documentation:** [ComfyUI API Examples](https://github.com/comfyanonymous/ComfyUI_API_Examples)

## Core Concept: Graph Execution

The fundamental difference in ComfyUI is that there is no endpoint for `/txt2img` or `/img2img`. Instead, there is a single, primary endpoint: `/prompt`. This endpoint accepts a complete workflow graph, formatted as JSON, which describes the nodes, their parameters, and the connections between them.

To generate an image, Kai-CD does not simply send parameters; it sends this entire graph object to the ComfyUI backend.

## The `GraphExecutionCapability`

To handle this, the ComfyUI service definition in Kai-CD uses the `GraphExecutionCapability`. This capability has two main components:

1.  **`baseWorkflow`**: A complete, default text-to-image workflow graph that is stored directly within the service definition file.
2.  **`parameterMapping`**: A special object that tells the Kai-CD `apiClient` how to inject the user's parameters from the UI into the `baseWorkflow` JSON before sending it to the ComfyUI server.

### Example: `parameterMapping`

Here is a snippet from the `parameterMapping` in `comfyui.ts`:

```typescript
parameterMapping: {
  prompt: {
    nodeId: "6", 
    inputKey: "text",
    parameterDefinition: { key: 'prompt', ... }
  },
  sd_model_checkpoint: {
    nodeId: "4", 
    inputKey: "ckpt_name",
    parameterDefinition: { key: 'sd_model_checkpoint', ... }
  },
  steps: {
    nodeId: "3", 
    inputKey: "steps",
    parameterDefinition: { key: 'steps', ... }
  },
}
```

This mapping means:
-   Take the value of the `prompt` parameter from the UI and inject it into the `inputs.text` field of the node with ID `6`.
-   Take the value of the `sd_model_checkpoint` parameter and inject it into the `inputs.ckpt_name` field of the node with ID `4`.
-   Take the value of the `steps` parameter and inject it into the `inputs.steps` field of the node with ID `3`.

This declarative mapping allows Kai-CD to manipulate the workflow graph dynamically based on user input.

## Real-time Progress via Websockets

ComfyUI reports all progress—such as loading models, sampling steps, and completion—through a websocket connection, not standard HTTP responses.

-   **Endpoint:** The service definition correctly identifies the `/ws` endpoint for this purpose.
-   **Future Enhancement:** For the user to see real-time progress, the `apiClient` in Kai-CD must be enhanced to establish a websocket connection after submitting a prompt. It will need to listen for progress messages and update the UI accordingly. This is a critical future improvement for a good user experience.

## Dynamic Asset Discovery

The definition uses the `/object_info/{NodeClassName}` endpoint to discover available assets.
-   **Models:** Discovered from the `CheckpointLoaderSimple` node.
-   **Samplers:** Discovered from the `KSampler` node.
-   **VAEs:** Discovered from the `VAELoader` node.

## Future Enhancements

The current implementation provides a functional text-to-image pipeline. Future work will focus on:
1.  **Websocket Client:** Implementing the client-side logic to handle real-time progress updates.
2.  **Workflow Management:** Creating a UI that allows users to import, manage, and select different workflow files (`.json`) instead of only using the hardcoded `baseWorkflow`. This would unlock the full power of ComfyUI.
3.  **Dynamic Node Discovery:** Building a system that can parse the full `/object_info` endpoint to discover all nodes available in a user's ComfyUI instance, allowing Kai-CD to adapt to custom nodes and complex workflows automatically. 