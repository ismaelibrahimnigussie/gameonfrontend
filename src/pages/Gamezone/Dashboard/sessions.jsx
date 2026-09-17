import { useEffect, useMemo, useState } from 'react';
import {
  Play, SquareStop, Ban, RefreshCw, Plus, QrCode, TimerReset,
  Gamepad2, Pause, RotateCcw, ArrowLeft,
  Coins, ChevronRight, ShieldAlert, Search, SkipForward, History, ChevronDown,
  Trash2, X, Check, AlertTriangle, ArrowUpDown, Loader2, Users, MoreVertical,
  SlidersHorizontal, Receipt, LayoutGrid, ArrowRightLeft, UserRound
} from 'lucide-react';

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return [hours, minutes, secs].map(p => String(p).padStart(2, '0')).join(':');
};

const formatRoundMinutes = (minutes = 0) => {
  const value = Number(minutes) || 0;
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

const toLocalDateKey = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
  if (!value) return 'All days';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatEventType = (eventType) => {
  const labels = {
    round_started: 'Round started',
    extra_time_added: 'Extra time added',
    paused: 'Paused',
    resumed: 'Resumed',
    session_ended: 'Session ended',
    session_cancelled: 'Session cancelled',
    LegacySnapshot: 'Legacy snapshot',
  };
  return labels[eventType] || String(eventType || 'Event').replace(/_/g, ' ');
};

const formatRoundStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (!normalized) return 'Unknown';
  if (normalized === 'playing') return 'Live';
  if (normalized === 'waiting') return 'Waiting';
  if (normalized === 'paused') return 'Paused';
  if (normalized === 'finished') return 'Done';
  if (normalized === 'cancelled') return 'Cancelled';
  if (normalized === 'completed') return 'Completed';
  return status;
};

