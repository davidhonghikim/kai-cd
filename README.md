# Kai-CD: The Developer's AI Command Deck

Kai-CD is a browser extension that acts as a unified command center for interacting with a diverse ecosystem of local and remote AI services. It's designed for developers, researchers, and power users who work with multiple AI models and tools, eliminating the need to juggle various UIs and APIs.

![Kai-CD Screenshot (to be added)]()

## Core Features

-   **Unified Interface:** Manage and interact with LLMs (Ollama, OpenAI), Image Generation models (Stable Diffusion, ComfyUI), Vector Databases (Chroma, Qdrant), and more from a single, intuitive UI.
-   **Dynamic & Extensible:** The UI is dynamically generated from "Service Definitions." Adding support for a new service is as simple as creating a new definition file.
-   **Rich Parameter Control:** A powerful and consistent UI for adjusting API parameters for any service.
-   **State Management:** Securely saves your service configurations and connections in your browser's local storage.
-   **Developer-Focused:** Includes a built-in logging console, bug report generator, and detailed troubleshooting guides.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   A Chromium-based browser (Google Chrome, Brave, etc.)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/kai-cd.git
    cd kai-cd
    ```
    *(Note: Replace the URL with the actual repository URL when available.)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This command builds the extension and watches for changes.
    ```bash
    npm run dev
    ```

4.  **Load the extension in your browser:**
    -   Navigate to `chrome://extensions`.
    -   Enable "Developer mode".
    -   Click "Load unpacked" and select the `dist` directory from the project folder.

## How It Works

The core of Kai-CD is the "Rich Service Definition" architecture. Each supported service is defined by a single TypeScript file that contains all the information the application needs to generate a UI, construct API calls, and handle authentication. This makes the system incredibly modular and easy for anyone to extend.

## Contributing

Contributions are welcome! The best way to contribute is by adding a new Service Definition. See the documentation in the `documentation/developers` directory for a detailed guide.
