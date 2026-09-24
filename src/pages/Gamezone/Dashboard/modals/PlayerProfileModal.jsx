import { History, Loader2, X } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function PlayerProfileModal({ d }) {
  const {
    modal,
    setModal,
    formError,
    playerProfileLoading,
    playerHistoryFilter,
    setPlayerHistoryFilter,
    showToast,
    closeModal,
    visiblePlayerHistory,
    handlePayPlayerRounds,
    proceedToPlayerPayment,
  } = d;

  return (
    <>
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
    </>
  );
}
