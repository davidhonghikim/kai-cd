# ✨ 06: Best Practices

This document outlines the best practices for coding, commits, and general development within the Kai-CD project to ensure the codebase remains clean, consistent, and maintainable.

## Code Style & Formatting

- *Follow the Linter:* The project is configured with ESLint and Prettier, which are the single source of truth for code style.
- *Auto-format on Save:* It is highly recommended to configure your IDE to automatically run Prettier on save.
- *TypeScript Best Practices:*
    - Use specific types whenever possible; avoid `any`.
    - Leverage the core types defined in `src/types/index.ts`.
    - Use `const` for variables that are not reassigned.

## Component Design

- *Functional Components:* All React components should be functional components using hooks.
- *Small & Focused:* Keep components small and focused on a single responsibility.
- *State Management:* Use props for passing data down. Lift state up to the nearest common ancestor or use the global Zustand store for global state.

## Naming Conventions

- Components: `PascalCase` (e.g., `ChatInput.tsx`)
- Files (non-components): `camelCase` (e.g., `serviceFactory.ts`)
- Variables & Functions: `camelCase`
- Types & Interfaces: `PascalCase` (e.g., `ServiceDefinition`)
- CSS: Use Tailwind CSS utility classes. Avoid custom CSS where possible.

## Git & Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for a clear and readable commit history.

### Commit Message Format

`<type>(<scope>): <subject>`

- *Type:* `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- *Scope (optional):* The part of the codebase the commit affects (e.g., `connectors`, `ui`).
- *Subject:* A short, imperative-tense description of the change.

### Example Commits

- `feat(connectors): add initial service definition for comfyui`
- `fix(ui): correct slider behavior for CFG scale`
- `docs(agent): create the agent onboarding protocol`
- `refactor(a1111): share parameters between txt2img and img2img` 