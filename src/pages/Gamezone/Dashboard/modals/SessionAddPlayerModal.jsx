import { Loader2, X } from 'lucide-react';
import SessionPlayerPicker from '../../components/SessionPlayerPicker';

export default function SessionAddPlayerModal({ d }) {
  const {
    modal,
    setModal,
    isSubmitting,
    formError,
    sessionPlayerCandidates,
    sessionPlayerLoading,
    closeModal,
    confirmAddPlayerToSession,
  } = d;

  return (
    <>
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
    </>
  );
}
