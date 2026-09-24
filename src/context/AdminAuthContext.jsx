/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';
import AuthAPI from '../api/modules/auth';
import { AUTH_ROLES } from '../api/authConfig';
import { getApiErrorMessage, sanitizePhone } from '../lib/http';
import usePersistedAuth from '../hooks/usePersistedAuth';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const {
    profile: adminUser,
    setProfile: setAdminUser,
    isLoading: isAdminLoading,
    setIsLoading: setIsAdminLoading,
    logout: clearSession,
    isAuthenticated: isAdminAuthenticated,
  } = usePersistedAuth(AUTH_ROLES.ADMIN);

  const adminLogin = async (rawCredentials) => {
    setIsAdminLoading(true);
    const phone = sanitizePhone(rawCredentials.phone || rawCredentials.phoneNumber);
    const credentials = { ...rawCredentials, phone, phoneNumber: phone };

    try {
      const result = await AuthAPI.admin.login(credentials);
      const profile = AuthAPI.admin.getProfile()
        || result?.data
        || result?.user
        || result?.profile
        || null;
      const token = AuthAPI.admin.getToken() || result?.token;

      if (token && profile) {
        setAdminUser(profile);
        return { success: true, data: profile };
      }

      return {
        success: false,
        message: result?.message || 'Admin authentication failed.',
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(
          error,
          error.response?.status === 401 ? 'Invalid admin credentials.' : 'Admin login failed.',
        ),
      };
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adminLogout = useCallback(() => {
    AuthAPI.admin.logout();
    clearSession();
  }, [clearSession]);

  const isSuperAdmin = Boolean(adminUser?.role === 'Super Admin' || adminUser?.is_super === true);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminLoading,
        isAdminAuthenticated,
        isSuperAdmin,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
