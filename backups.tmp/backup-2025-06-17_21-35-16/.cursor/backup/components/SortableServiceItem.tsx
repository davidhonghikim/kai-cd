import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ServiceListItem from './ServiceListItem';
import type { Service } from '@/config/types';
import styles from '@/styles/components/options/Options.module.css';

interface SortableServiceItemProps {
  service: Service;
  isSelecting: boolean;
  isSelected: boolean;
  onSelectionChange: (id: string) => void;
  onUpdate: (service: Service) => void;
  onDelete: (id: string) => void;
  startExpanded: boolean;
}

export const SortableServiceItem: React.FC<SortableServiceItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.serviceItemWrapper}>
      <div {...attributes} {...listeners} className={styles.dragHandle}>&#x2630;</div>
      <div className={styles.serviceItemContainer}>
        {props.isSelecting && <input type="checkbox" checked={props.isSelected} onChange={() => props.onSelectionChange(props.service.id)} className={styles.checkbox} />}
        <ServiceListItem {...props} />
      </div>
    </div>
  );
}; 