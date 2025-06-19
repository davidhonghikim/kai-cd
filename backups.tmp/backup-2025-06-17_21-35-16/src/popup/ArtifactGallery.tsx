import React from 'react';
import styles from '@/styles/components/popup/ArtifactGallery.module.css';
import { ImageArtifact } from '@/types';

interface ArtifactGalleryProps {
  onClose: () => void;
  artifacts: ImageArtifact[];
  onDelete: (artifactId: string) => void;
}

const ArtifactGallery: React.FC<ArtifactGalleryProps> = ({
  onClose,
  artifacts,
  onDelete,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2>Artifact Gallery</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </header>
        <div className={styles.content}>
          {artifacts.length > 0 ? (
            <div className={styles.grid}>
              {artifacts.map((artifact) => (
                <div key={artifact.id} className={styles.gridItem}>
                  <img src={artifact.url} alt={artifact.prompt} />
                  <div className={styles.itemOverlay}>
                    <p>{artifact.prompt}</p>
                    <button
                      onClick={() => onDelete(artifact.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No image artifacts saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactGallery; 