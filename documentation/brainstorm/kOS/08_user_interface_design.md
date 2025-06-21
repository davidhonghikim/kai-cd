# 08: User Interface Design and Theming (kAI / kOS)

This document defines the full UI architecture, styling system, user theming logic, layout hierarchy, and reusable components for the KindAI (kAI) system UI and the broader kindOS (kOS) interfaces.

---

## I. UI System Overview

### A. Framework & Tooling

- **React 18+** with TypeScript
- **Tailwind CSS** for atomic styling and design tokens
- **ShadCN/UI** components (customized)
- **Framer Motion** for animations and transitions
- **Heroicons & Lucide** for iconography
- **Theme Management** via Tailwind + context providers
- **Optional NativeScript Bridge** for mobile wrappers (future)

### B. Rendering Targets

- `tab.html` — Full-page browser extension panel
- `popup.html` — Extension popup view
- `sidepanel.html` — Chrome side panel injection
- `web.html` — Embedded iframe (for KindOS services)
- `mobile/` — Native-like PWA mode (Planned)

---

## II. Layout & Component Tree

```text
AppRoot
├── SidebarNav (Left dock, icons)
├── MainContentPanel
│   ├── Header (breadcrumbs, active service)
│   ├── CapabilityUI (dynamic renderer)
│   │   └── capability/ComponentX
│   └── FooterStatus (memory, connection, context)
├── NotificationCenter
├── ThemeManager
└── ModalRoot
```

### A. Layout Directories

- `src/layouts/RootLayout.tsx`
- `src/layouts/TabbedLayout.tsx`
- `src/layouts/SidepanelLayout.tsx`

---

## III. Theming System

### A. Theme Tokens (Tailwind Presets)

```ts
// tailwind.config.js (extract)
colors: {
  primary: '#6366f1',
  secondary: '#f472b6',
  accent: '#22d3ee',
  surface: '#1e1e2e',
  background: '#0f0f15',
  border: '#3c3c3c',
  muted: '#9ca3af',
  success: '#4ade80',
  error: '#f87171',
  warning: '#facc15',
},
fontFamily: {
  sans: ['Inter', 'ui-sans-serif'],
  mono: ['Fira Code', 'ui-monospace'],
}
```

### B. Dark / Light Mode

- Default: Dark mode
- Auto-switch via `prefers-color-scheme`
- User toggle stored in `localStorage`
- ThemeContext provided globally

### C. Custom Theme Support

- User-defined JSON themes loaded at runtime
- Live preview mode with ThemeEditor

---

## IV. Reusable UI Components

### A. Form Controls

- `InputText`
- `InputSelect`
- `InputSlider`
- `ToggleSwitch`
- `FileUpload`
- `MultiInput`

### B. Layout Widgets

- `Card`
- `Accordion`
- `Tabs`
- `SplitPane`
- `ResizableDrawer`

### C. Navigation Elements

- `SidebarNav`
- `ServiceSelector`
- `ModelDropdown`
- `BreadcrumbBar`

### D. Feedback & Status

- `NotificationToast`
- `LoadingSpinner`
- `StatusDot`
- `ConnectionStatus`

### E. Capability Components

- `LlmChatView`
- `ImageGenerationView`
- `DataAnalysisView`
- `PromptWorkbench`

### F. Global Components

- `ThemeSwitcher`
- `SettingsPanel`
- `VaultLockIcon`
- `SecurityAlertBanner`
- `UserContextMenu`

---

## V. Accessibility & i18n

### A. Accessibility

- All components ARIA-labeled
- Focus rings for keyboard navigation
- High-contrast mode available

### B. Internationalization

- `i18next` used for all UI strings
- Language selector component
- Default languages: `en`, `es`, `de`, `zh`
- Easy translation override via `locales/`

---

## VI. Visual Design Guidelines

### A. Typography

- Headings: `Inter`, semi-bold
- Body: `Inter`, regular
- Code/Logs: `Fira Code`
- Base font size: `14px`

### B. Spacing

- Padding scale: `p-2`, `p-4`, `p-6`, `p-8`
- Margin scale: same
- Section gap: `gap-6`

### C. Border Radius & Elevation

- Radius: `rounded-2xl` for cards
- Elevation: `shadow-lg`, `shadow-sm`, `drop-shadow`

### D. Motion

- Animate presence using `framer-motion`
- UI transitions: `ease-in-out`, `duration-200`

---

## VII. Branding / Logo Guidelines

- Logos stored in `assets/logos/`
- Brand palette:
  - Kind Blue: `#6366f1`
  - Friendly Pink: `#f472b6`
  - Sky Accent: `#22d3ee`
  - Midnight BG: `#0f0f15`

---

## VIII. Future Plans

| Feature           | Description                                 | Target Version |
| ----------------- | ------------------------------------------- | -------------- |
| ThemeEditor       | Live theming editor with JSON export/import | v1.2           |
| Voice Nav         | Speech input for navigation and commands    | v1.3           |
| Animation Library | Shared motion tokens + reusable anims       | v1.3           |
| Mobile First Pass | PWA enhancements for phone UI               | v1.4           |

---

### Changelog

- 2025-06-21: Initial full-spec release for UI layout, theming, and components (AI agent)

