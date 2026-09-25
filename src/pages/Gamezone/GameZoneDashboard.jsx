import {
  AlertTriangle,
  Clock,
  Coins,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import FullscreenRefreshOverlay from "./components/FullscreenRefreshOverlay";
import DashboardModals from "./Dashboard/modals/DashboardModals";
import LoungeTabs from "./Dashboard/LoungeTabs";
import { useLoungeDashboard } from "./Dashboard/hooks/useLoungeDashboard";

export default function GameZoneDashboard() {
  const d = useLoungeDashboard();
  const {
    isZoneAuthenticated,
    isZoneLoading,
    activeTab,
    setActiveTab,
    zoneInfo,
    creditBalance,
    isLoading,
    isRefreshing,
    loadError,
    toast,
    initialLoadDoneRef,
    targetProfile,
    isVerified,
    loadData,
    handleLogout,
  } = d;

  if (isZoneLoading || (isZoneAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-[#020208]">
        <FullscreenRefreshOverlay
          label="Loading lounge dashboard"
          sublabel="Pulling your latest stations, sessions, and balance..."
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#020208] flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full bg-[#050510] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Connection Error
          </h3>
          <p className="text-xs text-slate-400 mb-5">{loadError}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                initialLoadDoneRef.current = false;
                loadData();
              }}
              className="flex-1 py-2.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-[#00F0FF] text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> Retry
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold active:scale-95 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020208] text-white flex flex-col lg:flex-row antialiased">
      {isRefreshing && (
        <FullscreenRefreshOverlay
          label="Refreshing dashboard"
          sublabel="Syncing the latest lounge data across every section..."
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl animate-fadeIn ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : toast.type === "warning"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          <p className="text-xs font-medium text-center sm:text-left">
            {toast.message}
          </p>
        </div>
      )}

      {/* Navigation Sidebar / Bottom Bar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        zoneInfo={zoneInfo}
        targetProfile={targetProfile}
        isVerified={isVerified}
      />

      {/* Main Container Area */}
      <main className="flex-1 min-h-screen w-full overflow-x-hidden flex flex-col">
        {/* TOP BRAND HEADER (NO MENU BUTTONS) */}
        <header className="sticky top-0 z-30 bg-[#020208]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Lounge Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="GameOn logo"
              className="w-9 h-9 rounded-xl object-cover bg-black/20 shadow-lg shadow-[#00F0FF]/20 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white truncate tracking-wide">
                  {zoneInfo?.zone_name ||
                    targetProfile?.zone_name ||
                    "GameZone"}
                </h1>
                <span
                  className={`hidden sm:flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isVerified
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isVerified ? <ShieldCheck size={10} /> : <Clock size={10} />}
                  {isVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {zoneInfo?.owner_name ||
                  targetProfile?.owner_name ||
                  "Lounge Admin"}
              </p>
            </div>
          </div>

          {/* Quick Balance Pill */}
          <div className="flex items-center gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Coins size={14} className="text-amber-400" />
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase font-mono leading-none">
                  Wallet
                </p>
                <p className="text-xs font-bold text-amber-400 font-mono leading-tight">
                  {creditBalance} Br
                </p>
              </div>
            </div>
          </div>
        </header>

        {isRefreshing && (
          <div className="h-1 w-full overflow-hidden bg-white/5">
            <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#00F0FF]" />
          </div>
        )}

        <LoungeTabs d={d} />
      </main>

      <DashboardModals d={d} />
    </div>
  );
}
