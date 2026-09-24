import { Loader2, X } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function TransferPlayerModal({ d }) {
  const {
    stations,
    modal,
    setModal,
    isSubmitting,
    formError,
    transferCandidates,
    transferLoading,
    closeModal,
    confirmTransferPlayer,
  } = d;

  return (
    <>
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
    </>
  );
}
