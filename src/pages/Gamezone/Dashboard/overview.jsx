import React from 'react';
import { MapPin, Phone, Coins, Tv, Gamepad2, RefreshCw } from 'lucide-react';

export default function Overview({ 
  zoneInfo, 
  targetProfile, 
  games = [], 
  stations = [], 
  creditBalance = 0,
  activeStations = 0,
  occupiedStations = 0,
  availabilityRate = 0,
  onAddGame,
  onAddStation,
  isVerified = false,
  canManage = false,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <div className="space-y-4 pt-16 lg:pt-0 pb-20 lg:pb-0 animate-fadeIn">
      
      {/* Wallet Card - Banner Focus */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-black/40 to-black/60 rounded-2xl p-5 border border-amber-500/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium text-amber-200/80 tracking-wider uppercase">
                Available Credit
              </p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  title="Refresh Balance"
                  className="p-1 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-all active:scale-90 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              )}
            </div>
            
            <p className="text-3xl font-extrabold text-amber-400 mt-1 flex items-baseline gap-1.5 font-mono">
              {Number(creditBalance).toLocaleString()} 
              <span className="text-sm font-bold text-amber-500 font-sans">Br</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Coins size={26} className="text-amber-400" />
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddGame}
          disabled={!canManage}
          className="flex items-center justify-center gap-2 py-3.5 px-4 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-[#00F0FF] text-xs font-bold active:scale-[0.98] transition-all hover:bg-[#00F0FF]/20 shadow-lg shadow-[#00F0FF]/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Gamepad2 size={16} />
          + New Game
        </button>
        <button
          onClick={onAddStation}
          disabled={!canManage || !games.length}
          className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold active:scale-[0.98] transition-all hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Tv size={16} />
          + Deploy Station
        </button>
      </div>

      {/* Interactive Stats Grid */}
      <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Zone Snapshot</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-xl font-extrabold text-[#00F0FF]">{games.length}</p>
            <p className="text-[10px] text-slate-400 font-medium">Total Games</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-xl font-extrabold text-emerald-400">{activeStations}</p>
            <p className="text-[10px] text-slate-400 font-medium">Active Stations</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-xl font-extrabold text-amber-400">{occupiedStations}</p>
            <p className="text-[10px] text-slate-400 font-medium">Occupied</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-xl font-extrabold text-[#7B2CBF]">{availabilityRate}%</p>
            <p className="text-[10px] text-slate-400 font-medium">Availability</p>
          </div>
        </div>
      </div>

      {/* Location & Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/5 text-[#00F0FF]">
            <MapPin size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
            <p className="text-xs text-white truncate font-medium mt-0.5">
              {zoneInfo?.address || targetProfile?.address || 'Not set'}
            </p>
          </div>
        </div>
        <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/5 text-emerald-400">
            <Phone size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Contact</p>
            <p className="text-xs text-white truncate font-medium mt-0.5">
              {zoneInfo?.owner_phone || targetProfile?.owner_phone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}