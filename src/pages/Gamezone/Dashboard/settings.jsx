import { Settings as SettingsIcon, Lock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="text-center py-12 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <SettingsIcon size={28} className="text-slate-600" />
      </div>
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Settings</h4>
      <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
        Configuration is locked. Please contact your administrator for changes.
      </p>
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
        <Lock size={12} />
        <span>Admin access required</span>
      </div>
    </div>
  );
}