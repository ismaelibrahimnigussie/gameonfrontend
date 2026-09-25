import { Loader2, X } from 'lucide-react';
import GameDetailsAPI from '../../../../api/modules/gameDetails.api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function DetailModal({ d }) {
  const {
    games,
    stations,
    modal,
    isSubmitting,
    formError,
    setFormError,
    newDetail,
    setNewDetail,
    closeModal,
    isEditingDetail,
    isStationDetailContext,
    handleCreate,
    handleUpdateDetail,
  } = d;

  return (
    <>
      {modal.type === 'detail' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {isStationDetailContext
                  ? (isEditingDetail ? 'Edit Station Rule' : 'Add Station Rule')
                  : (isEditingDetail ? 'Edit Rules & Pricing' : 'Configure Rules & Pricing')}
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

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!isStationDetailContext && (!newDetail.game_id || !newDetail.station_id)) return setFormError('Select both game & station');
              if (isEditingDetail) {
                handleUpdateDetail(modal.data.id, newDetail);
                return;
              }
              handleCreate('detail', newDetail, GameDetailsAPI.create, '✅ Rules saved successfully!');
            }} className="space-y-3">
              {isStationDetailContext ? (
                <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-xs text-slate-200">
                  <div className="font-bold text-white">{modal.data?.station_name || 'Station'}</div>
                  <div className="mt-1 text-slate-300">Rules are attached to this station. Update the values below.</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-black/20 px-2 py-1.5 text-[10px] text-slate-300">
                      Station ID: {newDetail.station_id || modal.data?.station_id || 'N/A'}
                    </div>
                    <div className="rounded-xl bg-black/20 px-2 py-1.5 text-[10px] text-slate-300">
                      Game ID: {newDetail.game_id || modal.data?.game_id || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <SearchableDropdown
                    label="Game"
                    value={newDetail.game_id}
                    onChange={(nextValue) => setNewDetail({ ...newDetail, game_id: nextValue })}
                    options={games.map((g) => ({
                      value: g.id,
                      label: g.game_name,
                      meta: g.game_type || `Game #${g.id}`,
                    }))}
                    placeholder="Select game"
                    searchPlaceholder="Search games..."
                  />

                  <SearchableDropdown
                    label="Station"
                    value={newDetail.station_id}
                    onChange={(nextValue) => setNewDetail({ ...newDetail, station_id: nextValue })}
                    options={stations
                      .filter(s => !newDetail.game_id || Number(s.game_id) === Number(newDetail.game_id))
                      .map((s) => ({
                        value: s.id,
                        label: s.station_name,
                        meta: s.gameName || `Station #${s.id}`,
                      }))}
                    placeholder="Select station"
                    searchPlaceholder="Search stations..."
                  />
                </>
              )}

              <textarea
                rows={2}
                placeholder="Game Rule (e.g. Winner stays on)"
                value={newDetail.game_rule}
                onChange={e => setNewDetail({ ...newDetail, game_rule: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 resize-none transition-all"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={newDetail.duration_minutes}
                  onChange={e => setNewDetail({ ...newDetail, duration_minutes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="Extra Time (min)"
                  value={newDetail.extra_time_minutes}
                  onChange={e => setNewDetail({ ...newDetail, extra_time_minutes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  placeholder="Main Price (Br)"
                  value={newDetail.main_price}
                  onChange={e => setNewDetail({ ...newDetail, main_price: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="Extra Price (Br)"
                  value={newDetail.extra_price}
                  onChange={e => setNewDetail({ ...newDetail, extra_price: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditingDetail ? 'Update Details' : 'Save Details')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
