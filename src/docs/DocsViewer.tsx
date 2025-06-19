import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DocsIndex from './DocsIndex';
import { docModules, getDocKey } from './doc-loader';

const DocsViewer: React.FC = () => {
  const [docParam, setDocParam] = useState('00_Index');
  const [content, setContent] = useState('');

  useEffect(() => {
    // One-time log to inspect the structure of the imported modules.
    console.log('[DocsViewer] Inspecting docModules:', docModules);
  }, []); // Runs only once on component mount

  useEffect(() => {
    console.log(`[DocsViewer] useEffect triggered for docParam: "${docParam}"`);
    const key = getDocKey(docParam);
    console.log(`[DocsViewer] Looking for document with key: "${key}"`);
    
    const module = (docModules as Record<string, { default: string }>)[key];
    console.log(`[DocsViewer] Found module:`, module);
    
    if (module && typeof module.default === 'string') {
        const newContent = module.default;
        console.log(`[DocsViewer] Found content of length: ${newContent.length}`);
        setContent(newContent);
    } else {
        console.error(`[DocsViewer] Document module not found or malformed for key: "${key}"`);
        console.log('[DocsViewer] Available keys:', Object.keys(docModules));
        setContent('# 404\nDocument not found. Please check the console for a list of available documents.');
    }
  }, [docParam]);
  
  const handleSelect = (docName: string) => {
    console.log(`Selected doc: ${docName}`);
    setDocParam(docName);
  };

  const LinkRenderer = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    if (href && href.startsWith('./') && href.endsWith('.md')) {
      const targetDoc = href.replace('./', '').replace('.md', '');
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        console.log(`[LinkRenderer] Intercepted click for doc: ${targetDoc}`);
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