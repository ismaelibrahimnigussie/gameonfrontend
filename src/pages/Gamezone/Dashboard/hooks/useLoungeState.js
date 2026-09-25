import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameZoneAuth } from '../../../../context/GameZoneAuthContext';
import AuthAPI from '../../../../api/modules/auth';
import CreditAPI from '../../../../api/modules/credits.api';
import GameAPI from '../../../../api/modules/games.api';
import GameDetailsAPI from '../../../../api/modules/gameDetails.api';
import GameZoneAPI from '../../../../api/modules/gamezones.api';
import SessionAPI from '../../../../api/modules/sessions.api';
import StationAPI from '../../../../api/modules/stations.api';

export function useLoungeState() {
  const { 
    zoneUser, 
    isZoneAuthenticated, 
    isZoneLoading,
    zoneLogout,
    getZoneToken,
    updateZoneUser
  } = useGameZoneAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [zoneInfo, setZoneInfo] = useState(null);
  const [games, setGames] = useState([]);
  const [stations, setStations] = useState([]);
  const [gameDetails, setGameDetails] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [creditBalance, setCreditBalance] = useState(0);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState(null);

  // Modal Forms State
  const [modal, setModal] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [newGame, setNewGame] = useState({
    game_name: '', description: '', game_type: '', max_players: ''
  });
  const [newDetail, setNewDetail] = useState({
    game_id: '', station_id: '', game_rule: '',
    duration_minutes: '30', extra_time_minutes: '15',
    main_price: '', extra_price: ''
  });
  const [newStation, setNewStation] = useState({
    game_id: '', station_name: '', status: 'Available'
  });
  const [newSession, setNewSession] = useState({
    detail_id: '',
    station_id: '',
    player_id: '',
    player_count: 2,
    player_nicknames: [],
    assign_random_player: true,
    mode: 'strict',
    payment_timing: 'After Game',
    planned_rounds: 1,
    payment_method: 'Cash',
    payment_provider: '',
    transaction_reference: '',
    sender_name: '',
    notes: ''
  });
  const [focusSessionId, setFocusSessionId] = useState(null);
  const [transferReminder, setTransferReminder] = useState(null);
  const [transferCandidates, setTransferCandidates] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [sessionPlayerCandidates, setSessionPlayerCandidates] = useState([]);
  const [sessionPlayerLoading, setSessionPlayerLoading] = useState(false);
  const [manualPlayerCandidates, setManualPlayerCandidates] = useState([]);
  const [manualPlayerLoading, setManualPlayerLoading] = useState(false);
  const [playerProfileLoading, setPlayerProfileLoading] = useState(false);
  const [playerHistoryFilter, setPlayerHistoryFilter] = useState('open');

  // Use ref to prevent multiple initial loads
  const initialLoadDoneRef = useRef(false);

  const targetProfile = zoneUser || AuthAPI.gameZone.getProfile();

  const getZoneId = useCallback(() => {
    if (!targetProfile) return null;
    const ids = [
      targetProfile?.zone?.id, targetProfile?.zone?.zone_id,
      targetProfile?.zone_id, targetProfile?.id,
      targetProfile?.data?.zone_id, targetProfile?.data?.id,
      targetProfile?.zoneId, targetProfile?.zoneID,
      targetProfile?._id
    ];
    return ids.find(id => id !== null && id !== undefined && id !== '') || null;
  }, [targetProfile]);

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

  const readBalance = (payload) => {
    return (
      payload?.data?.balance ??
      payload?.data?.credit_balance ??
      payload?.balance ??
      payload?.credit_balance ??
      0
    );
  };

  const sessionInviteCode = useMemo(() => {
    const stationId = selectedSessionStation?.id || selectedSessionDetail?.station_id;
    if (!stationId) return '';
    return `STATION-${stationId}`;
  }, [selectedSessionStation, selectedSessionDetail]);

  const isVerified = useMemo(() => {
    const check = (data) => {
      if (!data) return false;
      const verified = data?.is_verified ?? data?.verified ?? data?.isVerified;
      if (verified === true || verified === 1 || verified === '1' || verified === 'true') return true;
      const by = data?.verified_by ?? data?.verifiedBy;
      return by !== null && by !== undefined && by !== '' && by !== '0';
    };
    return check(zoneInfo) || check(targetProfile);
  }, [zoneInfo, targetProfile]);

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

  // Computed Metrics
  const activeStations = stations.filter(s =>
    ['active', 'available'].includes(String(s.status || '').toLowerCase())
  ).length;

  const occupiedStations = stations.filter(s =>
    String(s.status || '').toLowerCase() === 'occupied'
  ).length;

  const availabilityRate = stations.length > 0
    ? Math.round((activeStations / stations.length) * 100)
    : 0;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateSessionState = useCallback((updatedSession) => {
    if (!updatedSession || typeof updatedSession !== 'object') return;

    const sessionKey = updatedSession.play_id ?? updatedSession.id;
    if (sessionKey === null || sessionKey === undefined) return;

    const systemPaid = Number(updatedSession.system_paid_amount ?? updatedSession.systemPaidAmount ?? updatedSession.credits_used ?? 0);
    const userPaid = Number(updatedSession.user_paid_amount ?? updatedSession.userPaidAmount ?? 0);
    const totalPaid = Number(updatedSession.total_paid_amount ?? updatedSession.totalPrice ?? userPaid + systemPaid);

    setSessions((prev) => prev.map((session) => {
      const currentKey = session.play_id ?? session.id;
      if (String(currentKey) === String(sessionKey)) {
        return {
          ...session,
          ...updatedSession,
          user_paid_amount: userPaid,
          system_paid_amount: systemPaid,
          total_paid_amount: totalPaid,
        };
      }
      return session;
    }));

    setModal((prev) => {
      if (prev.type !== 'session') return prev;
      const modalKey = prev.data?.play_id ?? prev.data?.id;
      if (String(modalKey) === String(sessionKey)) {
        return {
          ...prev,
          data: {
            ...prev.data,
            ...updatedSession,
            user_paid_amount: userPaid,
            system_paid_amount: systemPaid,
            total_paid_amount: totalPaid,
          }
        };
      }
      return prev;
    });
  }, []);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError('');

    // Check authentication first
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
      const [zoneRes, gamesRes, creditRes, detailsRes, sessionsRes] = await Promise.all([
        GameZoneAPI.getZoneById(zoneId),
        GameAPI.getGamesByZone(zoneId),
        CreditAPI.getZoneBalance(zoneId).catch(() => ({ balance: 0 })),
        GameDetailsAPI.getAll().catch(() => ({ data: [] })),
        SessionAPI.getZoneSessions().catch(() => ({ data: [] }))
      ]);

      const zonePayload = zoneRes?.data?.data ?? zoneRes?.data?.zone ?? zoneRes?.data ?? zoneRes?.zone ?? zoneRes;
      setZoneInfo(zonePayload);
      const gamesData = gamesRes?.games ?? gamesRes?.data ?? gamesRes ?? [];
      setGames(gamesData);
      setCreditBalance(readBalance(creditRes));
      setGameDetails(detailsRes?.data ?? detailsRes ?? []);
      setSessions(sessionsRes?.data ?? sessionsRes ?? []);

      if (gamesData.length > 0) {
        const stationResults = await Promise.all(
          gamesData.filter(g => g.id).map(game =>
            StationAPI.getStationsByGame(game.id)
              .then(res => ({ gameId: game.id, data: res?.stations ?? res?.data ?? res ?? [] }))
              .catch(() => ({ gameId: game.id, data: [] }))
          )
        );

        const flatStations = stationResults.flatMap(result => {
          const game = gamesData.find(g => g.id === result.gameId);
          return (result.data || []).map(s => ({
            ...s,
            gameName: game?.game_name || 'Unknown',
            gameId: result.gameId
          }));
        });
        setStations(flatStations);
      } else {
        setStations([]);
      }

      if (refresh) showToast('✨ Dashboard refreshed');
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [zoneId, setupAuth, isZoneAuthenticated]);

  // Only load data once on mount, or when zoneId/isZoneAuthenticated changes
  useEffect(() => {
    if (isZoneLoading) return;
    
    // Skip if already loaded or if not authenticated
    if (!isZoneAuthenticated || !zoneId) {
      return;
    }
    
    // Only load if not loaded yet
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      loadData();
    }
  }, [zoneId, isZoneAuthenticated, isZoneLoading, loadData]);

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
  }, [zoneId, isZoneAuthenticated, isZoneLoading, setupAuth]);

  const handleLogout = () => {
    zoneLogout();
    setZoneInfo(null);
    setGames([]);
    setStations([]);
    setSessions([]);
    setModal({ type: null, data: null });
    setTransferReminder(null);
    setNewSession({
      detail_id: '',
      station_id: '',
      player_id: '',
      player_count: 2,
      player_nicknames: [],
      assign_random_player: true,
      mode: 'strict'
    });
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
    if ((type === 'game' || type === 'detail' || type === 'station') && !isVerified) {
      showToast('Please verify your lounge first', 'warning');
      return;
    }
    if (type === 'session' && !isVerified) {
      showToast(sessionLockMessage || 'Please verify your lounge first', 'warning');
      return;
    }
    setFormError('');
    if (type === 'game') {
      setNewGame(
        data?.id
          ? {
              game_name: data.game_name || '',
              description: data.description || '',
              game_type: data.game_type || '',
              max_players: data.max_players ?? ''
            }
          : {
              game_name: '',
              description: '',
              game_type: '',
              max_players: ''
            }
      );
    }

    if (type === 'detail') {
      const isStationContext = Boolean(
        data?.station_name &&
        data?.game_rule === undefined &&
        data?.duration_minutes === undefined &&
        data?.extra_time_minutes === undefined &&
        data?.main_price === undefined &&
        data?.extra_price === undefined
      );

      if (isStationContext) {
        const stationId = String(data.id ?? data.station_id ?? '');
        const existingDetail = gameDetails.find((detail) => String(detail.station_id) === stationId) || null;

        if (existingDetail) {
          setNewDetail({
            game_id: String(existingDetail.game_id ?? data.game_id ?? data.gameId ?? ''),
            station_id: String(existingDetail.station_id ?? stationId),
            game_rule: existingDetail.game_rule || '',
            duration_minutes: existingDetail.duration_minutes ?? '30',
            extra_time_minutes: existingDetail.extra_time_minutes ?? '15',
            main_price: existingDetail.main_price ?? '',
            extra_price: existingDetail.extra_price ?? ''
          });
          setModal({ type, data: { ...existingDetail, station_name: data.station_name || existingDetail.station_name || 'Station' } });
          return;
        }

        setNewDetail({
          game_id: String(data.game_id ?? data.gameId ?? ''),
          station_id: stationId,
          game_rule: '',
          duration_minutes: '30',
          extra_time_minutes: '15',
          main_price: '',
          extra_price: ''
        });
        setModal({
          type,
          data: {
            station_id: stationId,
            station_name: data.station_name || 'Station',
            game_id: data.game_id ?? data.gameId ?? '',
          }
        });
        return;
      }

      setNewDetail(
        data?.id
          ? {
              game_id: data.game_id ?? '',
              station_id: data.station_id ?? '',
              game_rule: data.game_rule || '',
              duration_minutes: data.duration_minutes ?? '30',
              extra_time_minutes: data.extra_time_minutes ?? '15',
              main_price: data.main_price ?? '',
              extra_price: data.extra_price ?? ''
            }
          : {
              game_id: data?.id ?? '',
              station_id: '',
              game_rule: '',
              duration_minutes: '30',
              extra_time_minutes: '15',
              main_price: '',
              extra_price: ''
            }
      );
    }

    if (type === 'session') {
      const lockedDetailId = data?.detail_id ? String(data.detail_id) : '';
      const lockedStationId = data?.station_id ? String(data.station_id) : '';
      const defaultPlayerCount = Math.max(Number(data?.player_count || 2), 1);
      const defaultNicknames = Array.from({ length: defaultPlayerCount }, (_, index) => `Player ${index + 1}`);

      setNewSession({
        detail_id: lockedDetailId,
        station_id: lockedStationId,
        player_id: '',
        player_count: defaultPlayerCount,
        player_nicknames: defaultNicknames,
        assign_random_player: true,
        mode: 'strict',
        payment_timing: 'After Game',
        planned_rounds: 1,
        payment_method: 'Cash',
        payment_provider: '',
        transaction_reference: '',
        sender_name: '',
        notes: ''
      });

      if (lockedDetailId) {
        const matchingDetail = gameDetails.find((detail) => String(detail.id) === String(lockedDetailId));
        if (matchingDetail?.station_id) {
          setNewSession((prev) => ({
            ...prev,
            station_id: prev.station_id || String(matchingDetail.station_id),
            detail_id: String(matchingDetail.id)
          }));
        }
      }
    }

    setModal({ type, data });
  };
  
  const closeModal = () => {
    setModal({ type: null, data: null });
    setFormError('');
    setTransferCandidates([]);
    setTransferLoading(false);
    setSessionPlayerCandidates([]);
    setSessionPlayerLoading(false);
  };

  const isEditingGame = modal.type === 'game' && Boolean(modal.data?.id);
  const visiblePlayerHistory = useMemo(() => {
    const history = Array.isArray(modal.data?.history) ? modal.data.history : [];
    if (playerHistoryFilter === 'all') return history;
    return history.filter((session) => {
      const status = String(session.status || '').toLowerCase();
      const isUnended = !['finished', 'cancelled'].includes(status);
      const isUnpaid = String(session.payment_status || '').toLowerCase() !== 'paid';
      return isUnended || isUnpaid;
    });
  }, [modal.data, playerHistoryFilter]);
  const isEditingDetail = modal.type === 'detail' && Boolean(
    modal.data && (
      modal.data.detail_id ||
      (
        modal.data.id && (
          modal.data.station_id !== undefined ||
          modal.data.game_rule !== undefined ||
          modal.data.duration_minutes !== undefined ||
          modal.data.extra_time_minutes !== undefined ||
          modal.data.main_price !== undefined ||
          modal.data.extra_price !== undefined
        )
      )
    )
  );
  const isStationDetailContext = modal.type === 'detail' && Boolean(modal.data?.station_name);
  const isQuickPlayLocked = Boolean(newSession.detail_id && newSession.station_id);
  const sessionPriceDetail = gameDetails.find((detail) => String(detail.id) === String(newSession.detail_id));
  const plannedRoundPrice = Number(sessionPriceDetail?.main_price || 0);
  const plannedPlayerCount = newSession.assign_random_player
    ? Math.max(Number(newSession.player_count || 1), 1)
    : (newSession.player_id ? 1 : 0);
  const plannedUpfrontTotal = plannedRoundPrice * Math.max(Number(newSession.planned_rounds || 1), 1) * plannedPlayerCount;

  return {
    isZoneAuthenticated,
    isZoneLoading,
    activeTab,
    setActiveTab,
    zoneInfo,
    games,
    setGames,
    stations,
    setStations,
    gameDetails,
    setGameDetails,
    sessions,
    setSessions,
    creditBalance,
    isLoading,
    isRefreshing,
    loadError,
    toast,
    modal,
    setModal,
    isSubmitting,
    setIsSubmitting,
    formError,
    setFormError,
    newGame,
    setNewGame,
    newDetail,
    setNewDetail,
    newStation,
    setNewStation,
    newSession,
    setNewSession,
    focusSessionId,
    setFocusSessionId,
    transferReminder,
    setTransferReminder,
    transferCandidates,
    setTransferCandidates,
    transferLoading,
    setTransferLoading,
    sessionPlayerCandidates,
    setSessionPlayerCandidates,
    sessionPlayerLoading,
    setSessionPlayerLoading,
    manualPlayerCandidates,
    setManualPlayerCandidates,
    manualPlayerLoading,
    setManualPlayerLoading,
    playerProfileLoading,
    setPlayerProfileLoading,
    playerHistoryFilter,
    setPlayerHistoryFilter,
    initialLoadDoneRef,
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
    activeStations,
    occupiedStations,
    availabilityRate,
    showToast,
    updateSessionState,
    loadData,
    handleLogout,
    handleSaveProfile,
    openModal,
    closeModal,
    isEditingGame,
    visiblePlayerHistory,
    isEditingDetail,
    isStationDetailContext,
    isQuickPlayLocked,
    sessionPriceDetail,
    plannedRoundPrice,
    plannedPlayerCount,
    plannedUpfrontTotal,
  };
}
