import SearchableDropdown from '../../components/SearchableDropdown';

export function SessionSetupFields({
  newSession,
  setNewSession,
  gameDetails,
  getDefaultPlayerCount,
  selectedSessionDetail,
  plannedUpfrontTotal,
  plannedPlayerCount,
  plannedRoundPrice,
  manualPlayerCandidates,
  manualPlayerLoading,
}) {
  return (
    <>
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
    </>
  );
}
