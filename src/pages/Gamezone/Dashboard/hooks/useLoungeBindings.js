import { useCallback, useEffect, useMemo } from 'react';
import AuthAPI from '../../../../api/modules/auth';
import SessionAPI from '../../../../api/modules/sessions.api';
import { fetchGameStations, fetchLoungeCore, mergeSessionList, mergeSessionModal } from './loungeLoad';
import {
  editingDetail,
  editingGame,
  logoutSessionForm,
  loungeVerified,
  modalOpenPlan,
  openPlayerHistory,
  resolveZoneId,
  sessionPlan,
  stationDetailContext,
  stationSnapshot,
} from './loungeModel';

export function useLoungeBindings(auth, field) {
  const {
    zoneUser,
    isZoneAuthenticated,
    isZoneLoading,
    zoneLogout,
    getZoneToken,
    updateZoneUser,
  } = auth;
  const {
    zoneInfo,
    setZoneInfo,
    setGames,
    stations,
    setStations,
    gameDetails,
    setGameDetails,
    setSessions,
    creditBalance,
    setCreditBalance,
    setIsLoading,
    setIsRefreshing,
    setLoadError,
    setToast,
    modal,
    setModal,
    setFormError,
    setNewGame,
    setNewDetail,
    newSession,
    setNewSession,
    setTransferReminder,
    setTransferCandidates,
    setTransferLoading,
    setSessionPlayerCandidates,
    setSessionPlayerLoading,
    playerHistoryFilter,
    initialLoadDoneRef,
  } = field;

  const targetProfile = zoneUser || AuthAPI.gameZone.getProfile();

  const getZoneId = useCallback(() => resolveZoneId(targetProfile), [targetProfile]);
  const zoneId = getZoneId();

  const selectedSessionDetail = useMemo(
    () => gameDetails.find((detail) => String(detail.id) === String(newSession.detail_id)) || null,
    [gameDetails, newSession.detail_id]
  );

  const selectedSessionStation = useMemo(
    () => stations.find((station) => String(station.id) === String(newSession.station_id)) || null,
    [stations, newSession.station_id]
  );

  const getDefaultPlayerCount = useCallback((detail) => {
    const nextCount = Number(detail?.max_players ?? detail?.maxPlayers ?? 2);
    return Number.isFinite(nextCount) && nextCount > 0 ? nextCount : 1;
  }, []);

  const sessionInviteCode = useMemo(() => {
    const stationId = selectedSessionStation?.id || selectedSessionDetail?.station_id;
    if (!stationId) return '';
    return `STATION-${stationId}`;
  }, [selectedSessionStation, selectedSessionDetail]);

  const isVerified = useMemo(
    () => loungeVerified(zoneInfo, targetProfile),
    [zoneInfo, targetProfile]
  );

  const canManage = isVerified;
  const canCreateRandomSession = isVerified && Number(creditBalance || 0) > 0;
  const sessionLockMessage = !isVerified
    ? 'Verify your zone to manage play sessions.'
    : Number(creditBalance || 0) <= 0
      ? 'You can still generate invite QR codes, but random-player sessions need credits.'
      : '';

  const setupAuth = useCallback(() => {
    return Boolean(
      getZoneToken()
      || targetProfile?.token
      || targetProfile?.access_token
      || localStorage.getItem('gamezone_token'),
    );
  }, [targetProfile, getZoneToken]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateSessionState = useCallback((updatedSession) => {
    if (!updatedSession || typeof updatedSession !== 'object') return;
    const sessionKey = updatedSession.play_id ?? updatedSession.id;
    if (sessionKey === null || sessionKey === undefined) return;
    setSessions((prev) => mergeSessionList(prev, updatedSession));
    setModal((prev) => mergeSessionModal(prev, updatedSession));
  }, [setModal, setSessions]);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError('');

    if (!isZoneAuthenticated || !zoneId) {
      setLoadError('Session invalid or zone not found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!setupAuth()) {
      setLoadError('Game zone token missing. Please sign in again.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const core = await fetchLoungeCore(zoneId);
      setZoneInfo(core.zoneInfo);
      setGames(core.games);
      setCreditBalance(core.creditBalance);
      setGameDetails(core.gameDetails);
      setSessions(core.sessions);
      setStations(core.games.length > 0 ? await fetchGameStations(core.games) : []);
      if (refresh) {
        setToast({ message: '✨ Dashboard refreshed', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    zoneId,
    setupAuth,
    isZoneAuthenticated,
    setCreditBalance,
    setGameDetails,
    setGames,
    setIsLoading,
    setIsRefreshing,
    setLoadError,
    setSessions,
    setStations,
    setToast,
    setZoneInfo,
  ]);

  useEffect(() => {
    if (isZoneLoading) return;
    if (!isZoneAuthenticated || !zoneId) return;
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      loadData();
    }
  }, [zoneId, isZoneAuthenticated, isZoneLoading, loadData, initialLoadDoneRef]);

  useEffect(() => {
    if (isZoneLoading || !isZoneAuthenticated || !zoneId) return undefined;

    let mounted = true;
    const refreshSessions = async () => {
      if (document.hidden || !setupAuth()) return;
      try {
        const response = await SessionAPI.getZoneSessions();
        if (mounted) setSessions(response?.data ?? response ?? []);
      } catch {
        // Background session refresh is best-effort.
      }
    };

    const timer = window.setInterval(refreshSessions, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [zoneId, isZoneAuthenticated, isZoneLoading, setupAuth, setSessions]);

  const handleLogout = () => {
    zoneLogout();
    setZoneInfo(null);
    setGames([]);
    setStations([]);
    setSessions([]);
    setModal({ type: null, data: null });
    setTransferReminder(null);
    setNewSession(logoutSessionForm());
  };

  const handleSaveProfile = async (profileData) => {
    const response = await AuthAPI.gameZone.updateProfile(profileData);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to update profile');
    }

    const savedProfile = response?.data?.data ?? response?.data ?? response;
    const profile = savedProfile?.data ?? savedProfile;

    setZoneInfo(profile);
    updateZoneUser(profile);

    return response;
  };

  const openModal = (type, data = null) => {
    const plan = modalOpenPlan(type, data, { isVerified, gameDetails });
    if (plan.blocked === 'verify') {
      showToast('Please verify your lounge first', 'warning');
      return;
    }
    if (plan.blocked === 'session') {
      showToast(sessionLockMessage || 'Please verify your lounge first', 'warning');
      return;
    }
    setFormError('');
    if (plan.newGame) setNewGame(plan.newGame);
    if (plan.newDetail) setNewDetail(plan.newDetail);
    if (plan.newSession) setNewSession(plan.newSession);
    setModal(plan.modal);
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    setFormError('');
    setTransferCandidates([]);
    setTransferLoading(false);
    setSessionPlayerCandidates([]);
    setSessionPlayerLoading(false);
  };

  const visiblePlayerHistory = useMemo(
    () => openPlayerHistory(modal.data?.history, playerHistoryFilter),
    [modal.data, playerHistoryFilter]
  );
  const isQuickPlayLocked = Boolean(newSession.detail_id && newSession.station_id);
  const pricing = sessionPlan(gameDetails, newSession);

  return {
    targetProfile,
    zoneId,
    selectedSessionDetail,
    selectedSessionStation,
    getDefaultPlayerCount,
    sessionInviteCode,
    isVerified,
    canManage,
    canCreateRandomSession,
    sessionLockMessage,
    ...stationSnapshot(stations),
    showToast,
    updateSessionState,
    loadData,
    handleLogout,
    handleSaveProfile,
    openModal,
    closeModal,
    isEditingGame: editingGame(modal),
    visiblePlayerHistory,
    isEditingDetail: editingDetail(modal),
    isStationDetailContext: stationDetailContext(modal),
    isQuickPlayLocked,
    ...pricing,
  };
}
