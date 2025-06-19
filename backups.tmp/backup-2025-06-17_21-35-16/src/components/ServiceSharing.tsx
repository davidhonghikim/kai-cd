import React, { useState } from 'react';
import styles from '@/styles/components/ServiceSharing.module.css';
import { Service } from '@/types';

interface ServiceSharingProps {
  service: Service;
  onShare: (service: Service, users: string[]) => void;
}

const ServiceSharing: React.FC<ServiceSharingProps> = ({ service, onShare }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // This would typically come from a user management service
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = () => {
    onShare(service, selectedUsers);
    setSelectedUsers([]);
    setSearchQuery('');
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Share Service</h3>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.usersList}>
        {filteredUsers.map(user => (
          <label key={user.id} className={styles.userItem}>
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleUserSelect(user.id)}
              className={styles.checkbox}
            />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.shareButton}
          onClick={handleShare}
          disabled={selectedUsers.length === 0}
        >
          Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
        </button>
      </div>
    </div>
  );
};

export default ServiceSharing; 