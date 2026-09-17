import { STORAGE_KEYS, LEGACY_KEYS } from './authConfig';

const ROLE_KEYS = {
  admin: STORAGE_KEYS.ADMIN,
  gamezone: STORAGE_KEYS.GAME_ZONE,
  user: STORAGE_KEYS.USER,
};

export const getTokenForRole = (role) => {
  const keys = ROLE_KEYS[role];
  if (!keys) return null;

  const primaryToken = localStorage.getItem(keys.TOKEN);
  if (primaryToken) return primaryToken;

  if (role === 'gamezone') {
    return localStorage.getItem(LEGACY_KEYS.GAME_ZONE_TOKEN)
      || localStorage.getItem(LEGACY_KEYS.ZONE_TOKEN)
      || null;
  }

  return null;
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
    localStorage.removeItem(LEGACY_KEYS.GAME_ZONE_TOKEN);
    localStorage.removeItem(LEGACY_KEYS.ZONE_TOKEN);
    localStorage.removeItem(LEGACY_KEYS.GAME_ZONE_DATA);
    localStorage.removeItem(LEGACY_KEYS.ACTIVE_ZONE);
  }
};
