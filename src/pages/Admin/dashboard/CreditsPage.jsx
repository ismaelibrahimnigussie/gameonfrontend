import { BadgeCheck, Clock3, Coins, Plus, TrendingDown, Wallet } from 'lucide-react';
import { Button, Card, EmptyState, Select } from '../components/ui';
import { CreditRow } from '../components/cards';

export default function CreditsPage({
  zones,
  selectedZone,
  selectedZoneId,
  zoneCredits,
  onSelectZone,
  onGrant,
  onDeduct,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Credit Management</h2>
          <p className="text-sm text-slate-500">View and manage zone credit transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={TrendingDown} onClick={onDeduct}>Revoke Credits</Button>
          <Button variant="primary" icon={Plus} onClick={onGrant}>Grant Credits</Button>
        </div>
      </div>

      <Select
        label="Select Zone"
        value={selectedZoneId}
        onChange={(event) => onSelectZone(event.target.value)}
        options={[{ value: '', label: 'Choose a zone...' }, ...zones.map((zone) => ({ value: zone.zone_id ?? zone.id ?? zone.zoneId, label: zone.zone_name || `Zone #${zone.zone_id ?? zone.id}` }))]}
      />

      {selectedZone ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedZone.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {selectedZone.is_verified ? <BadgeCheck size={24} /> : <Clock3 size={24} />}
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-semibold text-slate-900">{selectedZone.is_verified ? 'Verified' : 'Pending'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Wallet size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Balance</p>
                <p className="text-lg font-bold text-slate-900">{Number(selectedZone.balance || 0).toLocaleString()} <span className="text-sm text-slate-500">Br</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Coins size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Transactions</p>
                <p className="text-lg font-bold text-slate-900">{zoneCredits.length}</p>
              </div>
            </div>
          </div>

          <Card title="Transaction History" noPadding>
            {zoneCredits.length === 0 ? (
              <EmptyState icon={Coins} title="No transactions yet" description="Credit activity will appear here once you grant credits" action={<Button icon={Plus} onClick={onGrant}>Grant Credits</Button>} />
            ) : (
              zoneCredits.map((credit, index) => <CreditRow key={credit.zone_credit_id || credit.id || index} credit={credit} onClick={() => {}} />)
            )}
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState icon={Coins} title="Select a zone" description="Choose a zone above to view credit history and manage transactions" />
        </Card>
      )}
    </>
  );
}
