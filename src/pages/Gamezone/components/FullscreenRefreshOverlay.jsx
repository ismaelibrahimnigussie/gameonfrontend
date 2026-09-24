import { Gamepad2 } from 'lucide-react';

export default function FullscreenRefreshOverlay({ label = 'Syncing lounge data', sublabel = 'Refreshing the full dashboard...' }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020208]/75 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#070711]/90 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,240,255,0.14),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(123,44,191,0.16),_transparent_38%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="h-20 w-20 rounded-full border border-[#00F0FF]/20 bg-black/30" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#00F0FF] border-r-[#7B2CBF]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 size={22} className="text-[#00F0FF]" />
            </div>
          </div>

          <h3 className="text-lg font-black tracking-wide text-white">{label}</h3>
          <p className="mt-1 text-xs text-slate-400">{sublabel}</p>

          <div className="mt-6 w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#00F0FF]" />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Please wait
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
