// src/api/authConfig.js

export const STORAGE_KEYS = {
  USER: {
    TOKEN: 'user_token',
    ROLE: 'user_role',
    PROFILE: 'user_profile'
  },
  ADMIN: {
    TOKEN: 'admin_token',
    ROLE: 'admin_role',
    PROFILE: 'admin_profile'
  },
  GAME_ZONE: {
    TOKEN: 'gamezone_token',
    ROLE: 'gamezone_role',
    PROFILE: 'gamezone_profile'
  },
  // 🚀 To add a new role in the future, just add its keys here:
  // NEW_ROLE: {
  //   TOKEN: 'new_role_token',
  //   ROLE: 'new_role_role',
  //   PROFILE: 'new_role_profile'
  // }
};

export const LEGACY_KEYS = {
  GAME_ZONE_TOKEN: 'gamezone_token',
  ZONE_TOKEN: 'zoneToken',
  GAME_ZONE_DATA: 'gamezone_data',
  ACTIVE_ZONE: 'activeZone'
};