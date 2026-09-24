/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';
import AuthAPI from '../api/modules/auth';
import UserApi from '../api/modules/users.api';
import { AUTH_ROLES } from '../api/authConfig';
import { getApiErrorMessage, sanitizePhone, unwrapData } from '../lib/http';
import usePersistedAuth from '../hooks/usePersistedAuth';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const {
    profile: userProfile,
    setProfile: setUserProfile,
    isLoading: isUserLoading,
    setIsLoading: setIsUserLoading,
    logout: clearSession,
    isAuthenticated: isUserAuthenticated,
  } = usePersistedAuth(AUTH_ROLES.USER);

  const userLogin = useCallback(async (rawCredentials) => {
    setIsUserLoading(true);
    const phone = sanitizePhone(rawCredentials.phone || rawCredentials.phoneNumber);
    const credentials = { ...rawCredentials, phone, phoneNumber: phone };

    try {
      const response = await AuthAPI.user.login(credentials);
      const profile = AuthAPI.user.getProfile() || response?.data || null;
      const token = AuthAPI.user.getToken() || response?.token;

      if (response?.success && token && profile) {
        setUserProfile(profile);
        return { success: true, data: profile };
      }

      return {
        success: false,
        message: response?.message || 'Login failed.',
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(
          error,
          error.response?.status === 401 ? 'Invalid phone or password.' : 'Authentication failed.',
        ),
      };
    } finally {
      setIsUserLoading(false);
    }
  }, [setIsUserLoading, setUserProfile]);

  const userLogout = useCallback(() => {
    AuthAPI.user.logout();
    clearSession();
  }, [clearSession]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const response = await UserApi.getProfile();
      if (response?.success === false) {
        return { success: false, message: response?.message || 'Failed to fetch profile' };
      }
      const profile = unwrapData(response);
      setUserProfile(profile);
      AuthAPI.user.setProfile(profile);
      return { success: true, data: profile };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error, 'Failed to fetch profile') };
    } finally {
      setIsUserLoading(false);
    }
  }, [setIsUserLoading, setUserProfile]);

  const updateUserProfile = useCallback(async (profileData) => {
    try {
      const response = await UserApi.updateProfile(profileData);
      const updatedProfile = { ...userProfile, ...unwrapData(response) };
      setUserProfile(updatedProfile);
      AuthAPI.user.setProfile(updatedProfile);
      return {
        success: true,
        data: updatedProfile,
        message: response?.message || 'Profile updated successfully',
      };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error, 'Profile update failed') };
    }
  }, [setUserProfile, userProfile]);

  const getUserStats = useCallback(async () => {
    try {
      const response = await UserApi.getMyStats();
      return {
        success: true,
        data: unwrapData(response),
        message: response?.message || 'Stats fetched successfully',
      };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error, 'Failed to fetch stats') };
    }
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        userProfile,
        isUserLoading,
        isUserAuthenticated,
        userLogin,
        userLogout,
        getProfile: () => AuthAPI.user.getProfile() || userProfile,
        fetchUserProfile,
        updateUserProfile,
        getUserStats,
        getToken: () => AuthAPI.user.getToken(),
        getUserName: () => userProfile?.username || userProfile?.name || userProfile?.fullName || 'User',
        getUserEmail: () => userProfile?.email || '',
        getUserPhone: () => userProfile?.phone || '',
        getUserAvatar: () => userProfile?.avatar || null,
        getUserId: () => userProfile?.userId || userProfile?.id || null,
        getUserRole: () => userProfile?.role || 'user',
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export default UserAuthContext;
