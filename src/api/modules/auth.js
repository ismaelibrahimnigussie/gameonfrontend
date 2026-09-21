import client from '../client';
import { AUTH_ROLES } from '../authConfig';
import {
  clearAllAuth,
  clearAuthRole,
  getActiveAuthRole,
  getProfileForRole,
  getTokenForRole,
  persistAuthSession,
  setProfileForRole,
} from '../authSession';

const extractAuthPayload = (response) => {
  const body = response?.data || response || {};
  const nested = body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
    ? body.data
    : body;
  const token = body.token || nested.token;
  const profile = nested.user
    || nested.profile
    || nested.data
    || (nested && !nested.token ? nested : null);

  return { body, token, profile };
};

const requestAuth = async (requestFn, role, { exclusive = false } = {}) => {
  try {
    const response = await requestFn();
    const { body, token, profile } = extractAuthPayload(response);
    const success = body?.success === true || Boolean(token && profile);

    if (success && token && profile) {
      persistAuthSession(role, { token, profile, exclusive });
      return { success: true, token, data: profile, message: body?.message };
    }

    return body;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

const createSessionApi = (role, { exclusiveLogin = false } = {}) => ({
  getToken: () => getTokenForRole(role),
  getProfile: () => getProfileForRole(role),
  setProfile: (profile) => setProfileForRole(role, profile),
  isAuthenticated: () => Boolean(getTokenForRole(role)),
  logout: () => clearAuthRole(role),
  persist: (token, profile) => persistAuthSession(role, { token, profile, exclusive: exclusiveLogin }),
});

const AuthAPI = {
  user: {
    ...createSessionApi(AUTH_ROLES.USER),
    register: (data) => requestAuth(
      () => client.post('/auth/register', data),
      AUTH_ROLES.USER,
    ),
    login: (credentials) => requestAuth(
      () => client.post('/auth/login', credentials),
      AUTH_ROLES.USER,
    ),
  },

  admin: {
    ...createSessionApi(AUTH_ROLES.ADMIN),
    register: (data) => requestAuth(
      () => client.post('/auth/admin/register', data),
      AUTH_ROLES.ADMIN,
    ),
    login: (credentials) => requestAuth(
      () => client.post('/auth/admin/login', credentials, {
        headers: { Authorization: undefined },
      }),
      AUTH_ROLES.ADMIN,
    ),
    verifyGameZone: (zoneId) => client.patch(`/gamezones/${zoneId}/verify`),
    unverifyGameZone: (zoneId) => client.patch(`/gamezones/${zoneId}/unverify`),
    getGameZoneVerificationStatus: (zoneId) => client.get(`/gamezones/${zoneId}/verification-status`),
  },

  gameZone: {
    ...createSessionApi(AUTH_ROLES.GAMEZONE, { exclusiveLogin: true }),
    register: (data) => requestAuth(
      () => client.post('/gamezones', data, {
        headers: { Authorization: undefined },
      }),
      AUTH_ROLES.GAMEZONE,
      { exclusive: true },
    ),
    login: (credentials) => requestAuth(
      () => client.post('/gamezones/login', credentials, {
        headers: { Authorization: undefined },
      }),
      AUTH_ROLES.GAMEZONE,
      { exclusive: true },
    ),
    isVerified: () => {
      const profile = getProfileForRole(AUTH_ROLES.GAMEZONE);
      if (!profile) return false;
      return profile.is_verified === true
        || profile.is_verified === 1
        || (profile.verified_by !== null && profile.verified_by !== '' && profile.verified_by !== '0');
    },
    updateProfile: async (data) => {
      try {
        const response = await client.put('/gamezones/profile', data);
        const body = response?.data || response;
        if (body?.success) {
          const currentProfile = getProfileForRole(AUTH_ROLES.GAMEZONE);
          const updatedProfile = { ...currentProfile, ...body.data };
          if (getTokenForRole(AUTH_ROLES.GAMEZONE)) {
            setProfileForRole(AUTH_ROLES.GAMEZONE, updatedProfile);
          }
        }
        return body;
      } catch (error) {
        if (error.response?.data) return error.response.data;
        throw error;
      }
    },
    getZoneById: (id) => client.get(`/gamezones/${id}`),
  },

  getActiveStakeholder: () => {
    const role = getActiveAuthRole();
    return role === 'gamezone' ? 'game_zone' : role;
  },

  isAnyAuthenticated: () => Boolean(getActiveAuthRole()),
  logoutAll: () => clearAllAuth(),
  getToken: () => getTokenForRole(getActiveAuthRole()),
  validateToken: () => client.get('/auth/validate'),
};

export default AuthAPI;
