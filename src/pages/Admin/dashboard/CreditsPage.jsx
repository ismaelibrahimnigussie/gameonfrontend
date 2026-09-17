import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Coins } from 'lucide-react';

export default function CreditsPage({
  zones = [],
  packages = [],
  selectedZone,
  selectedZoneId,
  zoneCredits,
  actionLoading,
  onSelectZone,
  onGrantCredits,
  onDeductCredits,
}) {
  const [grantForm, setGrantForm] = useState({
    zoneId: selectedZoneId || '',
    creditId: '',
    amount: '',
    transaction_type: 'manual_grant',
  });

  const handleSubmitGrant = (e) => {
    e.preventDefault();
    onGrantCredits({ ...grantForm, zoneId: selectedZoneId || grantForm.zoneId });
  };

  const handleSubmitDeduct = (e) => {
    e.preventDefault();
    onDeductCredits({ ...grantForm, zoneId: selectedZoneId || grantForm.zoneId });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      {/* Zone Selector & Active Balance */}
      <div className="space-y-4">
        <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Game Zone</label>
          <select
            value={selectedZoneId || ''}
            onChange={(e) => onSelectZone(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white focus:outline-none"
          >
            <option value="" className="bg-[#020208]">Select a Zone...</option>
            {zones.map((z) => (
              <option key={z.zone_id ?? z.id} value={z.zone_id ?? z.id} className="bg-[#020208]">
                {z.zone_name}
              </option>
            ))}
          </select>
        </div>

        {selectedZone && (
          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Balance Details</h3>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-[#00F0FF]">
                  {zoneCredits?.balance ?? selectedZone?.credit_balance ?? 0}
                </p>
                <p className="text-[11px] text-slate-500">Available Credits</p>
              </div>
              <Coins size={32} className="text-[#00F0FF]/20" />
            </div>
          </div>
        )}
      </div>

      {/* Credit Actions Form */}
      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
        <h3 className="text-sm font-bold text-white">Grant / Deduct Credits</h3>
        <form className="mt-4 space-y-3">
          <div>
            <label className="text-[10px] uppercase text-slate-400">Amount</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={grantForm.amount}
              onChange={(e) => setGrantForm({ ...grantForm, amount: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-400">Package Preset (Optional)</label>
            <select
              value={grantForm.creditId}
              onChange={(e) => {
                const pkg = packages.find((p) => String(p.credit_id ?? p.id) === e.target.value);
                setGrantForm({
                  ...grantForm,
                  creditId: e.target.value,
                  amount: pkg ? pkg.credit_amount : grantForm.amount,
                });
              }}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="" className="bg-[#020208]">Custom Amount</option>
              {packages.map((pkg) => (
                <option key={pkg.credit_id ?? pkg.id} value={pkg.credit_id ?? pkg.id} className="bg-[#020208]">
                  {pkg.credit_name} ({pkg.credit_amount} credits)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSubmitGrant}
              disabled={actionLoading === 'grant'}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#00F0FF] py-2.5 text-xs font-bold text-black hover:bg-[#00F0FF]/90 disabled:opacity-50"
            >
              <PlusCircle size={14} /> Grant
            </button>
            <button
              type="button"
              onClick={handleSubmitDeduct}
              disabled={actionLoading === 'deduct'}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
            >
              <MinusCircle size={14} /> Deduct
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}