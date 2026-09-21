export const STORAGE_KEYS = {
  USER: {
    TOKEN: 'user_token',
    ROLE: 'user_role',
    PROFILE: 'user_profile',
  },
  ADMIN: {
    TOKEN: 'admin_token',
    ROLE: 'admin_role',
    PROFILE: 'admin_profile',
  },
  GAME_ZONE: {
    TOKEN: 'gamezone_token',
    ROLE: 'gamezone_role',
    PROFILE: 'gamezone_profile',
  },
};

export const LEGACY_KEYS = {
  ZONE_TOKEN: 'zoneToken',
  GAME_ZONE_DATA: 'gamezone_data',
  ACTIVE_ZONE: 'activeZone',
};

export const AUTH_ROLES = {
  ADMIN: 'admin',
  GAMEZONE: 'gamezone',
  USER: 'user',
};

export const AUTH_EXPIRED_EVENT = {
  admin: 'admin-auth-expired',
  gamezone: 'gamezone-auth-expired',
  user: 'user-auth-expired',
};
