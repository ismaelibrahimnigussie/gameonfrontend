import { CheckCircle2, Radio } from 'lucide-react';
import { METRICS, PORTALS } from './content';

export default function PortalCards({ activePortalId, onSelect }) {
  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <Radio size={12} className="text-[#00F0FF] animate-pulse" /> Select Platform Mode
        </span>
        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
          v2.4
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          const isActive = activePortalId === portal.id;

          return (
            <div
              key={portal.id}
              onClick={() => onSelect(portal.id)}
              className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer border backdrop-blur-md select-none ${
                isActive
                  ? 'bg-[#0B0C1E] border-[#00F0FF]/40 shadow-[0_0_25px_rgba(0,240,255,0.12)]'
                  : 'bg-[#050510]/60 border-white/[0.06] hover:bg-[#0A0A1A]/80 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-white uppercase font-mono tracking-wide">
                        {portal.title}
                      </h2>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                        {portal.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-normal mt-0.5">{portal.tagline}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-[#00F0FF] bg-[#00F0FF] text-black'
                      : 'border-slate-700 text-transparent group-hover:border-slate-500'
                  }`}
                >
                  <CheckCircle2 size={14} strokeWidth={3} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <div id="ecosystem" className="grid grid-cols-3 gap-2">
          {METRICS.map((metric, i) => {
            const MetricIcon = metric.icon;
            return (
              <div
                key={i}
                className="bg-[#050510]/80 border border-white/[0.06] p-3 rounded-xl flex flex-col items-center justify-center text-center backdrop-blur-md"
              >
                <MetricIcon size={14} className="text-[#00F0FF] mb-1" />
                <span className="text-xs sm:text-sm font-extrabold text-white font-mono">{metric.value}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {metric.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
