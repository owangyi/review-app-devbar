import React from 'react';
import type { MetadataProps } from './types';
import styles from './styles.module.css';

const Metadata: React.FC<MetadataProps> = ({ pipelineId, deployTime }) => {
  const formatDeployTime = (time: string) => {
    if (!time) return 'N/A';
    try {
      const date = new Date(time);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return time;
    }
  };

  return (
    <div className={styles.metadata}>
      <div className={styles.metadataItem}>
        <span className={styles.metadataIcon}>🔧</span>
        <span className={styles.metadataLabel}>Pipeline:</span>
        <span>#{pipelineId || 'N/A'}</span>
      </div>
      <div className={styles.metadataItem}>
        <span className={styles.metadataIcon}>📅</span>
        <span className={styles.metadataLabel}>Deployed:</span>
        <span>{formatDeployTime(deployTime)}</span>
      </div>
    </div>
  );
};

export default Metadata;

