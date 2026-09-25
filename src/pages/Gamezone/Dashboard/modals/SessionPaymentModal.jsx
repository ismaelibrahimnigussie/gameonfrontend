import { Loader2, X } from 'lucide-react';

export default function SessionPaymentModal({ d }) {
  const {
    modal,
    setModal,
    isSubmitting,
    formError,
    setPlayerHistoryFilter,
    closeModal,
    confirmEndSessionPayment,
  } = d;

  return (
    <>
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
    </>
  );
}
