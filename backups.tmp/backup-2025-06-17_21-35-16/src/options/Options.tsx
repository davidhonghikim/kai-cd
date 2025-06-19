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
import { sendMessage } from '../utils/messaging';
import { SERVICE_TYPES, SERVICE_CATEGORIES } from '@/config/constants';
import { SortableServiceItem } from './components/SortableServiceItem';
import styles from '@/styles/components/options/Options.module.css';
import { importServersOnly, exportServersOnly } from '../utils/settingsIO';
import type { Service } from '@/types';

interface OptionsProps {
  onOpenAdvancedSettings?: () => void;
}

const Options: React.FC<OptionsProps> = ({ onOpenAdvancedSettings }) => {
  const [services, setServices] = useState<Service[]>([]);
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
      const response = await sendMessage('getServices', null);
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        setServices([]);
      }
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
      const response = await sendMessage('addService', {
        name: 'New Service',
        type: SERVICE_TYPES.OLLAMA,
        url: '',
        category: SERVICE_CATEGORIES.LLM,
      });
      if (response.success && response.data) {
        setServices(prev => [...prev, response.data]);
        setNewlyAddedServiceId(response.data.id);
      } else {
        throw new Error(response.error || 'Failed to add service');
      }
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
  }
  
  function handleDragStart() {
    // No need to set activeId as it's handled by the DndContext
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

  const handleImportServers = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          await importServersOnly(file);
          alert('Servers imported successfully!');
          loadServices();
        } catch (err) {
          alert('Failed to import servers. Please check the file format.');
        }
      }
    };
    input.click();
  };
  
  const handleExportServers = () => {
    exportServersOnly();
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
            <button onClick={handleImportServers} className={styles.secondaryButton}>Import Servers</button>
            <button onClick={onOpenAdvancedSettings} className={styles.secondaryButton}>Advanced Settings</button>
            {isSelecting ? (
                <>
                    <button onClick={() => handleExport(false)} className={styles.primaryButton}>Export Selected ({selection.size})</button>
                    <button onClick={() => {setIsSelecting(false); setSelection(new Set())}} className={styles.secondaryButton}>Cancel</button>
                </>
            ) : (
                <>
                    <button onClick={handleExportServers} className={styles.secondaryButton}>Export All Servers</button>
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