import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import AuthAPI from '../api/modules/auth';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Restore Admin Session
  useEffect(() => {
    const restoreAdminSession = () => {
      try {
        const activeRole = AuthAPI.getActiveStakeholder?.();
        if (activeRole === 'admin') {
          const profile = AuthAPI.admin?.getProfile?.();
          const token = AuthAPI.admin?.getToken?.();

          if (token && profile) {
            setAdminUser(profile);
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            AuthAPI.admin?.logout?.();
            delete client.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
      } finally {
        setIsAdminLoading(false);
      }
    };

    restoreAdminSession();
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setAdminUser(null);
      delete client.defaults.headers.common['Authorization'];
    };
    window.addEventListener('admin-auth-expired', handleExpired);
    return () => window.removeEventListener('admin-auth-expired', handleExpired);
  }, []);

  // Admin Login
  const adminLogin = async (rawCredentials) => {
    setIsAdminLoading(true);
    const phoneVal = (rawCredentials.phone || rawCredentials.phoneNumber || '').toString().trim().replace(/\s+/g, '');
    const credentials = { ...rawCredentials, phone: phoneVal, phoneNumber: phoneVal };

    try {
      const result = await AuthAPI.admin.login(credentials);
      const storedProfile = AuthAPI.admin?.getProfile?.();
      let profile = storedProfile || result?.user || result?.data?.user || result?.profile || result?.data?.profile || null;
      const token = AuthAPI.admin?.getToken?.() || result?.token || result?.data?.token;

      if (!profile && result?.data && !Array.isArray(result.data)) {
        profile = result.data;
      }

      if (token && profile) {
        const normalizedRole = profile.role || 'Admin';
        setAdminUser(profile);
        localStorage.setItem('admin_role', normalizedRole);
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true, data: profile };
      }

      return {
        success: false,
        message: result?.message || result?.data?.message || 'Admin authentication failed.',
      };
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        (error.response?.status === 401 ? 'Invalid admin credentials.' : null) ||
        'Admin login failed.';
      return { success: false, message: serverMessage };
    } finally {
      setIsAdminLoading(false);
    }
  };

  // Admin Logout
  const adminLogout = useCallback(() => {
    if (typeof AuthAPI.admin?.logout === 'function') {
      AuthAPI.admin.logout();
    } else {
      AuthAPI.logoutAll?.();
    }
    setAdminUser(null);
    delete client.defaults.headers.common['Authorization'];
  }, []);

  const isSuperAdmin = Boolean(adminUser?.role === 'Super Admin' || adminUser?.is_super === true);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminLoading,
        isAdminAuthenticated: !!adminUser,
        isSuperAdmin,
        adminLogin,
        adminLogout,
      }}
    >
      {!isAdminLoading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};