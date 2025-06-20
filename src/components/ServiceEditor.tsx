import React from 'react';
import type { Service } from '../types';
import ServiceForm from './ServiceForm';

interface ServiceEditorProps {
  service: Service;
  onClose: () => void;
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({ service, onClose }) => {
  return (
    <div className="p-4 bg-slate-900 rounded-b-lg">
        <ServiceForm service={service} onClose={onClose} />
    </div>
  );
};

export default ServiceEditor; 