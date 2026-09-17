import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  const text = typeof message === 'string' ? message : message.text;
  const kind = typeof message === 'object' ? message.kind : 'success';
  const isSuccess = kind === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-medium shadow-2xl backdrop-blur-xl ${
          isSuccess
            ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
            : 'border-rose-500/30 bg-rose-950/80 text-rose-200'
        }`}
      >
        {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <span>{text}</span>
      </div>
    </div>
  );
}