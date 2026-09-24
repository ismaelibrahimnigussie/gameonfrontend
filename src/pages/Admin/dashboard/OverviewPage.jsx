import { Building2, ChevronRight, Clock3, Coins, Gift, Layers, Plus, Sparkles, Wallet } from 'lucide-react';
import { pickZoneId } from '../constants';
import { Badge, Button, Card, EmptyState, Skeleton, StatCard } from '../components/ui';
import { ZoneCard } from '../components/cards';

export default function OverviewPage({
  adminName,
  stats,
  loading,
  zones,
  onGrant,
  onNewPackage,
  onViewZones,
  onViewCredits,
  onOpenZone,
}) {
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
        <div className="relative">
          <Badge variant="info" size="md" icon={Sparkles}>Live Dashboard</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mt-3">Welcome back, {adminName.split(' ')[0]}</h2>
          <p className="text-slate-300 mt-2 text-sm sm:text-base">Here's what's happening with your platform today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Zones" value={stats.total} icon={Building2} accent="blue" subtitle={`${stats.verified} verified`} />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} accent="amber" subtitle={`${stats.rate.toFixed(0)}% rate`} />
        <StatCard label="Packages" value={stats.packageCount} icon={Layers} accent="purple" />
        <StatCard label="Total Balance" value={stats.totalBalance.toLocaleString()} icon={Wallet} accent="emerald" subtitle="Br" />
      </div>

      <Card title="Quick Actions" subtitle="Common tasks at your fingertips">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button onClick={onGrant} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <Gift size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Grant Credits</p>
              <p className="text-xs text-slate-500 mt-0.5">Add credits to zones</p>
            </div>
          </button>
          <button onClick={onNewPackage} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
              <Plus size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">New Package</p>
              <p className="text-xs text-slate-500 mt-0.5">Create credit package</p>
            </div>
          </button>
          <button onClick={onViewZones} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <Building2 size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">View Zones</p>
              <p className="text-xs text-slate-500 mt-0.5">Manage all zones</p>
            </div>
          </button>
          <button onClick={onViewCredits} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <Coins size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Transactions</p>
              <p className="text-xs text-slate-500 mt-0.5">View history</p>
            </div>
          </button>
        </div>
      </Card>

      <Card
        title="Recent Zones"
        subtitle={`${stats.total} total zones`}
        action={<Button variant="ghost" size="sm" onClick={onViewZones} iconRight={ChevronRight}>View all</Button>}
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24 w-full" />)}
          </div>
        ) : zones.length === 0 ? (
          <EmptyState icon={Building2} title="No zones yet" description="Create a game zone to get started" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {zones.slice(0, 4).map((zone) => (
              <ZoneCard key={pickZoneId(zone)} zone={zone} onClick={() => onOpenZone(zone)} />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
