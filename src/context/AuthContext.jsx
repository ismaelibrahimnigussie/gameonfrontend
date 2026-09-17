import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import AuthAPI from '../api/modules/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ==========================================
  // RESTORE SESSION ON PAGE RELOAD
  // ==========================================
  useEffect(() => {
    const restoreSession = () => {
      try {
        
        // Check which stakeholder is logged in
        const role = AuthAPI.getActiveStakeholder();
        
        if (role) {
          let profile = null;
          let token = null;
          
          // Get profile and token based on role
          if (role === 'game_zone') {
            profile = AuthAPI.gameZone?.getProfile?.();
            token = AuthAPI.gameZone?.getToken?.();
          } else if (role === 'admin') {
            profile = AuthAPI.admin?.getProfile?.();
            token = AuthAPI.admin?.getToken?.();
          } else if (role === 'user') {
            profile = AuthAPI.user?.getProfile?.();
            token = AuthAPI.user?.getToken?.();
          }
          
          
          if (token && profile) {
            setCurrentUser(profile);
            setCurrentRole(role);
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
          }
        } else {
        }
      } catch (e) {
      }
      setIsAuthLoading(false);
    };

    restoreSession();
  }, []);

  // ==========================================
  // LOGIN FUNCTION
  // ==========================================
  const login = async (stakeholderType, rawCredentials) => {
    setIsAuthLoading(true);
    
    // Normalize phone formatting and map field variants to prevent 401 field mismatch
    const phoneVal = (rawCredentials.phone || rawCredentials.phoneNumber || rawCredentials.owner_phone || '').toString().trim().replace(/\s+/g, '');
    const sanitizedCredentials = {
      ...rawCredentials,
      phone: phoneVal,
      phoneNumber: phoneVal,
      password: rawCredentials.password
    };

    try {
      let result;
      let profile = null;
      let role = null;
      
      if (stakeholderType === 'game_zone') {
        result = await AuthAPI.gameZone.login(sanitizedCredentials);
        profile = AuthAPI.gameZone?.getProfile?.();
        role = 'game_zone';
      } else if (stakeholderType === 'admin') {
        result = await AuthAPI.admin.login(sanitizedCredentials);
        profile = AuthAPI.admin?.getProfile?.();
        role = 'admin';
      } else if (stakeholderType === 'user') {
        result = await AuthAPI.user.login(sanitizedCredentials);
        profile = AuthAPI.user?.getProfile?.();
        role = 'user';
      } else {
        throw new Error(`Unknown stakeholder type: ${stakeholderType}`);
      }
      
      // Check success flags across varied backend envelope structures
      const isSuccess = Boolean(
        result?.success === true || 
        result?.data?.success === true || 
        result?.token || 
        result?.data?.token
      );

      // Refresh profile if initial getter returned null but result contains user payload
      if (!profile) {
        profile = result?.user || result?.data?.user || result?.profile || null;
      }
      
      if (isSuccess) {
        setCurrentUser(profile);
        setCurrentRole(role);
        
        const token = AuthAPI.getToken ? AuthAPI.getToken() : (result?.token || result?.data?.token);
        if (token) {
          client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return { success: true, data: profile };
      }
      
      return { 
        success: false, 
        message: result?.message || result?.data?.message || 'Invalid credentials or login failed.' 
      };
    } catch (error) {
      
      // Detailed extraction for 401 Unauthorized or other Axios HTTP errors
      const serverMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        (error.response?.status === 401 ? 'Invalid phone number or password.' : null) || 
        error.message || 
        'Authentication failed';

      return { 
        success: false, 
        message: serverMessage 
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ==========================================
  // LOGOUT FUNCTION
  // ==========================================
  const logout = useCallback(() => {
    if (typeof AuthAPI.logoutAll === 'function') {
      AuthAPI.logoutAll();
    }
    setCurrentUser(null);
    setCurrentRole(null);
    delete client.defaults.headers.common['Authorization'];
  }, []);

  // ==========================================
  // SYNC UPDATED PROFILE IN REACT STATE
  // ==========================================
  const updateCurrentUserState = useCallback((updatedFields) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      return updated;
    });
  }, []);

  // Helper flags derived from currentUser profile & currentRole
  const isSuperAdmin = currentRole === 'admin' && (currentUser?.role === 'Super Admin' || currentUser?.is_super === true);
  const isStandardAdmin = currentRole === 'admin' && (currentUser?.role === 'Admin' || !currentUser?.is_super);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const contextValue = {
    currentUser,
    currentRole,
    isAuthLoading,
    login,
    logout,
    updateCurrentUserState,
    isAuthenticated: !!currentUser && !!currentRole,
    isStandardUser: currentRole === 'user',
    isGameZone: currentRole === 'game_zone',
    isAdmin: currentRole === 'admin',
    isSuperAdmin,
    isStandardAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isAuthLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};