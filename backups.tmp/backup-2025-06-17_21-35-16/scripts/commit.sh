#!/bin/bash
# ChatDemon Git Commit Helper Script
# Usage: ./scripts/commit.sh <type> "<message>"
# Example: ./scripts/commit.sh feat "Add server manager UI"

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valid commit types
VALID_TYPES=("feat" "fix" "docs" "style" "refactor" "perf" "test" "chore" "ci" "build" "revert")

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed or not in the PATH${NC}"
    exit 1
fi

# Check if this is a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Check parameters
if [ $# -lt 2 ]; then
    echo -e "${YELLOW}Usage: $0 <type> \"<message>\"${NC}"
    echo -e "${BLUE}Valid types:${NC} ${VALID_TYPES[*]}"
    echo -e "${BLUE}Example:${NC} $0 feat \"Add server manager UI\""
    exit 1
fi

TYPE=$1
MESSAGE=$2

# Validate commit type
if [[ ! " ${VALID_TYPES[*]} " =~ " ${TYPE} " ]]; then
    echo -e "${RED}Error: Invalid commit type '${TYPE}'${NC}"
    echo -e "${BLUE}Valid types:${NC} ${VALID_TYPES[*]}"
    exit 1
fi

# Check for unstaged changes
if ! git diff-index --quiet HEAD --; then
    # Show staged and unstaged changes
    echo -e "${BLUE}Changes to be committed:${NC}"
    git diff --name-status --staged | sed 's/^/  /'
    
    echo -e "${YELLOW}Changes not staged for commit:${NC}"
    git diff --name-status | sed 's/^/  /'
    
    # Ask if user wants to stage all changes
    read -p "Do you want to stage all changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo -e "${GREEN}All changes staged${NC}"
    else
        echo -e "${YELLOW}Continuing with currently staged changes only${NC}"
    fi
fi

# Create the commit message
COMMIT_MSG="${TYPE}: ${MESSAGE}"

# Get the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Perform the commit
echo -e "${BLUE}Committing with message:${NC} ${COMMIT_MSG}"
echo -e "${BLUE}On branch:${NC} ${BRANCH}"

git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Commit successful!${NC}"
    
    # Ask if user wants to push
    read -p "Do you want to push to remote? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Push successful!${NC}"
        else
            echo -e "${RED}Push failed${NC}"
        fi
    fi
else
    echo -e "${RED}Commit failed${NC}"
fi 