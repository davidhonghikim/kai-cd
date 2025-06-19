# 09_Development_Testing.md
# kai-cd – Development & Testing Guide

This file explains how to set up the dev environment, run tests, lint, build, and measure coverage.

## 1. Prerequisites
* Node 20 LTS
* pnpm or npm (scripts assume npm)
* Chrome or any Manifest V3‐capable browser for local loading.

## 2. Install & Run
```bash
npm ci             # install exact versions
npm run dev        # vite dev server (popup and panel) with HMR
```

## 3. Test suites
| Script | What it runs |
|--------|--------------|
| `npm test` | Jest unit tests |
| `npm run test:watch` | Jest watch mode |
| `npm run test:cov` | Jest with coverage |

React Testing Library is used for UI; service connectors use `msw` for network mocks.

## 4. Lint & Format
```bash
npm run lint   # ESLint (strict)
npm run format # prettier --write
```

CI blocks merge on any lint or type errors.

## 5. Build & Load extension
```bash
npm run build         # vite build, output to dist/
# then in Chrome ➜ Extensions ➜ Load unpacked ➜ dist/
```

## 6. Debug tips
* Background logs: `chrome://extensions` ➜ Inspect worker.
* UI logs: open DevTools on popup/panel.

*Document last updated: <!--timestamp-->* 