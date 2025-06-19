# Agent Knowledge Base & Troubleshooting

This document is a log of specific, tricky issues that have been solved. It is intended to be a resource for future agents to quickly resolve recurring problems or avoid common pitfalls.

## 1. Build System Issues

### 1.1. `vite build` fails with "is not exported by" error

-   **Symptom:** Running `npm run build` fails with an error message like: `"someDefinition" is not exported by "src/connectors/definitions/some-file.ts", imported by "src/connectors/definitions/all.ts".`

-   **Root Cause:** This error occurs when there is a mismatch between the import and export styles for service definitions. The project standard is to use **named exports** for all service definitions. However, some files may have been created or edited to use `export default`. The central `src/connectors/definitions/all.ts` file, which bundles all definitions, uses named imports and will therefore fail the build if it encounters a default export.

-   **Solution:**
    1.  Identify the file mentioned in the error message (e.g., `some-file.ts`).
    2.  Open that file. You will likely see code like this at the end of the file:
        ```typescript
        const someDefinition: ServiceDefinition = { ... };
        export default someDefinition; 
        ```
    3.  Change this to a named `const` export:
        ```typescript
        export const someDefinition: ServiceDefinition = { ... };
        ```
    4.  The file `src/connectors/definitions/all.ts` must also be checked to ensure it is using a named import for the definition in question:
        ```typescript
        import { someDefinition } from './some-file';
        ```
    5.  Rerun `npm run build`. The error for that file will be resolved. If another error appears for a different file, repeat the process. This systematic approach ensures all definitions adhere to the same standard.

## 2. Dependency & Installation Issues

### 2.1 `npm install` fails with `ERESOLVE` peer dependency conflict

-   **Symptom:** Running `npm install` fails with a long error message about being unable to resolve a peer dependency, specifically mentioning `react-beautiful-dnd` and `react`.
-   **Root Cause:** The `react-beautiful-dnd` library is unmaintained and has a strict peer dependency on React versions `^16.8.5 || ^17.0.0 || ^18.0.0`. This project uses React 19, which falls outside of that range, causing the conflict. Using `--force` or `--legacy-peer-deps` is not a solution as it can lead to critical runtime errors.
-   **Solution:**
    1.  Remove the conflicting package from `package.json`. Delete the lines for `react-beautiful-dnd` and `@types/react-beautiful-dnd` from the `dependencies`.
    2.  Run `npm install` again. It should now succeed.
    3.  Search the codebase for any files that import `react-beautiful-dnd`. In this project, it was `src/components/ServiceManagement.tsx`.
    4.  Remove the import statement and any code that uses the library's components (e.g., `DragDropContext`, `Droppable`, `Draggable`). This will temporarily disable the feature that used it (service reordering), but it is necessary to unblock the project.
    5.  Create a task for a future agent to re-implement the feature with a modern, compatible library.

---
*Add new issues and solutions here as they are discovered.* 