const getPlayerNames = (session) => {
  const fromPlayers = Array.isArray(session?.players)
    ? session.players
        .map((player) => player?.nickname || player?.username || `Player ${player?.player_id || ''}`.trim())
        .filter(Boolean)
    : [];
  if (fromPlayers.length > 0) return fromPlayers;

  const fromAssignedPlayers = Array.isArray(session?.assigned_players)
    ? session.assigned_players
        .map((player) => player?.nickname || player?.username || `Player ${player?.player_id || ''}`.trim())
        .filter(Boolean)
    : [];
  if (fromAssignedPlayers.length > 0) return fromAssignedPlayers;

  const fromSession = String(session?.player_names || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  if (fromSession.length > 0) return fromSession;

  const fallback = String(session?.nickname || session?.username || '').trim();
  return fallback ? [fallback] : [];
};

const getSessionPlayers = (session) => {
  if (Array.isArray(session?.players) && session.players.length > 0) {
    return session.players.filter(Boolean);
  }

  const rawPlayerIds = String(session?.player_ids || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (rawPlayerIds.length === 0) return [];

  const playerNames = String(session?.player_names || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  return rawPlayerIds.map((playerId, index) => ({
    player_id: playerId,
    nickname: playerNames[index] || `Player ${playerId}`,
  }));
};

const getSessionRounds = (session) => {
  if (Array.isArray(session?.rounds) && session.rounds.length > 0) {
    return session.rounds;
  }

  const roundCount = Math.max(Number(session?.play_amount ?? session?.round_count ?? 0), 0);
  if (roundCount === 0) return [];

  const playerNames = getPlayerNames(session);
  return Array.from({ length: roundCount }, (_, index) => ({
    round_number: index + 1,
    round_status: index + 1 === roundCount ? (session?.status || 'Completed') : 'Completed',
    started_at: index === 0 ? session?.started_at : null,
    ended_at: index + 1 === roundCount ? session?.ended_at : null,
    events: [],
    players: playerNames.map((name) => ({
      player_id: null,
      nickname: name,
    })),
  }));
};

// Fewer distinct hues on purpose: cyan carries the brand + "live" signal,
// amber = paused / money, slate = neutral / done, rose = cancelled / danger only.
const STATUS_CONFIG = {
  playing: { label: 'Live', color: 'text-[#00F0FF]', bg: 'bg-[#00F0FF]/10', border: 'border-[#00F0FF]/20', dot: 'bg-[#00F0FF]', bar: 'bg-[#00F0FF]' },
  waiting: { label: 'Waiting', color: 'text-slate-200', bg: 'bg-white/5', border: 'border-white/15', dot: 'bg-slate-300', bar: 'bg-slate-300' },
  paused: { label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  finished: { label: 'Done', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-500', bar: 'bg-slate-500' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400', bar: 'bg-rose-400' }
};

const SORT_OPTIONS = [
  { id: 'priority', label: 'Status' },
  { id: 'newest', label: 'Newest' },
  { id: 'remaining', label: 'Time left' },
];

const DETAIL_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'rounds', label: 'Rounds', icon: History },
  { id: 'pricing', label: 'Pricing', icon: Receipt },
];

// ---------- Small shared UI pieces ----------

function TimeBar({ percent, urgency = 'normal', className = '' }) {
  const colors = { critical: 'bg-rose-400', warn: 'bg-amber-400', normal: 'bg-[#00F0FF]', idle: 'bg-slate-400' };
  const width = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent * 100)) : 0;
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/5 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${colors[urgency] || colors.normal}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0f14] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <h3 id="confirm-dialog-title" className="text-sm font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300 disabled:opacity-60"
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col items-stretch sm:items-end gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-xl animate-fadeIn ${
            t.tone === 'error'
              ? 'border-rose-500/30 bg-[#160b0d] text-rose-300'
              : 'border-emerald-500/30 bg-[#0b1512] text-emerald-300'
          }`}
        >
          {t.tone === 'error' ? <AlertTriangle size={14} className="shrink-0" /> : <Check size={14} className="shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled, pending, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-white/5 hover:bg-white/10 border-white/10 text-white',
    primary: 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 border-transparent text-black',
    accent: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-300',
    accentSolid: 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 border-transparent text-black shadow-lg shadow-[#00F0FF]/20',
    warn: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400',
    warnSoft: 'bg-amber-300/10 hover:bg-amber-300/20 border-amber-300/25 text-amber-200',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      title={label}
      aria-label={label}
      className={`flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00F0FF]/60 ${tones[tone]} ${className}`}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {label}
    </button>
  );
}

// A small "..." menu so secondary actions don't clutter every card by default.
function OverflowMenu({ items }) {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;
  return (
    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="More actions"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-white/10 bg-[#0b0f14] p-1 shadow-2xl animate-fadeIn"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { setOpen(false); item.onClick(); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition disabled:opacity-40 ${
                  item.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.icon && <item.icon size={13} />}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Sessions({
  sessions = [],
  focusSessionId = null,
  onClearSessionFocus,
  onAddSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onContinueSession, // Adds configured extra time and price
  onAddExtraTime,
  onEndSession,
  onCancelSession,
  onDeleteSession,
  onBulkDeleteSessions,
  onTransferPlayer,
  onViewPlayerProfile,
  onAddPlayerToSession,
  onLeaveFlexiblePlayer,
  transferReminder = null,
  onRefresh,
  isRefreshing,
  canManageSessions = true,
  sessionLockMessage = '',
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [now, setNow] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [expandedPlayersSessionId, setExpandedPlayersSessionId] = useState(null);
  const [expandedRoundNumber, setExpandedRoundNumber] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pendingAction, setPendingAction] = useState(null); // `${id}:${actionKey}`
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmLabel, onConfirm }
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [roundResultSession, setRoundResultSession] = useState(null);
  const [roundResultDraft, setRoundResultDraft] = useState([]);
  const [roundResultBusy, setRoundResultBusy] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    const session = sessions.find(s => String(s.play_id || s.id) === String(activeSessionId));
    if (!session || String(session.status || '').toLowerCase() !== 'playing') return;

    const remaining = getRemainingTime(session);
    if (remaining <= 0) {
      onPauseSession?.(activeSessionId);
    }
  }, [activeSessionId, sessions, onPauseSession, now]);

  useEffect(() => {
    if (!focusSessionId) return;
    const nextId = String(focusSessionId);
    const session = sessions.find((item) => String(item.play_id || item.id) === nextId);
    if (session) {
      setActiveSessionId(nextId);
      setExpandedPlayersSessionId(null);
      onClearSessionFocus?.();
    }
  }, [focusSessionId, sessions, onClearSessionFocus]);

  const activeSession = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => String(s.play_id || s.id) === String(activeSessionId)) || null;
  }, [sessions, activeSessionId]);

  useEffect(() => {
    setExpandedPlayersSessionId(null);
    setExpandedRoundNumber(null);
    setDetailTab('overview');
  }, [activeSessionId]);

  // ---------- Toast + confirm + pending-action helpers ----------

  const pushToast = (message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const isPending = (id, actionKey) => pendingAction === `${id}:${actionKey}`;

  const runAction = async (fn, id, actionKey, successMessage) => {
    if (!fn) return;
    const key = `${id}:${actionKey}`;
    setPendingAction(key);
    try {
      await fn(id);
      if (successMessage) pushToast(successMessage, 'success');
    } catch (err) {
      pushToast(err?.message || 'That action failed. Please try again.', 'error');
    } finally {
      setPendingAction((prev) => (prev === key ? null : prev));
    }
  };

  const askConfirm = ({ title, message, confirmLabel, onConfirm }) => {
    setConfirmState({ title, message, confirmLabel, onConfirm });
  };

  const handleConfirm = async () => {
    if (!confirmState?.onConfirm) return;
    setConfirmBusy(true);
    try {
      await confirmState.onConfirm();
    } finally {
      setConfirmBusy(false);
      setConfirmState(null);
    }
  };

  const openRoundResultForm = (session) => {
    const players = getSessionPlayers(session);
    setRoundResultSession(session);
    setRoundResultDraft(players.map((player) => ({
      session_player_id: player.session_player_id,
      player_id: player.player_id,
      nickname: player.nickname || player.username || `Player ${player.player_id || ''}`,
      result: '',
      score: '',
      prize_amount: '',
      result_note: ''
    })));
  };

  const submitRoundResults = async (skipResults = false) => {
    if (!roundResultSession || !onContinueSession) return;
    const id = roundResultSession.play_id || roundResultSession.id;
    const results = skipResults
      ? []
      : roundResultDraft
          .filter((entry) => entry.result)
          .map(({ session_player_id, result, score, prize_amount, result_note }) => ({
            session_player_id,
            result,
            score,
            prize_amount,
            result_note
          }));

    setRoundResultBusy(true);
    try {
      await onContinueSession(id, results);
      setRoundResultSession(null);
      setRoundResultDraft([]);
      pushToast(skipResults ? 'New round started without results' : 'Results saved and new round started');
    } catch (error) {
      pushToast(error?.message || 'Unable to start the new round', 'error');
    } finally {
      setRoundResultBusy(false);
    }
  };

  const stats = useMemo(() => {
    const scoped = dayFilter === 'all' ? sessions : sessions.filter((session) => {
      const sessionDay = toLocalDateKey(session.started_at || session.created_at);
      return sessionDay === dayFilter;
    });
    return {
      total: scoped.length,
      playing: scoped.filter(s => String(s.status || '').toLowerCase() === 'playing').length,
      waiting: scoped.filter(s => String(s.status || '').toLowerCase() === 'waiting').length,
      paused: scoped.filter(s => String(s.status || '').toLowerCase() === 'paused').length,
      finished: scoped.filter(s => String(s.status || '').toLowerCase() === 'finished').length,
    };
  }, [sessions, dayFilter]);

  const daySessions = useMemo(() => {
    if (dayFilter === 'all') return sessions;
    return sessions.filter((session) => {
      const sessionDay = toLocalDateKey(session.started_at || session.created_at);
      return sessionDay === dayFilter;
    });
  }, [sessions, dayFilter]);

  const revenueSummary = useMemo(() => {
    const payments = daySessions.flatMap((session) => (
      Array.isArray(session.session_payments) ? session.session_payments : []
    )).filter((payment) => String(payment.payment_status || '').toLowerCase() === 'paid');
    return {
      amount: payments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      payments: payments.length,
      date: dayFilter === 'all' ? 'All dates' : formatDateLabel(dayFilter),
    };
  }, [daySessions, dayFilter]);

  const dayOptions = useMemo(() => {
    const uniqueDays = new Set();
    sessions.forEach((session) => {
      const key = toLocalDateKey(session.started_at || session.created_at);
      if (key) uniqueDays.add(key);
    });

    return Array.from(uniqueDays)
      .sort((a, b) => b.localeCompare(a))
      .map((value) => ({
        value,
        label: formatDateLabel(value),
      }));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const list = daySessions.filter(session => {
      const status = String(session.status || '').toLowerCase();
      const matchesStatus = activeTab === 'all' || status === activeTab;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        String(session.game_name || '').toLowerCase().includes(q) ||
        String(session.station_name || '').toLowerCase().includes(q) ||
        String(session.player_names || '').toLowerCase().includes(q) ||
        getPlayerNames(session).join(' ').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    const priority = { playing: 0, waiting: 1, paused: 2, finished: 3, cancelled: 4 };
    const sorted = [...list];

    if (sortBy === 'newest') {
      sorted.sort((a, b) => {
        const aTime = new Date(a.started_at || a.created_at || 0).getTime();
        const bTime = new Date(b.started_at || b.created_at || 0).getTime();
        return bTime - aTime;
      });
    } else if (sortBy === 'remaining') {
      sorted.sort((a, b) => getRemainingTime(a) - getRemainingTime(b));
    } else {
      sorted.sort((a, b) =>
        (priority[String(a.status || '').toLowerCase()] ?? 99) -
        (priority[String(b.status || '').toLowerCase()] ?? 99)
      );
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daySessions, activeTab, searchQuery, sortBy, now]);

  const toggleSelectSession = (sessionId) => {
    const id = String(sessionId);
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const allVisibleIds = filteredSessions.map(session => String(session.play_id || session.id));
  const allVisibleSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => allVisibleSelected
      ? prev.filter(id => !allVisibleIds.includes(id))
      : Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const selectedCount = selectedIds.length;
  const requestBulkDelete = () => {
    if (!selectedIds.length) return;
    askConfirm({
      title: `Delete ${selectedIds.length} session${selectedIds.length === 1 ? '' : 's'}?`,
      message: 'This removes the selected sessions and their history for good. This can\'t be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await onBulkDeleteSessions?.(selectedIds);
        pushToast(`${selectedIds.length} session${selectedIds.length === 1 ? '' : 's'} deleted`);
        setSelectedIds([]);
      },
    });
  };

  // Calculates total seconds played (excluding pauses)
  function getElapsed(session) {
    if (!session) return 0;
    const status = String(session.status || '').toLowerCase();
    const base = Number(session.elapsed_seconds || 0);
    const startedAt = session.started_at ? new Date(session.started_at).getTime() : null;

    if (status === 'playing' && startedAt && now) {
      const live = Math.floor((now - startedAt) / 1000);
      return Math.max(live - Number(session.total_pause_seconds || 0), 0);
    }
    return Math.max(base, 0);
  }

  // Total seconds the current round budget allows for (main + any extra time bought)
  function getTotalSeconds(session) {
    const mainDuration = Number(session.duration_minutes || 30) * 60;
    const extraDuration = Number(session.extra_time_minutes || session.duration_minutes || 15) * 60;
    const extraTimeDuration = Number(session.extra_time_count || 0) * extraDuration;
    return mainDuration + extraTimeDuration;
  }

  // Calculates countdown timer based on round and duration rules
  function getRemainingTime(session) {
    const status = String(session.status || '').toLowerCase();

    // If finished or cancelled, show 0
    if (status === 'finished' || status === 'cancelled') return 0;

    if (String(session.mode || '').toLowerCase() === 'flexible' && Array.isArray(session.players)) {
      const playerTimers = session.players
        .map((player) => getPlayerRemainingTime(session, player))
        .filter((remaining) => remaining !== null);
      if (playerTimers.length > 0) return Math.max(...playerTimers);
    }

    if (String(session.mode || '').toLowerCase() === 'flexible' && session.started_at) {
      const startedAt = new Date(session.started_at).getTime();
      if (Number.isFinite(startedAt)) {
        const elapsed = Math.max(0, Math.floor(((now || Date.now()) - startedAt) / 1000));
        return Math.max(0, Number(session.duration_minutes || 30) * 60 - elapsed);
      }
    }

    // Strict sessions do not start counting until the session starts.
    if (status === 'waiting') return getTotalSeconds(session);

    return Math.max(0, getTotalSeconds(session) - getElapsed(session));
  }

  function getPlayerRemainingTime(session, player) {
    if (String(session?.mode || '').toLowerCase() !== 'flexible' || !player) return null;
    const status = String(session.status || '').toLowerCase();
    const playerDuration = getTotalSeconds(session);
    if (status === 'finished' || status === 'cancelled') return 0;

    const joinedAt = new Date(player.joined_at || session.started_at).getTime();
    if (!Number.isFinite(joinedAt)) return null;
    const endAt = status === 'paused' && session.paused_at
      ? new Date(session.paused_at).getTime()
      : now || Date.now();
    const elapsed = Math.max(0, Math.floor((endAt - joinedAt) / 1000));
    return Math.max(0, playerDuration - elapsed);
  }

  // Glanceable urgency for the countdown: cyan while there's plenty of time,
  // amber when it's getting low, rose when it's nearly (or fully) out.
  function getTimeUrgency(session) {
    const status = String(session.status || '').toLowerCase();
    if (!['playing', 'paused'].includes(status)) return 'idle';
    const total = getTotalSeconds(session);
    if (!total) return 'normal';
    const ratio = getRemainingTime(session) / total;
    if (ratio <= 0.15) return 'critical';
    if (ratio <= 0.4) return 'warn';
    return 'normal';
  }

  const getSessionPricing = (session) => {
    const mainPrice = Number(session.main_price ?? 0);
    const addonPrice = Number(session.extra_price ?? 0);
    const roundCount = Math.max(Number(session.play_amount ?? 1), 1);
    const extraRoundCount = Math.max(Number(session.extra_round_count ?? roundCount - 1), 0);
    const extraTimeCount = Math.max(Number(session.extra_time_count || 0), 0);
    const sessionMainPrice = Number(session.session_main_price ?? mainPrice);
    const extraRoundPrice = Number(session.extra_round_price ?? (extraRoundCount * sessionMainPrice));
    const extraTimePrice = Number(session.extra_time_price ?? (extraTimeCount * addonPrice));
    const userPaid = Number(
      session.user_paid_amount ??
      session.userPaidAmount ??
      (sessionMainPrice + extraRoundPrice + extraTimePrice)
    );
    const systemPaid = Number(
      session.system_paid_amount ?? session.systemPaidAmount ?? session.system_paid ?? Math.max(Number(session.credits_used || 0) - userPaid, 0)
    );
    const rawTotalPaid = Number(session.total_paid_amount ?? session.totalPrice ?? (userPaid + systemPaid));
    const totalPaid = Number.isFinite(rawTotalPaid) ? rawTotalPaid : 0;

    return {
      roundCount,
      extraRoundCount,
      sessionMainPrice,
      extraPrice: addonPrice,
      extraRoundPrice,
      extraTimePrice,
      userPaid,
      systemPaid,
      totalPaid,
    };
  };

  const requestDeleteSession = (id, label) => {
    askConfirm({
      title: 'Delete this session?',
      message: `#${id}${label ? ` · ${label}` : ''} and its round history will be permanently removed.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await onDeleteSession?.(id);
        pushToast('Session deleted');
        if (String(activeSessionId) === String(id)) setActiveSessionId(null);
      },
    });
  };

  const requestCancelSession = (id, label) => {
    askConfirm({
      title: 'Cancel this session?',
      message: `#${id}${label ? ` · ${label}` : ''} will be marked cancelled. Players and the timer will stop.`,
      confirmLabel: 'Cancel session',
      onConfirm: () => runAction(onCancelSession, id, 'cancel', 'Session cancelled'),
    });
  };

  const activeFilterCount = (dayFilter !== 'all' ? 1 : 0) + (sortBy !== 'priority' ? 1 : 0);

  // Detail View
  if (activeSession) {
    const status = String(activeSession.status || '').toLowerCase();
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
    const id = activeSession.play_id || activeSession.id;
    const remaining = getRemainingTime(activeSession);
    const totalSeconds = getTotalSeconds(activeSession);
    const urgency = getTimeUrgency(activeSession);
    const isTimeUp = remaining === 0 && status === 'playing';
    const canAdvanceRound = remaining === 0 && (status === 'playing' || status === 'paused');
    const pricing = getSessionPricing(activeSession);
    const playerNames = getPlayerNames(activeSession);
    const sessionPlayers = getSessionPlayers(activeSession);
    const canTransferPlayers = remaining === 0 && ['playing', 'paused'].includes(status) && sessionPlayers.length > 0;
    const canAddFlexiblePlayer = String(activeSession.mode || '').toLowerCase() === 'flexible'
      && status === 'playing';
    const hasTransferReminder = String(transferReminder?.session_id || '') === String(id);
    const extraTimeCount = Math.max(Number(activeSession.extra_time_count || 0), 0);
    const playerCount = Math.max(Number(activeSession.player_count || playerNames.length || 0), 0);
    const isPlayersExpanded = String(expandedPlayersSessionId || '') === String(id);
    const sessionRounds = getSessionRounds(activeSession);
    const roundCount = Math.max(sessionRounds.length, pricing.roundCount, 0);
    const gameLabel = activeSession.game_name || 'Session';
    const timerColor = urgency === 'critical' ? 'text-rose-400' : urgency === 'warn' ? 'text-amber-300' : 'text-[#00F0FF]';

    return (
      <div className="space-y-5 animate-fadeIn max-w-3xl mx-auto pt-16 lg:pt-0 pb-24 lg:pb-0">
        <button
          onClick={() => setActiveSessionId(null)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 rounded-lg px-1 -ml-1"
        >
          <ArrowLeft size={18} /> Back to sessions
        </button>

        {/* Hero: the one thing you came here to check */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${isTimeUp ? 'animate-pulse' : ''}`} />
              {config.label}
            </span>
            <span className="text-xs font-mono text-slate-500">#{id}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{gameLabel}</h2>
          <p className="text-sm text-slate-400">{activeSession.station_name || 'Station'}</p>

          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <p className="text-xs text-slate-500">{status === 'waiting' ? 'Time budget' : 'Time remaining'}</p>
              {isTimeUp && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 animate-pulse">
                  <AlertTriangle size={12} /> Time's up
                </span>
              )}
            </div>
            <p className={`text-4xl sm:text-5xl font-mono font-bold tabular-nums leading-none mt-1 ${timerColor}`}>
              {formatDuration(remaining)}
            </p>
            <TimeBar
              percent={totalSeconds ? remaining / totalSeconds : 0}
              urgency={status === 'waiting' ? 'idle' : urgency}
              className="mt-3"
            />
          </div>

          {/* Quick-glance chips: kept to essentials, everything else lives in the tabs below */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              type="button"
              onClick={() => setExpandedPlayersSessionId((value) => (String(value) === String(id) ? null : id))}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60"
              aria-expanded={isPlayersExpanded}
            >
              <Users size={13} className="text-cyan-300" />
              {playerCount || playerNames.length || 0} player{(playerCount || playerNames.length || 0) === 1 ? '' : 's'}
              <ChevronDown size={12} className={`transition-transform ${isPlayersExpanded ? 'rotate-180' : ''}`} />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
              <Coins size={13} className="text-amber-400" /> {pricing.totalPaid} Br
            </span>
            {roundCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                <SkipForward size={13} className="text-violet-300" /> {roundCount} round{roundCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {isPlayersExpanded && (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex flex-wrap gap-1.5">
                {(sessionPlayers.length > 0 ? sessionPlayers : playerNames.map((n) => ({ nickname: n }))).map((player, index) => {
                  const label = player?.nickname || player?.username || `Player ${player?.player_id || index + 1}`;
                  const playerRemaining = getPlayerRemainingTime(activeSession, player);
                  const key = player?.player_id ?? `${id}-${index}`;
                  const canViewProfile = player?.player_id && typeof onViewPlayerProfile === 'function';
                  const canLeaveFlexiblePlayer = String(activeSession.mode || '').toLowerCase() === 'flexible'
                    && player?.player_id
                    && playerRemaining === 0
                    && ['playing', 'paused'].includes(status);
                  const isActionable = (canTransferPlayers || canLeaveFlexiblePlayer) && player?.player_id;
                  return isActionable ? (
                    <div key={key} className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 pl-2.5 pr-1 py-1">
                      <span className="text-xs font-medium text-cyan-100">{label}</span>
                      {playerRemaining !== null && (
                        <span className="text-[10px] font-mono text-cyan-200/70">{formatDuration(playerRemaining)}</span>
                      )}
                      {canViewProfile && <button
                        type="button"
                        onClick={() => onViewPlayerProfile({ ...player, payment_session: activeSession }, sessionPlayers)}
                        className="rounded-full p-1 text-cyan-200 transition hover:bg-white/10 hover:text-white"
                        title="View player profile and play history"
                        aria-label={`View ${label} profile`}
                      ><UserRound size={13} /></button>}
                      {canLeaveFlexiblePlayer && <button
                        type="button"
                        onClick={() => onLeaveFlexiblePlayer?.(activeSession, player)}
                        className="rounded-full p-1 text-amber-200 transition hover:bg-white/10 hover:text-white"
                        title="Player time ended; mark player as left"
                        aria-label={`Mark ${label} as left`}
                      ><UserRound size={13} /></button>}
                      {canTransferPlayers && <button
                        type="button"
                        onClick={() => onTransferPlayer?.(activeSession, player)}
                        className="rounded-full p-1 text-cyan-200 transition hover:bg-white/10 hover:text-white"
                        title="Move this player to another station"
                        aria-label={`Move ${label} to another station`}
                      >
                        <ArrowRightLeft size={13} />
                      </button>}
                    </div>
                  ) : canViewProfile ? (
                    <button key={key} type="button" onClick={() => onViewPlayerProfile({ ...player, payment_session: activeSession }, sessionPlayers)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100" title="View player profile and play history">
                      <UserRound size={12} /> {label}
                      {playerRemaining !== null && <span className="text-[10px] font-mono text-slate-400">{formatDuration(playerRemaining)}</span>}
                    </button>
                  ) : (
                    <span key={key} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white">
                      {label}
                    </span>
                  );
                })}
                {sessionPlayers.length === 0 && playerNames.length === 0 && (
                  <span className="text-xs text-slate-500">No players recorded</span>
                )}
                    {canAddFlexiblePlayer && canManageSessions && (
                      <button
                        type="button"
                        onClick={() => onAddPlayerToSession?.(activeSession)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                        title="Add a player whose timer starts now"
                      >
                        <Plus size={12} /> Add player
                      </button>
                    )}
              </div>
              {canTransferPlayers && (
                <p className="mt-2 text-[11px] text-cyan-200/80">
                  Timer ended — tap a player to move them to another station.
                </p>
              )}
            </div>
          )}

          {hasTransferReminder && (
            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Transfer reminder</p>
                  <h4 className="mt-1 text-sm font-bold text-white">Moved player waiting here</h4>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-200">
                <div>Moved player: <span className="font-semibold text-white">{transferReminder?.moved_player?.nickname || transferReminder?.moved_player?.player_id || 'Player'}</span></div>
                <div>From: <span className="font-semibold text-white">#{transferReminder?.source_session_id || '—'} {transferReminder?.source_station_name || ''}</span></div>
                <div>To: <span className="font-semibold text-white">{activeSession.station_name || transferReminder?.target_station_name || 'This station'}</span></div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const key = `${id}:addPlayer`;
                  setPendingAction(key);
                  try {
                    await onAddPlayerToSession?.(activeSession);
                    pushToast('Player added');
                  } catch (err) {
                    pushToast(err?.message || 'That action failed. Please try again.', 'error');
                  } finally {
                    setPendingAction((prev) => (prev === key ? null : prev));
                  }
                }}
                disabled={!canManageSessions || isPending(id, 'addPlayer')}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00F0FF] px-3 py-2 text-xs font-bold text-black transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00F0FF]"
              >
                {isPending(id, 'addPlayer') && <Loader2 size={13} className="animate-spin" />}
                Add new player
              </button>
            </div>
          )}
        </div>

        {/* Segmented control keeps controls, round history, and pricing from all fighting for attention at once */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
          {DETAIL_TABS.map((tab) => {
            const isActive = detailTab === tab.id;
            const count = tab.id === 'rounds' ? sessionRounds.length : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 ${
                  isActive ? 'bg-[#00F0FF] text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={isActive}
              >
                <tab.icon size={14} />
                {tab.label}
                {count !== null && count > 0 && (
                  <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-slate-500'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {detailTab === 'overview' && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn">
            {['playing', 'paused'].includes(status) && (
              <div className={`flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                canAdvanceRound ? 'border-cyan-400/30 bg-cyan-400/6' : 'border-white/10 bg-white/[0.02]'
              }`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SkipForward size={15} className={canAdvanceRound ? 'text-cyan-300' : 'text-slate-500'} />
                    <p className="text-xs font-bold text-white">Start new round</p>
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold text-amber-200">
                      {pricing.sessionMainPrice} Br
                    </span>
                  </div>
                  <p className="mt-1 pl-6 text-[10px] text-slate-400">Starts a fresh round and resets the round timer</p>
                </div>
                <p className={`shrink-0 text-[10px] font-semibold ${canAdvanceRound ? 'text-cyan-200' : 'text-slate-500'}`}>
                  {canAdvanceRound ? 'Ready to start' : `Available at ${formatDuration(remaining)}`}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {status === 'waiting' && (
                <>
                  <ActionButton icon={Play} label="Start" tone="primary" onClick={() => runAction(onStartSession, id, 'start', 'Round started')} disabled={!canManageSessions} pending={isPending(id, 'start')} />
                  <ActionButton icon={Plus} label="Extra time" tone="warnSoft" onClick={() => runAction(onAddExtraTime, id, 'extra', 'Extra time added')} disabled={!canManageSessions} pending={isPending(id, 'extra')} />
                </>
              )}
              {status === 'playing' && (
                <>
                  <ActionButton icon={SkipForward} label="New round" tone={canAdvanceRound ? 'accentSolid' : 'accent'} onClick={() => openRoundResultForm(activeSession)} disabled={!canManageSessions || !canAdvanceRound} pending={isPending(id, 'continue')} />
                  <ActionButton icon={Plus} label="Extra time" tone="warnSoft" onClick={() => runAction(onAddExtraTime, id, 'extra', 'Extra time added')} disabled={!canManageSessions} pending={isPending(id, 'extra')} />
                  <ActionButton icon={Pause} label="Pause" onClick={() => runAction(onPauseSession, id, 'pause', 'Session paused')} disabled={!canManageSessions} pending={isPending(id, 'pause')} />
                  <ActionButton icon={SquareStop} label="End" tone="warn" onClick={() => runAction(onEndSession, id, 'end', 'Session ended')} disabled={!canManageSessions} pending={isPending(id, 'end')} />
                </>
              )}
              {status === 'paused' && (
                <>
                  <ActionButton icon={RotateCcw} label="Resume" tone="primary" onClick={() => runAction(onResumeSession, id, 'resume', 'Session resumed')} disabled={!canManageSessions} pending={isPending(id, 'resume')} />
                  <ActionButton icon={SkipForward} label="New round" tone="accent" onClick={() => openRoundResultForm(activeSession)} disabled={!canManageSessions || !canAdvanceRound} pending={isPending(id, 'continue')} />
                  <ActionButton icon={Plus} label="Extra time" tone="warnSoft" onClick={() => runAction(onAddExtraTime, id, 'extra', 'Extra time added')} disabled={!canManageSessions} pending={isPending(id, 'extra')} />
                  <ActionButton icon={SquareStop} label="End" tone="warn" onClick={() => runAction(onEndSession, id, 'end', 'Session ended')} disabled={!canManageSessions} pending={isPending(id, 'end')} />
                </>
              )}
              {status === 'finished' && (
                <p className="text-xs text-slate-500">This session is complete. Nothing left to do here.</p>
              )}
              {status === 'cancelled' && (
                <p className="text-xs text-slate-500">This session was cancelled.</p>
              )}
            </div>

            {!['finished', 'cancelled'].includes(status) && (
              <div className="pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => requestCancelSession(id, gameLabel)}
                  disabled={!canManageSessions}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400/60 rounded px-1"
                >
                  <Ban size={13} /> Cancel this session
                </button>
              </div>
            )}
          </div>
        )}

        {detailTab === 'rounds' && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 animate-fadeIn">
            {sessionRounds.length === 0 ? (
              <p className="text-xs text-slate-500">No rounds recorded yet. Start the session to begin round 1.</p>
            ) : (
              <div className="space-y-2">
                {sessionRounds.map((round) => {
                  const roundKey = round.round_number ?? round.roundNumber ?? 'unknown';
                  const isExpanded = String(expandedRoundNumber) === String(roundKey);
                  const roundEvents = Array.isArray(round.events) ? round.events : [];
                  const roundPlayers = Array.isArray(round.players)
                    ? round.players.map((player) => player?.nickname || player?.username || `Player ${player?.player_id || ''}`.trim()).filter(Boolean)
                    : [];
                  const roundStatus = formatRoundStatus(round.round_status || round.status);
                  const playerSummary = roundPlayers.length > 0 ? roundPlayers.join(', ') : 'No players recorded';

                  return (
                    <div key={roundKey} className="rounded-xl border border-white/10 bg-black/30">
                      <button
                        type="button"
                        onClick={() => setExpandedRoundNumber((value) => (String(value) === String(roundKey) ? null : roundKey))}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 rounded-xl"
                        aria-expanded={isExpanded}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-white">Round {roundKey}</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                              {roundStatus}
                            </span>
                            {roundEvents.length > 0 && (
                              <span className="text-[10px] text-slate-500">{roundEvents.length} event{roundEvents.length === 1 ? '' : 's'}</span>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {formatDateTime(round.started_at)} {round.ended_at ? `→ ${formatDateTime(round.ended_at)}` : ''}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-cyan-100/80">{playerSummary}</p>
                        </div>
                        <ChevronDown size={14} className={`shrink-0 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/5 px-3 py-3 text-xs text-slate-300">
                          {roundEvents.length > 0 ? (
                            <div className="space-y-2">
                              {roundEvents.map((event, index) => (
                                <div key={event.history_id ?? `${roundKey}-${index}`} className="rounded-lg border border-white/5 bg-black/20 px-2.5 py-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-white">{formatEventType(event.event_type)}</span>
                                    <span className="text-[10px] text-slate-500">{formatDateTime(event.created_at)}</span>
                                  </div>
                                  {(event.status_before || event.status_after) && (
                                    <p className="mt-1 text-[10px] text-slate-400">
                                      {formatRoundStatus(event.status_before)} → {formatRoundStatus(event.status_after)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500">No detailed events recorded for this round yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {detailTab === 'pricing' && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 animate-fadeIn">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300"><span>Base round</span><span className="text-white font-medium">{pricing.sessionMainPrice} Br</span></div>
              <div className="flex justify-between text-slate-300"><span>Extra rounds ({pricing.extraRoundCount} × {pricing.sessionMainPrice} Br)</span><span className="text-white font-medium">{pricing.extraRoundPrice} Br</span></div>
              <div className="flex justify-between text-slate-300"><span>Extra time ({extraTimeCount} × {pricing.extraPrice} Br)</span><span className="text-white font-medium">{pricing.extraTimePrice} Br</span></div>
              <div className="flex justify-between text-slate-300"><span>System cost</span><span className="text-white font-medium">{pricing.systemPaid} Br</span></div>
              <div className="flex justify-between pt-2 mt-2 border-t border-white/10 text-base font-bold text-amber-300"><span>Total</span><span>{pricing.totalPaid} Br</span></div>
            </div>
            <p className="mt-4 text-[11px] text-slate-500">{gameLabel} • {activeSession.game_rule || 'Standard rules'}</p>
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold text-white">Payment</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${activeSession.session_payments?.[0]?.payment_status === 'Paid' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
                  {activeSession.session_payments?.[0]?.payment_status || 'Not recorded'}
                </span>
              </div>
              {Array.isArray(activeSession.session_payments) && activeSession.session_payments.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {activeSession.session_payments.map((payment) => (
                    <div key={payment.payment_id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-amber-200">{Number(payment.amount || 0)} Br</span>
                        <span className="text-slate-300">{payment.payment_method}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                        {payment.payment_provider && <span>Provider: {payment.payment_provider}</span>}
                        {payment.sender_name && <span>Sender: {payment.sender_name}</span>}
                        {payment.transaction_reference && <span>Reference: {payment.transaction_reference}</span>}
                        {payment.paid_at && <span>Paid: {formatDateTime(payment.paid_at)}</span>}
                        {payment.payment_timing && <span>Timing: {payment.payment_timing}</span>}
                      </div>
                      {payment.notes && <p className="mt-1 text-[10px] text-slate-400">{payment.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">No payment recorded for this session.</p>
              )}
            </div>
          </div>
        )}

        {roundResultSession && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/15 bg-[#090914] p-5 sm:rounded-2xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Round {roundResultSession.play_amount || 1} completed</p>
                  <h3 className="mt-1 text-base font-bold text-white">Record results before the next round</h3>
                </div>
                <button type="button" onClick={() => setRoundResultSession(null)} disabled={roundResultBusy} className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close round results">
                  <X size={18} />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Results are optional. You can skip them and start the next round.</p>

              <div className="mt-4 space-y-3">
                {roundResultDraft.map((entry, index) => (
                  <div key={entry.session_player_id || entry.player_id || index} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="mb-2 text-xs font-semibold text-white">{entry.nickname}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={entry.result}
                        onChange={(event) => setRoundResultDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, result: event.target.value } : item))}
                        className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white outline-none"
                      >
                        <option value="">No result</option>
                        <option value="Win">Win</option>
                        <option value="Lose">Lose</option>
                        <option value="Draw">Draw</option>
                      </select>
                      <input value={entry.score} onChange={(event) => setRoundResultDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, score: event.target.value } : item))} type="number" step="0.01" placeholder="Score (optional)" className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none" />
                      <input value={entry.prize_amount} onChange={(event) => setRoundResultDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, prize_amount: event.target.value } : item))} type="number" step="0.01" placeholder="Prize (optional)" className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none" />
                      <input value={entry.result_note} onChange={(event) => setRoundResultDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, result_note: event.target.value } : item))} maxLength={255} placeholder="Note (optional)" className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => submitRoundResults(false)} disabled={roundResultBusy} className="flex-1 rounded-xl bg-[#00F0FF] py-3 text-xs font-bold text-black disabled:opacity-50">
                  {roundResultBusy ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Save and start next round'}
                </button>
                <button type="button" onClick={() => submitRoundResults(true)} disabled={roundResultBusy} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-slate-300 disabled:opacity-50">
                  Skip results
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmState}
          title={confirmState?.title}
          message={confirmState?.message}
          confirmLabel={confirmState?.confirmLabel}
          busy={confirmBusy}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmState(null)}
        />
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'playing', label: 'Live', count: stats.playing },
    { id: 'waiting', label: 'Wait', count: stats.waiting },
    { id: 'paused', label: 'Pause', count: stats.paused },
    { id: 'finished', label: 'Done', count: stats.finished },
  ];

  return (
    <div className="space-y-4 animate-fadeIn pt-16 lg:pt-0 pb-20 lg:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 size={18} className="text-[#00F0FF] shrink-0" />
            <span className="truncate">Sessions</span>
          </h1>
          <p className="text-xs text-slate-400">{stats.total} total · {stats.playing} live now</p>
        </div>
        <button
          onClick={onAddSession}
          disabled={!canManageSessions}
          className="px-3 sm:px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 rounded-xl text-xs sm:text-sm font-semibold text-black transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-[#00F0FF]/20 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00F0FF]"
        >
          <Plus size={14} /> <span className="hidden xs:inline">New session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Revenue collected</p>
          <p className="mt-1 text-2xl font-black text-white">{revenueSummary.amount.toLocaleString()} <span className="text-sm font-semibold text-emerald-200">Br</span></p>
          <p className="mt-1 text-[10px] text-emerald-100/70">Paid payments · {revenueSummary.date}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Paid records</p>
          <p className="mt-1 text-2xl font-black text-white">{revenueSummary.payments}</p>
          <p className="mt-1 text-[10px] text-cyan-100/70">Payments marked paid</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date issued</p>
          <p className="mt-1 text-lg font-bold text-white">{revenueSummary.date}</p>
          <p className="mt-1 text-[10px] text-slate-500">Based on the date filter above</p>
        </div>
      </div>

      {/* Primary toolbar: status pills + search only. Day/sort live behind Filters to stay out of the way. */}
      <div className="bg-black/40 rounded-2xl p-2 sm:p-3 border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-1 min-w-[200px] overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter sessions by status">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all rounded-lg whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 ${
                    isActive ? 'bg-[#00F0FF] text-black' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.label}
                    <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-slate-500'}`}>{tab.count}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search sessions"
                className="w-28 xs:w-36 sm:w-44 pl-8 pr-7 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-[#00F0FF]/50 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                title="Day & sort filters"
                aria-label="Day and sort filters"
                aria-expanded={filtersOpen}
                className={`relative p-2 rounded-lg border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 ${
                  filtersOpen || activeFilterCount > 0
                    ? 'border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]'
                    : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <SlidersHorizontal size={14} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00F0FF] text-[9px] font-bold text-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {filtersOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFiltersOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-white/10 bg-[#0b0f14] p-3 shadow-2xl animate-fadeIn space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Day</label>
                      <select
                        value={dayFilter}
                        onChange={(e) => setDayFilter(e.target.value)}
                        className="mt-1 w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-[#00F0FF]/50 outline-none transition"
                      >
                        <option value="all">All days</option>
                        {dayOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="mt-1 w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-[#00F0FF]/50 outline-none transition"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => { setDayFilter('all'); setSortBy('priority'); }}
                        className="w-full text-[11px] text-center text-slate-400 hover:text-white transition py-1"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh"
              aria-label="Refresh sessions"
              className="p-2 text-slate-500 hover:text-[#00F0FF] hover:bg-white/5 rounded-lg transition shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#00F0FF]' : ''} />
            </button>
          </div>
        </div>

        {(dayFilter !== 'all' || filteredSessions.length > 0) && (
          <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
            <p className="text-[10px] text-slate-500">
              {filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'} · {dayFilter === 'all' ? 'all days' : formatDateLabel(dayFilter)}
            </p>
            {filteredSessions.length > 0 && (
              <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 accent-[#00F0FF]"
                />
                Select all
              </label>
            )}
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-2 text-xs text-[#00F0FF] animate-fadeIn">
          <span className="font-medium">{selectedCount} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSelectedIds([])} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition">
              Clear
            </button>
            <button type="button" onClick={requestBulkDelete} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-300 hover:bg-rose-500/25 transition">
              <Trash2 size={12} /> Delete selected
            </button>
          </div>
        </div>
      )}

      {!canManageSessions && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-400">
          <ShieldAlert size={14} className="shrink-0" />
          <span className="truncate">{sessionLockMessage || 'Verification required'}</span>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-black/40 border border-white/10 rounded-2xl">
          <QrCode size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-300 font-medium">
            {searchQuery || activeTab !== 'all' || dayFilter !== 'all' ? 'No sessions match your filters' : 'No sessions yet'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery || activeTab !== 'all' || dayFilter !== 'all'
              ? 'Try clearing search or filters.'
              : 'Start your first session to see it here.'}
          </p>
          {!(searchQuery || activeTab !== 'all' || dayFilter !== 'all') ? (
            <button
              onClick={onAddSession}
              disabled={!canManageSessions}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 rounded-xl text-xs font-medium text-black transition disabled:opacity-50"
            >
              <Plus size={14} /> New session
            </button>
          ) : (
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); setDayFilter('all'); }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white transition"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
          {filteredSessions.map(session => {
            const status = String(session.status || '').toLowerCase();
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
            const id = session.play_id || session.id;
            const remaining = getRemainingTime(session);
            const totalSeconds = getTotalSeconds(session);
            const urgency = getTimeUrgency(session);
            const isTimeUp = remaining === 0 && status === 'playing';
            const canAdvanceRound = remaining === 0 && (status === 'playing' || status === 'paused');
            const pricing = getSessionPricing(session);
            const playerNames = getPlayerNames(session);
            const playerCount = Math.max(Number(session.player_count || playerNames.length || 0), 0);
            const gameLabel = session.game_name || 'Session';
            const isSelected = selectedIds.includes(String(id));
            const timerColor = status === 'waiting' ? 'text-slate-300' : urgency === 'critical' ? 'text-rose-400' : urgency === 'warn' ? 'text-amber-300' : 'text-[#00F0FF]';

            // Single primary action per card — everything else lives in the "⋯" menu.
            let primary = null;
            if (status === 'waiting') primary = { icon: Play, label: 'Start', tone: 'primary', key: 'start', fn: onStartSession, msg: 'Round started' };
            else if (status === 'paused') primary = { icon: RotateCcw, label: 'Resume', tone: 'primary', key: 'resume', fn: onResumeSession, msg: 'Session resumed' };
            else if (status === 'playing' && canAdvanceRound) primary = { icon: SkipForward, label: 'New round', tone: 'accentSolid', key: 'continue', fn: onContinueSession, msg: 'New round started' };

            const menuItems = [
              status === 'playing' && { label: 'Pause', icon: Pause, onClick: () => runAction(onPauseSession, id, 'pause', 'Session paused') },
              ['playing', 'paused', 'waiting'].includes(status) && { label: 'Add extra time', icon: Plus, onClick: () => runAction(onAddExtraTime, id, 'extra', 'Extra time added') },
              ['playing', 'paused'].includes(status) && { label: 'End session', icon: SquareStop, onClick: () => runAction(onEndSession, id, 'end', 'Session ended') },
              !['finished', 'cancelled'].includes(status) && { label: 'Cancel session', icon: Ban, danger: true, onClick: () => requestCancelSession(id, gameLabel) },
              { label: 'Delete session', icon: Trash2, danger: true, onClick: () => requestDeleteSession(id, gameLabel) },
            ].filter(Boolean);

            return (
              <div
                key={id}
                onClick={() => setActiveSessionId(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setActiveSessionId(id); }}
                className={`group bg-black/40 border rounded-xl p-3.5 sm:p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 ${
                  isSelected ? 'border-[#00F0FF]/40 bg-[#00F0FF]/[0.03]' : 'border-white/10 hover:border-[#00F0FF]/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelectSession(id)}
                    aria-label={`Select session ${id}`}
                    className="mt-1.5 h-4 w-4 accent-[#00F0FF] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${isTimeUp ? 'animate-pulse' : ''}`} />
                        {config.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">#{id}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate mt-1 group-hover:text-[#00F0FF] transition-colors">
                      {gameLabel}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{session.station_name || 'Station'}</p>
                    {getSessionPlayers(session).length > 0 && typeof onViewPlayerProfile === 'function' && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {getSessionPlayers(session).map((player, index) => {
                          const playerLabel = player?.nickname || player?.username || `Player ${player?.player_id || index + 1}`;
                          return (
                            <button
                              key={player?.player_id || `${id}-player-${index}`}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onViewPlayerProfile({ ...player, payment_session: session }, getSessionPlayers(session));
                              }}
                              className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100"
                              title="View unpaid or unended sessions for this player"
                            >
                              <UserRound size={11} />
                              <span className="max-w-[8rem] truncate">{playerLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-base sm:text-lg font-mono font-bold tabular-nums ${isTimeUp ? 'text-rose-400 animate-pulse' : timerColor}`}>
                      {formatDuration(remaining)}
                    </p>
                  </div>
                  <OverflowMenu items={menuItems} />
                </div>

                <TimeBar percent={totalSeconds ? remaining / totalSeconds : 0} urgency={status === 'waiting' ? 'idle' : urgency} className="mt-3" />

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400 min-w-0">
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} className="text-cyan-300" /> {playerCount || playerNames.length || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Coins size={12} className="text-amber-400" /> {pricing.totalPaid} Br
                    </span>
                  </div>
                  {primary ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); runAction(primary.fn, id, primary.key, primary.msg); }}
                      disabled={!canManageSessions || isPending(id, primary.key)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                        primary.tone === 'primary' || primary.tone === 'accentSolid'
                          ? 'bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {isPending(id, primary.key) ? <Loader2 size={12} className="animate-spin" /> : <primary.icon size={12} />}
                      {primary.label}
                    </button>
                  ) : (
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-[#00F0FF] group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
      <ToastStack toasts={toasts} />
    </div>
  );
}