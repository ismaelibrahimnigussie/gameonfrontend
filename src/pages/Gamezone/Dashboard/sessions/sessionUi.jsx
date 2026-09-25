import { useState } from 'react';
import { AlertTriangle, Check, Loader2, MoreVertical } from 'lucide-react';

export function TimeBar({ percent, urgency = 'normal', className = '' }) {
  const colors = { critical: 'bg-rose-400', warn: 'bg-amber-400', normal: 'bg-[#00F0FF]', idle: 'bg-slate-400' };
  const width = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent * 100)) : 0;
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/5 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${colors[urgency] || colors.normal}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0f14] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <h3 id="confirm-dialog-title" className="text-sm font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50">
            Keep it
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600 disabled:opacity-60">
            {busy && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col items-stretch sm:items-end gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-xl animate-fadeIn ${
            toast.tone === 'error'
              ? 'border-rose-500/30 bg-[#160b0d] text-rose-300'
              : 'border-emerald-500/30 bg-[#0b1512] text-emerald-300'
          }`}
        >
          {toast.tone === 'error' ? <AlertTriangle size={14} className="shrink-0" /> : <Check size={14} className="shrink-0" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

const ACTION_TONES = {
  default: 'bg-white/5 hover:bg-white/10 border-white/10 text-white',
  primary: 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 border-transparent text-black',
  accent: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-300',
  accentSolid: 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 border-transparent text-black shadow-lg shadow-[#00F0FF]/20',
  warn: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400',
  warnSoft: 'bg-amber-300/10 hover:bg-amber-300/20 border-amber-300/25 text-amber-200',
  danger: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400',
};

export function ActionButton({ icon: Icon, label, onClick, disabled, pending, tone = 'default', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      title={label}
      aria-label={label}
      className={`flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${ACTION_TONES[tone]} ${className}`}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {label}
    </button>
  );
}

export function OverflowMenu({ items }) {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;
  return (
    <div className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="More actions"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-white/10 bg-[#0b0f14] p-1 shadow-2xl animate-fadeIn">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { setOpen(false); item.onClick(); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition disabled:opacity-40 ${
                  item.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.icon && <item.icon size={13} />}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
