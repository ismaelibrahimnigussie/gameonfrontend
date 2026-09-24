import axios from 'axios';
import { clearAuthRole, emitAuthExpired, getTokenForRole } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getCustomHeaders = () => ({});

const getNormalizedPath = (url = '', baseURL = '') => {
  if (!url) return '';

  let pathname;
  try {
    pathname = new URL(url, baseURL || 'http://localhost').pathname;
  } catch {
    pathname = String(url).split('?')[0];
  }

  const fullPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return fullPath.replace(/^\/api(?=\/|$)/, '');
};

const getRouteToken = (url = '', baseURL = '', method = 'get', authRole) => {
  if (authRole) return getTokenForRole(authRole);

  const path = getNormalizedPath(url, baseURL);
  const requestMethod = String(method).toLowerCase();
  if (!path) return null;

  const adminToken = getTokenForRole('admin');
  const zoneToken = getTokenForRole('gamezone');
  const userToken = getTokenForRole('user');

  const isPublicRoute =
    path.startsWith('/auth/') ||
    (path === '/gamezones' && requestMethod === 'post') ||
    path === '/gamezones/login' ||
    path === '/gamezones/verified' ||
    /^\/gamezones\/\d+$/.test(path) ||
    (path.startsWith('/credits/packages') && requestMethod === 'get');

  if (isPublicRoute) return null;

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

  if (isZoneRoute && zoneToken) return zoneToken;

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

apiClient.interceptors.request.use(
  (config) => {
    const dynamicHeaders = getCustomHeaders();
    const routeToken = getRouteToken(
      config.url,
      config.baseURL,
      config.method,
      config.authRole,
    );
    const adminToken = getTokenForRole('admin');
    const zoneToken = getTokenForRole('gamezone');
    config.__authRole = routeToken === adminToken
      ? 'admin'
      : routeToken === zoneToken
        ? 'gamezone'
        : routeToken
          ? 'user'
          : null;

    Object.entries(dynamicHeaders).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        config.headers.set(key, value);
      }
    });

    if (routeToken) {
      config.headers.set('Authorization', `Bearer ${routeToken}`);
    } else {
      config.headers.delete('Authorization');
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const authRole = error.config?.__authRole;
      if (authRole) {
        clearAuthRole(authRole);
        emitAuthExpired(authRole);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
