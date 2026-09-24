import { useCallback, useEffect, useState } from 'react';
import { AUTH_EXPIRED_EVENT } from '../api/authConfig';
import { clearAuthRole, readAuthSession } from '../api/authSession';

export default function usePersistedAuth(role) {
  const [profile, setProfile] = useState(() => readAuthSession(role)?.profile ?? null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const eventName = AUTH_EXPIRED_EVENT[role];
    if (!eventName) return undefined;

    const handleExpired = () => setProfile(null);
    window.addEventListener(eventName, handleExpired);
    return () => window.removeEventListener(eventName, handleExpired);
  }, [role]);

  const logout = useCallback(() => {
    clearAuthRole(role);
    setProfile(null);
  }, [role]);

  return {
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    logout,
    isAuthenticated: Boolean(profile),
  };
}
