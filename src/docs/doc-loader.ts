// This file centralizes the logic for loading markdown documentation files
// using Vite's import.meta.glob feature. This ensures that both the
// DocsViewer and DocsIndex components use the exact same logic, preventing
// synchronization issues.

// The glob pattern '/md/**/*.md' recursively finds all markdown files
// in the /md/ directory and its subdirectories.
// `eager: true` imports the modules directly.
// `query: '?raw'` imports the files as raw text strings.
export const docModules = import.meta.glob('/md/**/*.md', {
  query: '?raw',
  eager: true,
});

// We process the raw module keys (e.g., '/md/01_ProjectOverview.md')
// into a cleaner format for navigation and display.
export const docList = Object.keys(docModules)
  .map(path => {
    // Remove the '/md/' prefix and '.md' suffix.
    // This leaves us with a "logical path" like '01_ProjectOverview'
    // or 'agent/19_Agent_Task_List'.
    return path.replace(/^\/md\/|\.md$/g, '');
  })
  .sort();

/**
 * Generates the correct key to look up a document in the docModules object.
 * @param logicalPath - The clean, logical path (e.g., '01_ProjectOverview').
 * @returns The full key for the modules object (e.g., '/md/01_ProjectOverview.md').
 */
export const getDocKey = (logicalPath: string): string => {
    return `/md/${logicalPath}.md`;
} 