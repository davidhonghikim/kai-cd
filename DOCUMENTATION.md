# Kai-cd Project Documentation

This document provides an overview of the Kai-cd Chrome Extension, its architecture, and guidelines for future development.

## 1. Project Overview

Kai-cd is a modular Chrome Extension designed to be a central hub for interacting with a wide range of AI and automation services. It provides a unified interface for managing connections to services like local LLMs (Ollama), cloud-based APIs (OpenAI, Anthropic), image generation tools (A1111, ComfyUI), and more.

The core goal is to create a powerful, user-friendly, and highly extensible platform for developers and power users.

## 2. Architecture: Rich Service Definitions

The foundation of Kai-cd is a "Rich Service Definition" architecture. This architecture is designed for maximum flexibility and scalability, allowing new services to be added with minimal effort and no changes to the core application code.

Each service is defined by a single TypeScript file in `src/connectors/definitions/`. This file exports a `ServiceDefinition` object, which contains all the information the application needs to understand and interact with the service.

### Key Architectural Components:

*   **`ServiceDefinition` (`src/types/index.ts`):** The main interface for a service. It includes:
    *   Basic metadata (`type`, `name`, `category`).
    *   Connection details (`defaultPort`).
    *   Authentication requirements (`authentication`).
    *   A list of `capabilities` that the service provides.

*   **`ServiceCapability` (`src/types/index.ts`):** This is the most powerful concept in the architecture. It's a union type that describes *what a service can do*. Examples include:
    *   `LlmChatCapability`: For conversational AI.
    *   `ImageGenerationCapability`: For text-to-image services.
    *   `ModelManagementCapability`: For browsing and searching model repositories like Civitai.
    *   `AutomationCapability`: For triggering workflows in tools like n8n.
    *   `StorageCapability`: For interacting with file storage services like Dropbox.
    *   `VectorDatabaseCapability`: For services like ChromaDB.
    *   Each capability defines its own set of `endpoints` and `parameters`.

*   **`ParameterDefinition` (`src/types/index.ts`):** This interface allows for the dynamic generation of UI elements. It defines everything needed to render a form field for a service parameter, including its `type` (string, number, select), default value, and even an `optionsEndpoint` to populate dropdowns directly from the service's API (e.g., fetching a list of models).

## 3. Current Progress: Implemented Services

The following service definitions have been implemented:

| Service | Category | Capabilities |
| :--- | :--- | :--- |
| **A1111 WebUI** | Image Generation | `ImageGenerationCapability` |
| **Anthropic** | LLM | `LlmChatCapability` |
| **ChromaDB** | Vector Database | `VectorDatabaseCapability` |
| **Civitai** | Model Management | `ModelManagementCapability` |
| **ComfyUI** | Image Generation | `ImageGenerationCapability` |
| **Dropbox** | Storage | `StorageCapability` |
| **Hugging Face**| LLM | `LlmChatCapability`, `ImageGenerationCapability` |
| **n8n** | Automation | `AutomationCapability` |
| **Ollama** | LLM | `LlmChatCapability` |
| **OpenAI** | LLM | `LlmChatCapability`, `LangChainCapability` |

## 4. How to Add a New Service

Adding a new service is simple:

1.  **Create a Definition File:** Create a new file, `[service-name].ts`, inside `src/connectors/definitions/`.
2.  **Define the Service:** Import `ServiceDefinition` and other necessary types. Create and export a `[serviceName]Definition` constant.
3.  **Choose Capabilities:** Select the appropriate capabilities for the service (e.g., `LlmChatCapability`). If a new type of capability is needed, define it first in `src/types/index.ts`.
4.  **Define Endpoints & Parameters:** Fill in the `endpoints` and `parameters` for each capability based on the service's API documentation.
5.  **Update ServiceType:** Add the new service's `type` string to the `ServiceType` union in `src/types/index.ts`. 