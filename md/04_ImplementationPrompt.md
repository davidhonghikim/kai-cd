# 04_ImplementationPrompt.md
# kai-cd – Implementation Prompt & Checklist

This document describes the standard operating procedure for any feature, bug-fix or refactor.

## Pre-flight
- [ ] `git status` is clean (or committed/stashed).
- [ ] Run `npm ci` then `npm test`, `npm run lint`, `npm run build` – baseline must pass.
- [ ] Run `npm run backup` (script TBD) → tarball saved to `backups/`.

## Task flow
1. **Branch**: `git switch -c feat/<short-desc>`.
2. **Code**: implement change, following AgentProtocol rules (≤150 lines, modular).
3. **Tests**: add/adjust unit tests, ensure 80 %+ coverage.
4. **Docs**: update or create markdown in `md/`.
5. **Build & Lint**: `npm run lint`, `npm run build`.
6. **Backup**: `npm run backup`.
7. **Commit & Push**: `/g commit "feat: …"` then `/g push`.
8. **Pull Request**: open PR, run CI.
9. **Merge & Tag** after approval.

## Done criteria
- All CI checks green.
- User-visible behaviour verified manually.
- Documentation current.
- Backup tarball present. 