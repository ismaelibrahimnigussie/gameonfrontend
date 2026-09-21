import {
  BadgeCheck, Building2, Clock3, Coins, DollarSign, Edit3, Gift, MapPin,
  Package, Phone, Save, Timer, UserPlus, Users, Wallet,
} from 'lucide-react';
import { pickZoneId, pickPackageId } from '../constants';
import { Badge, Button, Input, Modal, Select, Textarea } from './ui';
import { CreditRow } from './cards';

export default function AdminModals({
  zones,
  packages,
  users,
  stations,
  systemCosts,
  actionLoading,
  showZoneDetails,
  showZoneEdit,
  showGrantModal,
  showPackageModal,
  showPlayerModal,
  showAdminModal,
  selectedZoneForDetails,
  selectedPackageForEdit,
  selectedPlayerForEdit,
  selectedAdminForEdit,
  zoneForm,
  grantForm,
  packageForm,
  playerForm,
  adminForm,
  setZoneForm,
  setGrantForm,
  setPackageForm,
  setPlayerForm,
  setAdminForm,
  setShowZoneDetails,
  setShowZoneEdit,
  setShowGrantModal,
  setShowPackageModal,
  setShowPlayerModal,
  setShowAdminModal,
  openZoneEdit,
  openGrantModal,
  handleZoneSave,
  handleZoneVerify,
  handleGrantCredits,
  handlePackageSave,
  handlePlayerSave,
  handleAdminSave,
}) {
  return (
    <>
      <Modal
        isOpen={showZoneDetails}
        onClose={() => setShowZoneDetails(false)}
        title={selectedZoneForDetails?.zone_name || 'Zone Details'}
        subtitle={`Zone #${pickZoneId(selectedZoneForDetails)}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowZoneDetails(false)}>Close</Button>
            <Button variant="soft" icon={Edit3} onClick={() => openZoneEdit(selectedZoneForDetails)}>Edit Zone</Button>
            <Button variant="primary" icon={Gift} onClick={() => { setShowZoneDetails(false); openGrantModal(selectedZoneForDetails); }}>Grant Credits</Button>
          </>
        }
      >
        {selectedZoneForDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Owner</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{selectedZoneForDetails.owner_name || '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedZoneForDetails.owner_phone || 'No phone'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Balance</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{Number(selectedZoneForDetails.balance || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Br</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</span>
                </div>
                <p className="text-sm text-slate-700">{selectedZoneForDetails.address || 'No address provided'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
              <Badge variant={selectedZoneForDetails.is_verified ? 'success' : 'warning'} icon={selectedZoneForDetails.is_verified ? BadgeCheck : Clock3}>
                {selectedZoneForDetails.is_verified ? 'Verified' : 'Pending Verification'}
              </Badge>
              <div className="flex gap-2">
                {!selectedZoneForDetails.is_verified ? (
                  <Button variant="success" size="sm" icon={BadgeCheck} onClick={() => handleZoneVerify(selectedZoneForDetails, true)}>Verify</Button>
                ) : (
                  <Button variant="secondary" size="sm" icon={Clock3} onClick={() => handleZoneVerify(selectedZoneForDetails, false)}>Unverify</Button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Transactions</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {selectedZoneForDetails.credits && selectedZoneForDetails.credits.length > 0 ? (
                  selectedZoneForDetails.credits.slice(0, 5).map((credit, index) => <CreditRow key={credit.zone_credit_id || credit.id || index} credit={credit} />)
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">No transactions yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showZoneEdit}
        onClose={() => setShowZoneEdit(false)}
        title="Edit Zone"
        subtitle="Update zone information"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowZoneEdit(false)}>Cancel</Button>
            <Button variant="primary" icon={Save} loading={actionLoading === 'zone-save'} onClick={handleZoneSave}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleZoneSave} className="space-y-4">
          <Input label="Zone Name" value={zoneForm.zone_name} onChange={(event) => setZoneForm((prev) => ({ ...prev, zone_name: event.target.value }))} icon={Building2} />
          <Input label="Owner Name" value={zoneForm.owner_name} onChange={(event) => setZoneForm((prev) => ({ ...prev, owner_name: event.target.value }))} icon={Users} />
          <Input label="Phone" type="tel" value={zoneForm.owner_phone} onChange={(event) => setZoneForm((prev) => ({ ...prev, owner_phone: event.target.value }))} icon={Phone} />
          <Textarea label="Address" rows={3} value={zoneForm.address} onChange={(event) => setZoneForm((prev) => ({ ...prev, address: event.target.value }))} />
        </form>
      </Modal>

      <Modal
        isOpen={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title="Grant Credits"
        subtitle="Add credits to a game zone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowGrantModal(false)}>Cancel</Button>
            <Button variant="primary" icon={Gift} loading={actionLoading === 'grant'} onClick={handleGrantCredits}>Grant Credits</Button>
          </>
        }
      >
        <form onSubmit={handleGrantCredits} className="space-y-4">
          <Select
            label="Zone"
            value={grantForm.zoneId}
            onChange={(event) => setGrantForm((prev) => ({ ...prev, zoneId: event.target.value }))}
            options={[{ value: '', label: 'Choose a zone...' }, ...zones.map((zone) => ({ value: pickZoneId(zone), label: zone.zone_name || `Zone #${pickZoneId(zone)}` }))]}
          />
          <Select
            label="Package (optional)"
            value={grantForm.creditId}
            onChange={(event) => setGrantForm((prev) => ({ ...prev, creditId: event.target.value }))}
            options={[{ value: '', label: 'Use manual amount' }, ...packages.map((pkg) => ({ value: pickPackageId(pkg), label: `${pkg.credit_name} — ${pkg.credit_amount} Br` }))]}
          />
          <Select
            label="System cost (optional)"
            value={grantForm.costId || ''}
            onChange={(event) => setGrantForm((prev) => ({ ...prev, costId: event.target.value }))}
            options={[{ value: '', label: 'Automatically use matching rule' }, ...systemCosts.map((cost) => ({ value: cost.cost_id, label: `${cost.cost_reason} — ${Number(cost.amount || 0).toFixed(2)}` }))]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount" type="number" value={grantForm.amount} onChange={(event) => setGrantForm((prev) => ({ ...prev, amount: event.target.value }))} placeholder="0" icon={Coins} />
            <Select
              label="Type"
              value={grantForm.transaction_type}
              onChange={(event) => setGrantForm((prev) => ({ ...prev, transaction_type: event.target.value }))}
              options={[
                { value: 'Bonus', label: 'Bonus' },
                { value: 'Manual', label: 'Manual' },
                { value: 'Registration', label: 'Registration' },
                { value: 'Purchase', label: 'Purchase' },
              ]}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title={selectedAdminForEdit ? 'Edit Administrator' : 'Add Administrator'}
        subtitle="Manage account access and permissions"
        footer={<><Button variant="secondary" onClick={() => setShowAdminModal(false)}>Cancel</Button><Button icon={Save} loading={actionLoading === 'admin-save'} onClick={handleAdminSave}>{selectedAdminForEdit ? 'Save Changes' : 'Create Administrator'}</Button></>}
      >
        <form onSubmit={handleAdminSave} className="space-y-4">
          <Input label="Name" value={adminForm.admin_name} onChange={(event) => setAdminForm((current) => ({ ...current, admin_name: event.target.value }))} icon={UserPlus} placeholder="Full name" />
          <Input label="Phone" type="tel" value={adminForm.phone} onChange={(event) => setAdminForm((current) => ({ ...current, phone: event.target.value }))} icon={Phone} placeholder="Phone number" />
          <Select label="Role" value={adminForm.role} onChange={(event) => setAdminForm((current) => ({ ...current, role: event.target.value }))} options={['Admin', 'System Admin', 'Support', 'Manager', 'Super Admin'].map((role) => ({ value: role, label: role }))} />
          <Select label="Status" value={adminForm.status} onChange={(event) => setAdminForm((current) => ({ ...current, status: event.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
          <Input label={selectedAdminForEdit ? 'New password (optional)' : 'Password'} type="password" value={adminForm.password} onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))} placeholder="At least 6 characters" />
        </form>
      </Modal>

      <Modal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        title={selectedPlayerForEdit ? 'Edit Player' : 'Add Player'}
        subtitle={selectedPlayerForEdit ? 'Update player assignment' : 'Create a registered or random player'}
        footer={<><Button variant="secondary" onClick={() => setShowPlayerModal(false)}>Cancel</Button><Button icon={Save} loading={actionLoading === 'player-save'} onClick={handlePlayerSave}>{selectedPlayerForEdit ? 'Save Changes' : 'Create Player'}</Button></>}
      >
        <form onSubmit={handlePlayerSave} className="space-y-4">
          {!selectedPlayerForEdit && <Select label="Player type" value={playerForm.player_type} onChange={(event) => setPlayerForm((current) => ({ ...current, player_type: event.target.value }))} options={[{ value: 'random', label: 'Random player' }, { value: 'registered', label: 'Registered user' }]} />}
          {!selectedPlayerForEdit && playerForm.player_type === 'registered' && <Select label="Registered user" value={playerForm.user_id} onChange={(event) => setPlayerForm((current) => ({ ...current, user_id: event.target.value }))} options={[{ value: '', label: 'Choose a user...' }, ...users.map((user) => ({ value: user.user_id, label: `${user.username} (${user.phone || 'no phone'})` }))]} />}
          {((!selectedPlayerForEdit && playerForm.player_type === 'random') || (selectedPlayerForEdit && selectedPlayerForEdit.user_id == null)) && <Input label="Nickname" value={playerForm.nickname} onChange={(event) => setPlayerForm((current) => ({ ...current, nickname: event.target.value }))} placeholder="Guest name" icon={UserPlus} />}
          <Select label="Station" value={playerForm.station_id} onChange={(event) => setPlayerForm((current) => ({ ...current, station_id: event.target.value }))} options={[{ value: '', label: 'Choose a station...' }, ...stations.map((station) => ({ value: station.id ?? station.station_id, label: station.station_name || `Station #${station.id ?? station.station_id}` }))]} />
        </form>
      </Modal>

      <Modal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        title={selectedPackageForEdit ? 'Edit Package' : 'Create Package'}
        subtitle={selectedPackageForEdit ? 'Update package details' : 'Configure a new credit package'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPackageModal(false)}>Cancel</Button>
            <Button variant="primary" icon={Save} loading={actionLoading === 'package-save'} onClick={handlePackageSave}>
              {selectedPackageForEdit ? 'Save Changes' : 'Create Package'}
            </Button>
          </>
        }
      >
        <form onSubmit={handlePackageSave} className="space-y-4">
          <Input label="Package Name" value={packageForm.credit_name} onChange={(event) => setPackageForm((prev) => ({ ...prev, credit_name: event.target.value }))} placeholder="e.g., Starter Pack" icon={Package} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Credits" type="number" value={packageForm.credit_amount} onChange={(event) => setPackageForm((prev) => ({ ...prev, credit_amount: event.target.value }))} placeholder="100" icon={Coins} />
            <Input label="Duration (days)" type="number" value={packageForm.duration_days} onChange={(event) => setPackageForm((prev) => ({ ...prev, duration_days: event.target.value }))} placeholder="30" icon={Timer} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (Br)" type="number" value={packageForm.price} onChange={(event) => setPackageForm((prev) => ({ ...prev, price: event.target.value }))} placeholder="0" icon={DollarSign} />
            <Select
              label="Distribution"
              value={packageForm.offered_by}
              onChange={(event) => setPackageForm((prev) => ({ ...prev, offered_by: event.target.value }))}
              options={[
                { value: 'Registration', label: 'Registration' },
                { value: 'Payment', label: 'Payment' },
              ]}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
