import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { Service } from '../config/types';
import { sendMessage } from '../utils/chrome';
import { SERVICE_CATEGORIES, SERVICE_TYPES } from '../config/constants';
import { SortableServiceItem } from './components/SortableServiceItem';
import styles from '@/styles/components/options/Options.module.css';
import AdvancedSettingsModal from '../components/settings/AdvancedSettingsModal';

interface OptionsProps {
  onOpenAdvancedSettings?: () => void;
}

const Options: React.FC<OptionsProps> = ({ onOpenAdvancedSettings }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newlyAddedServiceId, setNewlyAddedServiceId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadServices = useCallback(async () => {
    try {
      const allServices = await sendMessage<Service[]>('getServices');
      setServices(allServices || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleUpdateService = (updatedService: Service) => {
    setServices(prevServices => 
      prevServices.map(s => s.id === updatedService.id ? updatedService : s)
    );
    if (updatedService.id === newlyAddedServiceId) {
      setNewlyAddedServiceId(null);
    }
    // Note: The actual save is handled within ServiceListItem
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      await sendMessage('removeService', { id: serviceId });
      loadServices(); // Reload from storage to be safe
    } catch (error) {
      console.error('Failed to remove service:', error);
      alert(`Error removing service: ${error instanceof Error ? error.message : error}`);
    }
  };
  
  const handleAddNewService = async () => {
    try {
      const newService = await sendMessage('addService', {
        name: 'New Service',
        type: SERVICE_TYPES.OLLAMA,
        url: '',
        category: SERVICE_CATEGORIES.LLM,
      });
      setServices(prev => [...prev, newService]);
      setNewlyAddedServiceId(newService.id);
    } catch (error) {
       console.error('Failed to add new service:', error);
       alert(`Error adding service: ${error instanceof Error ? error.message : error}`);
    }
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update backend with new order
        const orderedIds = newItems.map(item => item.id);
        sendMessage('updateServicesOrder', { orderedIds });
        
        return newItems;
      });
    }
    setActiveId(null);
  }
  
  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  const handleSelectionChange = (serviceId: string) => {
    setSelection(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(serviceId)) {
        newSelection.delete(serviceId);
      } else {
        newSelection.add(serviceId);
      }
      return newSelection;
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const servicesToImport = JSON.parse(event.target?.result as string);
            await sendMessage('importServices', { services: servicesToImport });
            alert('Services imported successfully!');
            loadServices();
          } catch (err) {
            alert('Failed to import services. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleExport = (exportAll: boolean) => {
    const serviceIds = exportAll ? services.map(s => s.id) : Array.from(selection);
    if (serviceIds.length === 0) {
      alert('Please select at least one service to export.');
      return;
    }
    sendMessage('exportServices', { serviceIds });
    setIsSelecting(false);
    setSelection(new Set());
  };

  return (
    <div className={styles.optionsPage}>
      <header className={styles.header}>
        <h1>ChatDemon Settings</h1>
        <div className={styles.headerActions}>
            <button onClick={handleAddNewService} className={styles.primaryButton}>Add New Service</button>
            <button onClick={handleImport} className={styles.secondaryButton}>Import</button>
            <button onClick={onOpenAdvancedSettings} className={styles.secondaryButton}>Advanced Settings</button>
            {isSelecting ? (
                <>
                    <button onClick={() => handleExport(false)} className={styles.primaryButton}>Export Selected ({selection.size})</button>
                    <button onClick={() => {setIsSelecting(false); setSelection(new Set())}} className={styles.secondaryButton}>Cancel</button>
                </>
            ) : (
                <>
                    <button onClick={() => handleExport(true)} className={styles.secondaryButton}>Export All</button>
                    <button onClick={() => setIsSelecting(true)} className={styles.secondaryButton}>Select to Export</button>
                </>
            )}
        </div>
      </header>

      <div className={styles.serviceListContainer}>
        <div className={styles.serviceList}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={services.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {services.map(service => (
                  <SortableServiceItem
                    key={service.id}
                    service={service}
                    isSelecting={isSelecting}
                    isSelected={selection.has(service.id)}
                    onSelectionChange={handleSelectionChange}
                    onUpdate={handleUpdateService}
                    onDelete={handleRemoveService}
                    startExpanded={service.id === newlyAddedServiceId}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {services.length === 0 && (
              <p className={styles.noServicesMessage}>No services configured. Click "Add New Service" to begin.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Options; 