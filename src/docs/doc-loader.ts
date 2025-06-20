// This file centralizes the logic for loading markdown documentation files
// using Vite's import.meta.glob feature. This ensures that both the
// DocsViewer and DocsIndex components use the exact same logic, preventing
// synchronization issues.

// The glob pattern '/documentation/**/*.md' finds all markdown files
// in the /documentation/ directory and all its subdirectories.
// `eager: true` imports the modules directly.
// `query: '?raw'` imports the files as raw text strings.
export const docModules = import.meta.glob('/documentation/**/*.md', {
  query: '?raw',
  eager: true,
});

// We process the raw module keys (e.g., '/documentation/01_ProjectOverview.md')
// into a cleaner format for navigation and display.
export const docList = Object.keys(docModules)
  .map(path => {
    // Remove the '/documentation/' prefix and '.md' suffix.
    // This leaves us with a "logical path" like '01_ProjectOverview'
    // or 'agent/19_Agent_Task_List'.
    return path.replace(/^\/documentation\/|\.md$/g, '');
  })
  .sort((a, b) => {
    // Keep '00_Index' at the top
    if (a === '00_Index') return -1;
    if (b === '00_Index') return 1;

    // Prioritize categories
    const categoryOrder = ['users', 'developers', 'agents'];
    const aCategory = a.split('/')[0];
    const bCategory = b.split('/')[0];
    const aIndex = categoryOrder.indexOf(aCategory);
    const bIndex = categoryOrder.indexOf(bCategory);

    if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    // Fallback to alphabetical sort
    return a.localeCompare(b);
  });

/**
 * Generates the correct key to look up a document in the docModules object.
 * @param logicalPath - The clean, logical path (e.g., '01_ProjectOverview').
 * @returns The full key for the modules object (e.g., '/documentation/01_ProjectOverview.md').
 */
export const getDocKey = (logicalPath: string): string => {
    return `/documentation/${logicalPath}.md`;
} 