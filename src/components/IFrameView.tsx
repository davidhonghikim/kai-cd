import React from 'react';
import type { Service } from '../types';

interface IFrameViewProps {
  service: Service;
}

const IFrameView: React.FC<IFrameViewProps> = ({ service }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 p-3 shrink-0 text-center">
        <h1 className="text-lg font-semibold text-slate-100">{service.name}</h1>
        <p className="text-xs text-slate-400">
          External UI loaded from: <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{service.url}</a>
        </p>
      </header>
      <iframe
        src={service.url}
        title={service.name}
        className="w-full h-full border-none bg-white"
      />
    </div>
  );
};

export default IFrameView; 