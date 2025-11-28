/**
 * API Client for backend requests
 * Constructs the correct backend URL based on x_target_backend cookie
 */

import { getCookie, COOKIE_KEYS, branchToSubdomain } from './utils';

/**
 * Get the base URL for backend API requests
 * Returns: http://<branch>.api.discovery.wang (or https:// in production)
 */
export const getBackendBaseUrl = (): string => {
  // Use the same protocol as the current page (http for local dev, https for production)
  const protocol = window.location.protocol;
  
  // Read backend branch from cookie, default to current frontend branch
  const backendBranch = getCookie(COOKIE_KEYS.BACKEND);
  
  if (backendBranch) {
    // Convert branch name to valid subdomain (e.g., feature/DEV-001 → feature-dev-001)
    const subdomain = branchToSubdomain(backendBranch);
    return `${protocol}//${subdomain}.api.discovery.wang`;
  }
  
  // If no cookie is set, extract the current frontend branch from the URL
  // and use it as the backend branch
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0]; // e.g., "feature-dev-002" from "feature-dev-002.discovery.wang"
  
  return `${protocol}//${subdomain}.api.discovery.wang`;
};

/**
 * Make an API request to the backend
 * Automatically handles the backend URL based on cookie
 * 
 * @param endpoint - API endpoint path (e.g., '/users', '/products/123')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise<Response>
 */
export const apiRequest = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  // Default options
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };
  
  return fetch(url, { ...defaultOptions, ...options });
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: (endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
    
  patch: (endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

/**
 * Get current backend branch name for display purposes
 */
export const getCurrentBackendBranch = (): string => {
  const backendBranch = getCookie(COOKIE_KEYS.BACKEND);
  
  if (backendBranch) {
    return backendBranch;
  }
  
  // Extract from URL if no cookie
  const hostname = window.location.hostname;
  return hostname.split('.')[0];
};

