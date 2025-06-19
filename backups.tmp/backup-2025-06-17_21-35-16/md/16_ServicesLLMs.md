# LLM Service Integration Guide

This guide details the integration of various Large Language Model (LLM) services into the ChatDemon extension, providing a unified interface for interacting with LLMs from various providers.

## Supported Service Types

ChatDemon connects to a variety of local and remote AI services. Each service type has a specific connector that knows how to communicate with its API.

### Default Service Configurations

When adding a new service, ChatDemon will suggest a default URL. Here are the standard endpoints for the supported service types. Note that your local setup might use different ports.

| Service Type        | Default URL                      | API Path (if applicable) | Notes                                           |
| ------------------- | -------------------------------- | ------------------------ | ----------------------------------------------- |
| **Ollama**          | `http://localhost:11434`         | `/api/*`                 | Standard for local Ollama instances.            |
| **OpenWebUI**       | `http://localhost:3000`          | N/A (iframe)             | Renders the Web UI directly in a frame.         |
| **A1111**           | `http://localhost:7860`          | `/sdapi/v1/*`            | For Automatic1111 Stable Diffusion Web UI.      |
| **ComfyUI**         | `http://localhost:8188`          | `/`                      | For ComfyUI instances.                          |
| **Llama.cpp**       | `http://localhost:8080`          | `/v1/*`                  | For servers running `llama.cpp` with an API.    |
| **vLLM**            | `http://localhost:8000`          | `/v1/*`                  | For services using the vLLM engine.             |
| **LLM Studio**      | `http://localhost:1234`          | `/v1/*`                  | For the local LLM Studio server.                |
| **OpenAI Compatible** | `https://api.openai.com`       | `/v1/*`                  | For OpenAI or any API that mimics it.           |

### Connector Interfaces

The core logic for communicating with these services is defined by a set of interfaces in the `src/types` directory.

-   **`LLMConnector`**: Defines the methods for chat-based services, such as fetching models and sending messages.
-   **`ImageGenConnector`**: Defines methods for image generation services, such as fetching models/LoRAs and generating images.
-   **`Service`**: The core data structure that represents a configured service, including its URL, name, and authentication details.

### Adding New Services

To add support for a new service type, a new connector implementing one of the above interfaces must be created in the `src/services` directory and integrated into the `getConnector` function in `src/background/main.ts`.