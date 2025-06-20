import React from 'react';
import type { Service } from '../types';

interface StatusIndicatorProps {
    status: Service['status'];
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    let bgColor = 'bg-slate-500';
    let title = 'Status Unknown';
    
    switch (status) {
        case 'checking':
            bgColor = 'bg-yellow-500 animate-pulse';
            title = 'Checking...';
            break;
        case 'online':
            bgColor = 'bg-green-500';
            title = 'Online';
            break;
        case 'offline':
            bgColor = 'bg-red-500';
            title = 'Offline';
            break;
        case 'error':
            bgColor = 'bg-red-700';
            title = 'Error';
            break;
    }
    return <span title={title} className={`block w-3 h-3 rounded-full ${bgColor}`} />;
};

export default StatusIndicator; 