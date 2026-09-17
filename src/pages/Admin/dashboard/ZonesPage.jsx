import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, Edit2, MapPin, Phone, User } from 'lucide-react';

export default function ZonesPage({
  zones = [],
  selectedZone,
  selectedZoneId,
  loading,
  actionLoading,
  onSelectZone,
  onSaveZone,
  onVerifyZone,
  onUnverifyZone,
}) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ zone_name: '', address: '', owner_name: '', owner_phone: '' });

  const filteredZones = zones.filter((z) =>
    z.zone_name?.toLowerCase().includes(search.toLowerCase()) ||
    z.address?.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (zone) => {
    setForm({
      zone_name: zone.zone_name || '',
      address: zone.address || '',
      owner_name: zone.owner_name || '',
      owner_phone: zone.owner_phone || '',
    });
    setEditing(true);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* Zone List */}
      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search zones by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#00F0FF] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          {filteredZones.map((zone) => {
            const zId = String(zone.zone_id ?? zone.id);
            const isSelected = zId === String(selectedZoneId);
            return (
              <div
                key={zId}
                onClick={() => onSelectZone(zone)}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                  isSelected
                    ? 'border-[#00F0FF]/40 bg-[#00F0FF]/5'
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{zone.zone_name}</h4>
                  <p className="mt-0.5 text-[11px] text-slate-400">{zone.address || 'No address'}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  zone.is_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {zone.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Details / Editor */}
      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
        {selectedZone ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Zone Details</h3>
              <button
                onClick={() => startEditing(selectedZone)}
                className="flex items-center gap-1 text-xs font-semibold text-[#00F0FF] hover:underline"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>

            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSaveZone(form, selectedZone.zone_id ?? selectedZone.id);
                  setEditing(false);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Zone Name</label>
                  <input
                    type="text"
                    value={form.zone_name}
                    onChange={(e) => setForm({ ...form, zone_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading === 'zone-save'}
                    className="flex-1 rounded-xl bg-[#00F0FF] py-2 text-xs font-bold text-black hover:bg-[#00F0FF]/90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{selectedZone.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <User size={14} className="text-slate-500" />
                  <span>{selectedZone.owner_name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={14} className="text-slate-500" />
                  <span>{selectedZone.owner_phone || 'N/A'}</span>
                </div>

                <div className="pt-4 border-t border-white/5">
                  {selectedZone.is_verified ? (
                    <button
                      onClick={() => onUnverifyZone(selectedZone)}
                      disabled={Boolean(actionLoading)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                    >
                      <XCircle size={14} /> Unverify Zone
                    </button>
                  ) : (
                    <button
                      onClick={() => onVerifyZone(selectedZone)}
                      disabled={Boolean(actionLoading)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <CheckCircle2 size={14} /> Verify Zone
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500 py-10">Select a zone to view details</p>
        )}
      </div>
    </div>
  );
}