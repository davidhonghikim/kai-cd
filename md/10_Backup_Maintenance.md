# 10_Backup_Maintenance.md
# kai-cd – Backup & Maintenance Guide

Regular backups protect against data loss and give developers the freedom to experiment.

## Backup script
Located at `scripts/create_backup.sh` (to be implemented). Responsibilities:
1. Ensure `dist/` is clean (run build if missing).
2. Tar + gzip project root **excluding**:
   * `node_modules`, `dist`, `.git`, `backups`.
3. Filename: `backups/backup-$(date +%Y-%m-%d_%H-%M-%S).tar.gz`.
4. Verify archive integrity (`tar -tzf`).

Run via:
```bash
npm run backup   # alias to sh scripts/create_backup.sh
```

## Rotation policy
* Keep last 20 archives locally; older ones auto-deleted by script.
* Optional: sync to external storage via `rclone` (not automated).

## Maintenance tasks
| Frequency | Task |
|-----------|------|
| Daily     | `npm test` & `npm run lint` on main branch |
| Weekly    | Run `npm audit fix` & update minor deps |
| Monthly   | Verify backups restore correctly |
| Quarterly | Review docs for staleness |

*Document last updated: <!--timestamp-->* 