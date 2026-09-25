import { FileText, Pencil, Printer, Trash2, X, Zap } from 'lucide-react';
import QRCode from 'react-qr-code';

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

export function StationCard({
  station,
  activeSession,
  status,
  gameDetails,
  isVerified,
  canAssignRandomSession,
  onStartRandomSession,
  onManageRule,
  onEditStation,
  onDeleteStation,
}) {
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
}

export function StationPrintDialog({ station, onClose }) {
  if (!station) return null;
  return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fadeIn sm:items-center">
            <div
              className="w-full rounded-t-3xl border-t border-white/15 bg-[#090914] p-6 shadow-2xl animate-slideUp sm:max-w-sm sm:rounded-2xl sm:border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#00F0FF]">Station QR</span>
                  <h4 className="text-lg font-bold text-white">{station.station_name}</h4>
                </div>
                <button
                  onClick={() => onClose()}
                  className="rounded-full bg-white/5 p-2 text-slate-400 transition-all active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-2 flex justify-center rounded-2xl bg-white p-5 shadow-inner">
                <QRCode
                  value={station.qr_code || `STATION-${station.id}`}
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
                  onClick={() => onClose()}
                  className="rounded-xl bg-white/10 py-3 text-xs font-bold text-white transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
  );
}
