import { Ban, ChevronRight, Coins, Loader2, Pause, Play, Plus, RotateCcw, SkipForward, SquareStop, Trash2, UserRound, Users } from 'lucide-react';
import {
  STATUS_CONFIG,
  formatDuration,
  getPlayerNames,
  getRemainingTime,
  getSessionPlayers,
  getSessionPricing,
  getTimeUrgency,
  getTotalSeconds,
  sessionKey,
} from './sessionModel';
import { OverflowMenu, TimeBar } from './sessionUi';

export function SessionCard({
  session,
  now,
  selected,
  canManageSessions,
  isPending,
  onOpen,
  onToggleSelect,
  onViewPlayerProfile,
  runAction,
  onStartSession,
  onResumeSession,
  onContinueSession,
  onPauseSession,
  onAddExtraTime,
  onEndSession,
  onRequestCancel,
  onRequestDelete,
}) {
  const status = String(session.status || '').toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
  const id = sessionKey(session);
  const remaining = getRemainingTime(session, now);
  const totalSeconds = getTotalSeconds(session);
  const urgency = getTimeUrgency(session, now);
  const isTimeUp = remaining === 0 && status === 'playing';
  const canAdvanceRound = remaining === 0 && (status === 'playing' || status === 'paused');
  const pricing = getSessionPricing(session);
  const playerNames = getPlayerNames(session);
  const players = getSessionPlayers(session);
  const playerCount = Math.max(Number(session.player_count || playerNames.length || 0), 0);
  const gameLabel = session.game_name || 'Session';
  const timerColor = status === 'waiting'
    ? 'text-slate-300'
    : urgency === 'critical' ? 'text-rose-400' : urgency === 'warn' ? 'text-amber-300' : 'text-[#00F0FF]';

  let primary = null;
  if (status === 'waiting') primary = { icon: Play, label: 'Start', tone: 'primary', key: 'start', fn: onStartSession, msg: 'Round started' };
  else if (status === 'paused') primary = { icon: RotateCcw, label: 'Resume', tone: 'primary', key: 'resume', fn: onResumeSession, msg: 'Session resumed' };
  else if (status === 'playing' && canAdvanceRound) primary = { icon: SkipForward, label: 'New round', tone: 'accentSolid', key: 'continue', fn: onContinueSession, msg: 'New round started' };

  const menuItems = [
    status === 'playing' && { label: 'Pause', icon: Pause, onClick: () => runAction(onPauseSession, id, 'pause', 'Session paused') },
    ['playing', 'paused', 'waiting'].includes(status) && { label: 'Add extra time', icon: Plus, onClick: () => runAction(onAddExtraTime, id, 'extra', 'Extra time added') },
    ['playing', 'paused'].includes(status) && { label: 'End session', icon: SquareStop, onClick: () => runAction(onEndSession, id, 'end', 'Session ended') },
    !['finished', 'cancelled'].includes(status) && { label: 'Cancel session', icon: Ban, danger: true, onClick: () => onRequestCancel(id, gameLabel) },
    { label: 'Delete session', icon: Trash2, danger: true, onClick: () => onRequestDelete(id, gameLabel) },
  ].filter(Boolean);

  return (
    <div
      onClick={() => onOpen(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Enter') onOpen(id); }}
      className={`group bg-black/40 border rounded-xl p-3.5 sm:p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00F0FF]/60 ${
        selected ? 'border-[#00F0FF]/40 bg-[#00F0FF]/[0.03]' : 'border-white/10 hover:border-[#00F0FF]/30'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={selected}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onToggleSelect(id)}
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
          <h3 className="text-sm sm:text-base font-bold text-white truncate mt-1 group-hover:text-[#00F0FF] transition-colors">{gameLabel}</h3>
          <p className="text-xs text-slate-400 truncate">{session.station_name || 'Station'}</p>
          {players.length > 0 && typeof onViewPlayerProfile === 'function' && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {players.map((player, index) => {
                const playerLabel = player?.nickname || player?.username || `Player ${player?.player_id || index + 1}`;
                return (
                  <button
                    key={player?.player_id || `${id}-player-${index}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewPlayerProfile({ ...player, payment_session: session }, players);
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
          <span className="inline-flex items-center gap-1"><Users size={12} className="text-cyan-300" /> {playerCount || playerNames.length || 0}</span>
          <span className="inline-flex items-center gap-1"><Coins size={12} className="text-amber-400" /> {pricing.totalPaid} Br</span>
        </div>
        {primary ? (
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); runAction(primary.fn, id, primary.key, primary.msg); }}
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
}
