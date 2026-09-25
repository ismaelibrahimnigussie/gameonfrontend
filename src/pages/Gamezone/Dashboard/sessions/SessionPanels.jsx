import { ArrowRightLeft, Ban, ChevronDown, Pause, Play, Plus, RotateCcw, SkipForward, SquareStop, UserRound } from 'lucide-react';
import {
  formatDateTime,
  formatDuration,
  formatEventType,
  formatRoundStatus,
  getPlayerRemainingTime,
} from './sessionModel';
import { ActionButton } from './sessionUi';

export function PlayerChips({
  session, players, playerNames, id, status, now, canTransferPlayers, canAddFlexiblePlayer, canManageSessions,
  onViewPlayerProfile, onLeaveFlexiblePlayer, onTransferPlayer, onAddPlayerToSession,
}) {
  const shown = players.length > 0 ? players : playerNames.map((name) => ({ nickname: name }));
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex flex-wrap gap-1.5">
        {shown.map((player, index) => {
          const label = player?.nickname || player?.username || `Player ${player?.player_id || index + 1}`;
          const playerRemaining = getPlayerRemainingTime(session, player, now);
          const key = player?.player_id ?? `${id}-${index}`;
          const canViewProfile = player?.player_id && typeof onViewPlayerProfile === 'function';
          const canLeave = String(session.mode || '').toLowerCase() === 'flexible'
            && player?.player_id
            && playerRemaining === 0
            && ['playing', 'paused'].includes(status);
          const actionable = (canTransferPlayers || canLeave) && player?.player_id;
          if (!actionable) {
            return canViewProfile ? (
              <button key={key} type="button" onClick={() => onViewPlayerProfile({ ...player, payment_session: session }, players)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100" title="View player profile and play history">
                <UserRound size={12} /> {label}
                {playerRemaining !== null && <span className="text-[10px] font-mono text-slate-400">{formatDuration(playerRemaining)}</span>}
              </button>
            ) : (
              <span key={key} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white">{label}</span>
            );
          }
          return (
            <div key={key} className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 pl-2.5 pr-1 py-1">
              <span className="text-xs font-medium text-cyan-100">{label}</span>
              {playerRemaining !== null && <span className="text-[10px] font-mono text-cyan-200/70">{formatDuration(playerRemaining)}</span>}
              {canViewProfile && <button type="button" onClick={() => onViewPlayerProfile({ ...player, payment_session: session }, players)} className="rounded-full p-1 text-cyan-200 transition hover:bg-white/10 hover:text-white" title="View player profile and play history" aria-label={`View ${label} profile`}><UserRound size={13} /></button>}
              {canLeave && <button type="button" onClick={() => onLeaveFlexiblePlayer?.(session, player)} className="rounded-full p-1 text-amber-200 transition hover:bg-white/10 hover:text-white" title="Player time ended; mark player as left" aria-label={`Mark ${label} as left`}><UserRound size={13} /></button>}
              {canTransferPlayers && <button type="button" onClick={() => onTransferPlayer?.(session, player)} className="rounded-full p-1 text-cyan-200 transition hover:bg-white/10 hover:text-white" title="Move this player to another station" aria-label={`Move ${label} to another station`}><ArrowRightLeft size={13} /></button>}
            </div>
          );
        })}
        {players.length === 0 && playerNames.length === 0 && <span className="text-xs text-slate-500">No players recorded</span>}
        {canAddFlexiblePlayer && canManageSessions && (
          <button type="button" onClick={() => onAddPlayerToSession?.(session)} className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20" title="Add a player whose timer starts now">
            <Plus size={12} /> Add player
          </button>
        )}
      </div>
      {canTransferPlayers && <p className="mt-2 text-[11px] text-cyan-200/80">Timer ended — tap a player to move them to another station.</p>}
    </div>
  );
}

