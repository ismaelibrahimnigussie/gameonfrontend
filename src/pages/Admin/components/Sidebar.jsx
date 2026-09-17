import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Coins, 
  Package, 
  RefreshCw, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';

export default function Sidebar({
  adminName,
  adminRole,
  adminInitials,
  activePage,
  zoneStats,
  refreshing,
  onSelectPage,
  onRefresh,
  onLogout,
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'zones', label: 'Game Zones', icon: MapPin, count: zoneStats?.verified },
    { id: 'credits', label: 'Credit Management', icon: Coins },
    { id: 'packages', label: 'Credit Packages', icon: Package, count: zoneStats?.packageCount },
  ];

  return (
    <aside className="flex flex-col justify-between rounded-[28px] border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="space-y-6">
        {/* Admin Profile */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00F0FF]/10 text-sm font-bold text-[#00F0FF]">
            {adminInitials || 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{adminName}</p>
            <p className="text-[11px] font-medium text-slate-400">{adminRole}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'bg-white/5 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="mt-6 space-y-2 pt-4 border-t border-white/5">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>

        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}