import { CheckCircle2, ChevronRight, Clock3, CreditCard, Edit3, Loader2, Package, Timer, Trash2 } from 'lucide-react';
import { pickZoneId } from '../constants';
import { Badge } from './ui';

export const ZoneRow = ({ zone, onClick }) => {
  const zoneId = pickZoneId(zone);
  const isVerified = Boolean(zone.is_verified === 1 || zone.is_verified === true);
  return (
    <tr onClick={onClick} className="hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {zone.zone_name?.[0]?.toUpperCase() || 'Z'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{zone.zone_name || 'Unnamed'}</p>
            <p className="text-xs text-slate-500 font-mono">#{zoneId}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600 hidden md:table-cell">{zone.owner_name || '—'}</td>
      <td className="px-5 py-4 text-sm text-slate-600 hidden lg:table-cell">{zone.owner_phone || '—'}</td>
      <td className="px-5 py-4">
        <Badge variant={isVerified ? 'success' : 'warning'} icon={isVerified ? CheckCircle2 : Clock3}>
          {isVerified ? 'Verified' : 'Pending'}
        </Badge>
      </td>
      <td className="px-5 py-4 text-right">
        <span className="text-sm font-bold text-slate-900">{Number(zone.balance || 0).toLocaleString()}</span>
        <span className="text-xs text-slate-500 ml-1">Br</span>
      </td>
      <td className="px-5 py-4 text-right">
        <ChevronRight size={18} className="text-slate-400" />
      </td>
    </tr>
  );
};

export const ZoneCard = ({ zone, onClick }) => {
  const zoneId = pickZoneId(zone);
  const isVerified = Boolean(zone.is_verified === 1 || zone.is_verified === true);
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 transition-all active:scale-[0.98] hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {zone.zone_name?.[0]?.toUpperCase() || 'Z'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">{zone.zone_name || 'Unnamed'}</h3>
            <Badge variant={isVerified ? 'success' : 'warning'} size="sm" icon={isVerified ? CheckCircle2 : Clock3}>
              {isVerified ? 'Verified' : 'Pending'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 truncate mt-0.5">{zone.owner_name || 'Unknown'}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400 font-mono">#{zoneId}</span>
            <span className="text-sm font-bold text-slate-900">{Number(zone.balance || 0).toLocaleString()} Br</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export const PackageCard = ({ pkg, onEdit, onDelete, deleting }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-slate-300 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
        <Package size={22} className="text-purple-600" />
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
          <Edit3 size={16} />
        </button>
        <button onClick={onDelete} disabled={deleting} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
    <h3 className="text-base font-semibold text-slate-900 truncate">{pkg.credit_name}</h3>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl font-bold text-slate-900">{pkg.credit_amount}</span>
      <span className="text-sm text-slate-500">credits</span>
    </div>
    <div className="flex flex-wrap gap-2 mt-4">
      <Badge variant="info" icon={Timer}>{pkg.duration_days} days</Badge>
      <Badge variant="default">{pkg.offered_by || 'Manual'}</Badge>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
      <span className="text-xs text-slate-500">Price</span>
      <span className="text-lg font-bold text-slate-900">{pkg.price ?? 0} <span className="text-xs text-slate-500">Br</span></span>
    </div>
  </div>
);

export const CreditRow = ({ credit, onClick }) => {
  const type = credit.offered_by || 'Manual';
  const typeColors = {
    Bonus: 'bg-emerald-100 text-emerald-700',
    Manual: 'bg-blue-100 text-blue-700',
    Registration: 'bg-purple-100 text-purple-700',
    Purchase: 'bg-amber-100 text-amber-700',
    Deduction: 'bg-red-100 text-red-700',
  };
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[type] || 'bg-slate-100 text-slate-600'}`}>
        <CreditCard size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 truncate">{credit.credit_name || 'Manual Credit'}</p>
          <Badge variant="default" size="sm">{type}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {credit.purchased_at ? new Date(credit.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-900">{credit.total_credit || credit.credit_amount || 0}</p>
        <p className="text-xs text-slate-500">{credit.remaining_credit || 0} left</p>
      </div>
    </div>
  );
};
