import React from 'react';
import { docList } from './doc-loader';

interface DocsIndexProps {
  onSelect: (docName: string) => void;
  activeDoc: string;
}

const DocsIndex: React.FC<DocsIndexProps> = ({ onSelect, activeDoc }) => {
  const getDocTitle = (docPath: string) => {
    const title = docPath.split('/').pop() || '';
    return title.replace(/_/g, ' ').replace(/^\d+\s*/, '');
  };

  return (
    <nav className="p-4 border-r border-slate-200 dark:border-slate-700 w-64 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Documents</h2>
      <ul className="space-y-1">
        {docList.map(docPath => (
          <li key={docPath}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelect(docPath);
              }}
              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                activeDoc === docPath
                  ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {getDocTitle(docPath)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DocsIndex; 