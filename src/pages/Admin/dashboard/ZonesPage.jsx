import { Building2, Filter, Plus, Search } from 'lucide-react';
import { pickZoneId } from '../constants';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { ZoneCard, ZoneRow } from '../components/cards';

export default function ZonesPage({
  searchQuery,
  onSearchChange,
  filteredZones,
  zones,
  loading,
  onOpenZone,
  onGrant,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search zones by name, owner, or phone..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" icon={Filter}><span className="hidden sm:inline">Filter</span></Button>
          <Button variant="primary" size="md" icon={Plus} onClick={onGrant}>Grant</Button>
        </div>
      </div>

      <Card title="Game Zones" subtitle={`${filteredZones.length} of ${zones.length} zones`} noPadding>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 w-full" />)}
          </div>
        ) : filteredZones.length === 0 ? (
          <EmptyState icon={Building2} title="No zones found" description={searchQuery ? 'Try a different search term' : 'No game zones configured yet'} />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Owner</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                    <th className="px-5 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredZones.map((zone) => (
                    <ZoneRow key={pickZoneId(zone)} zone={zone} onClick={() => onOpenZone(zone)} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden p-4 grid gap-3">
              {filteredZones.map((zone) => (
                <ZoneCard key={pickZoneId(zone)} zone={zone} onClick={() => onOpenZone(zone)} />
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
