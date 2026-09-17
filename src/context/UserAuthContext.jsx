// context/UserAuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import AuthAPI from '../api/modules/auth';
import UserApi from '../api/modules/users.api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Restore User Session
  useEffect(() => {
    const restoreUserSession = () => {
      try {
        // Check if user is authenticated via AuthAPI
        if (AuthAPI.user.isAuthenticated()) {
          const profile = AuthAPI.user.getProfile();
          const token = AuthAPI.user.getToken();
          
          if (token && profile) {
            setUserProfile(profile);
            setIsUserAuthenticated(true);
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return;
          }
        }

        // Check localStorage directly as fallback
        const storedToken = localStorage.getItem('user_token');
        const storedProfile = localStorage.getItem('user_profile');
        
        if (storedToken && storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUserProfile(profile);
          setIsUserAuthenticated(true);
          client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          return;
        }
      } catch (err) {
        // Clear any corrupted data
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_profile');
      } finally {
        setIsUserLoading(false);
      }
    };

    restoreUserSession();
  }, []);

  // ==========================================
  // USER AUTHENTICATION (Using AuthAPI)
  // ==========================================

  // User Login
  const userLogin = useCallback(async (rawCredentials) => {
    setIsUserLoading(true);
    const phoneVal = (rawCredentials.phone || rawCredentials.phoneNumber || '')
      .toString()
      .trim()
      .replace(/\s+/g, '');
    const credentials = { ...rawCredentials, phone: phoneVal, phoneNumber: phoneVal };

    try {
      const response = await AuthAPI.user.login(credentials);
      
      if (response?.success) {
        const profile = AuthAPI.user.getProfile();
        const token = AuthAPI.user.getToken();

        if (token && profile) {
          // Save to state
          setUserProfile(profile);
          setIsUserAuthenticated(true);
          
          // Save to localStorage for persistence
          localStorage.setItem('user_token', token);
          localStorage.setItem('user_profile', JSON.stringify(profile));
          
          return { success: true, data: profile };
        }
      }

      return {
        success: false,
        message: response?.message || response?.data?.message || 'Login failed.'
      };
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        (error.response?.status === 401 ? 'Invalid phone or password.' : null) ||
        'Authentication failed.';
      return { success: false, message: serverMessage };
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  // User Logout
  const userLogout = useCallback(() => {
    try {
      AuthAPI.user.logout();
    } catch (error) {
    }
    
    // Clear state
    setUserProfile(null);
    setIsUserAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_profile');
    
    // Clear authorization header
    delete client.defaults.headers.common['Authorization'];
    
  }, []);

  // ==========================================
  // USER PROFILE METHODS (Using UserApi)
  // ==========================================

  // Fetch user profile from API
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const response = await UserApi.getProfile();
      
      // Check if response is successful
      if (response?.success !== false) {
        const profile = response.data || response;
        setUserProfile(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
        return { success: true, data: profile };
      }
      return { success: false, message: response?.message || 'Failed to fetch profile' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch profile'
      };
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      const response = await UserApi.updateProfile(profileData);
      
      // Get updated data
      const updatedData = response.data || response;
      
      // Merge with existing profile
      const updatedProfile = { ...userProfile, ...updatedData };
      
      // Update state and localStorage
      setUserProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      
      // Also update AuthAPI profile if needed
      const token = AuthAPI.user.getToken();
      if (token) {
        // AuthAPI doesn't have a direct update method, but we can update localStorage
        // The profile will be read from localStorage next time
      }
      
      return { 
        success: true, 
        data: updatedProfile,
        message: response?.message || 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Profile update failed'
      };
    }
  }, [userProfile]);

  // Get user stats
  const getUserStats = useCallback(async () => {
    try {
      const response = await UserApi.getMyStats();
      return {
        success: true,
        data: response.data || response,
        message: response?.message || 'Stats fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch stats'
      };
    }
  }, []);

  // Get current profile (alias)
  const getProfile = useCallback(() => {
    return AuthAPI.user.getProfile() || userProfile;
  }, [userProfile]);

  // ==========================================
  // ADMIN METHODS (Using UserApi)
  // ==========================================

  // Get all users (Admin only)
  const getAllUsers = useCallback(async () => {
    try {
      const response = await UserApi.getAll();
      return {
        success: true,
        data: response.data || response,
        message: response?.message || 'Users fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch users'
      };
    }
  }, []);

  // Get user by ID (Admin only)
  const getUserById = useCallback(async (id) => {
    try {
      const response = await UserApi.getById(id);
      return {
        success: true,
        data: response.data || response,
        message: response?.message || 'User fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch user'
      };
    }
  }, []);

  // Update user by ID (Admin only)
  const updateUserById = useCallback(async (id, data) => {
    try {
      const response = await UserApi.update(id, data);
      return {
        success: true,
        data: response.data || response,
        message: response?.message || 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update user'
      };
    }
  }, []);

  // Get user stats by ID (Admin only)
  const getUserStatsById = useCallback(async (id) => {
    try {
      const response = await UserApi.getStats(id);
      return {
        success: true,
        data: response.data || response,
        message: response?.message || 'User stats fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch user stats'
      };
    }
  }, []);

  // ==========================================
  // TOKEN & UTILITY METHODS
  // ==========================================

  // Get auth token
  const getToken = useCallback(() => {
    return AuthAPI.user.getToken() || localStorage.getItem('user_token');
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!userProfile) return false;
    return userProfile.role === role || userProfile.roles?.includes(role);
  }, [userProfile]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    if (!userProfile) return false;
    const adminRoles = ['Super Admin', 'Admin', 'System Admin', 'Support', 'Manager'];
    return adminRoles.includes(userProfile.role) || userProfile.roles?.some(r => adminRoles.includes(r));
  }, [userProfile]);

  // Check if user is game zone
  const isGameZone = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.role === 'game_zone' || userProfile.roles?.includes('game_zone');
  }, [userProfile]);

  // Check if user is verified (for game zone)
  const isVerified = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.is_verified === true || 
           userProfile.is_verified === 1 ||
           (userProfile.verified_by !== null && userProfile.verified_by !== '' && userProfile.verified_by !== '0');
  }, [userProfile]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    // State
    userProfile,
    isUserLoading,
    isUserAuthenticated,
    
    // Auth Methods (Using AuthAPI)
    userLogin,
    userLogout,
    
    // Profile Methods (Using UserApi)
    getProfile,
    fetchUserProfile,
    updateUserProfile,
    getUserStats,
    
    // Admin Methods (Using UserApi)
    getAllUsers,
    getUserById,
    updateUserById,
    getUserStatsById,
    
    // Token & Utility Methods
    getToken,
    hasRole,
    isAdmin,
    isGameZone,
    isVerified,
    
    // Helpers
    getUserName: () => userProfile?.username || userProfile?.name || userProfile?.fullName || 'User',
    getUserEmail: () => userProfile?.email || '',
    getUserPhone: () => userProfile?.phone || '',
    getUserAvatar: () => userProfile?.avatar || null,
    getUserId: () => userProfile?.userId || userProfile?.id || null,
    getUserRole: () => userProfile?.role || 'user',
    
    // AuthAPI passthrough (for advanced use)
    authAPI: AuthAPI
  };

  return (
    <UserAuthContext.Provider value={value}>
      {!isUserLoading && children}
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