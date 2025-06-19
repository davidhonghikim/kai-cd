# ⌨️ 15: Shortcuts & Commands

This file provides a quick reference for common commands and scripts used in the Kai-CD project.

## `package.json` Scripts

These scripts are run from the root of the project (e.g., `npm run dev`).

- `npm run dev`
  - *Action:* Starts the Vite development server in watch mode.
  - *Use:* This is the primary command for local development.

- `npm run build`
  - *Action:* Creates a production-ready build of the extension.
  - *Use:* Run this when you are ready to package the extension.

- `npm run preview`
  - *Action:* Starts a local server to preview the `dist/` directory.
  - *Use:* Useful for quickly inspecting the build output.

## Other Useful Commands

- `npm install`
  - *Action:* Installs all project dependencies.
  - *Use:* Run this after cloning or pulling changes that modify dependencies.

- `rm -rf dist`
  - *Action:* Deletes the `dist` directory.
  - *Use:* Useful for ensuring a completely clean build.

## Agent Commands

These commands are used to interact with the development agent.

- `/h`: Show help menu.
- `/c`: Continue with the current task.
- `/md reload`: Reload markdown documentation.
- `/g commit "<message>"`: Commit changes to Git.
- `/g push`: Push changes to the remote repository.
- `/b backup`: Create a backup of the project.
- `/sv add_service`: Add a new service connection.
- `/sv update_service`: Update an existing service connection.
- `/sv remove_service`: Remove a service connection.
- `/test unit`: Run unit tests.
- `/test integration`: Run integration tests.
- `/test e2e`: Run end-to-end tests. 