import { Bell, LogOut, Menu, RefreshCw, X, Zap } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { Avatar, Button } from './ui';

export const MobileBottomNav = ({ activePage, onNavigate, adminRole }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] sm:hidden">
    <div className="flex items-center justify-around px-2 py-2">
      {NAV_ITEMS.filter((item) => !item.superAdminOnly || adminRole === 'Super Admin').map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[64px] ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-slate-100' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.mobileLabel}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export const DesktopSidebar = ({ activePage, onNavigate, adminName, adminRole, onLogout }) => (
  <aside className="hidden sm:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 z-40">
    <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shadow-sm">
        <Zap size={18} className="text-white" />
      </div>
      <div>
        <span className="font-bold text-slate-900 text-base">GameZone</span>
        <span className="block text-[10px] text-slate-500 font-medium">Admin Portal</span>
      </div>
    </div>

    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
      {NAV_ITEMS.filter((item) => !item.superAdminOnly || adminRole === 'Super Admin').map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <Icon size={20} strokeWidth={isActive ? 2 : 1.8} />
            {item.label}
            {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
          </button>
        );
      })}
    </nav>

    <div className="p-3 border-t border-slate-100">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
        <Avatar name={adminName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{adminName}</p>
          <p className="text-xs text-slate-500 truncate">{adminRole}</p>
        </div>
        <button onClick={onLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </aside>
);

export const MobileHeader = ({ title, onMenuClick, onRefresh, refreshing }) => (
  <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 sm:hidden">
    <div className="flex items-center justify-between px-4 h-14">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"><Menu size={22} /></button>
        <h1 className="font-semibold text-slate-900 truncate">{title}</h1>
      </div>
      <button onClick={onRefresh} disabled={refreshing} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50">
        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  </header>
);

export const DesktopHeader = ({ title, subtitle, onRefresh, refreshing }) => (
  <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 hidden sm:block">
    <div className="flex items-center justify-between px-6 h-16">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" icon={RefreshCw} loading={refreshing} onClick={onRefresh}>Refresh</Button>
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </div>
  </header>
);

export const MobileDrawer = ({ isOpen, onClose, activePage, onNavigate, adminName, adminRole, onLogout }) => (
  <>
    <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 transition-transform duration-300 sm:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center"><Zap size={18} className="text-white" /></div>
            <span className="font-bold text-slate-900">GameZone</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.filter((item) => !item.superAdminOnly || adminRole === 'Super Admin').map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Icon size={22} strokeWidth={isActive ? 2 : 1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2">
            <Avatar name={adminName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{adminName}</p>
              <p className="text-xs text-slate-500">{adminRole}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />Sign Out
          </button>
        </div>
      </div>
    </div>
  </>
);
