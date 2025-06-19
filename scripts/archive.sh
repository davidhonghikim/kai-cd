#!/bin/bash

# This script creates a compressed archive of the project.
# It excludes common development directories and allows for adding custom notes.

# --- Configuration ---

# Directory to store archives
ARCHIVE_DIR="archives"

# Temporary file for archive notes
NOTES_FILE="archive_notes.md"

# --- Pre-archive steps ---

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Create a default notes file and prompt user to edit
cat > "$NOTES_FILE" << EOL
# Archive Notes

## Date
$(date)

## Completed Tasks
- 

## Current State
- 

## Notes
- 

EOL

echo "Please edit the archive notes file: $NOTES_FILE"
echo "Press Enter when you are ready to continue..."
read -r

# --- Archiving ---

# Generate a timestamp for the archive name
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_FILENAME="archive-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="$ARCHIVE_DIR/$ARCHIVE_FILENAME"

echo "Creating archive: $ARCHIVE_PATH"

# Create the tar archive
# Excludes:
# - .git: Version control history
# - node_modules: Project dependencies (can be reinstalled)
# - $ARCHIVE_DIR: The directory containing our archives
# - backups.tmp: Temporary backup directory
# - .DS_Store: macOS specific file
# - *.log: Log files
# - .env*: Environment specific files
tar --exclude=".git" \
    --exclude="node_modules" \
    --exclude="$ARCHIVE_DIR" \
    --exclude="backups.tmp" \
    --exclude=".DS_Store" \
    --exclude="*.log" \
    --exclude=".env*" \
    -czf "$ARCHIVE_PATH" . "$NOTES_FILE"

# --- Post-archive steps ---

# Clean up the temporary notes file
rm "$NOTES_FILE"

echo "Archive created successfully!"
echo "Path: $ARCHIVE_PATH"

exit 0 