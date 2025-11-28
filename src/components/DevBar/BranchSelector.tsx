import React, { useState, useRef, useEffect } from 'react';
import type { BranchSelectorProps } from './types';
import styles from './styles.module.css';

const BranchSelector: React.FC<BranchSelectorProps> = ({
  type,
  currentBranch,
  branches,
  onSwitch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const icon = type === 'frontend' ? '💻' : '🖥️';
  const label = type === 'frontend' ? 'Frontend' : 'Backend';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBranchClick = (branchName: string) => {
    setIsOpen(false);
    onSwitch(branchName);
  };

  return (
    <div className={styles.selector} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className={styles.selectorIcon}>{icon}</span>
        <div>
          <div style={{ fontSize: '10px', opacity: 0.6 }}>{label}</div>
          <div className={styles.selectorLabel}>{currentBranch || 'main'}</div>
        </div>
        <span className={`${styles.selectorArrow} ${isOpen ? styles.open : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {branches.main.length > 0 && (
            <div className={styles.dropdownGroup}>
              <div className={styles.dropdownGroupTitle}>Main Branches</div>
              {branches.main.map((branch) => (
                <div
                  key={branch}
                  className={`${styles.dropdownItem} ${branch === currentBranch ? styles.active : ''}`}
                  onClick={() => handleBranchClick(branch)}
                >
                  {branch}
                </div>
              ))}
            </div>
          )}

          {branches.feature.length > 0 && (
            <div className={styles.dropdownGroup}>
              <div className={styles.dropdownGroupTitle}>Feature Branches</div>
              {branches.feature.map((branch) => (
                <div
                  key={branch}
                  className={`${styles.dropdownItem} ${branch === currentBranch ? styles.active : ''}`}
                  onClick={() => handleBranchClick(branch)}
                >
                  {branch}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;

