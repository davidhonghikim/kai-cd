import React from 'react';
import type { Service } from '../types';

interface StatusIndicatorProps {
    status: Service['status'];
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    let bgColor = 'bg-slate-500';
    let title = 'Status Unknown';
    let glowClass = '';
    
    switch (status) {
        case 'checking':
            bgColor = 'bg-yellow-400';
            glowClass = 'shadow-lg shadow-yellow-400/50 animate-pulse';
            title = 'Checking...';
            break;
        case 'online':
            bgColor = 'bg-green-400';
            glowClass = 'shadow-lg shadow-green-400/60';
            title = 'Online';
            break;
        case 'offline':
            bgColor = 'bg-red-500';
            glowClass = 'shadow-lg shadow-red-500/60';
            title = 'Offline';
            break;
        case 'error':
            bgColor = 'bg-red-600';
            glowClass = 'shadow-lg shadow-red-600/60';
            title = 'Error';
            break;
    }
    return <span title={title} className={`block w-4 h-4 rounded-full ${bgColor} ${glowClass} transition-all duration-300`} />;
};

export default StatusIndicator; 