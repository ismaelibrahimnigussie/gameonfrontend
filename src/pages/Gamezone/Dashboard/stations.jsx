import { useState, useMemo, useCallback } from 'react';
import { Activity, ChevronDown, ChevronUp, Plus, RefreshCw, Search, Tv } from 'lucide-react';
import { StationCard, StationPrintDialog } from './stations/StationCard';

export default function Stations({
  stations,
  games,
  gameDetails = [],
  sessions = [],
  isVerified,
  canAssignRandomSession = true,
  onStartRandomSession,
  onManageRule,
  onEditStation,
  onDeleteStation,
  onAddStation,
  onRefresh,
  isRefreshing,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [printStation, setPrintStation] = useState(null);


  const getStationSession = useCallback((station) => {
    const stationId = station.id ?? station.station_id;
    return sessions.find((session) => {
      const sessionStatus = String(session.status || '').toLowerCase();
      const sessionStationId = session.station_id ?? session.stationId;
      return ['waiting', 'playing', 'paused'].includes(sessionStatus)
        && sessionStationId !== null
        && sessionStationId !== undefined
        && String(sessionStationId) === String(stationId);
    });
  }, [sessions]);

  const getStationDisplayStatus = useCallback((station) => {
    const activeSession = getStationSession(station);

    if (String(activeSession?.status || '').toLowerCase() === 'paused') return 'paused';
    if (activeSession || String(station.status || '').toLowerCase() === 'occupied') return 'occupied';
    return String(station.status || 'available').toLowerCase();
  }, [getStationSession]);

  const statusCounts = useMemo(() => ({
    total: stations.length,
    available: stations.filter((station) => getStationDisplayStatus(station) === 'available').length,
    occupied: stations.filter((station) => getStationDisplayStatus(station) === 'occupied').length,
    paused: stations.filter((station) => getStationDisplayStatus(station) === 'paused').length,
  }), [stations, getStationDisplayStatus]);

  const filteredStations = useMemo(() => {
    let result = stations;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((station) =>
        station.station_name?.toLowerCase().includes(q) ||
        station.gameName?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter((station) => getStationDisplayStatus(station) === filterStatus.toLowerCase());
    }

    return [...result].sort((a, b) => {
      const cmp = a.station_name?.localeCompare(b.station_name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [stations, searchQuery, filterStatus, sortOrder, getStationDisplayStatus]);

  return (
    <div className="space-y-4 animate-fadeIn pt-16 lg:pt-0 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#00F0FF]/70">
            <Activity size={13} /> Live floor
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-white">Stations</h3>
          <p className="mt-1 text-xs text-slate-400">
            Simple station management for quick scanning and quick actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh stations"
            className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-slate-300 transition-all active:scale-95 hover:text-[#00F0FF] disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onAddStation}
            disabled={!isVerified || !games.length}
            className="flex items-center gap-1.5 rounded-xl bg-[#00F0FF] px-3.5 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#00F0FF]/20 transition-all active:scale-95 disabled:opacity-40"
          >
            <Plus size={16} /> New Station
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-black text-white">{statusCounts.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">Available</p>
          <p className="mt-1 text-2xl font-black text-emerald-300">{statusCounts.available}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300/80">Occupied</p>
          <p className="mt-1 text-2xl font-black text-rose-300">{statusCounts.occupied}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80">Paused</p>
          <p className="mt-1 text-2xl font-black text-amber-200">{statusCounts.paused}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-[#00F0FF]/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none transition sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="paused">Paused</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-slate-400 transition-all active:scale-95 hover:text-[#00F0FF]"
            >
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {filteredStations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#050510]/60 py-16 text-center">
          <Tv size={36} className="mx-auto mb-2 text-slate-600" />
          <p className="text-xs text-slate-400">No stations match filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              activeSession={getStationSession(station)}
              status={getStationDisplayStatus(station)}
              gameDetails={gameDetails}
              isVerified={isVerified}
              canAssignRandomSession={canAssignRandomSession}
              onStartRandomSession={onStartRandomSession}
              onManageRule={onManageRule}
              onEditStation={onEditStation}
              onDeleteStation={onDeleteStation}
            />
          ))}
        </div>
      )}

      <StationPrintDialog station={printStation} onClose={() => setPrintStation(null)} />
    </div>
  );
}
