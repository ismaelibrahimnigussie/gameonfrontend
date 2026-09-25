import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { NAV_ITEMS, PORTALS } from './home/content';
import HomeFooter from './home/HomeFooter';
import PortalCards from './home/PortalCards';
import PortalPreview from './home/PortalPreview';

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

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        <PortalCards activePortalId={activePortalId} onSelect={setActivePortalId} />
        <PortalPreview portal={selectedPortal} onLaunch={handleLaunch} />
      </main>

      <HomeFooter />
    </div>
  );
}