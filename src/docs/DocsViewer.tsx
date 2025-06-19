import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DocsIndex from './DocsIndex';
import { docModules, getDocKey } from './doc-loader';
import { logger } from '../utils/logger';

const DocsViewer: React.FC = () => {
  const [docParam, setDocParam] = useState('00_Index');
  const [content, setContent] = useState('');

  useEffect(() => {
    const key = getDocKey(docParam);
    const module = (docModules as Record<string, { default: string }>)[key];
    
    if (module && typeof module.default === 'string') {
        setContent(module.default);
        logger.log(`[DocsViewer] Successfully loaded: ${key}`);
    } else {
        logger.error(`[DocsViewer] Failed to load document for key: "${key}"`);
        setContent('# 404\nDocument not found. Please check the console for a list of available documents.');
    }
  }, [docParam]);
  
  const handleSelect = (docName: string) => {
    logger.log(`[DocsViewer] Navigating to: ${docName}`);
    setDocParam(docName);
  };

  const LinkRenderer = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    if (href && href.startsWith('./') && href.endsWith('.md')) {
      const targetDoc = href.replace('./', '').replace('.md', '');
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        handleSelect(targetDoc);
      };
      return (
        <a href="#" onClick={handleClick}>
          {children}
        </a>
      );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <DocsIndex onSelect={handleSelect} activeDoc={docParam} />
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <article className="prose dark:prose-invert max-w-4xl mx-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: LinkRenderer,
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