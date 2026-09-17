import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  User,
  Menu,
  X,
  ArrowRight,
  Zap,
  Layers,
  Shield,
  Activity,
  ChevronRight,
  CheckCircle2,
  Radio
} from 'lucide-react';

// ==========================================
// CONFIGURATIONS (User & GameZone Only)
// ==========================================
const NAV_ITEMS = [
  { label: 'Arenas', href: '#arenas' },
  { label: 'Network', href: '#network' },
];

const PORTALS = [
  {
    id: 'game-zone',
    title: 'Game Zone Console',
    badge: 'Venue Host',
    tagline: 'Connect your physical arena',
    description: 'Register terminals, automate credit flows, and host local bracket tournaments with real-time sync.',
    icon: Gamepad2,
    gradient: 'from-[#00F0FF] via-[#00A3FF] to-[#0072FF]',
    accentColor: '#00F0FF',
    cta: 'Launch Arena Hub',
    path: '/GameZoneAuth'
  },
  {
    id: 'player',
    title: 'Player Portal',
    badge: 'Gamer ID',
    tagline: 'Your universal arcade pass',
    description: 'Scan station QR codes, claim your lane, and manage your match history, credits, and active sessions.',
    icon: User,
    gradient: 'from-[#7B2CBF] via-[#B5179E] to-[#D300C5]',
    accentColor: '#D300C5',
    cta: 'Open Player Hub',
    path: '/auth/user'
  }
];

const METRICS = [
  { icon: Zap, value: '0.2s', label: 'Sync Speed' },
  { icon: Layers, value: '100%', label: 'Uptime' },
  { icon: Shield, value: 'E2EE', label: 'Security' }
];

// Minimalist Arcade G-Logo
function BrandLogoIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#7B2CBF" />
        </linearGradient>
      </defs>
      <path
        d="M80 32H45C32 32 22 42 22 55C22 68 32 78 45 78H75C80 78 82 74 82 68V54H58"
        stroke="url(#gLogoGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="54,48 54,60 64,54" fill="#00F0FF" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePortalId, setActivePortalId] = useState('game-zone');

  const selectedPortal = PORTALS.find((p) => p.id === activePortalId) || PORTALS[0];

  const handleLaunch = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#020208] text-[#f1f5f9] font-sans antialiased selection:bg-[#00F0FF] selection:text-[#020208] flex flex-col justify-between relative overflow-hidden">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-[-5%] left-[-5%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#00F0FF]/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse duration-[6s]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] bg-[#7B2CBF]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#020208]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
          <BrandLogoIcon />
          <span className="font-extrabold tracking-wider text-base sm:text-lg text-white font-mono uppercase">
            GAME<span className="text-[#00F0FF]">ON</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => handleLaunch(selectedPortal.path)}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Launch Active</span>
            <ChevronRight size={14} className="text-[#00F0FF]" />
          </button>
        </nav>

        {/* Mobile / Webview Navigation Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-lg border border-white/10 active:scale-95"
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile / Webview Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[#060612]/95 backdrop-blur-2xl border-b border-white/10 p-5 flex flex-col gap-3 shadow-2xl md:hidden z-50">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-[#00F0FF] py-2 px-3 rounded-md bg-white/[0.02]"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLaunch(selectedPortal.path);
              }}
              className="w-full py-3 mt-1 bg-gradient-to-r from-[#00F0FF] to-[#0072FF] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{selectedPortal.cta}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </header>

      {/* APP INTERACTIVE DASHBOARD CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* LEFT COLUMN: INTERACTIVE CONSOLE SELECTOR */}
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
                  onClick={() => setActivePortalId(portal.id)}
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

          {/* REALTIME SYSTEM TELEMETRY STRIP */}
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

        {/* RIGHT COLUMN: DYNAMIC ACTIVE PORTAL DISPLAY CARD */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <div className="bg-[#060715]/90 border border-white/10 rounded-2xl p-6 sm:p-8 flex-grow flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden min-h-[360px]">
            {/* Ambient inner glow according to portal accent color */}
            <div
              className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[90px] opacity-25 pointer-events-none transition-all duration-500"
              style={{ backgroundColor: selectedPortal.accentColor }}
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
                  {selectedPortal.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-3 font-normal max-w-xl">
                  {selectedPortal.description}
                </p>
              </div>

              {/* INTERACTIVE FEATURES CHECKLIST */}
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

            {/* ACTION LAUNCH BUTTON */}
            <div className="pt-8 relative z-10">
              <button
                onClick={() => handleLaunch(selectedPortal.path)}
                className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r ${selectedPortal.gradient} text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all cursor-pointer hover:brightness-110`}
              >
                <span>{selectedPortal.cta}</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* COMPACT APP FOOTER / NETWORK BAR */}
      <footer id="network" className="border-t border-white/[0.06] bg-[#020208]/90 backdrop-blur-lg px-4 sm:px-8 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <span>GAMEON Distributed Network</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">94ms Operational Latency</span>
          </div>
          <p>&copy; {new Date().getFullYear()} GAMEON Core Systems.</p>
        </div>
      </footer>
    </div>
  );
}