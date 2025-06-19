import React, { useState, useEffect } from 'react';
import { Service } from '@/config/types';
import { storageManager } from "@/storage/storageManager";
import { sendMessage } from '@/utils/chrome';
import ViewRouter from "@/components/ViewRouter";
import '@/styles/global.css';
import styles from '@/styles/components/tab/ServiceTab.module.css';
import { connectToBackground } from '@/utils/keepAlive';

const ServiceTab: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        connectToBackground('service-tab');
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const allServices = await storageManager.get<Service[]>('services', []);
            setServices(allServices);
            setError(null);
        } catch (err) {
            setError('Failed to load services');
            console.error('Error loading services:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchToPanel = async () => {
        if (services.length === 0) return;
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            try {
                // Set the active service first
                await sendMessage('setActiveService', { serviceId: services[0].id });
                
                // Configure and open the side panel for the current tab
                await chrome.sidePanel.setOptions({ 
                    tabId: tab.id, 
                    path: 'src/sidepanel/index.html', 
                    enabled: true 
                });
                await chrome.sidePanel.open({ tabId: tab.id });
                
                // Close the current tab, this is more reliable
                // window.close() can have permission issues.
                chrome.tabs.remove(tab.id);

            } catch (error) {
                console.error("Failed to switch to panel:", error);
                setError("Could not open the panel. See console for details.");
            }
        }
    };

    const renderContent = () => {
        if (error) return <div className={styles.container}><h2 className={styles.error}>{error}</h2></div>;
        if (loading) return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Loading services...</p></div>;
        if (services.length === 0) return <div className={styles.emptyState}><p>No services configured. Configure services in the settings.</p></div>;
        
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3>Services</h3>
                </div>

                <div className={styles.serviceList}>
                    {services.map(service => (
                        <div key={service.id} className={styles.serviceCard}>
                            <div className={styles.serviceInfo}>
                                <h4>{service.name}</h4>
                                <p>{service.url}</p>
                                <div className={styles.serviceStatus}>
                                    <span className={`${styles.status} ${styles[service.status || 'unknown']}`}>
                                        {service.status || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return renderContent();
};

export default ServiceTab; 