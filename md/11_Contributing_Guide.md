# 11_Contributing_Guide.md
# kai-cd – Contributing Guide

Thank you for considering contributing! This document explains our process so PRs merge smoothly.

## Code style
* TypeScript strict mode.
* 2-space indent, Prettier enforced (`npm run format`).
* Filenames use **camelCase** for TS/TSX and **kebab-case** for CSS modules.

## Branch strategy
* `main` – protected, CI required.
* `feat/<desc>` – features.
* `fix/<desc>` – bug fixes.
* `docs/<desc>` – documentation only.

## Commit messages
Follow Conventional Commits:
```
feat: add side-panel image generation
fix: resolve connector cache race
docs: update service catalog
```

## Pull Request checklist
- [ ] Lint passes (`npm run lint`).
- [ ] Unit tests added/updated.
- [ ] `npm test` green & coverage ≥ 80 %.
- [ ] Docs updated (if relevant).
- [ ] `npm run backup` executed.

## Code review expectations
* Maintainer replies within 2 business days.
* Smaller PRs (<400 lines) merge faster.

## Reporting bugs / requesting features
Use GitHub Issues; include reproduction steps, logs, screenshots.

*Document last updated: <!--timestamp-->* 