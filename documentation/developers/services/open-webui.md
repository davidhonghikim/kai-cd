# Open WebUI Service Documentation

This document provides a detailed overview of the integration between Kai-CD and Open WebUI. Open WebUI serves as a versatile user interface for various Large Language Model (LLM) backends and exposes its own OpenAI-compatible API.

-   **GitHub Repository:** [https://github.com/open-webui/open-webui](https://github.com/open-webui/open-webui)
-   **Official API Documentation:** [Open WebUI Local OpenAI API Server Docs](https://docs.openwebui.com/api/local-openai-api-server)

## Capabilities & Endpoints

### 1. LLM Chat (`LlmChatCapability`)

-   **Endpoint:** `POST /v1/chat/completions`
-   **Description:** This is the primary endpoint for conversational AI. It is designed to be compatible with the OpenAI Chat Completions API standard.
-   **Parameters:**
    -   `model`: The model to use for the chat (e.g., `llama3:8b`). This list is loaded dynamically.
    -   `system_prompt`: A prompt to guide the model's behavior and personality.
    -   `temperature`: Controls randomness (0.0 to 2.0).
    -   `top_p`: Controls nucleus sampling.
    -   `max_tokens`: The maximum number of tokens to generate.
    -   `seed`: A seed for deterministic outputs.

### 2. Model Management (`ModelManagementCapability`)

-   **Endpoint:** `GET /v1/models`
-   **Description:** This endpoint retrieves the list of all models available to the Open WebUI instance, which is then used to populate the `model` dropdown in the chat view.

### 3. Health (`HealthCapability`)

-   **Endpoint:** `GET /health`
-   **Description:** A simple endpoint to check if the Open WebUI server is online and reachable. This is used for the status indicator in Kai-CD.

### 4. Storage / RAG (`StorageCapability`)

-   **Endpoint:** `POST /api/v1/files/`
-   **Description:** This endpoint is for uploading documents to be used with Open WebUI's Retrieval-Augmented Generation (RAG) features.
-   **Current Status:** This capability is a **placeholder** for future development. While the endpoint is defined, there is currently no UI in Kai-CD to upload files to Open WebUI. Implementing this would allow users to manage knowledge bases directly from Kai-CD.

## Authentication

The integration is configured to use **Bearer Token** authentication.

-   **Why:** Many Open WebUI instances are configured to require user login. After a user logs in via the web interface, the browser is issued a JWT token. This same token must be provided as a Bearer token in the `Authorization` header for all subsequent API requests.
-   **How to get the token:** If your Open WebUI instance requires login, you can obtain this token by:
    1.  Logging into Open WebUI in your browser.
    2.  Opening the browser's Developer Tools (usually F12).
    3.  Going to the "Network" tab.
    4.  Finding a recent API request (e.g., to `/v1/models`).
    5.  Inspecting the "Request Headers" and copying the entire value from the `Authorization` header (it will start with `Bearer ey...`).
    6.  Pasting this full value into the "Token" field when configuring the service in Kai-CD. 