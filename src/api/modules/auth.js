// api/modules/auth.js
import client from "../client";
import { STORAGE_KEYS, LEGACY_KEYS } from "../authConfig";
import { getActiveAuthRole, getTokenForRole } from "../authSession";

const AuthAPI = {
  // ==========================================
  // USER AUTHENTICATION
  // ==========================================
  user: {
    register: async (data) => {
      try {
        const response = await client.post("/auth/register", data);
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const token = responseData.token || responseData.data?.token;
          const profile = responseData.data?.data || responseData.data || responseData;
          
          if (token && profile) {
            // Store in localStorage only
            localStorage.setItem(STORAGE_KEYS.USER.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER.ROLE, 'user');
            localStorage.setItem(STORAGE_KEYS.USER.PROFILE, JSON.stringify(profile));
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
        
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    login: async (credentials) => {
      try {
        const response = await client.post("/auth/login", credentials);
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const token = responseData.token || responseData.data?.token;
          const profile = responseData.data?.data || responseData.data || responseData;
          
          if (token && profile) {
            // Store in localStorage only
            localStorage.setItem(STORAGE_KEYS.USER.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER.ROLE, 'user');
            localStorage.setItem(STORAGE_KEYS.USER.PROFILE, JSON.stringify(profile));
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
        
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.USER.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER.ROLE);
      localStorage.removeItem(STORAGE_KEYS.USER.PROFILE);
      
      const hasOtherSession = 
        localStorage.getItem(STORAGE_KEYS.ADMIN.TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.GAME_ZONE.TOKEN);
      
      if (!hasOtherSession) {
        delete client.defaults.headers.common['Authorization'];
      }
    },
    
    getToken: () => getTokenForRole('user'),
    getProfile: () => {
      const profile = localStorage.getItem(STORAGE_KEYS.USER.PROFILE);
      try {
        return profile ? JSON.parse(profile) : null;
      } catch {
        return null;
      }
    },
    isAuthenticated: () => !!localStorage.getItem(STORAGE_KEYS.USER.TOKEN)
  },

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  admin: {
    register: async (data) => {
      try {
        const response = await client.post("/auth/admin/register", data);
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const token = responseData.token || responseData.data?.token;
          const profile = responseData.data?.data || responseData.data || responseData;
          if (token && profile) {
            localStorage.setItem(STORAGE_KEYS.ADMIN.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.ADMIN.ROLE, 'admin');
            localStorage.setItem(STORAGE_KEYS.ADMIN.PROFILE, JSON.stringify(profile));
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    login: async (credentials) => {
      try {
        localStorage.removeItem(STORAGE_KEYS.ADMIN.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN.ROLE);
        localStorage.removeItem(STORAGE_KEYS.ADMIN.PROFILE);
        delete client.defaults.headers.common['Authorization'];
        const response = await client.post("/auth/admin/login", credentials, {
          headers: { Authorization: undefined }
        });
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const token = responseData.token || responseData.data?.token;
          const profile = responseData.data?.data || responseData.data || responseData;
          if (token && profile) {
            localStorage.setItem(STORAGE_KEYS.ADMIN.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.ADMIN.ROLE, 'admin');
            localStorage.setItem(STORAGE_KEYS.ADMIN.PROFILE, JSON.stringify(profile));
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.ADMIN.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN.ROLE);
      localStorage.removeItem(STORAGE_KEYS.ADMIN.PROFILE);
      
      const hasOtherSession = 
        localStorage.getItem(STORAGE_KEYS.USER.TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.GAME_ZONE.TOKEN);
      
      if (!hasOtherSession) {
        delete client.defaults.headers.common['Authorization'];
      }
    },
    
    getToken: () => getTokenForRole('admin'),
    getProfile: () => {
      const profile = localStorage.getItem(STORAGE_KEYS.ADMIN.PROFILE);
      try {
        return profile ? JSON.parse(profile) : null;
      } catch {
        return null;
      }
    },
    isAuthenticated: () => !!localStorage.getItem(STORAGE_KEYS.ADMIN.TOKEN),

    // Admin-specific actions
    verifyGameZone: (zoneId) => client.patch(`/gamezones/${zoneId}/verify`),
    unverifyGameZone: (zoneId) => client.patch(`/gamezones/${zoneId}/unverify`),
    getGameZoneVerificationStatus: (zoneId) => client.get(`/gamezones/${zoneId}/verification-status`)
  },

  // ==========================================
  // GAME ZONE AUTHENTICATION
  // ==========================================
  gameZone: {
    register: async (data) => {
      try {
        const response = await client.post("/gamezones", data, {
          headers: { Authorization: undefined }
        });
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const token = responseData.token || responseData.data?.token;
          const profile = responseData.data?.data || responseData.data || responseData;
          if (token && profile) {
            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.ROLE, 'game_zone');
            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.PROFILE, JSON.stringify(profile));
            // Store legacy keys
            localStorage.setItem(LEGACY_KEYS.GAME_ZONE_TOKEN, token);
            localStorage.setItem(LEGACY_KEYS.ZONE_TOKEN, token);
            localStorage.setItem(LEGACY_KEYS.GAME_ZONE_DATA, JSON.stringify(profile));
            localStorage.setItem(LEGACY_KEYS.ACTIVE_ZONE, JSON.stringify(profile));
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    login: async (credentials) => {
      try {
        const response = await client.post("/gamezones/login", credentials, {
          headers: { Authorization: undefined }
        });
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const token = responseData.token || responseData.data?.token;
          const profile = responseData.data?.data || responseData.data || responseData;
          if (token && profile) {
            localStorage.removeItem(STORAGE_KEYS.USER.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER.ROLE);
            localStorage.removeItem(STORAGE_KEYS.USER.PROFILE);
            localStorage.removeItem(STORAGE_KEYS.ADMIN.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.ADMIN.ROLE);
            localStorage.removeItem(STORAGE_KEYS.ADMIN.PROFILE);

            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.ROLE, 'game_zone');
            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.PROFILE, JSON.stringify(profile));
            localStorage.setItem(LEGACY_KEYS.GAME_ZONE_TOKEN, token);
            localStorage.setItem(LEGACY_KEYS.ZONE_TOKEN, token);
            localStorage.setItem(LEGACY_KEYS.GAME_ZONE_DATA, JSON.stringify(profile));
            localStorage.setItem(LEGACY_KEYS.ACTIVE_ZONE, JSON.stringify(profile));
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true, token, data: profile };
          }
        }
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.GAME_ZONE.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.GAME_ZONE.ROLE);
      localStorage.removeItem(STORAGE_KEYS.GAME_ZONE.PROFILE);
      localStorage.removeItem(LEGACY_KEYS.GAME_ZONE_TOKEN);
      localStorage.removeItem(LEGACY_KEYS.ZONE_TOKEN);
      localStorage.removeItem(LEGACY_KEYS.GAME_ZONE_DATA);
      localStorage.removeItem(LEGACY_KEYS.ACTIVE_ZONE);
      
      const hasOtherSession = 
        localStorage.getItem(STORAGE_KEYS.USER.TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.ADMIN.TOKEN);
      
      if (!hasOtherSession) {
        delete client.defaults.headers.common['Authorization'];
      }
    },
    
    getToken: () => getTokenForRole('gamezone'),
    
    getProfile: () => {
      let profile = localStorage.getItem(STORAGE_KEYS.GAME_ZONE.PROFILE);
      if (!profile) {
        profile = localStorage.getItem(LEGACY_KEYS.GAME_ZONE_DATA) ||
                  localStorage.getItem(LEGACY_KEYS.ACTIVE_ZONE);
      }
      try {
        return profile ? JSON.parse(profile) : null;
      } catch {
        return null;
      }
    },
    
    isAuthenticated: () => !!AuthAPI.gameZone.getToken(),

    isVerified: () => {
      const profile = AuthAPI.gameZone.getProfile();
      if (!profile) return false;
      return profile.is_verified === true || 
             profile.is_verified === 1 ||
             (profile.verified_by !== null && profile.verified_by !== '' && profile.verified_by !== '0');
    },

    getVerificationStatus: () => {
      const profile = AuthAPI.gameZone.getProfile();
      if (!profile) return { verified: false, reason: 'No profile found' };
      
      if (profile.is_verified === true || profile.is_verified === 1) {
        return { verified: true, reason: 'is_verified is true' };
      }
      if (profile.verified_by && profile.verified_by !== '' && profile.verified_by !== '0') {
        return { verified: true, reason: 'verified_by has valid value' };
      }
      
      return { 
        verified: false, 
        reason: 'No valid verification found',
        is_verified: profile.is_verified,
        verified_by: profile.verified_by
      };
    },

    updateProfile: async (data) => {
      try {
        const response = await client.put("/gamezones/profile", data);
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          const currentProfile = AuthAPI.gameZone.getProfile();
          const updatedProfile = { ...currentProfile, ...responseData.data };
          const token = AuthAPI.gameZone.getToken();
          if (token) {
            localStorage.setItem(STORAGE_KEYS.GAME_ZONE.PROFILE, JSON.stringify(updatedProfile));
            localStorage.setItem(LEGACY_KEYS.GAME_ZONE_DATA, JSON.stringify(updatedProfile));
            localStorage.setItem(LEGACY_KEYS.ACTIVE_ZONE, JSON.stringify(updatedProfile));
          }
        }
        return responseData;
      } catch (error) {
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    },

    getZoneById: (id) => client.get(`/gamezones/${id}`)
  },

  // ==========================================
  // GLOBAL HELPERS
  // ==========================================
  getActiveStakeholder: () => {
    const role = getActiveAuthRole();
    return role === 'gamezone' ? 'game_zone' : role;
  },

  getCurrentRole: () => {
    const stakeholder = AuthAPI.getActiveStakeholder();
    if (!stakeholder) return null;
    const keyMap = {
      'user': STORAGE_KEYS.USER,
      'admin': STORAGE_KEYS.ADMIN,
      'game_zone': STORAGE_KEYS.GAME_ZONE
    };
    const keys = keyMap[stakeholder];
    return localStorage.getItem(keys.ROLE);
  },

  isAnyAuthenticated: () => {
    return !!(
      localStorage.getItem(STORAGE_KEYS.USER.TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.ADMIN.TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.GAME_ZONE.TOKEN) ||
      localStorage.getItem(LEGACY_KEYS.GAME_ZONE_TOKEN)
    );
  },

  logoutAll: () => {
    Object.values(STORAGE_KEYS).forEach(keys => {
      localStorage.removeItem(keys.TOKEN);
      localStorage.removeItem(keys.ROLE);
      localStorage.removeItem(keys.PROFILE);
    });

    Object.values(LEGACY_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    delete client.defaults.headers.common['Authorization'];
  },

  getToken: () => {
    const stakeholder = AuthAPI.getActiveStakeholder();
    if (stakeholder === 'user') return AuthAPI.user.getToken();
    if (stakeholder === 'admin') return AuthAPI.admin.getToken();
    if (stakeholder === 'game_zone') return AuthAPI.gameZone.getToken();
    return null;
  },

  validateToken: () => client.get("/auth/validate")
};

export default AuthAPI;