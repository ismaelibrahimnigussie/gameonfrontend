import { AlertCircle, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

function BrandLogoIcon() {
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gLogoGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#7B2CBF" />
        </linearGradient>
      </defs>
      <path d="M80 32H45C32 32 22 42 22 55C22 68 32 78 45 78H75C80 78 82 74 82 68V54H58" stroke="url(#gLogoGradAuth)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="54,48 54,60 64,54" fill="#00F0FF" />
    </svg>
  );
}

export default function GameZoneAuthLayout({
  onNavigateBack,
  authMode,
  apiError,
  apiSuccess,
  onToggleMode,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#020208] text-[#f1f5f9] font-sans antialiased flex flex-col justify-start items-center p-4 sm:p-6 md:p-12 relative overflow-x-hidden selection:bg-[#00F0FF]/20 selection:text-white">
      <div className="absolute top-[-5%] left-[-10%] w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] bg-[#00F0FF]/5 rounded-full blur-[80px] sm:blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-10%] w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-[#7B2CBF]/5 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none z-0" />

      <div className="w-full max-w-4xl flex items-center justify-between mb-6 sm:mb-8 z-10">
        <button
          type="button"
          onClick={onNavigateBack}
          className="text-[11px] font-extrabold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-2 bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md active:scale-[0.97]"
        >
          <ArrowLeft size={12} strokeWidth={2.5} /> RETURN
        </button>

        <div className="flex lg:hidden items-center gap-2">
          <BrandLogoIcon />
          <span className="font-black tracking-widest text-xs uppercase text-white font-mono">
            GAME<span className="text-[#00F0FF]">ON</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-[#090914]/60 border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative z-10 m-auto">
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-black/20 via-transparent to-black/30 p-10 flex-col justify-between relative border-r border-white/[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,240,255,0.02),_transparent_60%)] pointer-events-none" />

          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateBack}>
            <BrandLogoIcon />
            <span className="font-extrabold tracking-widest text-base text-white font-mono uppercase">
              GAME<span className="text-[#00F0FF]">ON</span>
            </span>
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[10px] font-bold tracking-widest text-[#00F0FF] uppercase w-fit">
              <Sparkles size={11} className="animate-pulse" /> SYSTEM ACCESS MODULE
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase font-mono leading-snug">
              Power Up Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#7B2CBF]">Lounge Matrix.</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Automate local arcade token emissions, handle consolidated user transactions,
              track terminal response logs, and monitor gaming metrics in real-time.
            </p>
          </div>

          <footer className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">
            Core Secure Interface v4.0.0
          </footer>
        </div>

        <div className="lg:col-span-7 p-5 sm:p-8 md:p-12 flex flex-col justify-center bg-transparent">
          <div className="mb-6 sm:mb-8 text-center lg:text-left">
            <h1 className="text-lg sm:text-2xl font-black text-white uppercase font-mono tracking-wide">
              {authMode === 'signin' ? 'Connect Arena Node' : 'Register Arena Node'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto lg:mx-0">
              {authMode === 'signin'
                ? 'Connect using your terminal owner phone string profile.'
                : 'Transmit your layout parameters directly into our global physical directory cluster.'}
            </p>
          </div>

          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl text-xs font-semibold animate-fadeIn">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span className="leading-tight">{apiError}</span>
            </div>
          )}
          {apiSuccess && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn">
              <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span className="leading-tight">{apiSuccess}</span>
            </div>
          )}

          {children}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 leading-normal">
              {authMode === 'signin' ? "Don't have a configured hub terminal?" : "Already registered your venue node?"}{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-[#00F0FF] font-extrabold hover:underline bg-transparent border-none cursor-pointer p-0 ml-1.5 focus:outline-none inline-block"
              >
                {authMode === 'signin' ? 'Register Hub Arena' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
