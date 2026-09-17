import React from 'react';

export default function StatCard({ label, value, icon: Icon, accent = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-md">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-[11px] font-medium tracking-wide">{label}</span>
        {Icon && <Icon size={14} className={accent} />}
      </div>
      <div className={`mt-2 text-xl font-black ${accent}`}>
        {value ?? 0}
      </div>
    </div>
  );
}