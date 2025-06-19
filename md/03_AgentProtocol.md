# 03_AgentProtocol.md
# kai-cd – Agent Operating Protocol

This file defines the rules every automated or human contributor must follow.

## Core Principles
1. Automate repetitive tasks where safe and valuable.
2. Prioritise code quality, maintainability & security.
3. Keep files ≤ 150 lines whenever reasonable; split logic into reusable modules.
4. Always create a backup before a potentially breaking change.
5. Provide real-time console updates when running scripts or tests.
6. Never commit code that fails **build, lint or tests**.

## Required Workflow Commands (mnemonic shortcuts)
| Command | Description |
|---------|-------------|
| `/h` | Show help menu |
| `/c` | Continue current task |
| `/md reload` | Reload markdown docs |
| `/g commit "<msg>"` | Commit with message |
| `/g push` | Push to remote origin |
| `/b backup` | Run backup script |
| `/sv add_service <type> <json>` | Add service connection |
| `/sv update_service <id> <json>` | Update service |
| `/sv remove_service <id>` | Remove service |
| `/test unit` | Run unit tests |
| `/test integration` | Run integration tests |
| `/test e2e` | Run end-to-end tests |

## Autopilot Mode Rules
1. Do **not** stop until:
   * All tasks are complete
   * Build succeeds
   * Docs updated
   * Backup executed
   * No known bugs
   * Prioritize runtime operations
2. Show console output live and keep the user informed.
3. If an error occurs, attempt automatic fix; otherwise log and request input.
4. Keep a change-log of every file modified for easy rollback.
5. Create a dated backup tarball in `backups/` after each major commit. 