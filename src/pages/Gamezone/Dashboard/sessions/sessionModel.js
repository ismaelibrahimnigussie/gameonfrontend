export const sessionKey = (session) => session?.play_id || session?.id;

export const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, '0')).join(':');
};

export const toLocalDateKey = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const formatDateLabel = (value) => {
  if (!value) return 'All days';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (value) => {
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

const EVENT_LABELS = {
  round_started: 'Round started',
  extra_time_added: 'Extra time added',
  paused: 'Paused',
  resumed: 'Resumed',
  session_ended: 'Session ended',
  session_cancelled: 'Session cancelled',
  LegacySnapshot: 'Legacy snapshot',
};

export const formatEventType = (eventType) => (
  EVENT_LABELS[eventType] || String(eventType || 'Event').replace(/_/g, ' ')
);

const ROUND_STATUS_LABELS = {
  playing: 'Live',
  waiting: 'Waiting',
  paused: 'Paused',
  finished: 'Done',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export const formatRoundStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (!normalized) return 'Unknown';
  return ROUND_STATUS_LABELS[normalized] || status;
};

const namesFrom = (players) => (
  Array.isArray(players)
    ? players.map((player) => player?.nickname || player?.username || `Player ${player?.player_id || ''}`.trim()).filter(Boolean)
    : []
);

export const getPlayerNames = (session) => {
  const fromPlayers = namesFrom(session?.players);
  if (fromPlayers.length > 0) return fromPlayers;
  const fromAssigned = namesFrom(session?.assigned_players);
  if (fromAssigned.length > 0) return fromAssigned;
  const fromSession = String(session?.player_names || '').split(',').map((name) => name.trim()).filter(Boolean);
  if (fromSession.length > 0) return fromSession;
  const fallback = String(session?.nickname || session?.username || '').trim();
  return fallback ? [fallback] : [];
};

export const getSessionPlayers = (session) => {
  if (Array.isArray(session?.players) && session.players.length > 0) {
    return session.players.filter(Boolean);
  }
  const rawPlayerIds = String(session?.player_ids || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (rawPlayerIds.length === 0) return [];
  const playerNames = String(session?.player_names || '').split(',').map((name) => name.trim()).filter(Boolean);
  return rawPlayerIds.map((playerId, index) => ({
    player_id: playerId,
    nickname: playerNames[index] || `Player ${playerId}`,
  }));
};

export const getSessionRounds = (session) => {
  if (Array.isArray(session?.rounds) && session.rounds.length > 0) return session.rounds;
  const roundCount = Math.max(Number(session?.play_amount ?? session?.round_count ?? 0), 0);
  if (roundCount === 0) return [];
  const playerNames = getPlayerNames(session);
  return Array.from({ length: roundCount }, (_, index) => ({
    round_number: index + 1,
    round_status: index + 1 === roundCount ? (session?.status || 'Completed') : 'Completed',
    started_at: index === 0 ? session?.started_at : null,
    ended_at: index + 1 === roundCount ? session?.ended_at : null,
    events: [],
    players: playerNames.map((name) => ({ player_id: null, nickname: name })),
  }));
};

export const STATUS_CONFIG = {
  playing: { label: 'Live', color: 'text-[#00F0FF]', bg: 'bg-[#00F0FF]/10', border: 'border-[#00F0FF]/20', dot: 'bg-[#00F0FF]' },
  waiting: { label: 'Waiting', color: 'text-slate-200', bg: 'bg-white/5', border: 'border-white/15', dot: 'bg-slate-300' },
  paused: { label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  finished: { label: 'Done', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-500' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400' },
};

export const SORT_OPTIONS = [
  { id: 'priority', label: 'Status' },
  { id: 'newest', label: 'Newest' },
  { id: 'remaining', label: 'Time left' },
];

export const getTotalSeconds = (session) => {
  const mainDuration = Number(session.duration_minutes || 30) * 60;
  const extraSlice = Number(session.extra_time_minutes || session.duration_minutes || 15) * 60;
  return mainDuration + (Number(session.extra_time_count || 0) * extraSlice);
};

export const getPlayerRemainingTime = (session, player, now) => {
  if (String(session?.mode || '').toLowerCase() !== 'flexible' || !player) return null;
  const status = String(session.status || '').toLowerCase();
  if (status === 'finished' || status === 'cancelled') return 0;
  const joinedAt = new Date(player.joined_at || session.started_at).getTime();
  if (!Number.isFinite(joinedAt)) return null;
  const endAt = status === 'paused' && session.paused_at
    ? new Date(session.paused_at).getTime()
    : now || Date.now();
  const elapsed = Math.max(0, Math.floor((endAt - joinedAt) / 1000));
  return Math.max(0, getTotalSeconds(session) - elapsed);
};

const getElapsed = (session, now) => {
  if (!session) return 0;
  const status = String(session.status || '').toLowerCase();
  const startedAt = session.started_at ? new Date(session.started_at).getTime() : null;
  if (status === 'playing' && startedAt && now) {
    const live = Math.floor((now - startedAt) / 1000);
    return Math.max(live - Number(session.total_pause_seconds || 0), 0);
  }
  return Math.max(Number(session.elapsed_seconds || 0), 0);
};

export const getRemainingTime = (session, now) => {
  const status = String(session.status || '').toLowerCase();
  if (status === 'finished' || status === 'cancelled') return 0;

  if (String(session.mode || '').toLowerCase() === 'flexible' && Array.isArray(session.players)) {
    const playerTimers = session.players
      .map((player) => getPlayerRemainingTime(session, player, now))
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

  if (status === 'waiting') return getTotalSeconds(session);
  return Math.max(0, getTotalSeconds(session) - getElapsed(session, now));
};

export const getTimeUrgency = (session, now) => {
  const status = String(session.status || '').toLowerCase();
  if (!['playing', 'paused'].includes(status)) return 'idle';
  const total = getTotalSeconds(session);
  if (!total) return 'normal';
  const ratio = getRemainingTime(session, now) / total;
  if (ratio <= 0.15) return 'critical';
  if (ratio <= 0.4) return 'warn';
  return 'normal';
};

export const getSessionPricing = (session) => {
  const mainPrice = Number(session.main_price ?? 0);
  const addonPrice = Number(session.extra_price ?? 0);
  const roundCount = Math.max(Number(session.play_amount ?? 1), 1);
  const extraRoundCount = Math.max(Number(session.extra_round_count ?? roundCount - 1), 0);
  const extraTimeCount = Math.max(Number(session.extra_time_count || 0), 0);
  const sessionMainPrice = Number(session.session_main_price ?? mainPrice);
  const extraRoundPrice = Number(session.extra_round_price ?? (extraRoundCount * sessionMainPrice));
  const extraTimePrice = Number(session.extra_time_price ?? (extraTimeCount * addonPrice));
  const userPaid = Number(
    session.user_paid_amount
    ?? session.userPaidAmount
    ?? (sessionMainPrice + extraRoundPrice + extraTimePrice)
  );
  const systemPaid = Number(
    session.system_paid_amount
    ?? session.systemPaidAmount
    ?? session.system_paid
    ?? Math.max(Number(session.credits_used || 0) - userPaid, 0)
  );
  const rawTotalPaid = Number(session.total_paid_amount ?? session.totalPrice ?? (userPaid + systemPaid));
  return {
    roundCount,
    extraRoundCount,
    sessionMainPrice,
    extraPrice: addonPrice,
    extraRoundPrice,
    extraTimePrice,
    userPaid,
    systemPaid,
    totalPaid: Number.isFinite(rawTotalPaid) ? rawTotalPaid : 0,
  };
};

const STATUS_PRIORITY = { playing: 0, waiting: 1, paused: 2, finished: 3, cancelled: 4 };

export const filterSessions = (daySessions, { activeTab, searchQuery, sortBy, now }) => {
  const query = searchQuery.trim().toLowerCase();
  const list = daySessions.filter((session) => {
    const status = String(session.status || '').toLowerCase();
    if (activeTab !== 'all' && status !== activeTab) return false;
    if (!query) return true;
    return String(session.game_name || '').toLowerCase().includes(query)
      || String(session.station_name || '').toLowerCase().includes(query)
      || String(session.player_names || '').toLowerCase().includes(query)
      || getPlayerNames(session).join(' ').toLowerCase().includes(query);
  });

  const sorted = [...list];
  if (sortBy === 'newest') {
    sorted.sort((a, b) => new Date(b.started_at || b.created_at || 0) - new Date(a.started_at || a.created_at || 0));
  } else if (sortBy === 'remaining') {
    sorted.sort((a, b) => getRemainingTime(a, now) - getRemainingTime(b, now));
  } else {
    sorted.sort((a, b) => (
      (STATUS_PRIORITY[String(a.status || '').toLowerCase()] ?? 99)
      - (STATUS_PRIORITY[String(b.status || '').toLowerCase()] ?? 99)
    ));
  }
  return sorted;
};
