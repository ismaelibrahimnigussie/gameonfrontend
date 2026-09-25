import { Loader2, X } from 'lucide-react';

export function RoundResultDialog({ session, draft, busy, onChange, onClose, onSubmit }) {
  if (!session) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/15 bg-[#090914] p-5 sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Round {session.play_amount || 1} completed</p>
            <h3 className="mt-1 text-base font-bold text-white">Record results before the next round</h3>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close round results">
            <X size={18} />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Results are optional. You can skip them and start the next round.</p>
        <div className="mt-4 space-y-3">
          {draft.map((entry, index) => (
            <div key={entry.session_player_id || entry.player_id || index} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="mb-2 text-xs font-semibold text-white">{entry.nickname}</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={entry.result} onChange={(event) => onChange((current) => updateDraft(current, index, { result: event.target.value }))} className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white outline-none">
                  <option value="">No result</option>
                  <option value="Win">Win</option>
                  <option value="Lose">Lose</option>
                  <option value="Draw">Draw</option>
                </select>
                <input value={entry.score} onChange={(event) => onChange((current) => updateDraft(current, index, { score: event.target.value }))} type="number" step="0.01" placeholder="Score (optional)" className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none" />
                <input value={entry.prize_amount} onChange={(event) => onChange((current) => updateDraft(current, index, { prize_amount: event.target.value }))} type="number" step="0.01" placeholder="Prize (optional)" className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none" />
                <input value={entry.result_note} onChange={(event) => onChange((current) => updateDraft(current, index, { result_note: event.target.value }))} maxLength={255} placeholder="Note (optional)" className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => onSubmit(false)} disabled={busy} className="flex-1 rounded-xl bg-[#00F0FF] py-3 text-xs font-bold text-black disabled:opacity-50">
            {busy ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Save and start next round'}
          </button>
          <button type="button" onClick={() => onSubmit(true)} disabled={busy} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-slate-300 disabled:opacity-50">
            Skip results
          </button>
        </div>
      </div>
    </div>
  );
}

function updateDraft(current, index, patch) {
  return current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
}
