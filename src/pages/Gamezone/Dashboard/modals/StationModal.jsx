import { Loader2, X } from 'lucide-react';
import StationAPI from '../../../../api/modules/stations.api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function StationModal({ d }) {
  const {
    games,
    modal,
    isSubmitting,
    formError,
    setFormError,
    newStation,
    setNewStation,
    closeModal,
    handleCreate,
    handleDeleteStation,
    handleUpdateStation,
  } = d;

  return (
    <>
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
    </>
  );
}
