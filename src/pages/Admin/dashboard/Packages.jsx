import React, { useState } from 'react';
import { Package, Trash2, Edit3, Plus } from 'lucide-react';

export default function PackagesPage({
  packages = [],
  selectedPackageId,
  actionLoading,
  onSelectPackage,
  onSavePackage,
  onDeletePackage,
  onClearSelection,
}) {
  const [form, setForm] = useState({ credit_name: '', credit_amount: '', duration_days: '', price: '' });

  const selectedPkg = packages.find((p) => String(p.credit_id ?? p.id) === String(selectedPackageId));

  const handleEditClick = (pkg) => {
    onSelectPackage(pkg);
    setForm({
      credit_name: pkg.credit_name || '',
      credit_amount: pkg.credit_amount || '',
      duration_days: pkg.duration_days || '',
      price: pkg.price || '',
    });
  };

  const handleClear = () => {
    onClearSelection();
    setForm({ credit_name: '', credit_amount: '', duration_days: '', price: '' });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* List Packages */}
      <div className="grid gap-3 sm:grid-cols-2">
        {packages.map((pkg) => {
          const pkgId = String(pkg.credit_id ?? pkg.id);
          const isSelected = pkgId === String(selectedPackageId);
          return (
            <div
              key={pkgId}
              className={`rounded-[24px] border p-4 transition ${
                isSelected
                  ? 'border-[#7B2CBF]/50 bg-[#7B2CBF]/10'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-[#7B2CBF]/20 p-2 text-[#7B2CBF]">
                  <Package size={18} />
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleEditClick(pkg)} className="p-1 text-slate-400 hover:text-white">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => onDeletePackage(pkg)} className="p-1 text-slate-400 hover:text-rose-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="mt-3 text-sm font-bold text-white">{pkg.credit_name}</h4>
              <p className="mt-1 text-xl font-black text-[#00F0FF]">{pkg.credit_amount} Credits</p>
              
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-slate-400">
                <span>{pkg.duration_days} Days</span>
                <span className="font-bold text-white">${pkg.price}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Form */}
      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            {selectedPkg ? 'Edit Package' : 'Create Package'}
          </h3>
          {selectedPkg && (
            <button onClick={handleClear} className="text-[11px] text-[#00F0FF] hover:underline">
              New Package
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSavePackage(form, selectedPkg ? selectedPkg.credit_id ?? selectedPkg.id : null);
            handleClear();
          }}
          className="mt-4 space-y-3"
        >
          <div>
            <label className="text-[10px] uppercase text-slate-400">Package Name</label>
            <input
              type="text"
              required
              value={form.credit_name}
              onChange={(e) => setForm({ ...form, credit_name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase text-slate-400">Credits</label>
              <input
                type="number"
                required
                value={form.credit_amount}
                onChange={(e) => setForm({ ...form, credit_amount: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-400">Days</label>
              <input
                type="number"
                required
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-400">Price ($)</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading === 'package-save'}
            className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-[#00F0FF] py-2.5 text-xs font-bold text-black hover:bg-[#00F0FF]/90 disabled:opacity-50"
          >
            <Plus size={14} /> {selectedPkg ? 'Update Package' : 'Create Package'}
          </button>
        </form>
      </div>
    </div>
  );
}