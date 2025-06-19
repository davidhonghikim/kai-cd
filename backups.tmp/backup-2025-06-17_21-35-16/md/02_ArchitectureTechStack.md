# 02_ArchitectureTechStack.md
# ChatDemon Architecture and Tech Stack
**Title:** Architecture and Tech Stack

**Architecture:**

ChatDemon is designed as a modular browser extension to minimize complexity and maximize maintainability.

*   **Background Script:** The central component managing the extension lifecycle, service connections, and core functionality.
*   **UI (Vanilla JS/HTML/CSS or React):** The user interface is purposefully lightweight.
*   **Service Connectors:** Individual modules responsible for communicating with specific AI services. Each connector implements a consistent interface for easy integration.
*   **Storage:**
    *   IndexedDB: Used for storing extension settings, service configurations, and potentially cached data.
    *   LocalStorage: Used for smaller pieces of data.
*   **Content Scripts:** (If needed) Inject scripts into the pages hosted in the iframes to enable limited communication or data extraction.

**Data Flow:**

1.  User interacts with the UI.
2.  The UI sends a request to the background script.
3.  The background script routes the request to the appropriate service connector.
4.  The service connector communicates with the remote AI service via its API.
5.  The response is processed by the service connector and returned to the background script.
6.  The background script updates the UI with the response.
7.  Generated artifacts (images, chat logs) are optionally stored.

**Tech Stack:**

*   **JavaScript/HTML/CSS or React**:  For the browser extension UI.
*   **TypeScript**: Enforces strong typing and improves code maintainability.
*   **Node.js/npm**: For build tooling and dependency management.
*   **Vite or Webpack**: For bundling the extension code.
*   **IndexedDB Libraries:** Libraries for working with IndexedDB.

**Security:**

*   Enforce HTTPS for all API communication.
*   Securely store API keys using browser extension storage APIs and encryption.
*   Implement input validation and output sanitization to prevent security vulnerabilities.
*   Carefully manage iframe content and communication to prevent cross-site scripting (XSS) attacks.

**Extensibility:**

*   The modular connector design enables easy integration of new services.