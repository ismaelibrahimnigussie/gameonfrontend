// Sidebar.jsx
import { 
  LayoutDashboard, 
  Gamepad2, 
  Settings, 
  Layers, 
  User, 
  Clock,
  LogOut 
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  zoneInfo, 
  targetProfile, 
  isVerified 
}) {
  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'games', label: 'Games', icon: Layers },
    { id: 'stations', label: 'Stations', icon: Gamepad2 },
    { id: 'sessions', label: 'Sessions', icon: Clock },


    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible on lg: and up)                 */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex lg:w-64 flex-col h-screen sticky top-0 bg-[#050510]/80 backdrop-blur-xl border-r border-white/10 z-30 flex-shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <img
            src="/logo.png"
            alt="GameOn logo"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-[#00F0FF]/20 bg-black/20"
          />
          <div>
            <h1 className="font-extrabold text-sm tracking-wider font-mono text-white">
              GAME<span className="text-[#00F0FF]">ON</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Lounge Manager</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 font-mono">Status</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              isVerified 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {isVerified ? '✓ Verified' : 'Pending'}
            </span>
          </div>
          <h3 className="font-bold text-xs truncate text-white">
            {zoneInfo?.zone_name || targetProfile?.zone_name || 'My Game Zone'}
          </h3>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {zoneInfo?.owner_name || targetProfile?.owner_name || 'Lounge Admin'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#7B2CBF]/10 border border-[#00F0FF]/40 text-white shadow-lg shadow-[#00F0FF]/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#00F0FF]' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Disconnect Button at Bottom */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 active:scale-95 transition-all"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE FIXED BOTTOM NAVIGATION BAR (Visible under lg:)  */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050510]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {navigation.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive ? 'text-[#00F0FF]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#00F0FF]/10' : ''}`}>
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              </div>
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
