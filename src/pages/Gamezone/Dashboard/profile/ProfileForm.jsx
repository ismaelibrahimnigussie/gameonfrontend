import { Eye, EyeOff, LockKeyhole, Save } from 'lucide-react';

export default function ProfileForm({
  form,
  error,
  success,
  isSaving,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Profile Details</h4>
          <p className="text-[10px] text-slate-500">Update your lounge information here</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Zone Name</span>
            <input
              type="text"
              value={form.zone_name}
              onChange={(e) => onChange('zone_name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="Zone name"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Owner Name</span>
            <input
              type="text"
              value={form.owner_name}
              onChange={(e) => onChange('owner_name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="Owner name"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Address</span>
            <input
              type="text"
              value={form.address}
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="Business address"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Owner Phone</span>
            <input
              type="text"
              value={form.owner_phone}
              onChange={(e) => onChange('owner_phone', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="Phone number"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
        <div className="mb-2 flex items-center gap-2">
          <LockKeyhole size={14} className="text-[#00F0FF]" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Change Password</h4>
        </div>
        <p className="mb-4 text-[11px] text-slate-500">
          Fill these fields only if you want to change your password.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={form.current_password}
              onChange={(e) => onChange('current_password', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 pr-10 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="Current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-white"
            >
              {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={form.new_password}
              onChange={(e) => onChange('new_password', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 pr-10 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="New password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-white"
            >
              {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirm_password}
              onChange={(e) => onChange('confirm_password', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 pr-10 text-xs text-white outline-none transition focus:border-[#00F0FF]/50"
              placeholder="Confirm password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00F0FF] px-4 py-3 text-xs font-bold text-black transition active:scale-[0.99] disabled:opacity-60"
      >
        <Save size={14} />
        {isSaving ? 'Saving...' : 'Save Profile Changes'}
      </button>
    </form>
  );
}
