import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DocsIndex from './DocsIndex';

// Import all markdown files at build-time as raw strings
// The resulting object shape: { '/src/md/00_Index.md': string, ... }
const docModules = import.meta.glob('/md/*.md', { query: '?raw', eager: true });

const DocsViewer: React.FC = () => {
  const [docParam, setDocParam] = useState('00_Index');
  const [content, setContent] = useState('');

  useEffect(() => {
    const handleLocationChange = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const doc = searchParams.get('doc') || '00_Index';
        setDocParam(doc);
    }
    
    // Listen for manual history navigation (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);
    
    // Initial load
    handleLocationChange();

    return () => {
        window.removeEventListener('popstate', handleLocationChange);
    }
  }, []);

  useEffect(() => {
    const key = `/md/${docParam}.md`;
    const newContent = (docModules as Record<string, string>)[key] ?? '# 404\nDocument not found.';
    setContent(newContent);
    
    const url = new URL(window.location.href);
    if (url.searchParams.get('doc') !== docParam) {
        url.searchParams.set('doc', docParam);
        window.history.pushState({ doc: docParam }, '', url);
    }
  }, [docParam]);
  
  const handleSelect = (docName: string) => {
    setDocParam(docName);
  };

  const LinkRenderer = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    if (href && href.startsWith('./') && href.endsWith('.md')) {
      const targetDoc = href.replace('./', '').replace('.md', '');
      return (
        <a href="#" onClick={(e) => { e.preventDefault(); handleSelect(targetDoc); }}>
          {children}
        </a>
      );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <DocsIndex onSelect={handleSelect} activeDoc={docParam} />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <article className="prose dark:prose-invert max-w-none">
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