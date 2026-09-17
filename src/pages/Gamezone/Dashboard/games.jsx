// src/Dashboard/Games.jsx
import { useState, useMemo } from 'react';
import { 
  Gamepad2, Plus, Users, Tv, Search, 
  Edit3, Trash2, ArrowLeft, ChevronRight, X
} from 'lucide-react';

export default function Games({ 
  games = [], 
  stations = [], 
  onAddGame, 
  onEditGame, 
  onDeleteGame, 
  isLocked = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(null);

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const q = searchQuery.toLowerCase();
    return games.filter(g =>
      g.game_name?.toLowerCase().includes(q) ||
      g.game_type?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }, [games, searchQuery]);

  // Find currently selected game object
  const activeGame = useMemo(() => {
    if (selectedGameId === null) return null;
    return games.find(g => String(g.id) === String(selectedGameId));
  }, [games, selectedGameId]);

  // Helper getters for active game relations
  const activeLinkedStations = useMemo(() => {
    if (!activeGame) return [];
    return stations.filter(s => Number(s.gameId || s.game_id) === Number(activeGame.id));
  }, [stations, activeGame]);

  // ==========================================
  // GAME PROFILE VIEW (ACTIVE WHEN GAME CLICKED)
  // ==========================================
  if (activeGame) {
    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            onClick={() => setSelectedGameId(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
          >
            <ArrowLeft size={14} /> Back to Library
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditGame(activeGame)}
              disabled={isLocked}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Edit3 size={13} className="text-[#00F0FF]" /> Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${activeGame.game_name}"?`)) {
                  onDeleteGame(activeGame.id);
                  setSelectedGameId(null);
                }
              }}
              disabled={isLocked}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* Compact Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#080B1E] via-[#050510] to-[#0A0D28] border border-white/10 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">
                  <Gamepad2 size={18} />
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">{activeGame.game_name}</h2>
                {activeGame.game_type && (
                  <span className="text-[10px] font-mono text-[#00F0FF] uppercase bg-[#00F0FF]/10 border border-[#00F0FF]/20 px-2 py-0.5 rounded">
                    {activeGame.game_type}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {activeGame.description || 'No description provided.'}
              </p>
            </div>

            {/* Inline Stats Badge Group */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-white/5 p-1.5 rounded-xl border border-white/5">
              <div className="px-3 py-1 text-center border-r border-white/10">
                <p className="text-[9px] text-slate-400 font-mono uppercase">Max Players</p>
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Users size={12} className="text-[#00F0FF]" /> {activeGame.max_players || '—'}
                </p>
              </div>
              <div className="px-3 py-1 text-center border-r border-white/10">
                <p className="text-[9px] text-slate-400 font-mono uppercase">Stations</p>
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Tv size={12} className="text-amber-400" /> {activeLinkedStations.length}
                </p>
              </div>
              <div className="px-3 py-1 text-center">
                <p className="text-[9px] text-slate-400 font-mono uppercase">Stations</p>
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Tv size={12} className="text-emerald-400" /> {activeLinkedStations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">Linked Stations</h4>
              <p className="mt-1 text-xs text-slate-400">Rules are managed from each station now.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
              {activeLinkedStations.length} station{activeLinkedStations.length === 1 ? '' : 's'}
            </span>
          </div>

          {activeLinkedStations.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-[#050510]/50 p-8 text-center">
              <Tv size={24} className="mx-auto mb-2 text-slate-600" />
              <p className="text-xs text-slate-400">No stations currently assigned to this game title.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {activeLinkedStations.map((st) => (
                <div
                  key={st.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs font-bold text-white">{st.station_name}</p>
                  <p className="mt-1 text-[10px] uppercase font-mono text-slate-400">{st.status || 'Active'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // DEFAULT GAMES LIST GRID VIEW (COMPACT)
  // ==========================================
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">Games Library</h3>
          <p className="text-xs text-slate-400">Manage titles and see which stations are linked to them</p>
        </div>
        
        <button
          onClick={onAddGame}
          disabled={isLocked}
          className="px-3.5 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 rounded-xl text-black text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00F0FF]/20 disabled:opacity-50"
        >
          <Plus size={15} /> Add Game
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search games by name or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00F0FF]/50 outline-none transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Grid of Compact Cards */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-[#050510]/60 rounded-xl border border-dashed border-white/10 p-6">
          <Gamepad2 size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-medium mb-3">No games match your search parameters.</p>
          <button 
            onClick={onAddGame} 
            disabled={isLocked}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[#00F0FF] text-xs font-semibold hover:bg-white/10 transition-all"
          >
            + Create New Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGames.map(game => {
            const linkedStations = stations.filter(s => Number(s.gameId || s.game_id) === Number(game.id));

            return (
              <div
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className="group relative cursor-pointer bg-[#050510]/80 hover:bg-[#070B1E] rounded-xl border border-white/10 hover:border-[#00F0FF]/50 p-4 transition-all flex flex-col justify-between shadow-lg hover:shadow-[#00F0FF]/5"
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-xs text-white group-hover:text-[#00F0FF] transition-colors truncate">
                      {game.game_name}
                    </h4>
                    {game.game_type && (
                      <span className="shrink-0 text-[9px] font-mono text-[#00F0FF] uppercase bg-[#00F0FF]/10 border border-[#00F0FF]/20 px-1.5 py-0.5 rounded">
                        {game.game_type}
                      </span>
                    )}
                  </div>

                  {game.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {game.description}
                    </p>
                  )}
                </div>

                {/* Footer Metrics + Quick Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-2">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1" title="Max Players">
                      <Users size={11} className="text-[#00F0FF]" /> {game.max_players || '—'}
                    </span>
                    <span className="flex items-center gap-1" title="Linked Stations">
                      <Tv size={11} className="text-amber-400" /> {linkedStations.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Hover Quick Edit / Delete Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGame(game);
                        }}
                        disabled={isLocked}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50"
                        title="Quick Edit"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${game.game_name}"?`)) onDeleteGame(game.id);
                        }}
                        disabled={isLocked}
                        className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all disabled:opacity-50"
                        title="Quick Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    <ChevronRight size={14} className="text-slate-500 group-hover:text-[#00F0FF] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
