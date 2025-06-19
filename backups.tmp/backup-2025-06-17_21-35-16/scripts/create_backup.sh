#!/bin/bash
# ChatDemon Project Backup Script
# Usage: ./scripts/create_backup.sh [optional_tag]

# Get the current timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Create backup directory if it doesn't exist
mkdir -p "backups"

# Create the backup filename - using the exact pattern from existing backups
BACKUP_FILE="backups/backup-${TIMESTAMP}.tar.gz"

# Create the backup using tar with gzip compression
tar --exclude="node_modules" \
    --exclude=".git" \
    --exclude="dist" \
    --exclude="*.zip" \
    --exclude="*.tar.gz" \
    --exclude="backups" \
    --exclude="backups/*" \
    --exclude="*.log" \
    -zcvf "$BACKUP_FILE" ./

# Calculate size
SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)

echo "====================================================="
echo "✅ Backup created at $BACKUP_FILE"
echo "📦 Backup size: $SIZE"
echo "====================================================="

# Tag information is stored in the backup log if provided
TAG=${1:-"none"}

# Append to backups.md
README_FILE="backups/backups.md"
echo "# Backup: $(date)" >> "$README_FILE"
echo "- **File**: $BACKUP_FILE" >> "$README_FILE"
echo "- **Size**: $SIZE" >> "$README_FILE"
echo "- **Tag**: $TAG" >> "$README_FILE"
echo "" >> "$README_FILE"

# Add current git commit if available
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
  COMMIT=$(git rev-parse HEAD)
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  
  echo "- **Commit**: $COMMIT" >> "$README_FILE"
  echo "- **Branch**: $BRANCH" >> "$README_FILE"
  echo "" >> "$README_FILE"
fi

echo "✅ Backup information appended to $README_FILE" 