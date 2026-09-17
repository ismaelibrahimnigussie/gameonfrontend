import React from 'react';
import { MapPin, Coins, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default function OverviewPage({ zones = [], zoneStats, onSelectPage, onSelectZone }) {
  const recentZones = zones.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Quick Action Banner */}
      <div className="grid gap-4 md:grid-cols-2">
        <div 
          onClick={() => onSelectPage('zones')}
          className="group cursor-pointer rounded-[24px] border border-white/5 bg-white/[0.02] p-5 transition hover:border-[#00F0FF]/30 hover:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-[#00F0FF]/10 p-3 text-[#00F0FF]">
              <MapPin size={20} />
            </div>
            <ArrowRight size={18} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
          <h3 className="mt-4 text-base font-bold">Manage Game Zones</h3>
          <p className="mt-1 text-xs text-slate-400">Review, verify, or update details for connected gaming centers.</p>
        </div>

        <div 
          onClick={() => onSelectPage('credits')}
          className="group cursor-pointer rounded-[24px] border border-white/5 bg-white/[0.02] p-5 transition hover:border-[#7B2CBF]/30 hover:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-[#7B2CBF]/10 p-3 text-[#7B2CBF]">
              <Coins size={20} />
            </div>
            <ArrowRight size={18} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
          <h3 className="mt-4 text-base font-bold">Grant & Deduct Credits</h3>
          <p className="mt-1 text-xs text-slate-400">Directly manage balances and transaction logs for game zones.</p>
        </div>
      </div>

      {/* Recent Game Zones */}
      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Recently Active Zones</h3>
          <button 
            onClick={() => onSelectPage('zones')}
            className="text-xs font-semibold text-[#00F0FF] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {recentZones.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">No zones found</p>
          ) : (
            recentZones.map((zone) => (
              <div 
                key={zone.zone_id || zone.id}
                onClick={() => onSelectZone(zone)}
                className="flex cursor-pointer items-center justify-between py-3 transition hover:bg-white/[0.02] px-2 rounded-xl"
              >
                <div>
                  <p className="text-xs font-bold text-white">{zone.zone_name}</p>
                  <p className="text-[11px] text-slate-400">{zone.address || 'No address provided'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    zone.is_verified 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {zone.is_verified ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {zone.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}