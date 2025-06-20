const fs = require('fs');
const path = require('path');

// Function to fix unused variables by prefixing with underscore
function fixUnusedVars(filePath, fixes) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  fixes.forEach(fix => {
    if (content.includes(fix.old)) {
      content = content.replace(fix.old, fix.new);
      changed = true;
      console.log(`Fixed: ${fix.old} -> ${fix.new} in ${filePath}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
  }
}

// Fix unused imports by removing them
function removeUnusedImports(filePath, imports) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  imports.forEach(importName => {
    // Remove from import statement
    const importRegex = new RegExp(`\\s*${importName},?\\s*`, 'g');
    if (content.match(importRegex)) {
      content = content.replace(importRegex, '');
      changed = true;
      console.log(`Removed unused import: ${importName} from ${filePath}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
  }
}

// Fixes for specific files
const fixes = [
  // ThemeCustomizer unused imports and variables
  {
    file: 'src/components/ThemeCustomizer.tsx',
    unusedImports: ['SwatchIcon'],
    unusedVars: [
      { old: 'const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);', new: '// const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);' },
      { old: 'const [showImportModal, setShowImportModal] = useState(false);', new: '// const [showImportModal, setShowImportModal] = useState(false);' }
    ]
  },
  // VaultManager unused imports
  {
    file: 'src/components/VaultManager.tsx', 
    unusedImports: ['VaultSetup', 'VaultUnlock']
  },
  // StorageManagement unused error vars
  {
    file: 'src/components/StorageManagement.tsx',
    unusedVars: [
      { old: '} catch (error) {', new: '} catch (_error) {' }
    ]
  },
  // SettingsView unused theme var
  {
    file: 'src/components/SettingsView.tsx',
    unusedVars: [
      { old: 'const { theme } = useSettingsStore();', new: '// const { theme } = useSettingsStore();' }
    ]
  }
];

// Apply fixes
fixes.forEach(fix => {
  const filePath = fix.file;
  if (fs.existsSync(filePath)) {
    if (fix.unusedImports) {
      removeUnusedImports(filePath, fix.unusedImports);
    }
    if (fix.unusedVars) {
      fixUnusedVars(filePath, fix.unusedVars);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Batch fixes applied!');
