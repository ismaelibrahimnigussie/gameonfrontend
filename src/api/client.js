// src/api/client.js
import axios from 'axios';
import { clearAuthRole, getTokenForRole } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getCustomHeaders = () => ({});

/**
 * Safely extracts path relative to base API route.
 * Works seamlessly for full URLs, relative paths, and queries.
 */
const getNormalizedPath = (url = '', baseURL = '') => {
  if (!url) return '';
  let fullPath = url;

  try {
    // Handle relative paths by passing a dummy origin to new URL()
    const parsed = new URL(url, baseURL || 'http://localhost');
    fullPath = parsed.pathname;
  } catch {
    fullPath = String(url).split('?')[0];
  }

  if (!fullPath.startsWith('/')) {
    fullPath = `/${fullPath}`;
  }

  // Strip leading /api prefix if present
  return fullPath.replace(/^\/api(?=\/|$)/, '');
};

/**
 * Resolves authentication token based on route prefixes.
 */
const getRouteToken = (url = '', baseURL = '', method = 'get') => {
  const path = getNormalizedPath(url, baseURL);
  const requestMethod = String(method).toLowerCase();
  if (!path) return null;

  const adminToken = getTokenForRole('admin');
  const zoneToken = getTokenForRole('gamezone');
  const userToken = getTokenForRole('user');

  // Public authentication and discovery routes must never inherit a stale token.
  const isPublicRoute =
    path.startsWith('/auth/') ||
    (path === '/gamezones' && requestMethod === 'post') ||
    path === '/gamezones/login' ||
    path === '/gamezones/verified' ||
    (path.startsWith('/gamezones/') && /^\/gamezones\/\d+$/.test(path)) ||
    (path.startsWith('/credits/packages') && requestMethod === 'get');

  if (isPublicRoute) return null;

  // Game zone routes are protected by authenticateGameZone on the backend.
  // Keep admin-only credit mutations out of this group.
  const isZoneRoute =
    path.startsWith('/games') ||
    path.startsWith('/game-details') ||
    path.startsWith('/gamezone/plays') ||
    path.startsWith('/stations') ||
    path === '/gamezones/profile' ||
    (path.startsWith('/credits/zone/') &&
      !path.startsWith('/credits/zone/grant') &&
      !path.startsWith('/credits/zone/add') &&
      !path.startsWith('/credits/zone/deduct'));

  if (isZoneRoute) return zoneToken;

  const isUserPlayerRoute =
    path === '/players/random' ||
    path === '/players/resolve-station' ||
    path === '/players/station-request' ||
    path === '/players/station-requests' ||
    path.startsWith('/players/user/') ||
    /^\/players\/\d+\/(history|stats)$/.test(path);

  if (isUserPlayerRoute) {
    return userToken || zoneToken || null;
  }

  // Admin Route Matchers
  const isAdminRoute =
    path.startsWith('/gamezones') ||
    path.startsWith('/admins') ||
    path.startsWith('/players') ||
    path.startsWith('/users') ||
    path.startsWith('/credits/admin') ||
    path.startsWith('/credits/packages') ||
    path === '/credits/zone/grant' ||
    path === '/credits/zone/add' ||
    path.startsWith('/system-costs') ||
    path.startsWith('/stations');

  if (isAdminRoute) return adminToken;

  // User routes use the user token. These routes are not shared with the
  // game-zone endpoints above, so a role token cannot be sent accidentally.
  if (path.startsWith('/users') || path.startsWith('/plays')) {
    return userToken;
  }

  return null;
};

export const bindRequestHeaders = (headerGeneratorFn) => {
  if (typeof headerGeneratorFn === 'function') {
    getCustomHeaders = headerGeneratorFn;
  }
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const dynamicHeaders = getCustomHeaders();
    const routeToken = getRouteToken(config.url, config.baseURL, config.method);
    const adminToken = getTokenForRole('admin');
    const zoneToken = getTokenForRole('gamezone');
    config.__authRole = routeToken === adminToken
      ? 'admin'
      : routeToken === zoneToken
        ? 'gamezone'
        : routeToken
          ? 'user'
          : null;

    // Set custom external headers dynamically
    Object.entries(dynamicHeaders).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        config.headers.set(key, value);
      }
    });

    // Attach Bearer token if matched
    if (routeToken) {
      config.headers.set('Authorization', `Bearer ${routeToken}`);
    } else {
      config.headers.delete('Authorization');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const authRole = error.config?.__authRole;
      const prefix = authRole === 'gamezone' ? 'gamezone' : authRole;

      if (prefix) {
        clearAuthRole(prefix);
        window.dispatchEvent(new Event(`${prefix}-auth-expired`));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;