export function OverviewPanel({
  status, id, session, remaining, canAdvanceRound, canManageSessions, pricing, gameLabel, isPending, runAction,
  openRoundResultForm, requestCancelSession, onStartSession, onAddExtraTime, onPauseSession, onEndSession, onResumeSession,
}) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn">
      {['playing', 'paused'].includes(status) && (
        <div className={`flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between ${canAdvanceRound ? 'border-cyan-400/30 bg-cyan-400/6' : 'border-white/10 bg-white/[0.02]'}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SkipForward size={15} className={canAdvanceRound ? 'text-cyan-300' : 'text-slate-500'} />
              <p className="text-xs font-bold text-white">Start new round</p>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold text-amber-200">{pricing.sessionMainPrice} Br</span>
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
            <ActionButton icon={SkipForward} label="New round" tone={canAdvanceRound ? 'accentSolid' : 'accent'} onClick={() => openRoundResultForm(session)} disabled={!canManageSessions || !canAdvanceRound} pending={isPending(id, 'continue')} />
            <ActionButton icon={Plus} label="Extra time" tone="warnSoft" onClick={() => runAction(onAddExtraTime, id, 'extra', 'Extra time added')} disabled={!canManageSessions} pending={isPending(id, 'extra')} />
            <ActionButton icon={Pause} label="Pause" onClick={() => runAction(onPauseSession, id, 'pause', 'Session paused')} disabled={!canManageSessions} pending={isPending(id, 'pause')} />
            <ActionButton icon={SquareStop} label="End" tone="warn" onClick={() => runAction(onEndSession, id, 'end', 'Session ended')} disabled={!canManageSessions} pending={isPending(id, 'end')} />
          </>
        )}
        {status === 'paused' && (
          <>
            <ActionButton icon={RotateCcw} label="Resume" tone="primary" onClick={() => runAction(onResumeSession, id, 'resume', 'Session resumed')} disabled={!canManageSessions} pending={isPending(id, 'resume')} />
            <ActionButton icon={SkipForward} label="New round" tone="accent" onClick={() => openRoundResultForm(session)} disabled={!canManageSessions || !canAdvanceRound} pending={isPending(id, 'continue')} />
            <ActionButton icon={Plus} label="Extra time" tone="warnSoft" onClick={() => runAction(onAddExtraTime, id, 'extra', 'Extra time added')} disabled={!canManageSessions} pending={isPending(id, 'extra')} />
            <ActionButton icon={SquareStop} label="End" tone="warn" onClick={() => runAction(onEndSession, id, 'end', 'Session ended')} disabled={!canManageSessions} pending={isPending(id, 'end')} />
          </>
        )}
        {status === 'finished' && <p className="text-xs text-slate-500">This session is complete. Nothing left to do here.</p>}
        {status === 'cancelled' && <p className="text-xs text-slate-500">This session was cancelled.</p>}
      </div>
      {!['finished', 'cancelled'].includes(status) && (
        <div className="pt-3 border-t border-white/5">
          <button type="button" onClick={() => requestCancelSession(id, gameLabel)} disabled={!canManageSessions} className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition disabled:opacity-40 rounded px-1">
            <Ban size={13} /> Cancel this session
          </button>
        </div>
      )}
    </div>
  );
}

export function RoundsPanel({ rounds, expandedRoundNumber, setExpandedRoundNumber }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 animate-fadeIn">
      {rounds.length === 0 ? (
        <p className="text-xs text-slate-500">No rounds recorded yet. Start the session to begin round 1.</p>
      ) : (
        <div className="space-y-2">
          {rounds.map((round) => {
            const roundKey = round.round_number ?? round.roundNumber ?? 'unknown';
            const isExpanded = String(expandedRoundNumber) === String(roundKey);
            const roundEvents = Array.isArray(round.events) ? round.events : [];
            const roundPlayers = Array.isArray(round.players)
              ? round.players.map((player) => player?.nickname || player?.username || `Player ${player?.player_id || ''}`.trim()).filter(Boolean)
              : [];
            return (
              <div key={roundKey} className="rounded-xl border border-white/10 bg-black/30">
                <button type="button" onClick={() => setExpandedRoundNumber((value) => (String(value) === String(roundKey) ? null : roundKey))} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left rounded-xl" aria-expanded={isExpanded}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-white">Round {roundKey}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300">{formatRoundStatus(round.round_status || round.status)}</span>
                      {roundEvents.length > 0 && <span className="text-[10px] text-slate-500">{roundEvents.length} event{roundEvents.length === 1 ? '' : 's'}</span>}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">{formatDateTime(round.started_at)} {round.ended_at ? `→ ${formatDateTime(round.ended_at)}` : ''}</p>
                    <p className="mt-1 truncate text-[10px] text-cyan-100/80">{roundPlayers.length > 0 ? roundPlayers.join(', ') : 'No players recorded'}</p>
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
                              <p className="mt-1 text-[10px] text-slate-400">{formatRoundStatus(event.status_before)} → {formatRoundStatus(event.status_after)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-[10px] text-slate-500">No detailed events recorded for this round yet.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PricingPanel({ session, pricing, extraTimeCount, gameLabel }) {
  const paid = session.session_payments?.[0]?.payment_status === 'Paid';
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 animate-fadeIn">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-300"><span>Base round</span><span className="text-white font-medium">{pricing.sessionMainPrice} Br</span></div>
        <div className="flex justify-between text-slate-300"><span>Extra rounds ({pricing.extraRoundCount} × {pricing.sessionMainPrice} Br)</span><span className="text-white font-medium">{pricing.extraRoundPrice} Br</span></div>
        <div className="flex justify-between text-slate-300"><span>Extra time ({extraTimeCount} × {pricing.extraPrice} Br)</span><span className="text-white font-medium">{pricing.extraTimePrice} Br</span></div>
        <div className="flex justify-between text-slate-300"><span>System cost</span><span className="text-white font-medium">{pricing.systemPaid} Br</span></div>
        <div className="flex justify-between pt-2 mt-2 border-t border-white/10 text-base font-bold text-amber-300"><span>Total</span><span>{pricing.totalPaid} Br</span></div>
      </div>
      <p className="mt-4 text-[11px] text-slate-500">{gameLabel} • {session.game_rule || 'Standard rules'}</p>
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-xs font-bold text-white">Payment</h4>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${paid ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
            {session.session_payments?.[0]?.payment_status || 'Not recorded'}
          </span>
        </div>
        {Array.isArray(session.session_payments) && session.session_payments.length > 0 ? (
          <div className="mt-2 space-y-2">
            {session.session_payments.map((payment) => (
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
        ) : <p className="mt-2 text-[11px] text-slate-500">No payment recorded for this session.</p>}
      </div>
    </div>
  );
}
