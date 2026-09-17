import { CheckCircle2, UserRound } from 'lucide-react';

export default function SessionPlayerPicker({
  candidates = [],
  value = '',
  loading = false,
  onChange,
}) {
  const availableCandidates = candidates.filter((candidate) => !candidate.has_unfinished_session);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">Player assignment</p>
          <h4 className="mt-1 text-sm font-semibold text-white">Choose an available player</h4>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-200">
          <CheckCircle2 size={12} /> {availableCandidates.length} available
        </div>
      </div>
      <label className="mt-3 block text-[11px] font-medium text-slate-400">
        Player
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading || availableCandidates.length === 0}
          className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#050510] px-3 text-xs text-white outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{loading ? 'Loading available players...' : availableCandidates.length ? 'Select a player' : 'No available players'}</option>
          {availableCandidates.map((candidate) => (
            <option key={candidate.player_id} value={candidate.player_id}>
              {candidate.nickname || candidate.username || `Player ${candidate.player_id}`}
              {candidate.username && candidate.nickname ? ` · ${candidate.username}` : ''}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
        <UserRound size={12} /> Players already in an unfinished session are filtered out by player ID.
      </p>
    </div>
  );
}
