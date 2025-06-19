# 🤝 05: Contributing Guide

We welcome and encourage contributions from the community! The most impactful way to contribute is by adding support for a new AI service. Thanks to the "Rich Service Definition" architecture, this is a very straightforward process.

## How to Add a New AI Service

This is the primary method of contribution. By adding a new service, you make the entire platform more powerful for everyone.

*Goal:* To add a new service, you only need to create one new file and modify one existing file.

### Step 1: Create the Service Definition File

- Navigate to the `src/connectors/definitions/` directory.
- Create a new file named after your service in `camelCase`. For example, for "My AI Service", create `myAiService.ts`.

### Step 2: Define the Service

- Inside your new file, import the necessary types:
    ```typescript
    import type { ServiceDefinition } from '../../types';
    import { SERVICE_CATEGORIES } from '../../config/constants';
    ```
- Create and export a `const` for your service definition. This object is the single source of truth for your service.
    ```typescript
    export const myAiServiceDefinition: ServiceDefinition = {
        type: 'my-ai-service', // A unique, kebab-case ID
        name: 'My AI Service',
        category: SERVICE_CATEGORIES.LLM,
        defaultPort: 1234,
        docs: {
            api: 'https://link.to.your.service/api/docs'
        },
        // ... more fields to come
    };
    ```

### Step 3: Specify Configuration and Authentication

- Tell the user how to run the service and how to authenticate. The UI will use this to guide them.
    ```typescript
    // ... continuing inside your definition object
    configuration: {
        arguments: {
            enableApi: {
                flag: '--enable-api',
                description: 'Enables the JSON API for the service.',
                required: true
            }
        },
        help: {
            instructions: "You must launch the service with the `--enable-api` argument."
        }
    },
    authentication: {
        type: 'api_key',
        keyName: 'X-My-Service-Key',
    },
    // ...
    ```

### Step 4: Define the Service's Capabilities

- This is the most important step. Define what the service can *do*. A capability is a specific function like `llm_chat` or `image_generation`.
- You must define the `endpoints` and the `parameters` for each capability.
- It is **highly recommended** to look at existing, well-defined services for reference:
    - For Image Generation, see `a1111.ts`.
    - For LLM Chat, see `ollama.ts`.

### Step 5: Export The New Definition

- Finally, open `src/connectors/definitions/index.ts`.
- Add a single line to export your new definition file. This makes it visible to the rest of the application.
    ```typescript
    export * from './myAiService';
    ```

That's it! The application will automatically detect your new service and dynamically generate the UI for it. 