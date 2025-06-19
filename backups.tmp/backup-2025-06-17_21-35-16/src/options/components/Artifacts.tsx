import React, { useState, useEffect } from 'react';
import { sendMessage } from '@/utils/chrome';
import type { ImageArtifact } from '@/types';
import styles from './Artifacts.module.css';

interface ArtifactsProps {
  onBack: () => void;
}

const Artifacts: React.FC<ArtifactsProps> = ({ onBack }) => {
  const [artifacts, setArtifacts] = useState<ImageArtifact[]>([]);

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        const result = await sendMessage('getArtifacts', null);
        setArtifacts(result || []);
      } catch (error) {
        console.error('Failed to fetch artifacts:', error);
      }
    };
    fetchArtifacts();
  }, []);

  return (
    <div className={styles.artifactsContainer}>
      <header className={styles.header}>
        <h2>Generated Images</h2>
        <button onClick={onBack}>Back to Services</button>
      </header>
      {artifacts.length > 0 ? (
        <div className={styles.gallery}>
          {artifacts.map(artifact => (
            <div key={artifact.id} className={styles.artifactCard}>
              <img src={artifact.url} alt={artifact.prompt} />
              <div className={styles.artifactInfo}>
                <p title={artifact.prompt}><strong>Prompt:</strong> {artifact.prompt}</p>
                <p><strong>Seed:</strong> {artifact.seed}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No artifacts found. Go generate some images!</p>
      )}
    </div>
  );
};

export default Artifacts; 