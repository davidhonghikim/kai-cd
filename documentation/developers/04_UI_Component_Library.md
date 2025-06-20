# 4. UI Component Library

This document outlines the most important React components that form the Kai-CD user interface.

## Main Views & Layout

These components define the overall structure of the application.

-   **`Tab.tsx`**: The primary application shell. It renders the main two-column layout, including the far-left navigation rail (for switching between Services, Settings, etc.) and the main content panel. It is the root component for the main `tab.html` page.
-   **`Popup.tsx`**: The root component for the browser action popup. It displays a list of available services and provides buttons to open them in the Tab or Side Panel.
-   **`Sidepanel.tsx`**: The root component for the Chrome Side Panel. It's a simple container that renders the `CapabilityUI` for the currently active service.

## Core Dynamic Components

These components are the heart of the "data-driven UI" philosophy.

-   **`CapabilityUI.tsx`**: This is not a view itself, but a **router**. It takes a `service` object, inspects its `capabilities` array, and uses the `registry` to render the appropriate view component (e.g., `LlmChatView`). This allows the application to support any type of service without changing the core layout.
-   **`capabilities/registry.tsx`**: A simple map that associates a capability string (e.g., `'llm_chat'`) with the React component that can render it. This is the central registry for all "capability views."
-   **`ParameterControl.tsx`**: A generic component that renders the correct form input for a given parameter definition. It uses a `switch` statement on the parameter's `type` (`'string'`, `'number'`, `'boolean'`, `'select'`) to render a text input, a slider, a toggle, or a dropdown menu, respectively. This component is used heavily within capability views.

## Capability Views

These are the specialized, high-level components that provide the UI for a specific AI task. They are rendered by `CapabilityUI`.

-   **`capabilities/LlmChatView.tsx`**: The complete, feature-rich interface for conversational AI. It is composed of smaller components:
    -   **`ChatMessageList.tsx`**: Renders the list of user and assistant messages.
    -   **`ChatInputForm.tsx`**: Provides the text area for user input, including logic for handling submission and a "stop generating" button.
    -   **`ModelSelector.tsx`**: A dropdown for selecting the specific model to use for the chat, powered by the `useModelList` hook.
-   **`capabilities/ImageGenerationView.tsx`**: The interface for text-to-image generation. It includes a prompt input, a gallery for generated images, and a panel for adjusting parameters.
    -   **NOTE:** As identified during the code review, this component has a major architectural flaw: it uses local `useState` for all its state, meaning parameters and generated images are lost when the user navigates away. This is a high-priority item for refactoring.

## Service & Data Management

These components provide the administrative interface for the application.

-   **`ServiceManagement.tsx`**: The main screen for managing services. It displays a list of all configured services and allows the user to add, edit, or delete them. It uses the `ServiceForm` component.
-   **`ServiceForm.tsx`**: A detailed form used for both creating a new service and editing an existing one. It includes fields for name, credentials, and the base URL. It contains complex logic for dynamically generating helper URLs as the user types.
-   **`DataManagement.tsx`**: The view that contains the `ImportExportButtons` and the `BugReportView`, providing a central place for data-related operations.
-   **`ImportExportButtons.tsx`**: Provides buttons to trigger the `backupManager` utility to download a full backup of application data or to upload a backup file to restore from.

## Common Components

-   **`SettingsView.tsx`**: The form for changing global application settings, such as the theme and log level.
-   **`ConsoleLogView.tsx`**: Renders the contents of the `logStore`, providing a live, in-app view of system logs.
-   **`StatusIndicator.tsx`**: A small dot component that displays the health status of a service (green for healthy, red for unhealthy, gray for unknown).
-   **`IFrameView.tsx`**: A generic component used to render a service's external web UI within an `<iframe>`. This is used for services that don't have a native capability UI but provide their own web interface. 