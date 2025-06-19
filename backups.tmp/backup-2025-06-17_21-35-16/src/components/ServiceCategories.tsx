import React from 'react';
import { SERVICE_CATEGORIES } from '@/config/constants';
import type { Service } from '@/types';
import styles from '@/styles/components/ServiceCategories.module.css';

interface ServiceCategoriesProps {
  services: Service[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({
  services,
  onCategorySelect,
  selectedCategory
}) => {
  const getCategoryCount = (category: string) => {
    return services.filter(service => {
      const serviceCategory = SERVICE_CATEGORIES[service.category as keyof typeof SERVICE_CATEGORIES];
      return serviceCategory === category;
    }).length;
  };

  const categories = Object.values(SERVICE_CATEGORIES).filter(
    (value, index, self) => self.indexOf(value) === index
  );

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Categories</h3>
      <div className={styles.categoriesList}>
        <button
          className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => onCategorySelect('all')}
        >
          <span className={styles.categoryName}>All Services</span>
          <span className={styles.categoryCount}>{services.length}</span>
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            <span className={styles.categoryName}>{category}</span>
            <span className={styles.categoryCount}>{getCategoryCount(category)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategories; 