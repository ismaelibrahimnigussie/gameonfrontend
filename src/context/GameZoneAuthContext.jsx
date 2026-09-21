/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';
import AuthAPI from '../api/modules/auth';
import { AUTH_ROLES } from '../api/authConfig';
import { getApiErrorMessage, sanitizePhone } from '../lib/http';
import usePersistedAuth from '../hooks/usePersistedAuth';

const GameZoneAuthContext = createContext(null);

export const GameZoneAuthProvider = ({ children }) => {
  const {
    profile: zoneUser,
    setProfile: setZoneUser,
    isLoading: isZoneLoading,
    setIsLoading: setIsZoneLoading,
    logout: clearSession,
    isAuthenticated: isZoneAuthenticated,
  } = usePersistedAuth(AUTH_ROLES.GAMEZONE);

  const zoneLogin = useCallback(async (rawCredentials) => {
    setIsZoneLoading(true);
    const phone = sanitizePhone(
      rawCredentials.phone || rawCredentials.phoneNumber || rawCredentials.owner_phone,
    );
    const credentials = {
      ...rawCredentials,
      phone,
      phoneNumber: phone,
      owner_phone: phone,
    };

    try {
      const result = await AuthAPI.gameZone.login(credentials);
      const profile = AuthAPI.gameZone.getProfile() || result?.data || result?.user || result?.profile || null;
      const token = AuthAPI.gameZone.getToken() || result?.token;

      if (token && profile) {
        setZoneUser(profile);
        return { success: true, data: profile, token };
      }

      return {
        success: false,
        message: result?.message || 'Invalid credentials or login failed.',
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(
          error,
          error.response?.status === 401 ? 'Invalid phone number or password.' : 'Authentication failed',
        ),
      };
    } finally {
      setIsZoneLoading(false);
    }
  }, [setIsZoneLoading, setZoneUser]);

  const zoneRegister = useCallback(async (registrationData) => {
    setIsZoneLoading(true);

    try {
      const result = await AuthAPI.gameZone.register(registrationData);
      const isSuccess = Boolean(
        result?.success === true
        || result?.message?.toLowerCase?.().includes('success'),
      );

      if (!isSuccess) {
        return {
          success: false,
          message: result?.message || 'Registration failed. Please try again.',
        };
      }

      const loginResult = await zoneLogin({
        owner_phone: registrationData.owner_phone,
        password: registrationData.password,
      });

      if (loginResult.success) {
        return {
          success: true,
          data: loginResult.data,
          message: 'Registration successful! Welcome to GameOn!',
        };
      }

      return {
        success: true,
        autoLoginFailed: true,
        message: 'Registration successful! Please sign in manually.',
        loginError: loginResult.message,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Registration failed. Please try again.'),
      };
    } finally {
      setIsZoneLoading(false);
    }
  }, [setIsZoneLoading, zoneLogin]);

  const zoneLogout = useCallback(() => {
    AuthAPI.gameZone.logout();
    clearSession();
  }, [clearSession]);

  const updateZoneUser = useCallback((updatedFields) => {
    setZoneUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      AuthAPI.gameZone.setProfile(updated);
      return updated;
    });
  }, [setZoneUser]);

  const getZoneToken = useCallback(() => AuthAPI.gameZone.getToken() || null, []);

  return (
    <GameZoneAuthContext.Provider
      value={{
        zoneUser,
        isZoneLoading,
        isZoneAuthenticated,
        zoneLogin,
        zoneRegister,
        zoneLogout,
        updateZoneUser,
        getZoneToken,
        isZoneUser: isZoneAuthenticated,
        zoneUserId: zoneUser?.id || zoneUser?._id || null,
        zoneName: zoneUser?.zone_name || zoneUser?.name || null,
        zoneOwnerName: zoneUser?.owner_name || zoneUser?.ownerName || null,
        zonePhone: zoneUser?.owner_phone || zoneUser?.phone || null,
      }}
    >
      {children}
    </GameZoneAuthContext.Provider>
  );
};

export const useGameZoneAuth = () => {
  const context = useContext(GameZoneAuthContext);
  if (!context) {
    throw new Error('useGameZoneAuth must be used within a GameZoneAuthProvider');
  }
  return context;
};
