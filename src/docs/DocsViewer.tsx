import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DocsIndex from './DocsIndex';
import { docModules, getDocKey } from './doc-loader';
import { logger } from '../utils/logger';

const DocsViewer: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('00_Index');

  useEffect(() => {
    const key = getDocKey(selectedDoc);
    const module = (docModules as Record<string, any>)[key];

    if (module) {
        logger.debug('[DocsViewer] Loaded module:', { key, moduleType: typeof module, module });
        const content = typeof module === 'string' ? module : module.default;
        setContent(content);
        logger.info(`[DocsViewer] Successfully loaded: ${key}`);
    } else {
        logger.error(`[DocsViewer] Failed to load document for key: "${key}"`);
        const availableDocs = Object.keys(docModules).join('\n - ');
        setContent(`# 404: Document Not Found\n\nThe document \`${key}\` could not be found.\n\nAvailable documents:\n - ${availableDocs}`);
    }
  }, [selectedDoc]);
    
  const handleSelect = (docName: string) => {
    logger.info(`[DocsViewer] Navigating to: ${docName}`);
    setSelectedDoc(docName);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <DocsIndex onSelect={handleSelect} activeDoc={selectedDoc} />
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <article className="prose dark:prose-invert max-w-4xl mx-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Add custom components here if needed, e.g., for syntax highlighting
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
};

export default DocsViewer; 