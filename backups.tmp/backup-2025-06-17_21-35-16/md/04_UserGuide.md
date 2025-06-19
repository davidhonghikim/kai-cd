# 04_UserGuide.md
# ChatDemon User Guide
**Title:** User Guide

**Installation:**

*   **For Users:**
    1.  Go to the Chrome/Edge Web Store.
    2.  Search for "ChatDemon".
    3.  Click "Add to Chrome" or "Add to Edge".
    4.  Pin the extension to your toolbar for easy access.
*   **For Developers:**
    1.  Clone the repository: `git clone <repository_url>`
    2.  Install dependencies: `npm install`
    3.  Build the extension: `npm run build`
    4.  Load the `dist/` directory as an unpacked extension in your browser (developer mode).

**Getting Started:**

1.  Open the ChatDemon extension from the browser toolbar.
2.  The settings panel will appear. You'll need to configure your AI service connections.

**Configuration:**

1.  **Adding a Service Connection:**
    *   Click the "Add Service" button.
    *   Select the service type (e.g., OpenWebUI, A1111, ComfyUI).
    *   Enter the required information:
        *   **Name:** A user-friendly name for the service.
        *   **URL:** The base URL of the service (e.g., `http://localhost:3000` for OpenWebUI).
        *   **API Key:** If required, enter the API key for the service.
        *   **Model Selection (if applicable):** Choose the default model to use for the service.
    *   Click "Save".
2.  **Managing Service Connections:**
    *   You can edit or remove existing service connections from the settings panel.
3.  **Side Panel Chat:**
    *   After configuring at least one LLM service, you can use the side panel chat.
    *   Select the desired LLM service and model from the dropdown menus.
    *   Type your prompt in the chat input area and press Enter.
    *   The LLM's response will be displayed in the chat window.
4.  **Full-Function Tabs:**
    *   Click on the tab for a connected service (e.g., OpenWebUI, ComfyUI, A1111).
    *   The full UI of the service will be displayed in an iframe within the tab.
    *   You can interact with the service as you normally would.
5.  **Import/Export Configuration:**
    *   Use the "Export Configuration" button to save your settings to a file.
    *   Use the "Import Configuration" button to load settings from a file.
6.  **Model Bridging:**
    *   To send prompt data from a chat LLM to a media generation model you must configure remote data and send it with valid json.

**Troubleshooting:**

*   If you encounter any issues, refer to the Troubleshooting Guide (09_Troubleshooting.md).