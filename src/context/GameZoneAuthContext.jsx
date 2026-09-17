import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import AuthAPI from '../api/modules/auth';

const GameZoneAuthContext = createContext(null);

export const GameZoneAuthProvider = ({ children }) => {
  const [zoneUser, setZoneUser] = useState(null);
  const [isZoneLoading, setIsZoneLoading] = useState(true);

  // ==========================================
  // RESTORE GAME ZONE SESSION ON PAGE RELOAD
  // ==========================================
  useEffect(() => {
    const restoreZoneSession = () => {
      try {

        const token = AuthAPI.gameZone?.getToken?.();
        const profile = AuthAPI.gameZone?.getProfile?.();
        const role = AuthAPI.getActiveStakeholder?.();

        if (token && profile) {
          setZoneUser(profile);
          client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else if (role === 'game_zone') {
          AuthAPI.gameZone?.logout?.();
          setZoneUser(null);
        } else {
          setZoneUser(null);
        }
      } catch (e) {
        setZoneUser(null);
      }
      setIsZoneLoading(false);
    };

    restoreZoneSession();
  }, []);

  // ==========================================
  // GAME ZONE LOGIN FUNCTION
  // ==========================================
  const zoneLogin = async (rawCredentials) => {
    setIsZoneLoading(true);
    
    // Normalize phone formatting and map field variants
    const phoneVal = (rawCredentials.phone || rawCredentials.phoneNumber || rawCredentials.owner_phone || '')
      .toString()
      .trim()
      .replace(/\s+/g, '');
    
    const sanitizedCredentials = {
      ...rawCredentials,
      phone: phoneVal,
      phoneNumber: phoneVal,
      owner_phone: phoneVal,
      password: rawCredentials.password
    };

    try {
      const result = await AuthAPI.gameZone.login(sanitizedCredentials);
      
      // Get profile from API module or result
      let profile = AuthAPI.gameZone?.getProfile?.() || 
                    result?.user || 
                    result?.data?.user || 
                    result?.profile || 
                    null;
      
      // Get token from API module or result
      const token = AuthAPI.gameZone?.getToken?.() || 
                    result?.token || 
                    result?.data?.token || 
                    null;

      // Check success flags across varied backend envelope structures
      const isSuccess = Boolean(
        result?.success === true || 
        result?.data?.success === true || 
        token ||
        result?.token ||
        result?.data?.token
      );

      
      if (isSuccess && token && profile) {
        setZoneUser(profile);
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { 
          success: true, 
          data: profile,
          token: token
        };
      }
      
      // If token exists but profile doesn't, try to extract from result
      if (token && !profile) {
        // Try to get profile from result data
        profile = result?.user || result?.data?.user || result?.profile || null;
        if (profile) {
          setZoneUser(profile);
          client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return { 
            success: true, 
            data: profile,
            token: token
          };
        }
      }
      
      return { 
        success: false, 
        message: result?.message || result?.data?.message || 'Invalid credentials or login failed.' 
      };
    } catch (error) {
      
      // Detailed extraction for Axios HTTP errors
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
      setIsZoneLoading(false);
    }
  };

  // ==========================================
  // GAME ZONE REGISTRATION FUNCTION
  // ==========================================
  const zoneRegister = async (registrationData) => {
    setIsZoneLoading(true);
    
    try {
      const result = await AuthAPI.gameZone.register(registrationData);
      
      
      // Check if registration was successful
      const isSuccess = Boolean(
        result?.success === true || 
        result?.data?.success === true ||
        result?.message?.includes('success') ||
        result?.data?.message?.includes('success')
      );
      
      if (isSuccess) {
        // Auto-login after successful registration
        
        const loginResult = await zoneLogin({
          owner_phone: registrationData.owner_phone,
          password: registrationData.password
        });
        
        if (loginResult.success) {
          return {
            success: true,
            data: loginResult.data,
            message: 'Registration successful! Welcome to GameOn!'
          };
        } else {
          // Registration succeeded but auto-login failed
          return {
            success: true,
            autoLoginFailed: true,
            message: 'Registration successful! Please sign in manually.',
            loginError: loginResult.message
          };
        }
      }
      
      return { 
        success: false, 
        message: result?.message || result?.data?.message || 'Registration failed. Please try again.' 
      };
    } catch (error) {
      
      const serverMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Registration failed. Please try again.';

      return { 
        success: false, 
        message: serverMessage 
      };
    } finally {
      setIsZoneLoading(false);
    }
  };

  // ==========================================
  // GAME ZONE LOGOUT FUNCTION
  // ==========================================
  const zoneLogout = useCallback(() => {
    
    try {
      // Call game zone logout if available
      if (typeof AuthAPI.gameZone?.logout === 'function') {
        AuthAPI.gameZone.logout();
      } else if (typeof AuthAPI.logoutAll === 'function') {
        AuthAPI.logoutAll();
      }
      
      // Clear state
      setZoneUser(null);
      
      // Remove authorization header
      delete client.defaults.headers.common['Authorization'];
      
    } catch (error) {
    }
  }, []);

  // ==========================================
  // UPDATE ZONE USER PROFILE
  // ==========================================
  const updateZoneUser = useCallback((updatedFields) => {
    setZoneUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      
      // Update stored profile if available
      if (typeof AuthAPI.gameZone?.setProfile === 'function') {
        AuthAPI.gameZone.setProfile(updated);
      }
      
      return updated;
    });
  }, []);

  // ==========================================
  // CHECK IF TOKEN IS VALID
  // ==========================================
  const validateToken = useCallback(() => {
    try {
      const token = AuthAPI.gameZone?.getToken?.();
      return !!token;
    } catch (error) {
      return false;
    }
  }, []);

  // ==========================================
  // GET CURRENT TOKEN
  // ==========================================
  const getZoneToken = useCallback(() => {
    try {
      return AuthAPI.gameZone?.getToken?.() || null;
    } catch (error) {
      return null;
    }
  }, []);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const contextValue = {
    zoneUser,
    isZoneLoading,
    isZoneAuthenticated: !!zoneUser,
    zoneLogin,
    zoneRegister,
    zoneLogout,
    updateZoneUser,
    validateToken,
    getZoneToken,
    // Helper properties
    isZoneUser: !!zoneUser,
    zoneUserId: zoneUser?.id || zoneUser?._id || null,
    zoneName: zoneUser?.zone_name || zoneUser?.name || null,
    zoneOwnerName: zoneUser?.owner_name || zoneUser?.ownerName || null,
    zonePhone: zoneUser?.owner_phone || zoneUser?.phone || null,
  };

  return (
    <GameZoneAuthContext.Provider value={contextValue}>
      {!isZoneLoading && children}
    </GameZoneAuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK FOR USING GAME ZONE AUTH
// ==========================================
export const useGameZoneAuth = () => {
  const context = useContext(GameZoneAuthContext);
  if (!context) {
    throw new Error('useGameZoneAuth must be used within a GameZoneAuthProvider');
  }
  return context;
};