// GameZoneDashboard.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, AlertTriangle, X, Gamepad2, RefreshCw, Coins, ShieldCheck, Clock, QrCode, Search, ChevronDown, History, ArrowRightLeft, UserRound, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useGameZoneAuth } from '../../context/GameZoneAuthContext';

import GameAPI from '../../api/modules/games.api';
import GameDetailsAPI from '../../api/modules/gameDetails.api';
import StationAPI from '../../api/modules/stations.api';
import CreditAPI from '../../api/modules/credits.api';
import SessionAPI from '../../api/modules/sessions.api';
import GameZoneAPI from '../../api/modules/gamezones.api';
import AuthAPI from '../../api/modules/auth';
import PlayersAPI from '../../api/modules/players.api';


// Import Pages & Components
import Sidebar from './components/Sidebar';
import OverviewPage from './Dashboard/Overview';
import GamesPage from './Dashboard/Games';
import SessionsPage from './Dashboard/sessions';
import StationsPage from './Dashboard/Stations';
import ProfilePage from './Dashboard/Profile';
import SessionPlayerPicker from './components/SessionPlayerPicker';

function SearchableDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled = false,
  helperText = '',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find((option) => String(option.value) === String(value)) || null;
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => {
      const labelText = String(option.label || '').toLowerCase();
      const metaText = String(option.meta || '').toLowerCase();
      return labelText.includes(q) || metaText.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open || !searchInputRef.current) return;
    searchInputRef.current.focus();
  }, [open]);

  const closeDropdown = () => {
    setQuery('');
    setOpen(false);
  };

  const selectOption = (option) => {
    onChange?.(option.value);
    closeDropdown();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (!open && ['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && filteredOptions[highlightedIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[highlightedIndex]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setQuery('');
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {label && <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => {
            const next = !prev;
            if (!next) setQuery('');
            return next;
          });
        }}
        className={`group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-black/35 px-3.5 py-3 text-left text-xs text-white transition-all hover:border-cyan-300/50 focus-visible:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60 ${open ? 'border-cyan-300/60 ring-2 ring-cyan-300/10' : 'border-white/10'}`}
      >
        <span className={`min-w-0 truncate ${selectedOption ? 'font-medium text-white' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {selectedOption && <span className="hidden text-[10px] text-slate-500 sm:inline">Selected</span>}
          <ChevronDown size={16} className={`text-slate-400 transition-transform group-hover:text-cyan-200 ${open ? 'rotate-180 text-cyan-200' : ''}`} />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d17] shadow-2xl shadow-black/50 ring-1 ring-black/30" role="listbox" aria-label={label || placeholder}>
          <div className="border-b border-white/10 bg-white/2 p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-black/40 px-3 py-2.5 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-300/10">
              <Search size={14} className="text-slate-500" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="rounded-md p-0.5 text-slate-500 transition hover:bg-white/10 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-500">
              <span>{filteredOptions.length} {filteredOptions.length === 1 ? 'option' : 'options'}</span>
              <span className="hidden sm:inline">Use arrows and Enter</span>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={String(option.value) === String(value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition ${
                    index === highlightedIndex ? 'bg-cyan-300/10' : 'hover:bg-white/5'
                  } ${
                    option.selected ? 'text-emerald-200' : String(option.value) === String(value) ? 'text-cyan-200' : 'text-white'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    {option.selected && <CheckCircle2 size={14} className="shrink-0 text-emerald-300" />}
                    {!option.selected && String(option.value) === String(value) && <CheckCircle2 size={14} className="shrink-0 text-cyan-300" />}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {option.meta ? <span className={`max-w-[42%] truncate text-right text-[10px] ${option.selected ? 'text-emerald-300' : 'text-slate-500'}`}>{option.meta}</span> : null}
                </button>
              ))
            ) : (
              <div className="px-3.5 py-5 text-center text-xs text-slate-500">
                <Search size={16} className="mx-auto mb-2 text-slate-600" />
                No matching options
              </div>
            )}
          </div>
        </div>
      )}

      {helperText ? <p className="mt-1 text-[11px] text-slate-400">{helperText}</p> : null}
    </div>
  );
}

function FullscreenRefreshOverlay({ label = 'Syncing lounge data', sublabel = 'Refreshing the full dashboard...' }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020208]/75 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#070711]/90 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,240,255,0.14),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(123,44,191,0.16),_transparent_38%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="h-20 w-20 rounded-full border border-[#00F0FF]/20 bg-black/30" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#00F0FF] border-r-[#7B2CBF]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 size={22} className="text-[#00F0FF]" />
            </div>
          </div>

          <h3 className="text-lg font-black tracking-wide text-white">{label}</h3>
          <p className="mt-1 text-xs text-slate-400">{sublabel}</p>

          <div className="mt-6 w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#00F0FF]" />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Please wait
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameZoneDashboard() {
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
  const initialLoadDone = useRef(false);

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
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
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
      } catch (error) {
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

  const syncGame = (nextGame) => {
    setGames((prev) =>
      prev.map((game) => (String(game.id) === String(nextGame.id) ? { ...game, ...nextGame } : game))
    );
    setStations((prev) =>
      prev.map((station) =>
        String(station.gameId ?? station.game_id) === String(nextGame.id)
          ? { ...station, gameName: nextGame.game_name ?? station.gameName }
          : station
      )
    );
  };

  const syncDetail = (nextDetail) => {
    setGameDetails((prev) =>
      prev.map((detail) => (String(detail.id) === String(nextDetail.id) ? { ...detail, ...nextDetail } : detail))
    );

    setStations((prev) =>
      prev.map((station) => {
        if (String(station.id) !== String(nextDetail.station_id)) return station;

        return {
          ...station,
          game_rule: nextDetail.game_rule ?? station.game_rule ?? '',
          duration_minutes: nextDetail.duration_minutes ?? station.duration_minutes ?? null,
          extra_time_minutes: nextDetail.extra_time_minutes ?? station.extra_time_minutes ?? null,
          main_price: nextDetail.main_price ?? station.main_price ?? null,
          extra_price: nextDetail.extra_price ?? station.extra_price ?? null,
        };
      })
    );
  };

  const removeGameLocally = (gameId) => {
    setGames((prev) => prev.filter((game) => String(game.id) !== String(gameId)));
    setStations((prev) =>
      prev.filter((station) => String(station.gameId ?? station.game_id) !== String(gameId))
    );
    setGameDetails((prev) =>
      prev.filter((detail) => String(detail.game_id ?? detail.gameId) !== String(gameId))
    );
  };

  const handleCreate = async (type, data, apiFn, successMsg) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await apiFn({ ...data, zone_id: zoneId });
      const created = res?.data ?? res;

      if (type === 'game') {
        setGames((prev) => [...prev, created]);
        setNewGame({ game_name: '', description: '', game_type: '', max_players: '' });
      } else if (type === 'station') {
        const game = games.find((g) => String(g.id) === String(data.game_id));
        setStations((prev) => [
          ...prev,
          { ...created, gameName: game?.game_name || 'Unknown', gameId: data.game_id }
        ]);
        setNewStation({ game_id: '', station_name: '', status: 'Available' });
      } else if (type === 'detail') {
        setGameDetails((prev) => [...prev, created]);

        if (created?.station_id) {
          setStations((prev) =>
            prev.map((station) =>
              String(station.id) === String(created.station_id)
                ? {
                    ...station,
                    game_rule: created.game_rule ?? station.game_rule ?? '',
                    duration_minutes: created.duration_minutes ?? station.duration_minutes ?? null,
                    extra_time_minutes: created.extra_time_minutes ?? station.extra_time_minutes ?? null,
                    main_price: created.main_price ?? station.main_price ?? null,
                    extra_price: created.extra_price ?? station.extra_price ?? null,
                  }
                : station
            )
          );
        }

        setNewDetail({
          game_id: '',
          station_id: '',
          game_rule: '',
          duration_minutes: '30',
          extra_time_minutes: '15',
          main_price: '',
          extra_price: ''
        });
      } else if (type === 'session') {
        setSessions((prev) => [created, ...prev]);
        setNewSession({
          detail_id: '',
          station_id: '',
          player_id: '',
          player_count: 2,
          player_nicknames: [],
          assign_random_player: true,
          mode: 'strict'
        });
        setModal({ type: 'session', data: created });
        setIsSubmitting(false);
        showToast(successMsg);
        return;
      }

      setModal({ type: null, data: null });
      showToast(successMsg);
    } catch (err) {
      const validationErrors = err?.response?.data?.errors
        ?.map((item) => `${item.field}: ${item.message}`)
        .join(', ');
      setFormError(validationErrors || err?.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await GameAPI.delete(gameId);
      removeGameLocally(gameId);
      showToast('Game deleted successfully');
    } catch (err) {
      showToast(err.message || 'Failed to delete game', 'error');
    }
  };

  const handleDeleteStation = async (stationId) => {
    try {
      await StationAPI.delete(stationId);
      setStations((prev) => prev.filter((station) => String(station.id) !== String(stationId)));
      if (modal.type === 'station' && String(modal.data?.id) === String(stationId)) {
        closeModal();
      }
      showToast('Station deleted successfully');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to delete station', 'error');
    }
  };

  const handleUpdateStation = async (stationId, formData) => {
    try {
      const res = await StationAPI.update(stationId, formData);
      const updated = res?.data ?? res;
      const targetGame = games.find((game) => String(game.id) === String(updated.game_id ?? formData.game_id ?? ''));
      setStations((prev) => prev.map((station) => {
        if (String(station.id) !== String(stationId)) return station;
        return {
          ...station,
          ...updated,
          game_id: updated.game_id ?? formData.game_id ?? station.game_id,
          gameId: updated.game_id ?? formData.game_id ?? station.gameId ?? station.game_id,
          gameName: targetGame?.game_name ?? station.gameName ?? updated.game_name ?? station.game_name,
        };
      }));
      closeModal();
      showToast('Station updated successfully');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to update station');
    }
  };

  const handleUpdateGame = async (gameId, formData) => {
    try {
      const res = await GameAPI.update(gameId, formData);
      const updated = res?.data ?? res;
      syncGame({ ...updated, id: updated.id ?? updated.game_id ?? gameId });
      closeModal();
      showToast('Game updated successfully');
    } catch (err) {
      setFormError(err.message || 'Failed to update game');
    }
  };

  const handleUpdateDetail = async (detailId, formData) => {
    try {
      const res = await GameDetailsAPI.update(detailId, formData);
      const updated = res?.data ?? res;
      syncDetail({ ...updated, id: updated.id ?? updated.detail_id ?? detailId });
      closeModal();
      showToast('Rule updated successfully');
    } catch (err) {
      const validationErrors = err?.response?.data?.errors
        ?.map((item) => `${item.field}: ${item.message}`)
        .join(', ');
      setFormError(validationErrors || err?.response?.data?.message || err.message || 'Failed to update rule');
    }
  };

  const handleCreateSession = async (overrideData = null) => {
    const sessionData = overrideData || newSession;

    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!sessionData.assign_random_player) {
      const detail = sessionData.detail_id
        ? gameDetails.find((item) => String(item.id) === String(sessionData.detail_id))
        : null;
      const stationId = sessionData.station_id || detail?.station_id;
      if (!stationId) return setFormError('Select a station to generate an invite QR');
      setFormError('');
      const stationName = stations.find((s) => String(s.id) === String(stationId))?.station_name || 'Station';
      setModal({
        type: 'session',
        data: {
          invite_only: true,
          detail_id: sessionData.detail_id,
          station_id: stationId,
          station_name: stationName,
          invite_code: stationId ? `STATION-${stationId}` : '',
        }
      });
      showToast('Invite QR ready. Share it with the player.');
      return;
    }

    if (!canCreateRandomSession) {
      return showToast('Add credits before creating a random-player session', 'warning');
    }
    if (!sessionData.detail_id) return setFormError('Select a game rule first');

    if (sessionData.player_id) {
      const selectedCandidate = manualPlayerCandidates.find(
        (candidate) => String(candidate.player_id) === String(sessionData.player_id)
      );
      if (selectedCandidate?.has_unfinished_session) {
        return setFormError(
          `${selectedCandidate.nickname || selectedCandidate.username || 'This player'} is already in unfinished session #${selectedCandidate.unfinished_session_id}. Finish or cancel that session first.`
        );
      }
    }

    const detailForCount = gameDetails.find((item) => String(item.id) === String(sessionData.detail_id)) || selectedSessionDetail;
    const maxPlayersAllowed = Math.max(Number(detailForCount?.max_players || detailForCount?.maxPlayers || sessionData.player_count || 2), 1);
    const playerCount = Math.max(Number(sessionData.player_count || maxPlayersAllowed || 2), 1);
    const paymentTiming = sessionData.payment_timing || 'After Game';
    const plannedRounds = Math.max(Number(sessionData.planned_rounds || 1), 1);
    const roundPrice = Number(detailForCount?.main_price || 0);
    if (paymentTiming === 'Before Game') {
      if (!sessionData.assign_random_player && !sessionData.player_id) return setFormError('Select a player for Before Game payment');
      if (!['Cash', 'Mobile Banking'].includes(sessionData.payment_method)) return setFormError('Select a payment method for Before Game payment');
      if (!Number.isFinite(roundPrice) || roundPrice <= 0) return setFormError('This game has no valid round price');
    }

    setFormError('');

    setIsSubmitting(true);

    try {
      const customNicknames = Array.isArray(sessionData.player_nicknames)
        ? sessionData.player_nicknames
            .slice(0, playerCount)
            .map((name, index) => {
              const trimmed = String(name || '').trim();
              return trimmed && trimmed !== `Player ${index + 1}` ? trimmed : '';
            })
            .filter(Boolean)
        : [];
      const payload = {
        detail_id: Number(sessionData.detail_id),
        assign_random_player: sessionData.assign_random_player ?? true,
        player_count: playerCount,
        mode: sessionData.mode || 'strict',
        payment_timing: paymentTiming,
        planned_rounds: plannedRounds,
        payment_method: sessionData.payment_method,
        payment_provider: sessionData.payment_provider,
        transaction_reference: sessionData.transaction_reference,
        sender_name: sessionData.sender_name,
        notes: sessionData.notes,
      };

      if (customNicknames.length > 0) {
        payload.player_nicknames = customNicknames;
      }

      const resolvedStationId = sessionData.station_id
        ? Number(sessionData.station_id)
        : sessionData.detail_id
          ? Number(
              gameDetails.find((item) => String(item.id) === String(sessionData.detail_id))?.station_id ||
              selectedSessionDetail?.station_id
            )
          : null;

      if (resolvedStationId !== null && !Number.isNaN(resolvedStationId)) {
        payload.station_id = resolvedStationId;
      }

      const stationBusy = resolvedStationId !== null && sessions.some((session) => {
        const status = String(session.status || '').toLowerCase();
        const sessionStationId = session.station_id ?? session.stationId;
        return ['waiting', 'playing', 'paused'].includes(status)
          && String(sessionStationId) === String(resolvedStationId);
      });
      if (stationBusy) {
        setFormError('This station is occupied. Finish or cancel the current session first.');
        return;
      }

      if (sessionData.player_id) {
        payload.player_id = Number(sessionData.player_id);
      }

      if (zoneId) {
        payload.created_by = Number(zoneId);
      }

      const res = await SessionAPI.createZoneSession(payload);
      const created = res?.data ?? res;
      const playId = created?.play_id ?? created?.id;

      setSessions((prev) => [
        { ...created },
        ...prev.filter((session) => String(session.play_id || session.id) !== String(playId))
      ]);
      setFocusSessionId(playId ? String(playId) : null);
      setActiveTab('sessions');
      setModal({ type: null, data: null });
      setNewSession({
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
      showToast('Play session created successfully');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.startZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session started');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to start session', 'error');
    }
  };

  const handlePauseSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.pauseZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session paused');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to pause session', 'error');
    }
  };

  const handleResumeSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.resumeZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session continued');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to continue session', 'error');
    }
  };

  const handleContinueSession = async (sessionId, roundResults = []) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.continueZoneSession(sessionId, { round_results: roundResults });
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Round advanced');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to advance round', 'error');
      throw err;
    }
  };

  const handleAddExtraTime = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.addExtraTimeZoneSession(sessionId);
      const updated = res?.data ?? res;
      if (updated && typeof updated === 'object' && (updated.play_id ?? updated.id)) updateSessionState(updated);
      await loadData(true);
      showToast('Extra time added');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to add extra time', 'error');
      throw err;
    }
  };

  const handleTransferPlayer = async (session, player) => {
    if (!session || !player) return;

    const currentStationId = session.station_id ?? session.stationId ?? null;
    const fallbackStation = stations.find((station) => String(station.id) !== String(currentStationId)) || null;
    const nextStationId = fallbackStation?.id ? String(fallbackStation.id) : '';

    if (!nextStationId) {
      showToast('No alternate station is available for this player', 'warning');
      return;
    }

    setFormError('');
    setTransferCandidates([]);
    setTransferLoading(true);
    setModal({
      type: 'transfer-player',
      data: {
        session,
        player,
        target_station_id: nextStationId,
        replacement_player_id: '',
      }
    });

    try {
      const res = await StationAPI.getReplacementPlayers(currentStationId || nextStationId, session.play_id || session.id);
      const candidates = res?.data?.players ?? res?.players ?? res?.data ?? res ?? [];
      const filtered = (Array.isArray(candidates) ? candidates : [])
        .filter((candidate) => String(candidate.player_id) !== String(player.player_id));
      setTransferCandidates(filtered);
      setModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          replacement_player_id: filtered[0]?.player_id ? String(filtered[0].player_id) : '',
        }
      }));
    } catch (error) {
      setFormError(error?.response?.data?.message || error.message || 'Failed to load replacement players');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleViewPlayerProfile = async (player, profilePlayers = []) => {
    const playerId = Number(player?.player_id);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      showToast('This player has no profile history yet', 'warning');
      return;
    }

    setFormError('');
    setPlayerProfileLoading(true);
    setPlayerHistoryFilter('open');
    const queuedPayments = modal.data?.payment_entries || [];
    const sessionCandidates = sessions.flatMap((candidateSession) => {
      const sessionPlayers = Array.isArray(candidateSession.players) && candidateSession.players.length > 0
        ? candidateSession.players
        : String(candidateSession.player_ids || '')
          .split(',')
          .map((value, index) => ({
            player_id: Number(value.trim()),
            nickname: String(candidateSession.player_names || '').split(',')[index]?.trim() || `Player ${value.trim()}`,
          }))
          .filter((candidate) => Number.isFinite(candidate.player_id) && candidate.player_id > 0);
      return sessionPlayers.map((candidatePlayer) => ({
        ...candidatePlayer,
        payment_session: candidateSession,
        payment_key: `${candidateSession.play_id || candidateSession.id}:${candidatePlayer.player_id}`,
      }));
    });
    const resolvedProfilePlayers = [...profilePlayers, ...sessionCandidates]
      .map((candidate) => ({
        ...candidate,
        payment_session: candidate.payment_session || player.payment_session || null,
        payment_key: candidate.payment_key || `${candidate.payment_session?.play_id || candidate.payment_session?.id || 'profile'}:${candidate.player_id}`,
      }))
      .filter((candidate, index, allCandidates) => allCandidates.findIndex((item) => item.payment_key === candidate.payment_key) === index);
    setModal({ type: 'player-profile', data: { player, profilePlayers: resolvedProfilePlayers, payment_entries: queuedPayments, payment_mode: queuedPayments.length ? 'multiple' : 'single', stats: null, history: [] } });
    try {
      const [statsResponse, historyResponse] = await Promise.all([
        PlayersAPI.getStats(playerId),
        PlayersAPI.getHistory(playerId),
      ]);
      setModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          stats: statsResponse?.data ?? statsResponse,
          history: historyResponse?.data ?? historyResponse ?? [],
        },
      }));
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to load player profile');
    } finally {
      setPlayerProfileLoading(false);
    }
  };

  const handleAddPlayerToSession = async (session) => {
    if (!session) return;
    const stationId = session.station_id ?? session.stationId ?? null;
    if (!stationId) {
      showToast('Station not found for this session', 'warning');
      return;
    }

    setFormError('');
    setSessionPlayerCandidates([]);
    setSessionPlayerLoading(true);
    setModal({
      type: 'session-add-player',
      data: {
        session,
        player_id: '',
      }
    });

    try {
      const res = await StationAPI.getReplacementPlayers(stationId, session.play_id || session.id);
      const candidates = res?.data?.players ?? res?.players ?? res?.data ?? res ?? [];
      const currentPlayerIds = String(session.player_ids || '')
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);
      const filtered = (Array.isArray(candidates) ? candidates : []).filter(
        (candidate) => !candidate.has_unfinished_session && !currentPlayerIds.includes(Number(candidate.player_id))
      );
      setSessionPlayerCandidates(filtered);
      setModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          player_id: filtered[0]?.player_id ? String(filtered[0].player_id) : '',
        }
      }));
    } catch (error) {
      setFormError(error?.response?.data?.message || error.message || 'Failed to load available players');
    } finally {
      setSessionPlayerLoading(false);
    }
  };

  const loadManualPlayerCandidates = useCallback(async () => {
    const stationId = selectedSessionStation?.id;
    if (!stationId) {
      setManualPlayerCandidates([]);
      return [];
    }

    setManualPlayerLoading(true);
    try {
      const res = await StationAPI.getReplacementPlayers(stationId, null);
      const candidates = res?.data?.players ?? res?.players ?? res?.data ?? res ?? [];
      const nextCandidates = Array.isArray(candidates) ? candidates : [];
      setManualPlayerCandidates(nextCandidates);
      return nextCandidates;
    } catch (error) {
      setManualPlayerCandidates([]);
      return [];
    } finally {
      setManualPlayerLoading(false);
    }
  }, [selectedSessionStation?.id]);

  useEffect(() => {
    if (modal.type !== 'session') return undefined;
    if (newSession.assign_random_player) return undefined;

    let mounted = true;
    (async () => {
      const candidates = await loadManualPlayerCandidates();
      if (!mounted) return;
      setNewSession((prev) => {
        if (prev.player_id || !candidates.length) return prev;
        const recommended = candidates[0]?.player_id ? String(candidates[0].player_id) : '';
        return recommended ? { ...prev, player_id: recommended } : prev;
      });
    })();

    return () => {
      mounted = false;
    };
  }, [modal.type, newSession.assign_random_player, loadManualPlayerCandidates]);

  const confirmAddPlayerToSession = async () => {
    const addSession = modal.data?.session;
    const playerId = modal.data?.player_id;

    if (!addSession) {
      setFormError('Select a session first');
      return;
    }

    if (!playerId) {
      setFormError('Select a player');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await SessionAPI.addZonePlayerToSession(addSession.play_id || addSession.id, {
        player_id: Number(playerId),
      });
      const updated = res?.data ?? res;
      updateSessionState(updated);
      setModal({ type: null, data: null });
      setSessionPlayerCandidates([]);
      await loadData(true);
      showToast('Player added to the waiting session');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to add player to session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveFlexiblePlayer = async (session, player) => {
    const sessionId = session?.play_id || session?.id;
    if (!sessionId || !player?.player_id) return;
    try {
      const res = await SessionAPI.leaveZonePlayerFromSession(sessionId, {
        player_id: Number(player.player_id),
      });
      const updated = res?.data ?? res;
      updateSessionState(updated);
      await loadData(true);
      showToast('Player left the session');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to remove player', 'error');
    }
  };

  const confirmTransferPlayer = async () => {
    const transferSession = modal.data?.session;
    const transferPlayer = modal.data?.player;
    const targetStationId = modal.data?.target_station_id;
    const replacementPlayerId = modal.data?.replacement_player_id;

    if (!transferSession || !transferPlayer) {
      setFormError('Select a player to transfer');
      return;
    }

    if (!targetStationId) {
      setFormError('Select a destination station');
      return;
    }

    if (!replacementPlayerId) {
      setFormError('Select a replacement player');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await StationAPI.transferPlayer(targetStationId, {
        player_id: Number(transferPlayer.player_id),
        session_id: Number(transferSession.play_id || transferSession.id),
        replacement_player_id: Number(replacementPlayerId),
      });
      const updatedPlayer = res?.data ?? res;
      const pendingSessionId = updatedPlayer?.pending_session?.play_id || updatedPlayer?.pending_session?.id || null;
      const targetStationName = stations.find((station) => String(station.id) === String(targetStationId))?.station_name || 'the selected station';
      setTransferReminder({
        session_id: pendingSessionId ? String(pendingSessionId) : null,
        source_session_id: String(transferSession.play_id || transferSession.id),
        source_station_name: transferSession.station_name || 'Unknown station',
        target_station_name: targetStationName,
        moved_player: {
          player_id: transferPlayer.player_id,
          nickname: transferPlayer.nickname || transferPlayer.username || null,
        },
        replacement_player: {
          player_id: Number(replacementPlayerId),
        }
      });
      setModal({ type: null, data: null });
      setTransferCandidates([]);
      await loadData(true);
      if (pendingSessionId) {
        setActiveTab('sessions');
        setFocusSessionId(String(pendingSessionId));
      }
      showToast(`${updatedPlayer?.nickname || transferPlayer.nickname || 'Player'} moved to ${targetStationName}`);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to transfer player');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    const session = sessions.find((item) => String(item.play_id || item.id) === String(sessionId));
    if (!session) return showToast('Session not found', 'error');
    setFormError('');
    setModal({
      type: 'session-payment',
      data: {
        session,
        payment_amount: Number(session.user_paid_amount ?? session.total_paid_amount ?? session.main_price ?? 0) || '',
        payment_method: 'Cash',
        payment_provider: '',
        transaction_reference: '',
        sender_name: '',
        notes: '',
        winAmount: 0,
      }
    });
  };

  const handlePayPlayerRounds = (session, playerOverride = null, keepSelectionOpen = false) => {
    const roundCount = Math.max(Number(session?.play_amount || 0), 1);
    const paidRounds = new Set((session?.round_payments || []).map((payment) => Number(payment.round_number)));
    const unpaidRounds = Array.from({ length: roundCount }, (_, index) => index + 1).filter((round) => !paidRounds.has(round));
    if (!unpaidRounds.length) return showToast('This player has no unpaid rounds', 'warning');

    setFormError('');
    setModal((prev) => {
      const isPaymentModal = prev.type === 'session-payment' && prev.data?.action === 'player-rounds';
      const previousData = isPaymentModal || prev.data?.payment_entries ? prev.data : {};
      const sessionId = session.play_id || session.id;
      const playerId = session.player_id;
      const entries = previousData.payment_entries || [];
      const entryKey = `${sessionId}:${playerId}`;
      if (entries.some((entry) => entry.key === entryKey)) return prev;

      const player = String(playerOverride?.player_id) === String(playerId)
        ? playerOverride
        : previousData.player?.player_id === playerId
        ? previousData.player
        : prev.data?.player?.player_id === playerId
          ? prev.data.player
          : null;
      const entry = {
        key: entryKey,
        session,
        player,
        player_id: playerId,
        round_numbers: unpaidRounds,
        amount: (Number(session.main_price || 0) * unpaidRounds.length)
          + (Math.max(Number(session.extra_time_count || 0), 0) * Number(session.extra_price || 0)),
      };
      const paymentEntries = [...entries, entry];

      return {
        type: keepSelectionOpen ? 'player-profile' : 'session-payment',
        data: {
          ...previousData,
          ...(keepSelectionOpen ? {} : { action: 'player-rounds' }),
          session,
          player,
          player_id: playerId,
          round_numbers: unpaidRounds,
          payment_entries: paymentEntries,
          payment_amount: paymentEntries.reduce((total, item) => total + item.amount, 0) || '',
          payment_method: previousData.payment_method || 'Cash',
          payment_provider: previousData.payment_provider || '',
          transaction_reference: previousData.transaction_reference || '',
          sender_name: previousData.sender_name || '',
          notes: previousData.notes || '',
          stats: previousData.stats || prev.data?.stats || null,
          history: previousData.history || prev.data?.history || [],
        },
      };
    });
  };

  const proceedToPlayerPayment = () => {
    setModal((prev) => {
      const entries = prev.data?.payment_entries || [];
      if (entries.length === 0) {
        setFormError('Select at least one player to pay');
        return prev;
      }
      return {
        type: 'session-payment',
        data: {
          ...prev.data,
          action: 'player-rounds',
          session: entries[0].session,
          player_id: entries[0].player_id,
          round_numbers: entries[0].round_numbers,
          payment_amount: entries.reduce((total, entry) => total + entry.amount, 0),
          payment_method: prev.data.payment_method || 'Cash',
        },
      };
    });
  };

  const confirmEndSessionPayment = async () => {
    const payment = modal.data;
    const paymentEntries = payment?.action === 'player-rounds'
      ? (payment.payment_entries?.length ? payment.payment_entries : [payment])
      : [];
    const sessionId = payment?.session?.play_id || payment?.session?.id;
    if ((!sessionId && paymentEntries.length === 0) || !payment?.payment_amount || !payment?.payment_method) {
      setFormError('Payment amount and method are required');
      return;
    }
    try {
      setIsSubmitting(true);
      const paymentData = {
        winAmount: Number(payment.winAmount || 0),
        payment_amount: Number(payment.payment_amount),
        payment_method: payment.payment_method,
        payment_timing: payment.payment_timing || 'After Game',
        payment_provider: payment.payment_provider,
        transaction_reference: payment.transaction_reference,
        sender_name: payment.sender_name,
        notes: payment.notes,
      };
      let updated;
      if (payment.action === 'player-rounds') {
        for (const entry of paymentEntries) {
          const res = await SessionAPI.payZonePlayerRounds(entry.session.play_id || entry.session.id, {
            ...paymentData,
            player_id: entry.player_id,
            round_numbers: entry.round_numbers,
            payment_amount: entry.amount,
          });
          updateSessionState(res?.data ?? res);
        }
      } else {
        const res = payment.action === 'pay'
          ? await SessionAPI.addZonePayment(sessionId, paymentData)
          : await SessionAPI.endZoneSession(sessionId, paymentData);
        updated = res?.data ?? res;
      }
      if (payment.action !== 'player-rounds') updateSessionState(updated);
      closeModal();
      showToast(payment.action === 'pay' || payment.action === 'player-rounds' ? 'Payment recorded' : 'Session ended');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to end session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!window.confirm('Cancel this session?')) return;
    try {
      const res = await SessionAPI.cancelZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session cancelled');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to cancel session', 'error');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!window.confirm('Delete this session permanently?')) return;
    try {
      await SessionAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((session) => String(session.play_id || session.id) !== String(sessionId)));
      setModal((prev) => {
        if (prev.type === 'session' && String(prev.data?.play_id || prev.data?.id) === String(sessionId)) {
          return { type: null, data: null };
        }
        return prev;
      });
      showToast('Session deleted');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to delete session', 'error');
    }
  };

  const handleBulkDeleteSessions = async (sessionIds) => {
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) return;
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!window.confirm(`Delete ${sessionIds.length} selected session(s)?`)) return;
    try {
      await SessionAPI.bulkDeleteSessions(sessionIds);
      setSessions((prev) => prev.filter((session) => !sessionIds.includes(String(session.play_id || session.id))));
      showToast(`${sessionIds.length} session(s) deleted`);
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to delete selected sessions', 'error');
    }
  };

  const handleStartRandomSessionFromStation = (station) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!canCreateRandomSession) return showToast('Add credits before creating a random-player session', 'warning');
    if (!station?.id) return;

    const stationBusy = sessions.some((session) => {
      const status = String(session.status || '').toLowerCase();
      const sessionStationId = session.station_id ?? session.stationId;
      return ['waiting', 'playing', 'paused'].includes(status)
        && String(sessionStationId) === String(station.id);
    });
    if (stationBusy) {
      return showToast('This station is occupied. Finish or cancel the current session first.', 'warning');
    }

    const stationDetails = gameDetails.filter((detail) => String(detail.station_id) === String(station.id));
    const chosenDetail = stationDetails[0] || gameDetails.find((detail) => String(detail.game_id) === String(station.game_id ?? station.gameId));
    if (!chosenDetail) {
      showToast('Add a game detail for this station first', 'warning');
      return;
    }

    const defaultCount = getDefaultPlayerCount(chosenDetail);
    const defaultNicknames = Array.from({ length: defaultCount }, (_, index) => `Player ${index + 1}`);

    setNewSession({
      detail_id: String(chosenDetail.id),
      station_id: String(station.id),
      player_id: '',
      player_count: defaultCount,
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

    setModal({
      type: 'session',
      data: {
        detail_id: chosenDetail.id,
        station_id: station.id,
        station_name: station.station_name,
        invite_code: `STATION-${station.id}`
      }
    });
  };

  const handleInviteFromStation = (station) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!station?.id) return;
    setNewSession({
      detail_id: '',
      station_id: station.id,
      player_id: '',
      assign_random_player: false,
      mode: 'strict',
      payment_timing: 'After Game',
      planned_rounds: 1,
      payment_method: 'Cash',
      payment_provider: '',
      transaction_reference: '',
      sender_name: '',
      notes: ''
    });
    setModal({
      type: 'session',
      data: {
        invite_only: true,
        station_id: station.id,
        station_name: station.station_name,
        invite_code: `STATION-${station.id}`
      }
    });
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
  }, [modal.data?.history, playerHistoryFilter]);
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

  if (isZoneLoading || (isZoneAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-[#020208]">
        <FullscreenRefreshOverlay label="Loading lounge dashboard" sublabel="Pulling your latest stations, sessions, and balance..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#020208] flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full bg-[#050510] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Connection Error</h3>
          <p className="text-xs text-slate-400 mb-5">{loadError}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => {
                initialLoadDone.current = false;
                loadData();
              }} 
              className="flex-1 py-2.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-[#00F0FF] text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> Retry
            </button>
            <button 
              onClick={handleLogout} 
              className="flex-1 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold active:scale-95 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020208] text-white flex flex-col lg:flex-row antialiased">
      {isRefreshing && (
        <FullscreenRefreshOverlay
          label="Refreshing dashboard"
          sublabel="Syncing the latest lounge data across every section..."
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
          toast.type === 'warning' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
          'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <p className="text-xs font-medium text-center sm:text-left">{toast.message}</p>
        </div>
      )}

      {/* Navigation Sidebar / Bottom Bar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        zoneInfo={zoneInfo}
        targetProfile={targetProfile}
        isVerified={isVerified}
      />

      {/* Main Container Area */}
      <main className="flex-1 min-h-screen w-full overflow-x-hidden flex flex-col">
        
        {/* TOP BRAND HEADER (NO MENU BUTTONS) */}
        <header className="sticky top-0 z-30 bg-[#020208]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Lounge Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="GameOn logo"
              className="w-9 h-9 rounded-xl object-cover bg-black/20 shadow-lg shadow-[#00F0FF]/20 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white truncate tracking-wide">
                  {zoneInfo?.zone_name || targetProfile?.zone_name || 'GameZone'}
                </h1>
                <span className={`hidden sm:flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isVerified 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {isVerified ? <ShieldCheck size={10} /> : <Clock size={10} />}
                  {isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {zoneInfo?.owner_name || targetProfile?.owner_name || 'Lounge Admin'}
              </p>
            </div>
          </div>

          {/* Quick Balance Pill */}
          <div className="flex items-center gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Coins size={14} className="text-amber-400" />
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase font-mono leading-none">Wallet</p>
                <p className="text-xs font-bold text-amber-400 font-mono leading-tight">{creditBalance} Br</p>
              </div>
            </div>
          </div>
        </header>

        {isRefreshing && (
          <div className="h-1 w-full overflow-hidden bg-white/5">
            <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#00F0FF]" />
          </div>
        )}

        {!isVerified && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Your zone is pending verification. You can browse the dashboard, but create and session actions are disabled until verification is complete.
          </div>
        )}

        {isVerified && Number(creditBalance || 0) <= 0 && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
            Your zone is verified, but session actions are paused until credits are added.
          </div>
        )}

        {/* Content View */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8 flex-1">
          {activeTab === 'overview' && (
            <OverviewPage
              zoneInfo={zoneInfo}
              targetProfile={targetProfile}
              games={games}
              stations={stations}
              creditBalance={creditBalance}
              activeStations={activeStations}
              occupiedStations={occupiedStations}
              availabilityRate={availabilityRate}
              onAddGame={() => openModal('game')}
              onAddStation={() => {
                if (!canManage) return showToast('Verify lounge first', 'warning');
                if (!games.length) return showToast('Create a game first', 'warning');
                openModal('station');
              }}
              isVerified={isVerified}
              canManage={canManage}
              onRefresh={() => {
                initialLoadDone.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'games' && (
            <GamesPage
              games={games}
              stations={stations}
              onAddGame={() => openModal('game')}
              onEditGame={(game) => openModal('game', game)}
              onDeleteGame={handleDeleteGame}
              isLocked={!canManage}
              onRefresh={() => {
                initialLoadDone.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsPage
              sessions={sessions}
              focusSessionId={focusSessionId}
              onClearSessionFocus={() => setFocusSessionId(null)}
              onAddSession={() => openModal('session')}
              onStartSession={handleStartSession}
              onPauseSession={handlePauseSession}
              onResumeSession={handleResumeSession}
              onContinueSession={handleContinueSession}
              onAddExtraTime={handleAddExtraTime}
              onEndSession={handleEndSession}
              onCancelSession={handleCancelSession}
              onDeleteSession={handleDeleteSession}
              onBulkDeleteSessions={handleBulkDeleteSessions}
              onTransferPlayer={handleTransferPlayer}
              onViewPlayerProfile={handleViewPlayerProfile}
              onAddPlayerToSession={handleAddPlayerToSession}
              onLeaveFlexiblePlayer={handleLeaveFlexiblePlayer}
              transferReminder={transferReminder}
              canManageSessions={isVerified}
              sessionLockMessage={sessionLockMessage}
              onRefresh={() => {
                initialLoadDone.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'stations' && (
            <StationsPage
              stations={stations}
              games={games}
              gameDetails={gameDetails}
                sessions={sessions}
              isVerified={isVerified}
              canManageSessions={isVerified}
              canAssignRandomSession={canCreateRandomSession}
              onStartRandomSession={handleStartRandomSessionFromStation}
              onInviteStation={handleInviteFromStation}
              onManageRule={(station) => openModal('detail', station)}
              onEditStation={(station) => {
                if (!canManage) return showToast('Verify lounge first', 'warning');
                setNewStation({
                  game_id: String(station.gameId ?? station.game_id ?? ''),
                  station_name: station.station_name || '',
                  status: station.status || 'Available'
                });
                openModal('station', station);
              }}
              onDeleteStation={handleDeleteStation}
              onAddStation={() => {
                if (!canManage) return showToast('Verify lounge first', 'warning');
                if (!games.length) return showToast('Create a game first', 'warning');
                setNewStation({ game_id: '', station_name: '', status: 'Available' });
                openModal('station');
              }}
              onRefresh={() => {
                initialLoadDone.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              zoneInfo={zoneInfo}
              targetProfile={targetProfile}
              isVerified={isVerified}
              creditBalance={creditBalance}
              onSaveProfile={handleSaveProfile}
              onRefresh={() => {
                initialLoadDone.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          <footer className="mt-12 text-center text-[10px] text-slate-600 font-mono border-t border-white/5 pt-6">
            GAMEON LOUNGE CONTROLLER • 2026
          </footer>
        </div>
      </main>

      {/* REMOVED: Quick Action Floating Pill (Mobile Only) - This section has been removed */}

      {/* Modals */}
      {modal.type === 'game' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {isEditingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newGame.game_name.trim()) return setFormError('Game name is required');
              if (isEditingGame) {
                handleUpdateGame(modal.data.id, newGame);
                return;
              }
              handleCreate('game', newGame, GameAPI.create, '✨ Game created!');
            }} className="space-y-3">
              <input
                type="text"
                placeholder="Game Name *"
                value={newGame.game_name}
                onChange={e => setNewGame({ ...newGame, game_name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <input
                type="text"
                placeholder="Type/Genre (e.g. FIFA, Racing)"
                value={newGame.game_type}
                onChange={e => setNewGame({ ...newGame, game_type: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <input
                type="number"
                placeholder="Max Players"
                value={newGame.max_players}
                onChange={e => setNewGame({ ...newGame, max_players: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <textarea
                rows={3}
                placeholder="Short Description"
                value={newGame.description}
                onChange={e => setNewGame({ ...newGame, description: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 resize-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditingGame ? 'Update Game' : 'Create Game')}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal.type === 'station' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">{modal.data?.id ? 'Station Profile' : 'Deploy Station'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            {modal.data?.id && (
              <div className="mb-4 rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-3 text-xs text-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#00F0FF]">Station profile</div>
                    <div className="mt-1 text-sm font-bold text-white">{modal.data.station_name || 'Unnamed station'}</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-bold text-slate-200">
                    {modal.data.status || 'Available'}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                  <div className="rounded-xl bg-black/20 px-2 py-1.5">ID: {modal.data.id}</div>
                  <div className="rounded-xl bg-black/20 px-2 py-1.5">QR: {`STATION-${modal.data.id}`}</div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const trimmedName = String(newStation.station_name || '').trim();
              if (!newStation.game_id) return setFormError('Select a game');
              if (!trimmedName) return setFormError('Station name is required');
              if (trimmedName.length < 2) return setFormError('Station name must be at least 2 characters');
              const payload = { ...newStation, station_name: trimmedName, status: newStation.status || 'Available' };
              if (modal.data?.id) {
                handleUpdateStation(modal.data.id, payload);
                return;
              }
              handleCreate('station', payload, StationAPI.create, '🚀 Station deployed!');
            }} className="space-y-3">
              <SearchableDropdown
                label="Game"
                value={newStation.game_id}
                onChange={(nextValue) => setNewStation({ ...newStation, game_id: nextValue })}
                options={games.map((g) => ({
                  value: g.id,
                  label: g.game_name,
                  meta: g.game_type || `Game #${g.id}`,
                }))}
                placeholder="Select game"
                searchPlaceholder="Search games..."
              />
              <input
                type="text"
                placeholder="Station Name *"
                value={newStation.station_name}
                onChange={e => setNewStation({ ...newStation, station_name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <select
                value={newStation.status}
                onChange={e => setNewStation({ ...newStation, status: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white transition-all"
              >
                <option value="Available" className="bg-[#090914]">Available</option>
                <option value="Occupied" className="bg-[#090914]">Occupied</option>
                <option value="Maintenance" className="bg-[#090914]">Maintenance</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (modal.data?.id ? 'Save Changes' : 'Deploy Station')}
                </button>
                {modal.data?.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteStation(modal.data.id)}
                    className="px-4 py-3 mt-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold active:scale-95 transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.type === 'session-payment' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-white/15 bg-[#090914] p-5 sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Final payment step</p>
                <h3 className="mt-1 text-base font-bold text-white">{modal.data?.action === 'player-rounds' ? 'Review and pay' : modal.data?.action === 'pay' ? 'Pay session' : 'End session'} #{modal.data?.session?.play_id || modal.data?.session?.id}</h3>
              </div>
              <button onClick={closeModal} disabled={isSubmitting} className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close payment form">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">{modal.data?.action === 'player-rounds' ? 'Confirm the selected players and rounds, then submit one payment.' : modal.data?.action === 'pay' ? 'Record the missing payment for this session.' : 'Record payment before closing this session.'}</p>

            {formError && <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">{formError}</div>}

            {modal.data?.action === 'player-rounds' && (
              <div className="mt-4 space-y-2 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Payment summary</p>
                  <span className="text-[10px] text-slate-500">{modal.data?.payment_entries?.length || 0} selected</span>
                </div>
                {(modal.data?.payment_entries || [modal.data]).map((entry) => {
                  const playerLabel = entry.player?.nickname || entry.player?.username || entry.session?.player_nickname || entry.session?.player_name || `Player ${entry.player_id}`;
                  return (
                    <div key={entry.key || `${entry.session?.play_id || entry.session?.id}:${entry.player_id}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">{playerLabel}</p>
                        <p className="mt-0.5 text-[10px] text-amber-100/80">{entry.round_numbers.length} round{entry.round_numbers.length === 1 ? '' : 's'} · Session #{entry.session?.play_id || entry.session?.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModal((prev) => {
                          const remaining = (prev.data.payment_entries || []).filter((item) => item.key !== entry.key);
                          return remaining.length === 0
                            ? { type: null, data: null }
                            : { ...prev, data: { ...prev.data, payment_entries: remaining, payment_amount: remaining.reduce((total, item) => total + item.amount, 0) || '' } };
                        })}
                        className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                        aria-label={`Remove ${playerLabel} from payment`}
                        title="Remove player"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-slate-400">{modal.data?.action === 'player-rounds' ? 'Total to pay' : 'Amount *'}
                  <input type="number" min="0.01" step="0.01" readOnly={modal.data?.action === 'player-rounds'} value={modal.data?.payment_amount || ''} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, payment_amount: event.target.value } }))} className={`mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#00F0FF]/50 ${modal.data?.action === 'player-rounds' ? 'cursor-not-allowed opacity-75' : ''}`} />
                </label>
                <label className="text-[11px] text-slate-400">How will they pay? *
                  <select value={modal.data?.payment_method || 'Cash'} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, payment_method: event.target.value } }))} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#00F0FF]/50">
                    <option value="Cash">Cash</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Provider (optional)" maxLength={50} value={modal.data?.payment_provider || ''} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, payment_provider: event.target.value } }))} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#00F0FF]/50" />
                <input placeholder="Reference (optional)" maxLength={100} value={modal.data?.transaction_reference || ''} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, transaction_reference: event.target.value } }))} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#00F0FF]/50" />
              </div>
              <input placeholder="Sender name (optional)" maxLength={100} value={modal.data?.sender_name || ''} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, sender_name: event.target.value } }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#00F0FF]/50" />
              <input placeholder="Notes (optional)" maxLength={255} value={modal.data?.notes || ''} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, notes: event.target.value } }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#00F0FF]/50" />
              {![ 'pay', 'player-rounds' ].includes(modal.data?.action) && <input type="number" min="0" step="0.01" placeholder="Win amount to credit back (optional)" value={modal.data?.winAmount || ''} onChange={(event) => setModal((prev) => ({ ...prev, data: { ...prev.data, winAmount: event.target.value } }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#00F0FF]/50" />}
            </div>

            {modal.data?.action === 'player-rounds' && (
              <button
                type="button"
                onClick={() => {
                  setPlayerHistoryFilter('open');
                  setModal({
                    type: 'player-profile',
                    data: {
                      player: modal.data.player,
                      profilePlayers: modal.data.profilePlayers,
                      stats: modal.data.stats,
                      history: modal.data.history,
                      payment_entries: modal.data.payment_entries,
                      payment_mode: 'multiple',
                    },
                  });
                }}
                className="mt-4 w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                + Add another player’s rounds
              </button>
            )}

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={confirmEndSessionPayment} disabled={isSubmitting} className="flex-1 rounded-xl bg-[#00F0FF] py-3 text-xs font-bold text-black disabled:opacity-50">
                {isSubmitting ? <Loader2 size={15} className="mx-auto animate-spin" /> : modal.data?.action === 'player-rounds' ? 'Pay all selected rounds' : modal.data?.action === 'pay' ? 'Record payment' : 'Record payment and end'}
              </button>
              <button type="button" onClick={closeModal} disabled={isSubmitting} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'player-profile' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Player profile</p>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {modal.data?.player?.nickname || modal.data?.player?.username || `Player ${modal.data?.player?.player_id || ''}`}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90" aria-label="Close player profile">
                <X size={18} />
              </button>
            </div>

            {formError && <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">{formError}</div>}

            {playerProfileLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Loading player history...
              </div>
            ) : (
              <>
                {modal.data?.profilePlayers?.length > 1 && (
                  <div className="mb-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Step 1 · Choose payment type</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/30 p-1">
                      <button
                        type="button"
                        onClick={() => setModal((prev) => {
                          const currentPlayerId = prev.data?.player?.player_id;
                          const currentEntry = (prev.data?.payment_entries || []).filter((entry) => String(entry.player_id) === String(currentPlayerId));
                          return {
                            ...prev,
                            data: {
                              ...prev.data,
                              payment_mode: 'single',
                              payment_entries: currentEntry,
                              payment_amount: currentEntry.reduce((total, entry) => total + entry.amount, 0) || '',
                            },
                          };
                        })}
                        className={`rounded-lg px-2 py-2 text-[10px] font-semibold transition ${modal.data?.payment_mode !== 'multiple' ? 'bg-cyan-300 text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        Only this player
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal((prev) => ({ ...prev, data: { ...prev.data, payment_mode: 'multiple' } }))}
                        className={`rounded-lg px-2 py-2 text-[10px] font-semibold transition ${modal.data?.payment_mode === 'multiple' ? 'bg-cyan-300 text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        This player + others
                      </button>
                    </div>
                    {modal.data?.payment_mode === 'multiple' && <>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Step 2 · Add players</p>
                      {modal.data?.payment_entries?.length > 0 && <span className="text-[10px] text-slate-500">{modal.data.payment_entries.length} selected</span>}
                      </div>
                      <SearchableDropdown
                        className="mt-2"
                        value=""
                        onChange={(value) => {
                          const selectedPlayer = modal.data.profilePlayers.find((player) => player.payment_key === value);
                          if (!selectedPlayer) return;
                          const selectedKey = `${selectedPlayer.payment_session?.play_id || selectedPlayer.payment_session?.id}:${selectedPlayer.player_id}`;
                          const isQueued = modal.data?.payment_entries?.some((entry) => entry.key === selectedKey);
                          if (isQueued) {
                            showToast('This player is already selected', 'warning');
                            return;
                          }
                          if (selectedPlayer.payment_session) {
                            handlePayPlayerRounds(selectedPlayer.payment_session, selectedPlayer, true);
                          } else {
                            showToast('This player session could not be found', 'warning');
                          }
                        }}
                        options={modal.data.profilePlayers.filter((player) => player.payment_session).map((player) => {
                          const playerLabel = player?.nickname || player?.username || `Player ${player?.player_id}`;
                          const sessionLabel = player.payment_session?.station_name || `Session #${player.payment_session?.play_id || player.payment_session?.id}`;
                          const roundCount = Math.max(Number(player.payment_session?.play_amount || 0), 1);
                          const paidRounds = new Set((player.payment_session?.round_payments || []).map((payment) => Number(payment.round_number)));
                          const unpaidRounds = Array.from({ length: roundCount }, (_, index) => index + 1).filter((round) => !paidRounds.has(round));
                          const isQueued = modal.data?.payment_entries?.some((entry) => entry.key === player.payment_key);
                          const roundLabel = unpaidRounds.length > 0 ? `R${unpaidRounds.join(', R')}` : 'No unpaid rounds';
                          return { value: player.payment_key, label: playerLabel, selected: isQueued, meta: `${isQueued ? 'Selected' : 'Add'} · ${sessionLabel} · ${roundLabel}` };
                        }).sort((first, second) => Number(second.selected) - Number(first.selected))}
                        placeholder="Search and add another player"
                        searchPlaceholder="Search players..."
                      />
                      <p className="mt-2 text-[10px] text-slate-500">Search for a player, select them, and repeat. Their unpaid rounds will be added to this payment.</p>
                    </>}
                  </div>
                )}

                {modal.data?.payment_entries?.length > 0 && (
                  <div className="mb-5 rounded-xl border border-amber-300/25 bg-amber-300/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Step 3 · Review selected players</p>
                      <span className="text-[10px] text-slate-400">{modal.data.payment_entries.length} player{modal.data.payment_entries.length === 1 ? '' : 's'}</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {modal.data.payment_entries.map((entry) => (
                        <div key={entry.key} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">{entry.player?.nickname || entry.player?.username || `Player ${entry.player_id}`}</p>
                            <p className="text-[10px] text-amber-100/80">{entry.round_numbers.length} round{entry.round_numbers.length === 1 ? '' : 's'}: R{entry.round_numbers.join(', R')}</p>
                            {Number(entry.session?.extra_time_count || 0) > 0 && Number(entry.session?.extra_price || 0) > 0 && <p className="text-[10px] text-amber-200/70">Extra time fee: {Number(entry.session.extra_time_count) * Number(entry.session.extra_price)} Br</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => setModal((prev) => {
                              const remaining = prev.data.payment_entries.filter((item) => item.key !== entry.key);
                              return { ...prev, data: { ...prev.data, payment_entries: remaining } };
                            })}
                            className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"
                            aria-label={`Remove ${entry.player?.nickname || `player ${entry.player_id}`} from payment`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={proceedToPlayerPayment}
                      className="mt-3 w-full rounded-xl bg-[#00F0FF] py-2.5 text-xs font-bold text-black transition hover:bg-cyan-200"
                    >
                      Proceed to payment · {modal.data.payment_entries.reduce((total, entry) => total + entry.amount, 0)} Br
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                  {[
                    ['Rounds', modal.data?.stats?.total_play_amount ?? 0],
                    ['Sessions', modal.data?.stats?.total_sessions ?? 0],
                    ['Completed', modal.data?.stats?.completed_sessions ?? 0],
                    ['Credits', modal.data?.stats?.total_credits_used ?? 0],
                    ['Won', `${Number(modal.data?.stats?.total_won_amount || 0)} Br`],
                    ['Lost', `${Number(modal.data?.stats?.total_lost_amount || 0)} Br`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] text-slate-500">{label}</p>
                      <p className="mt-1 text-lg font-bold text-white">{Number(value || 0)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={14} className="text-cyan-300" />
                    <h4 className="text-xs font-bold text-white">Where this player played</h4>
                  </div>
                  <div className="mb-3 flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
                    {[
                      ['open', 'Unpaid or unended'],
                      ['all', 'All history'],
                    ].map(([value, label]) => (
                      <button key={value} type="button" onClick={() => setPlayerHistoryFilter(value)} className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition ${playerHistoryFilter === value ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} aria-pressed={playerHistoryFilter === value}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {visiblePlayerHistory.length > 0 ? (
                    <div className="space-y-2">
                      {visiblePlayerHistory.map((session) => (
                        <div key={session.play_id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="min-w-0 truncate text-xs font-semibold text-white">{session.station_name || 'Unknown station'}</p>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <span className="text-[10px] text-slate-500">{session.status || 'Unknown'}</span>
                              {String(session.payment_status || '').toLowerCase() !== 'paid' && <span className="rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">Unpaid</span>}
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] text-cyan-100/80">{session.game_name || 'Unknown game'} · {Number(session.play_amount || 0)} round{Number(session.play_amount || 0) === 1 ? '' : 's'}</p>
                          <p className="mt-1 text-[10px] text-slate-500">{session.zone_name || 'Unknown zone'} · {session.started_at ? new Date(session.started_at).toLocaleString() : 'No start time'}</p>
                          {Number(session.paid_round_count || 0) < Math.max(Number(session.play_amount || 0), 1) && ['playing', 'paused', 'finished'].includes(String(session.status || '').toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => handlePayPlayerRounds(session, modal.data.player, modal.data.payment_mode === 'multiple')}
                              className="mt-2 rounded-lg bg-amber-400 px-2.5 py-1.5 text-[10px] font-bold text-black transition hover:bg-amber-300"
                            >
                              {modal.data?.payment_mode === 'multiple' ? 'Add this player' : 'Pay only this player'}
                            </button>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Array.from({ length: Math.max(Number(session.play_amount || 0), 1) }, (_, index) => index + 1).map((roundNumber) => {
                              const roundResult = (session.round_results || []).find((item) => Number(item.round_number) === roundNumber);
                              const isPaid = (session.round_payments || []).some((payment) => Number(payment.round_number) === roundNumber);
                              return (
                                <span key={`${session.play_id}-round-${roundNumber}`} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isPaid ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/20 bg-amber-300/10 text-amber-200'}`}>
                                  R{roundNumber}: {roundResult?.result || 'No result'} · {isPaid ? 'Paid' : 'Unpaid'}
                                  {roundResult?.score != null ? ` · ${roundResult.score} pts` : ''}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-4 text-xs text-slate-500">No completed or active play history recorded.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {modal.type === 'transfer-player' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Move Player to Another Station</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Timer ended transfer</div>
              <div className="mt-1 text-lg font-black text-white">
                {modal.data?.player?.nickname || modal.data?.player?.username || `Player ${modal.data?.player?.player_id || ''}`}
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Current session: <span className="font-semibold text-white">#{modal.data?.session?.play_id || modal.data?.session?.id}</span>
                {' '}at <span className="font-semibold text-white">{modal.data?.session?.station_name || 'Unknown station'}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <SearchableDropdown
                label="Destination station"
                value={modal.data?.target_station_id || ''}
                onChange={(nextValue) => setModal((prev) => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    target_station_id: nextValue
                  }
                }))}
                options={stations
                  .filter((station) => String(station.id) !== String(modal.data?.session?.station_id ?? modal.data?.session?.stationId ?? ''))
                  .map((station) => ({
                    value: station.id,
                    label: station.station_name,
                    meta: station.gameName ? `${station.gameName}${station.status ? ` • ${String(station.status).toLowerCase()}` : ''}` : station.status ? String(station.status).toLowerCase() : '',
                  }))}
                placeholder="Select station"
                searchPlaceholder="Search stations..."
              />
              <p className="text-[11px] text-slate-400">
                The player record will move to the selected station, the original session will get a replacement, and a new waiting session will be created there.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <SearchableDropdown
                label="Replacement player"
                value={modal.data?.replacement_player_id || ''}
                onChange={(nextValue) => setModal((prev) => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    replacement_player_id: nextValue
                  }
                }))}
                disabled={transferLoading}
                options={transferLoading
                  ? [{ value: '', label: 'Loading players...', meta: '' }]
                  : transferCandidates.map((candidate) => ({
                      value: candidate.player_id,
                      label: candidate.nickname || candidate.username || `Player ${candidate.player_id}`,
                      meta: candidate.station_id ? `Station ${candidate.station_id}` : 'Random player'
                    }))}
                placeholder={transferLoading ? 'Loading players...' : 'Select replacement player'}
                searchPlaceholder="Search players..."
              />
              <p className="text-[11px] text-slate-400">
                Pick the player you want to move into the original session. This is no longer auto-random.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={confirmTransferPlayer}
                disabled={isSubmitting || transferLoading || !modal.data?.target_station_id || !modal.data?.replacement_player_id}
                className="flex-1 bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Move Player'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'session-add-player' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Add Player to {String(modal.data?.session?.mode || '').toLowerCase() === 'flexible' ? 'Flexible Session' : 'Waiting Session'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                  {String(modal.data?.session?.mode || '').toLowerCase() === 'flexible' ? 'Flexible session' : 'Waiting session'}
                </div>
              <div className="mt-1 text-lg font-black text-white">
                {modal.data?.session?.station_name || 'Station'} • #{modal.data?.session?.play_id || modal.data?.session?.id}
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Game: <span className="font-semibold text-white">{modal.data?.session?.game_name || 'Game'}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <SessionPlayerPicker
                candidates={sessionPlayerCandidates}
                value={modal.data?.player_id || ''}
                loading={sessionPlayerLoading}
                onChange={(nextValue) => setModal((prev) => ({
                  ...prev,
                  data: { ...prev.data, player_id: nextValue }
                }))}
              />
              <p className="text-[11px] text-slate-400">
                {String(modal.data?.session?.mode || '').toLowerCase() === 'flexible'
                  ? 'This player can join while the session is playing. Existing payment rules are unchanged.'
                  : 'This player will be added to the waiting session so the station can continue to build the lineup.'}
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={confirmAddPlayerToSession}
                disabled={isSubmitting || sessionPlayerLoading || !modal.data?.player_id}
                className="flex-1 bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Add Player'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'session' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Create Play Session</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            {modal.data?.invite_only && (
              <div className="mb-4 rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#00F0FF]">Invite Mode</div>
                <h4 className="mt-1 text-lg font-black text-white">{modal.data.station_name || 'Station'} QR Invite</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Share this QR code with the player. No session will start until you choose the random-player flow.
                </p>
                <div className="mt-4 rounded-2xl bg-white p-3 flex justify-center">
                  <QRCode
                    value={modal.data.invite_code || sessionInviteCode || `STATION-${modal.data.station_id || selectedSessionStation?.id || ''}`}
                    size={150}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
                <p className="mt-3 text-center text-[11px] font-mono text-[#00F0FF]">
                  {modal.data.invite_code || sessionInviteCode}
                </p>
              </div>
            )}

            {modal.data?.play_id && !newSession.assign_random_player && (
              <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Session Created</div>
                <h4 className="mt-1 text-lg font-black text-white">Session #{modal.data.play_id}</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Player: {modal.data.assigned_player?.nickname || modal.data.nickname || modal.data.username || 'Random Player'}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px] items-center">
                  <div className="space-y-2 text-xs text-slate-300">
                    <div>Game: <span className="text-white font-semibold">{modal.data.game_name || 'Unknown'}</span></div>
                    <div>Station: <span className="text-white font-semibold">{modal.data.station_name || 'Unknown'}</span></div>
                    <div>Invite Code: <span className="text-[#00F0FF] font-mono font-semibold">{modal.data.invite_station?.qr_code || sessionInviteCode}</span></div>
                  </div>
                  <div className="rounded-2xl bg-white p-3 flex justify-center">
                    <QRCode
                      value={modal.data.invite_station?.qr_code || sessionInviteCode || `STATION-${modal.data.station_id || selectedSessionStation?.id || ''}`}
                      size={132}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                </div>
                {String(modal.data.status || '').toLowerCase() === 'waiting' && (
                  <button
                    type="button"
                    onClick={() => handleStartSession(modal.data.play_id || modal.data.id)}
                    className="mt-4 w-full rounded-xl bg-emerald-500/15 px-4 py-3 text-xs font-bold text-emerald-300"
                  >
                    Start Session
                  </button>
                )}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSession();
            }} className="space-y-3">
              {!newSession.assign_random_player && (
                <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-xs text-slate-200">
                  Invite-only mode does not use credits. Choose a station, generate the QR, and share it with the player.
                </div>
              )}
              {newSession.assign_random_player && !canCreateRandomSession && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                  Add credits to create a random-player session. You can still switch off random assignment and generate an invite QR.
                </div>
              )}
              {!isQuickPlayLocked && (
                <>
                  <SearchableDropdown
                    label="Game detail"
                    value={newSession.detail_id}
                    onChange={(nextValue) => {
                      const detail = gameDetails.find((item) => String(item.id) === String(nextValue));
                      const nextPlayerCount = detail ? getDefaultPlayerCount(detail) : Math.max(Number(newSession.player_count || 2), 1);
                      const nextNicknames = Array.from({ length: nextPlayerCount }, (_, index) => `Player ${index + 1}`);

                      setNewSession((prev) => ({
                        ...prev,
                        detail_id: nextValue,
                        station_id: detail?.station_id ? String(detail.station_id) : prev.station_id,
                        player_count: prev.assign_random_player ? nextPlayerCount : prev.player_count,
                        player_nicknames: prev.assign_random_player ? nextNicknames : prev.player_nicknames
                      }));
                    }}
                    options={gameDetails.map((detail) => {
                      const game = games.find((g) => String(g.id) === String(detail.game_id));
                      return {
                        value: detail.id,
                        label: `${game?.game_name || 'Game'} - ${detail.game_rule || 'Standard Rule'}`,
                        meta: detail.station_name || `Detail #${detail.id}`
                      };
                    })}
                    placeholder="Select game detail"
                    searchPlaceholder="Search details..."
                  />

                  <SearchableDropdown
                    label="Station"
                    value={newSession.station_id}
                    onChange={(nextValue) => setNewSession((prev) => ({ ...prev, station_id: nextValue }))}
                    options={stations.map((station) => ({
                      value: station.id,
                      label: station.station_name,
                      meta: station.gameName || `Station #${station.id}`,
                    }))}
                    placeholder="Select station"
                    searchPlaceholder="Search stations..."
                  />
                </>
              )}

              {isQuickPlayLocked && (
                <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-xs text-slate-200">
                  <div className="font-bold text-white">Station ready for quick play</div>
                  <div className="mt-1 text-slate-300">
                    {stations.find((station) => String(station.id) === String(newSession.station_id))?.station_name || 'Selected station'}
                    {' • '}
                    {gameDetails.find((detail) => String(detail.id) === String(newSession.detail_id))?.game_rule || 'Selected detail'}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newSession.assign_random_player}
                  onChange={(e) => {
                    const nextChecked = e.target.checked;
                    setNewSession((prev) => {
                      const selectedDetail = prev.detail_id
                        ? gameDetails.find((item) => String(item.id) === String(prev.detail_id))
                        : null;
                      const nextPlayerCount = nextChecked
                        ? getDefaultPlayerCount(selectedDetail || { max_players: prev.player_count || 2 })
                        : Math.max(Number(prev.player_count || 1), 1);

                      return {
                        ...prev,
                        assign_random_player: nextChecked,
                        player_count: nextPlayerCount,
                        player_nicknames: Array.from({ length: nextPlayerCount }, (_, index) => {
                          const existing = prev.player_nicknames?.[index];
                          return existing && existing.trim() ? existing.trim() : `Player ${index + 1}`;
                        })
                      };
                    });
                  }}
                  className="h-4 w-4 accent-[#00F0FF]"
                />
                Assign random players for this match
              </label>

              <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500">Session mode</label>
                <select
                  value={newSession.mode || 'strict'}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, mode: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs outline-none text-white focus:border-[#00F0FF]/50"
                >
                  <option value="strict">Strict: all players start together</option>
                  <option value="flexible">Flexible: players can join while playing</option>
                </select>
              </div>

              <div className="space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Payment timing</p>
                  <p className="mt-1 text-[11px] text-slate-400">Choose whether players pay before the session starts or after it ends.</p>
                </div>
                <select
                  value={newSession.payment_timing || 'After Game'}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, payment_timing: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-xs text-white outline-none focus:border-amber-300/50"
                >
                  <option value="After Game">After Game</option>
                  <option value="Before Game">Before Game</option>
                </select>
                {newSession.payment_timing === 'Before Game' && (
                  <>
                    <label className="block text-[11px] font-medium text-slate-300">
                      Planned rounds
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={newSession.planned_rounds || 1}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, planned_rounds: Math.max(1, Number(e.target.value || 1)) }))}
                        className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-amber-300/50"
                      />
                    </label>
                    <label className="block text-[11px] font-medium text-slate-300">
                      Payment method
                      <select
                        value={newSession.payment_method || 'Cash'}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, payment_method: e.target.value }))}
                        className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-amber-300/50"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                      </select>
                    </label>
                    <div className="flex items-center justify-between rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2.5 text-xs">
                      <span className="text-amber-100">Upfront total</span>
                      <strong className="text-base text-amber-200">{plannedUpfrontTotal.toFixed(2)} Br</strong>
                    </div>
                    <p className="text-[10px] text-amber-100/70">Calculated from {plannedPlayerCount || 0} player{plannedPlayerCount === 1 ? '' : 's'} × {newSession.planned_rounds || 1} round{Number(newSession.planned_rounds || 1) === 1 ? '' : 's'} × {plannedRoundPrice.toFixed(2)} Br.</p>
                  </>
                )}
              </div>

              {newSession.assign_random_player && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-widest text-slate-500">
                      Players needed {selectedSessionDetail?.max_players ? `• default ${selectedSessionDetail.max_players}` : ''}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newSession.player_count || 1}
                      onChange={(e) => {
                        const nextCount = Math.max(1, Number(e.target.value || 1));
                        setNewSession((prev) => ({
                          ...prev,
                          player_count: nextCount,
                          player_nicknames: Array.from({ length: nextCount }, (_, index) => {
                            const existing = prev.player_nicknames?.[index];
                            return existing && existing.trim() ? existing.trim() : `Player ${index + 1}`;
                          })
                        }));
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-widest text-slate-500">Player nicknames</label>
                    <div className="space-y-2">
                      {Array.from({ length: Math.max(1, Number(newSession.player_count || 1)) }, (_, index) => {
                        const currentValue = newSession.player_nicknames?.[index] ?? `Player ${index + 1}`;
                        return (
                          <input
                            key={`nickname-${index}`}
                            type="text"
                            value={currentValue}
                            onChange={(e) => {
                              const nextList = [...(newSession.player_nicknames || [])];
                              nextList[index] = e.target.value;
                              setNewSession((prev) => ({ ...prev, player_nicknames: nextList }));
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                            placeholder={`Player ${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!newSession.assign_random_player && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <SearchableDropdown
                    label="Recommended player"
                    value={newSession.player_id || ''}
                    onChange={(nextValue) => setNewSession((prev) => ({ ...prev, player_id: nextValue }))}
                    disabled={manualPlayerLoading}
                    options={[
                      { value: '', label: 'No specific player', meta: 'Optional' },
                      ...(manualPlayerCandidates.map((candidate) => ({
                        value: candidate.player_id,
                        label: candidate.nickname || candidate.username || `Player ${candidate.player_id}`,
                        meta: candidate.has_unfinished_session
                          ? `In unfinished session #${candidate.unfinished_session_id}`
                          : candidate.station_id ? `Station ${candidate.station_id}` : 'Available player'
                      })))
                    ]}
                    placeholder={manualPlayerLoading ? 'Loading recommendations...' : 'Search player or ID'}
                    searchPlaceholder="Type player name or ID..."
                  />
                  <p className="text-[11px] text-slate-400">
                    We suggest existing players from this station first. You can leave this empty if you only want the invite QR.
                  </p>
                </div>
              )}

              {!newSession.assign_random_player && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Station Invite</p>
                      <p className="text-xs text-slate-300">{sessionInviteCode || 'Select a detail or station to preview the QR'}</p>
                    </div>
                    <QrCode size={18} className="text-[#00F0FF]" />
                  </div>
                  <div className="bg-white rounded-2xl p-3 flex justify-center">
                    <QRCode
                      value={sessionInviteCode || `STATION-${selectedSessionStation?.id || selectedSessionDetail?.station_id || ''}`}
                      size={150}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (newSession.assign_random_player && !canCreateRandomSession)}
                className="w-full bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (newSession.assign_random_player ? 'Create Session' : 'Generate Invite QR')}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal.type === 'detail' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {isStationDetailContext
                  ? (isEditingDetail ? 'Edit Station Rule' : 'Add Station Rule')
                  : (isEditingDetail ? 'Edit Rules & Pricing' : 'Configure Rules & Pricing')}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!isStationDetailContext && (!newDetail.game_id || !newDetail.station_id)) return setFormError('Select both game & station');
              if (isEditingDetail) {
                handleUpdateDetail(modal.data.id, newDetail);
                return;
              }
              handleCreate('detail', newDetail, GameDetailsAPI.create, '✅ Rules saved successfully!');
            }} className="space-y-3">
              {isStationDetailContext ? (
                <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-xs text-slate-200">
                  <div className="font-bold text-white">{modal.data?.station_name || 'Station'}</div>
                  <div className="mt-1 text-slate-300">Rules are attached to this station. Update the values below.</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-black/20 px-2 py-1.5 text-[10px] text-slate-300">
                      Station ID: {newDetail.station_id || modal.data?.station_id || 'N/A'}
                    </div>
                    <div className="rounded-xl bg-black/20 px-2 py-1.5 text-[10px] text-slate-300">
                      Game ID: {newDetail.game_id || modal.data?.game_id || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <SearchableDropdown
                    label="Game"
                    value={newDetail.game_id}
                    onChange={(nextValue) => setNewDetail({ ...newDetail, game_id: nextValue })}
                    options={games.map((g) => ({
                      value: g.id,
                      label: g.game_name,
                      meta: g.game_type || `Game #${g.id}`,
                    }))}
                    placeholder="Select game"
                    searchPlaceholder="Search games..."
                  />

                  <SearchableDropdown
                    label="Station"
                    value={newDetail.station_id}
                    onChange={(nextValue) => setNewDetail({ ...newDetail, station_id: nextValue })}
                    options={stations
                      .filter(s => !newDetail.game_id || Number(s.game_id) === Number(newDetail.game_id))
                      .map((s) => ({
                        value: s.id,
                        label: s.station_name,
                        meta: s.gameName || `Station #${s.id}`,
                      }))}
                    placeholder="Select station"
                    searchPlaceholder="Search stations..."
                  />
                </>
              )}

              <textarea
                rows={2}
                placeholder="Game Rule (e.g. Winner stays on)"
                value={newDetail.game_rule}
                onChange={e => setNewDetail({ ...newDetail, game_rule: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 resize-none transition-all"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={newDetail.duration_minutes}
                  onChange={e => setNewDetail({ ...newDetail, duration_minutes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="Extra Time (min)"
                  value={newDetail.extra_time_minutes}
                  onChange={e => setNewDetail({ ...newDetail, extra_time_minutes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  placeholder="Main Price (Br)"
                  value={newDetail.main_price}
                  onChange={e => setNewDetail({ ...newDetail, main_price: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="Extra Price (Br)"
                  value={newDetail.extra_price}
                  onChange={e => setNewDetail({ ...newDetail, extra_price: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditingDetail ? 'Update Details' : 'Save Details')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
