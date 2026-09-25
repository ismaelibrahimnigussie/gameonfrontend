import { AlertTriangle, ArrowLeft, ChevronDown, Coins, History, LayoutGrid, Loader2, Receipt, SkipForward, Users } from 'lucide-react';
import {
  STATUS_CONFIG,
  formatDuration,
  getPlayerNames,
  getRemainingTime,
  getSessionPlayers,
  getSessionPricing,
  getSessionRounds,
  getTimeUrgency,
  getTotalSeconds,
  sessionKey,
} from './sessionModel';
import { TimeBar } from './sessionUi';
import { OverviewPanel, PlayerChips, PricingPanel, RoundsPanel } from './SessionPanels';

const DETAIL_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'rounds', label: 'Rounds', icon: History },
  { id: 'pricing', label: 'Pricing', icon: Receipt },
];

export function SessionDetail({
  session,
  now,
  detailTab,
  setDetailTab,
  playersExpanded,
  setPlayersExpanded,
  expandedRoundNumber,
  setExpandedRoundNumber,
  canManageSessions,
  transferReminder,
  isPending,
  runAction,
  runTask,
  openRoundResultForm,
  requestCancelSession,
  onViewPlayerProfile,
  onLeaveFlexiblePlayer,
  onTransferPlayer,
  onAddPlayerToSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onEndSession,
  onAddExtraTime,
  onBack,
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
  const canTransferPlayers = remaining === 0 && ['playing', 'paused'].includes(status) && players.length > 0;
  const canAddFlexiblePlayer = String(session.mode || '').toLowerCase() === 'flexible' && status === 'playing';
  const hasTransferReminder = String(transferReminder?.session_id || '') === String(id);
  const extraTimeCount = Math.max(Number(session.extra_time_count || 0), 0);
  const playerCount = Math.max(Number(session.player_count || playerNames.length || 0), 0);
  const rounds = getSessionRounds(session);
  const roundCount = Math.max(rounds.length, pricing.roundCount, 0);
  const gameLabel = session.game_name || 'Session';
  const timerColor = urgency === 'critical' ? 'text-rose-400' : urgency === 'warn' ? 'text-amber-300' : 'text-[#00F0FF]';

  return (
    <div className="space-y-5 animate-fadeIn max-w-3xl mx-auto pt-16 lg:pt-0 pb-24 lg:pb-0">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00F0FF] transition-colors rounded-lg px-1 -ml-1">
        <ArrowLeft size={18} /> Back to sessions
      </button>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${isTimeUp ? 'animate-pulse' : ''}`} />
            {config.label}
          </span>
          <span className="text-xs font-mono text-slate-500">#{id}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{gameLabel}</h2>
        <p className="text-sm text-slate-400">{session.station_name || 'Station'}</p>
        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <p className="text-xs text-slate-500">{status === 'waiting' ? 'Time budget' : 'Time remaining'}</p>
            {isTimeUp && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 animate-pulse"><AlertTriangle size={12} /> Time's up</span>}
          </div>
          <p className={`text-4xl sm:text-5xl font-mono font-bold tabular-nums leading-none mt-1 ${timerColor}`}>{formatDuration(remaining)}</p>
          <TimeBar percent={totalSeconds ? remaining / totalSeconds : 0} urgency={status === 'waiting' ? 'idle' : urgency} className="mt-3" />
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            type="button"
            onClick={() => setPlayersExpanded((value) => (String(value) === String(id) ? null : id))}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            aria-expanded={playersExpanded}
          >
            <Users size={13} className="text-cyan-300" />
            {playerCount || playerNames.length || 0} player{(playerCount || playerNames.length || 0) === 1 ? '' : 's'}
            <ChevronDown size={12} className={`transition-transform ${playersExpanded ? 'rotate-180' : ''}`} />
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

        {playersExpanded && (
          <PlayerChips
            session={session}
            players={players}
            playerNames={playerNames}
            id={id}
            status={status}
            now={now}
            canTransferPlayers={canTransferPlayers}
            canAddFlexiblePlayer={canAddFlexiblePlayer}
            canManageSessions={canManageSessions}
            onViewPlayerProfile={onViewPlayerProfile}
            onLeaveFlexiblePlayer={onLeaveFlexiblePlayer}
            onTransferPlayer={onTransferPlayer}
            onAddPlayerToSession={onAddPlayerToSession}
          />
        )}

        {hasTransferReminder && (
          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Transfer reminder</p>
            <h4 className="mt-1 text-sm font-bold text-white">Moved player waiting here</h4>
            <div className="mt-3 space-y-1 text-xs text-slate-200">
              <div>Moved player: <span className="font-semibold text-white">{transferReminder?.moved_player?.nickname || transferReminder?.moved_player?.player_id || 'Player'}</span></div>
              <div>From: <span className="font-semibold text-white">#{transferReminder?.source_session_id || '—'} {transferReminder?.source_station_name || ''}</span></div>
              <div>To: <span className="font-semibold text-white">{session.station_name || transferReminder?.target_station_name || 'This station'}</span></div>
            </div>
            <button
              type="button"
              onClick={() => runTask(`${id}:addPlayer`, () => onAddPlayerToSession?.(session), 'Player added')}
              disabled={!canManageSessions || isPending(id, 'addPlayer')}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00F0FF] px-3 py-2 text-xs font-bold text-black transition disabled:opacity-50"
            >
              {isPending(id, 'addPlayer') && <Loader2 size={13} className="animate-spin" />}
              Add new player
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
        {DETAIL_TABS.map((tab) => {
          const isActive = detailTab === tab.id;
          const count = tab.id === 'rounds' ? rounds.length : null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDetailTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${isActive ? 'bg-[#00F0FF] text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              aria-pressed={isActive}
            >
              <tab.icon size={14} />
              {tab.label}
              {count !== null && count > 0 && <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-slate-500'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {detailTab === 'overview' && (
        <OverviewPanel
          status={status}
          id={id}
          session={session}
          remaining={remaining}
          canAdvanceRound={canAdvanceRound}
          canManageSessions={canManageSessions}
          pricing={pricing}
          gameLabel={gameLabel}
          isPending={isPending}
          runAction={runAction}
          openRoundResultForm={openRoundResultForm}
          requestCancelSession={requestCancelSession}
          onStartSession={onStartSession}
          onAddExtraTime={onAddExtraTime}
          onPauseSession={onPauseSession}
          onEndSession={onEndSession}
          onResumeSession={onResumeSession}
        />
      )}
      {detailTab === 'rounds' && (
        <RoundsPanel rounds={rounds} expandedRoundNumber={expandedRoundNumber} setExpandedRoundNumber={setExpandedRoundNumber} />
      )}
      {detailTab === 'pricing' && (
        <PricingPanel session={session} pricing={pricing} extraTimeCount={extraTimeCount} gameLabel={gameLabel} />
      )}
    </div>
  );
}
