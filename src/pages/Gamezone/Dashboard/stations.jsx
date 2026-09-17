import { useState, useMemo, useCallback } from 'react';
import { Tv, Plus, Search, ChevronUp, ChevronDown, X, RefreshCw, Printer, Zap, Pencil, Trash2, Activity, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';

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

  const statusStyles = {
    available: {
      label: 'Available',
      dot: 'bg-emerald-400',
      rail: 'from-emerald-400 to-emerald-400/10',
      badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    },
    occupied: {
      label: 'Occupied',
      dot: 'bg-rose-400',
      rail: 'from-rose-400 to-rose-400/10',
      badge: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
    },
    paused: {
      label: 'Paused',
      dot: 'bg-amber-300',
      rail: 'from-amber-300 to-amber-300/10',
      badge: 'bg-amber-300/10 text-amber-200 border-amber-300/20',
    },
  };

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
          {filteredStations.map((station) => {
            const activeSession = getStationSession(station);
            const status = getStationDisplayStatus(station);
            const isActive = ['active', 'available'].includes(status);
            const isOccupied = status === 'occupied';
            const isPaused = status === 'paused';
            const isUnavailable = isOccupied || isPaused;
            const visualStatus = isActive ? 'available' : status;
            const visualStyle = statusStyles[visualStatus] || statusStyles.available;
            const linkedDetail = gameDetails.find((detail) => String(detail.station_id) === String(station.id))
              || gameDetails.find((detail) => String(detail.game_id) === String(station.gameId ?? station.game_id));
            const displayRule = linkedDetail?.game_rule || station.game_rule || 'No rule configured';
            const round = Math.max(Number(activeSession?.play_amount || 1), 1);

            return (
              <div
                key={station.id}
                onClick={() => onEditStation?.(station)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-[#00F0FF]/30 hover:shadow-lg hover:shadow-[#00F0FF]/5"
              >
                <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${visualStyle.rail}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h4 className="truncate text-sm font-bold text-white transition-colors group-hover:text-[#00F0FF]">
                        {station.station_name}
                      </h4>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-bold ${visualStyle.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${visualStyle.dot}`} />
                        {visualStyle.label}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-400">{station.gameName || 'No linked game'}</p>
                    <p className="mt-2 truncate text-[10px] text-slate-500">Rule: {displayRule}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-semibold text-slate-300">
                        {activeSession ? `Session #${activeSession.play_id || activeSession.id}` : 'No active session'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-semibold text-slate-300">
                        {activeSession ? `Round ${round}` : 'Ready'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isUnavailable) return;
                        onStartRandomSession?.(station);
                      }}
                      disabled={isUnavailable || !canAssignRandomSession}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-300 transition-all active:scale-95 disabled:opacity-40"
                      title={isUnavailable ? `Station ${isPaused ? 'paused' : 'occupied'} by an active session` : 'Start a session'}
                      >
                      <Zap size={14} /> {isPaused ? 'Paused' : isOccupied ? 'Occupied' : 'Quick Play'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onManageRule?.(station);
                        }}
                        disabled={!isVerified}
                        className="rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-2 text-[#00F0FF] transition-all active:scale-90 disabled:opacity-40"
                        title="Manage rule"
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStation?.(station);
                        }}
                        disabled={!isVerified}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-all active:scale-90 disabled:opacity-40"
                        title="Edit station"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStation?.(station.id);
                        }}
                        disabled={!isVerified}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 transition-all active:scale-90 disabled:opacity-40"
                        title="Delete station"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {printStation && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fadeIn sm:items-center">
          <div
            className="w-full rounded-t-3xl border-t border-white/15 bg-[#090914] p-6 shadow-2xl animate-slideUp sm:max-w-sm sm:rounded-2xl sm:border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#00F0FF]">Station QR</span>
                <h4 className="text-lg font-bold text-white">{printStation.station_name}</h4>
              </div>
              <button
                onClick={() => setPrintStation(null)}
                className="rounded-full bg-white/5 p-2 text-slate-400 transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-2 flex justify-center rounded-2xl bg-white p-5 shadow-inner">
              <QRCode
                value={printStation.qr_code || `STATION-${printStation.id}`}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
              />
            </div>

            <p className="mt-3 text-center font-mono text-[11px] text-slate-400">
              Scan to join station
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00F0FF] py-3 text-xs font-bold text-black transition-all active:scale-95"
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={() => setPrintStation(null)}
                className="rounded-xl bg-white/10 py-3 text-xs font-bold text-white transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
