#!/bin/bash

# Fix unused variables by prefixing with underscore
echo "Fixing unused variables..."

# Background main.ts - the variables are already prefixed correctly, the issue is they're not used
# Let's fix the ones that aren't properly prefixed

# Fix src/components/ConsoleLogView.tsx
sed -i '' 's/, _error/, _error/g' src/components/ConsoleLogView.tsx

# Fix src/components/CredentialManager.tsx  
sed -i '' 's/(error)/(\_error)/g' src/components/CredentialManager.tsx

# Fix unused imports in SecurityHub.tsx
sed -i '' 's/HashtagIcon,//g' src/components/SecurityHub.tsx
sed -i '' 's/CubeTransparentIcon,//g' src/components/SecurityHub.tsx  
sed -i '' 's/LockClosedIcon,//g' src/components/SecurityHub.tsx

echo "Basic variable fixes applied"
