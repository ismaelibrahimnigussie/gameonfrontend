import { Activity, ArrowRight } from 'lucide-react';

export default function PortalPreview({ portal, onLaunch }) {
  return (
    <div className="lg:col-span-7 h-full flex flex-col">
      <div className="bg-[#060715]/90 border border-white/10 rounded-2xl p-6 sm:p-8 flex-grow flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden min-h-[360px]">
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[90px] opacity-25 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: portal.accentColor }}
        />

        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#00F0FF]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Console Telemetry Preview
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> System Ready
            </span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-mono tracking-tight">
              {portal.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mt-3 font-normal max-w-xl">
              {portal.description}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
              <span>Real-time local socket synchronization</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
              <span>Automated token credit top-up and usage tracking</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
              <span>Optimized for low-latency webview and mobile execution</span>
            </div>
          </div>
        </div>

        <div className="pt-8 relative z-10">
          <button
            onClick={() => onLaunch(portal.path)}
            className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r ${portal.gradient} text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all cursor-pointer hover:brightness-110`}
          >
            <span>{portal.cta}</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
