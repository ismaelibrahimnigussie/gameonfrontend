import { useState } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';

const emptyCost = { cost_type: 'per_session', cost_reason: '', amount: '', cost_special_case: '', scope: 'all', zone_id: '', description: '' };

function CostRuleCard({ cost, onEdit, onDelete }) {
  const scopeLabel = cost.scope === 'specific' ? `Zone ${cost.zone_id}` : 'All zones';
  return (
    <article className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{cost.cost_reason}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{cost.cost_type}</span>
          <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">{scopeLabel}</span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{Number(cost.amount || 0)} <span className="text-sm font-medium text-slate-500">credits</span></p>
        <p className="mt-1 truncate text-xs text-slate-500">{cost.cost_special_case || 'Default rule'}{cost.description ? ` · ${cost.description}` : ''}</p>
      </div>
      <div className="flex shrink-0 gap-1 opacity-70 transition group-hover:opacity-100">
        <button type="button" onClick={() => onEdit(cost)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="Edit cost"><Edit3 size={16} /></button>
        <button type="button" onClick={() => onDelete(cost)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete cost"><Trash2 size={16} /></button>
      </div>
    </article>
  );
}

function CostRuleForm({ form, editing, zones, loading, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Rule setup</p><h3 className="mt-1 text-base font-semibold text-slate-900">{editing ? 'Edit system cost' : 'Create system cost'}</h3></div>
        {editing && <button type="button" onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Cancel editing"><X size={16} /></button>}
      </div>
      <div className="mt-5 space-y-3">
        <label className="block text-sm font-medium text-slate-700">Cost type<select value={form.cost_type} onChange={(e) => onChange('cost_type', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"><option value="per_session">Per session</option><option value="per_round">Per round</option><option value="zone_credit">Zone credit</option><option value="other">Other</option></select></label>
        <label className="block text-sm font-medium text-slate-700">Cost reason<input required value={form.cost_reason} onChange={(e) => onChange('cost_reason', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" /></label>
        <label className="block text-sm font-medium text-slate-700">Special case <span className="font-normal text-slate-400">(optional)</span><input value={form.cost_special_case} onChange={(e) => onChange('cost_special_case', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" /></label>
        <label className="block text-sm font-medium text-slate-700">Applies to<select value={form.scope} onChange={(e) => onChange('scope', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"><option value="all">All game zones</option><option value="specific">Specific game zone</option></select></label>
        {form.scope === 'specific' && <label className="block text-sm font-medium text-slate-700">Game zone<select required value={form.zone_id} onChange={(e) => onChange('zone_id', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"><option value="">Select a game zone</option>{zones.map((zone) => { const zoneId = zone.zone_id ?? zone.id; return <option key={zoneId} value={zoneId}>{zone.zone_name || zone.name || `Zone ${zoneId}`}</option>; })}</select></label>}
        <label className="block text-sm font-medium text-slate-700">Credit amount<input required type="number" min="0" step="1" value={form.amount} onChange={(e) => onChange('amount', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" /></label>
        <label className="block text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(e) => onChange('description', e.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" /></label>
        <button disabled={loading === 'cost-save'} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"><Plus size={16} />{editing ? 'Update cost' : 'Create cost'}</button>
      </div>
    </form>
  );
}

export default function SystemCosts({ costs = [], zones = [], loading = '', onSave, onDelete }) {
  const [form, setForm] = useState(emptyCost);
  const [editing, setEditing] = useState(null);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      amount: Number(form.amount),
      cost_special_case: form.cost_special_case.trim() || null,
      zone_id: form.scope === 'specific' ? form.zone_id : null
    }, editing?.cost_id || null);
    setForm(emptyCost);
    setEditing(null);
  };
  const edit = (cost) => {
    setEditing(cost);
    setForm({
      cost_type: cost.cost_type || 'other',
      cost_reason: cost.cost_reason || '',
      amount: cost.amount ?? '',
      cost_special_case: cost.cost_special_case || '',
      scope: cost.scope || 'all',
      zone_id: cost.zone_id ?? '',
      description: cost.description || ''
    });
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {costs.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No system costs configured.</div>}
        {costs.map((cost) => <CostRuleCard key={cost.cost_id} cost={cost} onEdit={edit} onDelete={onDelete} />)}
      </div>
        <CostRuleForm
          form={form}
          editing={editing}
          zones={zones}
          loading={loading}
          onChange={update}
          onSubmit={submit}
          onCancel={() => { setEditing(null); setForm(emptyCost); }}
        />
    </div>
  );
}
