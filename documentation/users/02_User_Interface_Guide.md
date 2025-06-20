# 2. User Interface Guide

This guide provides a tour of the Kai-CD user interface. The extension has three main "surfaces": the Popup, the Side Panel, and the Main Tab.

### 1. The Popup

Clicking the Kai-CD icon in your browser toolbar opens the Popup.

-   **Purpose:** The Popup is a quick launcher. It shows a list of all the services you have configured.
-   **Actions:**
    -   **Tab Button:** Opens the selected service in the full-featured Main Tab view. If a tab is already open, it will be focused and switched to that service.
    -   **Panel Button:** Opens the selected service in the Side Panel for quick access alongside your current webpage.
    -   **Manage Services:** The gear icon at the bottom takes you to the service management screen in the Main Tab.

*(Screenshot of the Popup UI to be added here)*

### 2. The Side Panel

The Side Panel allows you to use an AI service without leaving your current page.

-   **Purpose:** Ideal for quick lookups, summarizing content, or other context-specific tasks.
-   **Functionality:** It provides the core UI for a single service. For example, if you open a chat service, you will see the full chat interface.

*(Screenshot of the Side Panel UI to be added here)*

### 3. The Main Tab

The Main Tab is the primary workspace where all the application's features are available. It has a main navigation rail on the left side to switch between different views.

*(Screenshot of the Main Tab UI to be added here)*

#### Main Navigation Views:

-   **Capability View (Chat/Image Icon):**
    -   This is the default view and where you'll spend most of your time. It shows the UI for the currently active service (e.g., a chat interface or an image generation interface).
    -   The header at the top allows you to switch between your configured services using a dropdown menu.

-   **Service Management (Plug Icon):**
    -   This is where you add, edit, delete, and test your service connections. See the [Managing Services](./03_Managing_Services.md) guide for more details.

-   **Settings (Gear Icon):**
    -   This view allows you to configure global settings for the application.
        -   **Theme:** Change the color scheme (Light, Dark, or System default).
        -   **Log Level:** Adjust the verbosity of logs shown in the Console Log view.

-   **Data Management (Database Icon):**
    -   This view provides tools for managing your application data.
        -   **Import/Export:** You can download a full backup of all your settings and service configurations to a `.json` file. You can later upload this file to restore your state.
        -   **Bug Report:** This tool generates a sanitized `.zip` file containing logs and system information that you can attach to a bug report.

-   **Console Log (Terminal Icon):**
    -   Displays a live feed of application logs. This is useful for troubleshooting issues.

-   **Documentation (Book Icon):**
    -   Shows this documentation, allowing you to read the guides directly within the application. 