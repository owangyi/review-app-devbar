import React, { useState, useEffect } from 'react';
import BranchSelector from './BranchSelector';
import Metadata from './Metadata';
import { getCookie, setCookie, COOKIE_KEYS, fetchEnvironments, branchToSubdomain, getBranchFromUrl } from './utils';
import type { EnvironmentsData } from './types';
import styles from './styles.module.css';

const DevBar: React.FC = () => {
  const [environments, setEnvironments] = useState<EnvironmentsData>({
    frontend: { main: [], feature: [] },
    backend: { main: [], feature: [] },
  });

  const [currentFrontend, setCurrentFrontend] = useState<string>('main');
  const [currentBackend, setCurrentBackend] = useState<string>('main');

  // Get metadata from environment variables (injected during build)
  const pipelineId = import.meta.env.VITE_PIPELINE_ID || '';
  const deployTime = import.meta.env.VITE_DEPLOY_TIME || '';

  // Load environments and current selections on mount
  useEffect(() => {
    // Get branch from URL (subdomain)
    const urlBranch = getBranchFromUrl();
    
    // Read current branch from cookies
    const cookieFrontendBranch = getCookie(COOKIE_KEYS.FRONTEND);
    const backendBranch = getCookie(COOKIE_KEYS.BACKEND) || 'main';
    
    // If URL has a branch and it differs from cookie, update cookie to match URL
    // This handles the case where user opens a new window/tab with a different URL
    let frontendBranch: string;
    if (urlBranch) {
      // Convert URL subdomain to branch name format (they should be the same, but normalize)
      const normalizedUrlBranch = urlBranch.toLowerCase();
      
      if (cookieFrontendBranch && cookieFrontendBranch.toLowerCase() !== normalizedUrlBranch) {
        // URL branch differs from cookie, update cookie to match URL
        setCookie(COOKIE_KEYS.FRONTEND, normalizedUrlBranch, 86400);
        frontendBranch = normalizedUrlBranch;
      } else if (!cookieFrontendBranch) {
        // No cookie set, use URL branch
        setCookie(COOKIE_KEYS.FRONTEND, normalizedUrlBranch, 86400);
        frontendBranch = normalizedUrlBranch;
      } else {
        // Cookie matches URL, use cookie value
        frontendBranch = cookieFrontendBranch;
      }
    } else {
      // No branch in URL (localhost or IP), use cookie or default
      frontendBranch = cookieFrontendBranch || 'main';
    }
    
    setCurrentFrontend(frontendBranch);
    setCurrentBackend(backendBranch);

    // Fetch available branches
    fetchEnvironments().then((data) => {
      setEnvironments(data);
    });
  }, []);

  const handleBranchSwitch = (type: 'frontend' | 'backend', branchName: string) => {
    const cookieKey = type === 'frontend' ? COOKIE_KEYS.FRONTEND : COOKIE_KEYS.BACKEND;
    
    // Set cookie
    setCookie(cookieKey, branchName, 86400); // 1 day expiry
    
    if (type === 'frontend') {
      // For frontend switch, redirect to the new branch's URL
      // e.g., from feature-dev-002.discovery.wang to main.discovery.wang
      const currentUrl = new URL(window.location.href);
      const hostname = currentUrl.hostname;
      const parts = hostname.split('.');
      
      // Convert branch name to valid subdomain (e.g., feature/DEV-001 → feature-dev-001)
      const subdomain = branchToSubdomain(branchName);
      
      // Replace the subdomain (branch name) with the new branch
      parts[0] = subdomain;
      const newHostname = parts.join('.');
      
      // Construct the new URL
      currentUrl.hostname = newHostname;
      
      // Redirect to the new URL
      window.location.href = currentUrl.toString();
    } else {
      // For backend switch, just reload the page to update DevBar UI
      // The actual API URL will be constructed dynamically by apiClient
      // e.g., Cookie: x_target_backend=staging
      // → API requests go to: https://staging.api.discovery.wang
      window.location.reload();
    }
  };

  return (
    <div className={styles.devBar}>
      <div className={styles.container}>
        <div className={styles.controls}>
          <div className={styles.branchGroup}>
            <div className={styles.branchSelectors}>
              <BranchSelector
                type="frontend"
                currentBranch={currentFrontend}
                branches={environments.frontend}
                onSwitch={(branch) => handleBranchSwitch('frontend', branch)}
              />
              <BranchSelector
                type="backend"
                currentBranch={currentBackend}
                branches={environments.backend}
                onSwitch={(branch) => handleBranchSwitch('backend', branch)}
              />
            </div>
          </div>
        </div>

        <Metadata pipelineId={pipelineId} deployTime={deployTime} />
      </div>
    </div>
  );
};

export default DevBar;

