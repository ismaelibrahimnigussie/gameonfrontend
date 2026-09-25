export default function HomeFooter() {
  return (
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
  );
}
