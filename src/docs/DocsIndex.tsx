import React from 'react';

// The import.meta.glob result is an object where keys are file paths
// e.g., { '../../md/00_Index.md': () => import(...) }
const docModules = import.meta.glob('/md/*.md');

// Extract and sort the filenames
const docFiles = Object.keys(docModules)
  .map(path => {
    const filename = path.split('/').pop()?.replace('.md', '');
    return filename;
  })
  .filter(Boolean)
  .sort();

interface DocsIndexProps {
  onSelect: (docName: string) => void;
  activeDoc: string;
}

const DocsIndex: React.FC<DocsIndexProps> = ({ onSelect, activeDoc }) => {
  return (
    <nav className="p-4 border-r border-slate-200 dark:border-slate-700 w-64 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Documents</h2>
      <ul className="space-y-1">
        {docFiles.map(docName => (
          <li key={docName}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelect(docName as string);
              }}
              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                activeDoc === docName
                  ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {docName?.replace(/_/g, ' ').replace(/^\d+\s*/, '')}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DocsIndex; 