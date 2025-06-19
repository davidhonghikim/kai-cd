# Backups Directory

This directory contains backups and archived files from the ChatDemon project.

## Structure

- **open-webui/**: Original Open-WebUI codebase that was used as a reference for the ChatDemon extension. This has been archived to reduce the main project size.

- **unused_files_***: Directories containing files that have been removed from the main project during cleanup. These are kept for reference.

- **backup-*.tar.gz**: Compressed backups of the project at various stages of development. These backups have been optimized to exclude large unnecessary files.

## Current Backups

- **backup-2025-06-11_20-48-23.tar.gz** (10.4MB): Early project state with optimized size
- **backup-2025-06-11_21-02-19.tar.gz** (10.4MB): Project development checkpoint
- **backup-2025-06-11_21-03-31.tar.gz** (10.4MB): Project development checkpoint
- **backup-2025-06-11_21-09-29.tar.gz** (10.4MB): Project development checkpoint
- **backup-2025-06-11_21-09-29 copy.tar.gz** (1.0GB): Original large backup (kept for reference)
- **backup-2025-06-12_03-00-45.tar.gz** (1.9MB): Latest backup after project cleanup and optimization

## Backup Strategy

We use an optimized backup strategy that excludes large, non-essential directories to keep backup sizes manageable:

```bash
# Create an optimized backup
current_date=$(date +\"%Y-%m-%d_%H-%M-%S\") && \
tar --exclude=\".git\" --exclude=\"open-webui\" --exclude=\"node_modules\" \
    --exclude=\"backups\" --exclude=\"restored_backups\" --exclude=\"wasm\" \
    -czvf \"backups/backup-${current_date}.tar.gz\" .
```

## Directory Size Considerations

The following directories should be excluded from backups:

1. `.git` - Version control information
2. `open-webui` - Original project files (moved to backups)
3. `node_modules` - NPM dependencies (can be reinstalled)
4. `wasm` - WebAssembly binary files
5. Large binary assets that don't change frequently

## Notes

- If a backup file is excessively large (>100MB), it likely contains one or more of these excluded directories.
- To create a clean backup from a large one, you can extract it to a temporary directory, remove the large directories, and re-archive.
- Previous backup archives were optimized to reduce their size from 1GB to approximately 10MB by removing unnecessary directories.
- Latest backup (backup-2025-06-12_03-00-45.tar.gz) was created after project cleanup and organization. 