#!/bin/bash

# This script creates a compressed archive of the project and maintains an index.
# It excludes common development directories and accepts notes as an argument.

# --- Configuration ---

# Directory to store archives
ARCHIVE_DIR="archives"

# Temporary file for archive notes
NOTES_FILE="archive_notes.md"
INDEX_FILE="$ARCHIVE_DIR/INDEX.md"

# --- Argument Check ---
if [ -z "$1" ]; then
  echo "Error: Archive notes must be provided as the first argument."
  echo "Usage: $0 \"Your multi-line notes here\""
  exit 1
fi

NOTES_CONTENT="$1"

# --- Pre-archive steps ---

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Write the notes from the argument to the temporary file
echo -e "$NOTES_CONTENT" > "$NOTES_FILE"

echo "Notes prepared for archive."

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

# --- Indexing ---
echo "Updating archive index: $INDEX_FILE"

# Create the index file with a header if it doesn't exist
if [ ! -f "$INDEX_FILE" ]; then
  echo "# Project Archives" > "$INDEX_FILE"
  echo "" >> "$INDEX_FILE"
fi

# Append the new archive's information to the index
{
  echo "---"
  echo ""
  echo "## Archive: \`$ARCHIVE_FILENAME\`"
  echo ""
  echo "**Created:** $(date)"
  echo ""
  echo "### Notes:"
  echo '```'
  echo "$NOTES_CONTENT"
  echo '```'
  echo ""
} >> "$INDEX_FILE"

echo "Archive created and indexed successfully!"
echo "Path: $ARCHIVE_PATH"

exit 0 