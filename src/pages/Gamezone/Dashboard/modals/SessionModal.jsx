import { Loader2, QrCode, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function SessionModal({ d }) {
  const {
    games,
    stations,
    gameDetails,
    modal,
    isSubmitting,
    formError,
    newSession,
    setNewSession,
    manualPlayerCandidates,
    manualPlayerLoading,
    selectedSessionDetail,
    selectedSessionStation,
    getDefaultPlayerCount,
    sessionInviteCode,
    canCreateRandomSession,
    closeModal,
    isQuickPlayLocked,
    plannedRoundPrice,
    plannedPlayerCount,
    plannedUpfrontTotal,
    handleCreateSession,
    handleStartSession,
  } = d;

  return (
    <>
      {modal.type === 'session' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Create Play Session</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            {modal.data?.invite_only && (
              <div className="mb-4 rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#00F0FF]">Invite Mode</div>
                <h4 className="mt-1 text-lg font-black text-white">{modal.data.station_name || 'Station'} QR Invite</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Share this QR code with the player. No session will start until you choose the random-player flow.
                </p>
                <div className="mt-4 rounded-2xl bg-white p-3 flex justify-center">
                  <QRCode
                    value={modal.data.invite_code || sessionInviteCode || `STATION-${modal.data.station_id || selectedSessionStation?.id || ''}`}
                    size={150}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
                <p className="mt-3 text-center text-[11px] font-mono text-[#00F0FF]">
                  {modal.data.invite_code || sessionInviteCode}
                </p>
              </div>
            )}

            {modal.data?.play_id && !newSession.assign_random_player && (
              <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Session Created</div>
                <h4 className="mt-1 text-lg font-black text-white">Session #{modal.data.play_id}</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Player: {modal.data.assigned_player?.nickname || modal.data.nickname || modal.data.username || 'Random Player'}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px] items-center">
                  <div className="space-y-2 text-xs text-slate-300">
                    <div>Game: <span className="text-white font-semibold">{modal.data.game_name || 'Unknown'}</span></div>
                    <div>Station: <span className="text-white font-semibold">{modal.data.station_name || 'Unknown'}</span></div>
                    <div>Invite Code: <span className="text-[#00F0FF] font-mono font-semibold">{modal.data.invite_station?.qr_code || sessionInviteCode}</span></div>
                  </div>
                  <div className="rounded-2xl bg-white p-3 flex justify-center">
                    <QRCode
                      value={modal.data.invite_station?.qr_code || sessionInviteCode || `STATION-${modal.data.station_id || selectedSessionStation?.id || ''}`}
                      size={132}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                </div>
                {String(modal.data.status || '').toLowerCase() === 'waiting' && (
                  <button
                    type="button"
                    onClick={() => handleStartSession(modal.data.play_id || modal.data.id)}
                    className="mt-4 w-full rounded-xl bg-emerald-500/15 px-4 py-3 text-xs font-bold text-emerald-300"
                  >
                    Start Session
                  </button>
                )}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSession();
            }} className="space-y-3">
              {!newSession.assign_random_player && (
                <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-xs text-slate-200">
                  Invite-only mode does not use credits. Choose a station, generate the QR, and share it with the player.
                </div>
              )}
              {newSession.assign_random_player && !canCreateRandomSession && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                  Add credits to create a random-player session. You can still switch off random assignment and generate an invite QR.
                </div>
              )}
              {!isQuickPlayLocked && (
                <>
                  <SearchableDropdown
                    label="Game detail"
                    value={newSession.detail_id}
                    onChange={(nextValue) => {
                      const detail = gameDetails.find((item) => String(item.id) === String(nextValue));
                      const nextPlayerCount = detail ? getDefaultPlayerCount(detail) : Math.max(Number(newSession.player_count || 2), 1);
                      const nextNicknames = Array.from({ length: nextPlayerCount }, (_, index) => `Player ${index + 1}`);

                      setNewSession((prev) => ({
                        ...prev,
                        detail_id: nextValue,
                        station_id: detail?.station_id ? String(detail.station_id) : prev.station_id,
                        player_count: prev.assign_random_player ? nextPlayerCount : prev.player_count,
                        player_nicknames: prev.assign_random_player ? nextNicknames : prev.player_nicknames
                      }));
                    }}
                    options={gameDetails.map((detail) => {
                      const game = games.find((g) => String(g.id) === String(detail.game_id));
                      return {
                        value: detail.id,
                        label: `${game?.game_name || 'Game'} - ${detail.game_rule || 'Standard Rule'}`,
                        meta: detail.station_name || `Detail #${detail.id}`
                      };
                    })}
                    placeholder="Select game detail"
                    searchPlaceholder="Search details..."
                  />

                  <SearchableDropdown
                    label="Station"
                    value={newSession.station_id}
                    onChange={(nextValue) => setNewSession((prev) => ({ ...prev, station_id: nextValue }))}
                    options={stations.map((station) => ({
                      value: station.id,
                      label: station.station_name,
                      meta: station.gameName || `Station #${station.id}`,
                    }))}
                    placeholder="Select station"
                    searchPlaceholder="Search stations..."
                  />
                </>
              )}

              {isQuickPlayLocked && (
                <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-xs text-slate-200">
                  <div className="font-bold text-white">Station ready for quick play</div>
                  <div className="mt-1 text-slate-300">
                    {stations.find((station) => String(station.id) === String(newSession.station_id))?.station_name || 'Selected station'}
                    {' • '}
                    {gameDetails.find((detail) => String(detail.id) === String(newSession.detail_id))?.game_rule || 'Selected detail'}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newSession.assign_random_player}
                  onChange={(e) => {
                    const nextChecked = e.target.checked;
                    setNewSession((prev) => {
                      const selectedDetail = prev.detail_id
                        ? gameDetails.find((item) => String(item.id) === String(prev.detail_id))
                        : null;
                      const nextPlayerCount = nextChecked
                        ? getDefaultPlayerCount(selectedDetail || { max_players: prev.player_count || 2 })
                        : Math.max(Number(prev.player_count || 1), 1);

                      return {
                        ...prev,
                        assign_random_player: nextChecked,
                        player_count: nextPlayerCount,
                        player_nicknames: Array.from({ length: nextPlayerCount }, (_, index) => {
                          const existing = prev.player_nicknames?.[index];
                          return existing && existing.trim() ? existing.trim() : `Player ${index + 1}`;
                        })
                      };
                    });
                  }}
                  className="h-4 w-4 accent-[#00F0FF]"
                />
                Assign random players for this match
              </label>

              <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500">Session mode</label>
                <select
                  value={newSession.mode || 'strict'}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, mode: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs outline-none text-white focus:border-[#00F0FF]/50"
                >
                  <option value="strict">Strict: all players start together</option>
                  <option value="flexible">Flexible: players can join while playing</option>
                </select>
              </div>

              <div className="space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Payment timing</p>
                  <p className="mt-1 text-[11px] text-slate-400">Choose whether players pay before the session starts or after it ends.</p>
                </div>
                <select
                  value={newSession.payment_timing || 'After Game'}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, payment_timing: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-xs text-white outline-none focus:border-amber-300/50"
                >
                  <option value="After Game">After Game</option>
                  <option value="Before Game">Before Game</option>
                </select>
                {newSession.payment_timing === 'Before Game' && (
                  <>
                    <label className="block text-[11px] font-medium text-slate-300">
                      Planned rounds
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={newSession.planned_rounds || 1}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, planned_rounds: Math.max(1, Number(e.target.value || 1)) }))}
                        className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-amber-300/50"
                      />
                    </label>
                    <label className="block text-[11px] font-medium text-slate-300">
                      Payment method
                      <select
                        value={newSession.payment_method || 'Cash'}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, payment_method: e.target.value }))}
                        className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-amber-300/50"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                      </select>
                    </label>
                    <div className="flex items-center justify-between rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2.5 text-xs">
                      <span className="text-amber-100">Upfront total</span>
                      <strong className="text-base text-amber-200">{plannedUpfrontTotal.toFixed(2)} Br</strong>
                    </div>
                    <p className="text-[10px] text-amber-100/70">Calculated from {plannedPlayerCount || 0} player{plannedPlayerCount === 1 ? '' : 's'} × {newSession.planned_rounds || 1} round{Number(newSession.planned_rounds || 1) === 1 ? '' : 's'} × {plannedRoundPrice.toFixed(2)} Br.</p>
                  </>
                )}
              </div>

              {newSession.assign_random_player && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-widest text-slate-500">
                      Players needed {selectedSessionDetail?.max_players ? `• default ${selectedSessionDetail.max_players}` : ''}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newSession.player_count || 1}
                      onChange={(e) => {
                        const nextCount = Math.max(1, Number(e.target.value || 1));
                        setNewSession((prev) => ({
                          ...prev,
                          player_count: nextCount,
                          player_nicknames: Array.from({ length: nextCount }, (_, index) => {
                            const existing = prev.player_nicknames?.[index];
                            return existing && existing.trim() ? existing.trim() : `Player ${index + 1}`;
                          })
                        }));
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-widest text-slate-500">Player nicknames</label>
                    <div className="space-y-2">
                      {Array.from({ length: Math.max(1, Number(newSession.player_count || 1)) }, (_, index) => {
                        const currentValue = newSession.player_nicknames?.[index] ?? `Player ${index + 1}`;
                        return (
                          <input
                            key={`nickname-${index}`}
                            type="text"
                            value={currentValue}
                            onChange={(e) => {
                              const nextList = [...(newSession.player_nicknames || [])];
                              nextList[index] = e.target.value;
                              setNewSession((prev) => ({ ...prev, player_nicknames: nextList }));
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
                            placeholder={`Player ${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!newSession.assign_random_player && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <SearchableDropdown
                    label="Recommended player"
                    value={newSession.player_id || ''}
                    onChange={(nextValue) => setNewSession((prev) => ({ ...prev, player_id: nextValue }))}
                    disabled={manualPlayerLoading}
                    options={[
                      { value: '', label: 'No specific player', meta: 'Optional' },
                      ...(manualPlayerCandidates.map((candidate) => ({
                        value: candidate.player_id,
                        label: candidate.nickname || candidate.username || `Player ${candidate.player_id}`,
                        meta: candidate.has_unfinished_session
                          ? `In unfinished session #${candidate.unfinished_session_id}`
                          : candidate.station_id ? `Station ${candidate.station_id}` : 'Available player'
                      })))
                    ]}
                    placeholder={manualPlayerLoading ? 'Loading recommendations...' : 'Search player or ID'}
                    searchPlaceholder="Type player name or ID..."
                  />
                  <p className="text-[11px] text-slate-400">
                    We suggest existing players from this station first. You can leave this empty if you only want the invite QR.
                  </p>
                </div>
              )}

              {!newSession.assign_random_player && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Station Invite</p>
                      <p className="text-xs text-slate-300">{sessionInviteCode || 'Select a detail or station to preview the QR'}</p>
                    </div>
                    <QrCode size={18} className="text-[#00F0FF]" />
                  </div>
                  <div className="bg-white rounded-2xl p-3 flex justify-center">
                    <QRCode
                      value={sessionInviteCode || `STATION-${selectedSessionStation?.id || selectedSessionDetail?.station_id || ''}`}
                      size={150}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (newSession.assign_random_player && !canCreateRandomSession)}
                className="w-full bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (newSession.assign_random_player ? 'Create Session' : 'Generate Invite QR')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
