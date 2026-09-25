import { Scanner } from '@yudiel/react-qr-scanner';

export default function ScannerPanel({
  cameraOpen,
  setCameraOpen,
  handleScan,
  setScanError,
  qrValue,
  setQrValue,
  resolveStation,
  scanError,
  station,
  readyPlayer,
  assignmentRequest,
  authUser,
}) {
  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Station Access</h2>
        <button onClick={() => setCameraOpen((v) => !v)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-300">
          {cameraOpen ? 'Use manual QR' : 'Open camera'}
        </button>
      </div>

      {cameraOpen ? (
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/5 bg-[#090914]">
          <Scanner
            onScan={handleScan}
            onError={(error) => setScanError(error?.message || 'Scanner unavailable')}
            constraints={{ facingMode: 'environment' }}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-white/5 bg-[#090914] p-4">
          <label className="text-[10px] uppercase tracking-widest text-slate-500">Paste station QR</label>
          <div className="mt-2 flex gap-2">
            <input
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white outline-none"
              placeholder="STATION-1"
            />
            <button onClick={() => resolveStation(qrValue)} className="rounded-2xl bg-[#00F0FF] px-4 py-3 text-xs font-black uppercase tracking-widest text-black">
              Scan
            </button>
          </div>
        </div>
      )}

      {scanError && <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">{scanError}</div>}

      {station && (
        <div className="mt-4 rounded-3xl border border-white/5 bg-[#090914] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Station</div>
              <div className="mt-1 text-lg font-bold">{station.station_name}</div>
              <div className="mt-1 text-xs text-slate-500">{station.game_name || 'Game not assigned'}</div>
            </div>
            <span className="rounded-full border border-emerald-500/20 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
              {station.status || 'active'}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">QR</div>
              <div className="mt-1 text-xs text-slate-300">{station.qr_code || `STATION-${station.station_id}`}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Zone</div>
              <div className="mt-1 text-xs text-slate-300">{station.zone_name || 'Unknown'}</div>
            </div>
          </div>
          {readyPlayer && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <div className="text-[10px] uppercase tracking-widest text-emerald-300">Ready to play</div>
              <div className="mt-1 text-sm font-bold text-white">{readyPlayer.nickname || authUser?.username || 'Registered Player'}</div>
              <div className="mt-1 text-[11px] text-emerald-200">Player #{readyPlayer.player_id} is assigned to this station.</div>
            </div>
          )}
          {assignmentRequest && !readyPlayer && (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
              <div className="text-[10px] uppercase tracking-widest text-amber-300">Assignment request sent</div>
              <div className="mt-1 text-sm font-bold text-white">Waiting for game zone approval</div>
              <div className="mt-1 text-[11px] text-amber-200">Registered player #{assignmentRequest.player_id} requested this station.</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
