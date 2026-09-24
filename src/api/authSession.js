import { STORAGE_KEYS, LEGACY_KEYS, AUTH_EXPIRED_EVENT } from './authConfig';

const ROLE_KEYS = {
  admin: STORAGE_KEYS.ADMIN,
  gamezone: STORAGE_KEYS.GAME_ZONE,
  user: STORAGE_KEYS.USER,
};

const ROLE_LABELS = {
  admin: 'admin',
  gamezone: 'game_zone',
  user: 'user',
};

const readJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getTokenForRole = (role) => {
  const keys = ROLE_KEYS[role];
  if (!keys) return null;

  const primaryToken = localStorage.getItem(keys.TOKEN);
  if (primaryToken) return primaryToken;

  if (role === 'gamezone') {
    return localStorage.getItem(LEGACY_KEYS.ZONE_TOKEN) || null;
  }

  return null;
};

export const getProfileForRole = (role) => {
  const keys = ROLE_KEYS[role];
  if (!keys) return null;

  const profile = readJson(localStorage.getItem(keys.PROFILE));
  if (profile) return profile;

  if (role === 'gamezone') {
    return readJson(localStorage.getItem(LEGACY_KEYS.GAME_ZONE_DATA))
      || readJson(localStorage.getItem(LEGACY_KEYS.ACTIVE_ZONE));
  }

  return null;
};

export const readAuthSession = (role) => {
  const token = getTokenForRole(role);
  const profile = getProfileForRole(role);
  if (!token || !profile) return null;
  return { token, profile };
};

export const persistAuthSession = (role, { token, profile, exclusive = false }) => {
  if (!ROLE_KEYS[role] || !token || !profile) return;

  if (exclusive) {
    Object.keys(ROLE_KEYS).forEach((otherRole) => {
      if (otherRole !== role) clearAuthRole(otherRole);
    });
  }

  const keys = ROLE_KEYS[role];
  localStorage.setItem(keys.TOKEN, token);
  localStorage.setItem(keys.ROLE, ROLE_LABELS[role]);
  localStorage.setItem(keys.PROFILE, JSON.stringify(profile));

  if (role === 'gamezone') {
    localStorage.setItem(LEGACY_KEYS.ZONE_TOKEN, token);
    localStorage.setItem(LEGACY_KEYS.GAME_ZONE_DATA, JSON.stringify(profile));
    localStorage.setItem(LEGACY_KEYS.ACTIVE_ZONE, JSON.stringify(profile));
  }
};

export const setProfileForRole = (role, profile) => {
  const keys = ROLE_KEYS[role];
  if (!keys || !profile) return;

  localStorage.setItem(keys.PROFILE, JSON.stringify(profile));
  if (role === 'gamezone') {
    localStorage.setItem(LEGACY_KEYS.GAME_ZONE_DATA, JSON.stringify(profile));
    localStorage.setItem(LEGACY_KEYS.ACTIVE_ZONE, JSON.stringify(profile));
  }
};

export const getActiveAuthRole = () => {
  if (getTokenForRole('admin')) return 'admin';
  if (getTokenForRole('gamezone')) return 'gamezone';
  if (getTokenForRole('user')) return 'user';
  return null;
};

export const clearAuthRole = (role) => {
  const keys = ROLE_KEYS[role];
  if (!keys) return;

  localStorage.removeItem(keys.TOKEN);
  localStorage.removeItem(keys.ROLE);
  localStorage.removeItem(keys.PROFILE);

  if (role === 'gamezone') {
    localStorage.removeItem(LEGACY_KEYS.ZONE_TOKEN);
    localStorage.removeItem(LEGACY_KEYS.GAME_ZONE_DATA);
    localStorage.removeItem(LEGACY_KEYS.ACTIVE_ZONE);
    localStorage.removeItem('gamezone_token');
  }
};

export const clearAllAuth = () => {
  Object.keys(ROLE_KEYS).forEach(clearAuthRole);
};

export const emitAuthExpired = (role) => {
  const eventName = AUTH_EXPIRED_EVENT[role];
  if (eventName) {
    window.dispatchEvent(new Event(eventName));
  }
};
