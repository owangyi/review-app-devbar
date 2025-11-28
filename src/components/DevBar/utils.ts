/**
 * Cookie utility functions
 */

/**
 * Helper function to clear cookies across all possible domain scopes
 * This prevents multiple cookies with the same name but different domains from coexisting
 */
const clearAllCookieScopes = (name: string): void => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Clear cookie for current domain (no domain attribute)
  document.cookie = `${name}=; path=/; max-age=0`;
  
  // For localhost or IP, that's all we need to do
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return;
  }
  
  // Clear cookie for current specific subdomain
  document.cookie = `${name}=; path=/; max-age=0; domain=${hostname}`;
  
  // Clear cookie for root domain (e.g., .discovery.wang)
  if (parts.length >= 2) {
    const rootDomain = `.${parts.slice(-2).join('.')}`;
    document.cookie = `${name}=; path=/; max-age=0; domain=${rootDomain}`;
  }
  
  // Also try clearing for all parent domains
  // e.g., for "feature-dev-002.discovery.wang", try ".feature-dev-002.discovery.wang"
  for (let i = 0; i < parts.length - 1; i++) {
    const domain = `.${parts.slice(i).join('.')}`;
    document.cookie = `${name}=; path=/; max-age=0; domain=${domain}`;
  }
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, maxAge: number = 86400): void => {
  const hostname = window.location.hostname;
  
  // First, clear any existing cookies with the same name across all domain scopes
  // This prevents multiple cookies with different domain attributes from coexisting
  clearAllCookieScopes(name);
  
  // For localhost or IP addresses, don't set domain attribute
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
    return;
  }
  
  // Extract the root domain (e.g., "discovery.wang" from "feature-dev-002.discovery.wang")
  const parts = hostname.split('.');
  
  // Get the root domain (last two parts: "discovery.wang")
  // This allows the cookie to be shared across all subdomains
  const rootDomain = parts.length >= 2 ? `.${parts.slice(-2).join('.')}` : hostname;
  
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; domain=${rootDomain}`;
};

export const deleteCookie = (name: string): void => {
  const hostname = window.location.hostname;
  
  // For localhost or IP addresses, don't set domain attribute
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    document.cookie = `${name}=; path=/; max-age=0`;
    return;
  }
  
  // Extract the root domain to ensure cookie deletion across subdomains
  const parts = hostname.split('.');
  const rootDomain = parts.length >= 2 ? `.${parts.slice(-2).join('.')}` : hostname;
  
  document.cookie = `${name}=; path=/; max-age=0; domain=${rootDomain}`;
};

/**
 * Cookie keys for branch selection
 */
export const COOKIE_KEYS = {
  FRONTEND: 'x_target_frontend',
  BACKEND: 'x_target_backend',
};

/**
 * Fetch environments data from PHP backend
 */
export const fetchEnvironments = async () => {
  try {
    const response = await fetch('/dev-ops/environments.php');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch environments:', error);
    return {
      frontend: { main: ['main'], feature: [] },
      backend: { main: ['main'], feature: [] },
    };
  }
};

/**
 * Convert branch name to valid subdomain slug
 * Examples:
 *   - feature/DEV-001-say-hello-world → feature-dev-001-say-hello-world
 *   - add-new-line → add-new-line
 *   - main → main
 */
export const branchToSubdomain = (branchName: string): string => {
  return branchName
    .toLowerCase()
    .replace(/\//g, '-')      // Replace / with -
    .replace(/[^a-z0-9-]/g, '-') // Replace any non-alphanumeric chars with -
    .replace(/-+/g, '-')      // Replace multiple consecutive - with single -
    .replace(/^-|-$/g, '');   // Remove leading/trailing -
};

/**
 * Extract branch name (subdomain) from current URL
 * Examples:
 *   - develop.discovery.wang → develop
 *   - feature-dev-002.discovery.wang → feature-dev-002
 *   - main.discovery.wang → main
 * Returns null if hostname is localhost or IP address
 */
export const getBranchFromUrl = (): string | null => {
  const hostname = window.location.hostname;
  
  // For localhost or IP addresses, return null
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Extract subdomain (first part before the root domain)
  const parts = hostname.split('.');
  
  // If we have at least 3 parts (e.g., develop.discovery.wang), return the first part
  // If we have 2 parts (e.g., discovery.wang), return null (no subdomain)
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
};

