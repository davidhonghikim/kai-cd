# Developer Documentation

This section provides a deep technical dive into the Kai-CD architecture, codebase, and development practices. It's intended for developers who want to contribute to the project or understand its inner workings.

### Index

1.  [**Architecture Overview**](./01_Architecture_Overview.md): A high-level view of the system's design, core principles, and data flow.
2.  [**Project Structure**](./02_Project_Structure.md): A detailed breakdown of the repository's layout and the purpose of each directory.
3.  [**State Management**](./03_State_Management.md): An in-depth explanation of the Zustand-based state management, including store design and data persistence.
4.  [**UI Component Library**](./04_UI_Component_Library.md): A guide to the key React components that make up the user interface.
5.  [**Backend Connectors**](./05_Backend_Connectors.md): A detailed look at the "Rich Service Definition" model and how the application communicates with external APIs.
6.  [**Adding a New Service**](./06_Adding_A_New_Service.md): A practical, step-by-step tutorial for extending the application with a new service.
7.  [**Build and Deployment**](./07_Build_And_Deployment.md): Information on the Vite build process and how to load the extension for development.

### Service-Specific Documentation

-   [**A1111 / Stable Diffusion WebUI**](./services/a1111.md)
-   [**ComfyUI**](./services/comfyui.md)
-   [**Open WebUI**](./services/open-webui.md) 