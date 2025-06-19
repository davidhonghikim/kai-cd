# 🛠️ 04: Development & Testing

This guide provides instructions for setting up the development environment, running the extension locally, and executing tests.

## Prerequisites

- Node.js: Ensure you have Node.js (v18 or later) and npm installed.
- Google Chrome: You need a Chromium-based browser to test the extension.

## Environment Setup

1.  Clone the Repository:
    ```bash
    git clone https://github.com/your-repo/kai-cd.git
    cd kai-cd
    ```

2.  Install Dependencies:
    Install the project's dependencies using npm.
    ```bash
    npm install
    ```

## Running the Extension Locally

We use Vite to build the extension files and watch for changes.

1.  Start the Development Build:
    Run the `dev` script. This command will compile the source code into the `dist/` directory and watch for changes.
    ```bash
    npm run dev
    ```

2.  Load the Extension in Chrome:
    - Open Google Chrome and navigate to `chrome://extensions`.
    - Enable "Developer mode" using the toggle in the top-right corner.
    - Click the "Load unpacked" button.
    - Select the `dist` directory from the project root.

3.  Development Workflow:
    - After changing code in `src/`, the dev server will automatically rebuild.
    - To see your changes, you may need to reload the extension from the `chrome://extensions` page. For many UI changes, closing and reopening the popup/sidepanel is sufficient.

## Building for Production

To create an optimized, production-ready build:
```bash
npm run build
```
This will create a `dist/` directory with minified files, ready to be packaged and uploaded to the Chrome Web Store.

## Testing (TBD)

*(This section is a placeholder and will be updated as the testing strategy is implemented.)*

A comprehensive testing strategy will be developed, likely including:
- Unit Tests (Vitest): For testing individual functions and components.
- Integration Tests: To ensure different parts of the extension work together.
- End-to-End (E2E) Tests (Cypress/Playwright): For simulating user interactions in a real browser. 