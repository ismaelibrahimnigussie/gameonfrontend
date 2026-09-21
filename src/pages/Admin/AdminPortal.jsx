/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import GameZoneAPI from '../../api/modules/gamezones.api';
import CreditAPI from '../../api/modules/credits.api';
import PlayersAPI from '../../api/modules/players.api';
import UsersAPI from '../../api/modules/users.api';
import StationsAPI from '../../api/modules/stations.api';
import AdminsAPI from '../../api/modules/admins.api';
import { ADMIN_PORTAL_PATH } from '../../config/routes';
import { getApiErrorMessage, unwrapList } from '../../lib/http';
import {
  NAV_ITEMS,
  PAGE_SUBTITLES,
  initialAdminForm,
  initialGrantForm,
  initialPackageForm,
  initialPlayerForm,
  initialZoneForm,
  pickPackageId,
  pickZoneId,
} from './constants';
import { ConfirmDialog, Toast } from './components/ui';
import { DesktopHeader, DesktopSidebar, MobileBottomNav, MobileDrawer, MobileHeader } from './components/layout';
import AdminModals from './components/AdminModals';
import OverviewPage from './dashboard/OverviewPage';
import ZonesPage from './dashboard/ZonesPage';
import PlayersPage from './dashboard/PlayersPage';
import AdminsPage from './dashboard/AdminsPage';
import CreditsPage from './dashboard/CreditsPage';
import PackagesPage from './dashboard/Packages';
import SystemCosts from './dashboard/SystemCosts';

export default function AdminPortal() {
  const navigate = useNavigate();
  const { adminUser, isAdminAuthenticated, isAdminLoading, adminLogout } = useAdminAuth();

  const [activePage, setActivePage] = useState('overview');
  const [zones, setZones] = useState([]);
  const [packages, setPackages] = useState([]);
  const [systemCosts, setSystemCosts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerTypeFilter, setPlayerTypeFilter] = useState('all');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedAdminIds, setSelectedAdminIds] = useState([]);
  const [zoneCredits, setZoneCredits] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [showZoneEdit, setShowZoneEdit] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [selectedZoneForDetails, setSelectedZoneForDetails] = useState(null);
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState(null);
  const [zoneForm, setZoneForm] = useState(initialZoneForm);
  const [grantForm, setGrantForm] = useState(initialGrantForm);
  const [packageForm, setPackageForm] = useState(initialPackageForm);
  const [playerForm, setPlayerForm] = useState(initialPlayerForm);
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState(initialAdminForm);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState(null);

  const isAuthenticated = Boolean(isAdminAuthenticated);
  const adminName = adminUser?.admin_name || adminUser?.name || 'Admin';
  const adminRole = adminUser?.role || 'Administrator';
  const isSuperAdmin = adminUser?.role === 'Super Admin';

  const showMessage = useCallback((text, kind = 'success') => setMessage({ text, kind }), []);
  const dismissToast = useCallback(() => setMessage(null), []);
  const requestConfirm = (config) => setShowConfirm(config);

  const loadDashboard = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [zonesRes, packagesRes, playersRes, usersRes, stationsRes, costsRes] = await Promise.all([
        GameZoneAPI.getAllZones(),
        CreditAPI.getCreditPackages().catch(() => ({ data: [] })),
        PlayersAPI.getAll().catch(() => ({ data: [] })),
        UsersAPI.getAll().catch(() => ({ data: [] })),
        StationsAPI.getAllStations().catch(() => ({ data: [] })),
        isSuperAdmin ? CreditAPI.getSystemCosts().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      const rawZones = unwrapList(zonesRes);
      const zonesWithBalance = await Promise.all(
        rawZones.map(async (zone) => {
          const zoneId = pickZoneId(zone);
          try {
            const balanceRes = await CreditAPI.getZoneBalanceAdmin(zoneId);
            const balance = balanceRes?.data?.balance ?? balanceRes?.balance ?? balanceRes?.data?.data?.balance ?? 0;
            return { ...zone, balance };
          } catch {
            return { ...zone, balance: 0 };
          }
        }),
      );
      setZones(zonesWithBalance);
      setPackages(unwrapList(packagesRes));
      setPlayers(unwrapList(playersRes));
      setUsers(unwrapList(usersRes));
      setStations(unwrapList(stationsRes));
      setSystemCosts(unwrapList(costsRes));
      if (isSuperAdmin) {
        const adminsRes = await AdminsAPI.getAll();
        setAdmins(unwrapList(adminsRes));
      }
      setSelectedZoneId((current) => current || (zonesWithBalance[0] ? String(pickZoneId(zonesWithBalance[0])) : ''));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load data'));
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isSuperAdmin, showMessage]);

  const handleSystemCostSave = async (payload, id) => {
    setActionLoading('cost-save');
    try {
      if (id) await CreditAPI.updateSystemCost(id, payload);
      else await CreditAPI.createSystemCost(payload);
      showMessage(id ? 'System cost updated' : 'System cost created', 'success');
      const response = await CreditAPI.getSystemCosts();
      setSystemCosts(unwrapList(response));
    } catch (err) {
      showMessage(getApiErrorMessage(err, 'Failed to save system cost'), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleSystemCostDelete = (cost) => requestConfirm({
    title: 'Delete system cost?',
    message: `Delete "${cost.cost_reason}"?`,
    variant: 'danger',
    confirmLabel: 'Delete',
    onConfirm: async () => {
      try {
        await CreditAPI.deleteSystemCost(cost.cost_id);
        setSystemCosts((items) => items.filter((item) => item.cost_id !== cost.cost_id));
        showMessage('System cost deleted', 'success');
      } catch (err) {
        showMessage(getApiErrorMessage(err, 'Cannot delete this system cost'), 'error');
      } finally {
        setShowConfirm(null);
      }
    },
  });

  const loadSelectedZoneCredits = useCallback(async (zoneId) => {
    if (!zoneId) {
      setZoneCredits([]);
      return;
    }
    try {
      const res = await CreditAPI.getZoneCreditsAdmin(zoneId);
      setZoneCredits(unwrapList(res));
    } catch {
      setZoneCredits([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadDashboard();
    else if (!isAdminLoading) setLoading(false);
  }, [isAuthenticated, isAdminLoading, loadDashboard]);

  useEffect(() => {
    if (selectedZoneId) loadSelectedZoneCredits(selectedZoneId);
  }, [selectedZoneId, loadSelectedZoneCredits]);

  const filteredZones = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return zones;
    return zones.filter((zone) => {
      const name = String(zone.zone_name || '').toLowerCase();
      const owner = String(zone.owner_name || '').toLowerCase();
      const phone = String(zone.owner_phone || '').toLowerCase();
      return name.includes(query) || owner.includes(query) || phone.includes(query);
    });
  }, [zones, searchQuery]);

  const selectedZone = useMemo(
    () => zones.find((zone) => String(pickZoneId(zone)) === String(selectedZoneId)) || null,
    [zones, selectedZoneId],
  );

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.trim().toLowerCase();
    return players.filter((player) => {
      const isRandom = player.user_id == null;
      const matchesType = playerTypeFilter === 'all' || (playerTypeFilter === 'random' ? isRandom : !isRandom);
      const text = `${player.random_nickname || player.nickname || ''} ${player.username || ''} ${player.phone || ''} ${player.station_name || ''}`.toLowerCase();
      return matchesType && (!query || text.includes(query));
    });
  }, [players, playerSearch, playerTypeFilter]);

  const filteredAdmins = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    return admins.filter((admin) => !query || `${admin.admin_name || ''} ${admin.phone || ''} ${admin.role || ''} ${admin.status || ''}`.toLowerCase().includes(query));
  }, [admins, adminSearch]);

  const stats = useMemo(() => {
    const totalBalance = zones.reduce((sum, zone) => sum + Number(zone.balance || 0), 0);
    const verified = zones.filter((zone) => Boolean(zone.is_verified === 1 || zone.is_verified === true)).length;
    return { total: zones.length, verified, pending: zones.length - verified, totalBalance, packageCount: packages.length, rate: zones.length ? (verified / zones.length) * 100 : 0 };
  }, [zones, packages]);

  const openZoneDetails = async (zone) => {
    setSelectedZoneForDetails(zone);
    setShowZoneDetails(true);
    const zoneId = pickZoneId(zone);
    if (!zoneId) return;
    try {
      const res = await CreditAPI.getZoneCreditsAdmin(zoneId);
      setSelectedZoneForDetails((prev) => ({ ...prev, credits: unwrapList(res) }));
    } catch {
      /* ignore credit lookup failures in the details drawer */
    }
  };

  const openZoneEdit = (zone) => {
    setSelectedZoneForDetails(zone);
    setZoneForm({
      zone_name: zone.zone_name || '',
      address: zone.address || '',
      owner_name: zone.owner_name || '',
      owner_phone: zone.owner_phone || '',
    });
    setShowZoneEdit(true);
    setShowZoneDetails(false);
  };

  const openGrantModal = (zone = null) => {
    setGrantForm({ ...initialGrantForm, zoneId: zone ? String(pickZoneId(zone)) : selectedZoneId || '' });
    setShowGrantModal(true);
  };

  const openPackageModal = (pkg = null) => {
    if (pkg) {
      setSelectedPackageForEdit(pkg);
      setPackageForm({
        credit_name: pkg.credit_name || '',
        credit_amount: String(pkg.credit_amount ?? ''),
        duration_days: String(pkg.duration_days ?? '30'),
        price: String(pkg.price ?? '0'),
        offered_by: pkg.offered_by || 'Registration',
      });
    } else {
      setSelectedPackageForEdit(null);
      setPackageForm(initialPackageForm);
    }
    setShowPackageModal(true);
  };

  const handleZoneSave = async (event) => {
    event.preventDefault();
    const zone = selectedZoneForDetails;
    if (!zone) return;
    setActionLoading('zone-save');
    try {
      await GameZoneAPI.updateZone(pickZoneId(zone), {
        zone_name: zoneForm.zone_name.trim(),
        address: zoneForm.address.trim(),
        owner_name: zoneForm.owner_name.trim(),
        owner_phone: zoneForm.owner_phone.trim(),
      });
      showMessage('Zone updated successfully', 'success');
      setShowZoneEdit(false);
      await loadDashboard(true);
    } catch (err) {
      showMessage(getApiErrorMessage(err, 'Failed to update'), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleZoneVerify = (zone, verified) => {
    requestConfirm({
      title: verified ? 'Verify Zone' : 'Unverify Zone',
      message: verified ? `Mark "${zone.zone_name}" as verified? This will enable full features.` : `Remove verification from "${zone.zone_name}"?`,
      variant: verified ? 'success' : 'warning',
      confirmLabel: verified ? 'Verify' : 'Unverify',
      onConfirm: async () => {
        setActionLoading('verify');
        try {
          if (verified) await GameZoneAPI.verifyZone(pickZoneId(zone));
          else await GameZoneAPI.unverifyZone(pickZoneId(zone));
          showMessage(verified ? 'Zone verified' : 'Zone unverified', 'success');
          setShowConfirm(null);
          await loadDashboard(true);
        } catch {
          showMessage('Failed to update', 'error');
          setShowConfirm(null);
        } finally {
          setActionLoading('');
        }
      },
    });
  };

  const handleGrantCredits = async (event) => {
    event.preventDefault();
    if (!grantForm.zoneId) {
      showMessage('Select a zone', 'error');
      return;
    }
    const amount = Number(grantForm.amount);
    if (!amount || amount <= 0) {
      showMessage('Enter a valid amount', 'error');
      return;
    }
    setActionLoading('grant');
    try {
      await CreditAPI.grantCredits({
        zoneId: Number(grantForm.zoneId),
        creditId: grantForm.creditId ? Number(grantForm.creditId) : null,
        amount,
        transaction_type: grantForm.transaction_type,
        cost_id: grantForm.costId ? Number(grantForm.costId) : null,
      });
      showMessage('Credits granted successfully', 'success');
      setGrantForm(initialGrantForm);
      setShowGrantModal(false);
      await loadDashboard(true);
      if (grantForm.zoneId) await loadSelectedZoneCredits(grantForm.zoneId);
    } catch (err) {
      showMessage(getApiErrorMessage(err, 'Failed to grant'), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeductCredits = (zone) => {
    const zoneId = pickZoneId(zone) || selectedZoneId;
    if (!zoneId) return showMessage('Select a zone', 'error');
    const rawAmount = window.prompt('Credits to revoke from this zone:', '1');
    if (rawAmount === null) return;
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage('Enter a valid positive amount', 'error');
      return;
    }
    requestConfirm({
      title: 'Deduct Credits',
      message: `Remove ${amount} credits from this zone? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Proceed',
      onConfirm: async () => {
        setActionLoading('deduct');
        try {
          await CreditAPI.deductCredits(zoneId, amount);
          showMessage('Credits deducted successfully', 'success');
          setShowConfirm(null);
          await loadDashboard(true);
          await loadSelectedZoneCredits(zoneId);
        } catch (err) {
          showMessage(getApiErrorMessage(err, 'Failed to deduct credits'), 'error');
          setShowConfirm(null);
        } finally {
          setActionLoading('');
        }
      },
    });
  };

  const handlePackageSave = async (event) => {
    event.preventDefault();
    setActionLoading('package-save');
    try {
      const payload = {
        credit_name: packageForm.credit_name.trim(),
        credit_amount: Number(packageForm.credit_amount),
        duration_days: Number(packageForm.duration_days),
        price: Number(packageForm.price),
        offered_by: packageForm.offered_by || 'Registration',
      };
      if (!payload.credit_name) throw new Error('Name required');
      if (!payload.credit_amount) throw new Error('Invalid amount');
      if (selectedPackageForEdit) {
        await CreditAPI.updatePackage(pickPackageId(selectedPackageForEdit), payload);
        showMessage('Package updated', 'success');
      } else {
        await CreditAPI.createPackage(payload);
        showMessage('Package created', 'success');
      }
      setPackageForm(initialPackageForm);
      setSelectedPackageForEdit(null);
      setShowPackageModal(false);
      await loadDashboard(true);
    } catch (err) {
      showMessage(err.message || 'Failed to save', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handlePackageDelete = (pkg) => {
    requestConfirm({
      title: 'Delete Package',
      message: `Are you sure you want to delete "${pkg.credit_name}"? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const pkgId = pickPackageId(pkg);
        setActionLoading(`del-${pkgId}`);
        try {
          await CreditAPI.deletePackage(pkgId);
          showMessage('Package deleted', 'success');
          setShowConfirm(null);
          await loadDashboard(true);
        } catch {
          showMessage('Failed to delete', 'error');
          setShowConfirm(null);
        } finally {
          setActionLoading('');
        }
      },
    });
  };

  const openPlayerModal = (player = null) => {
    setSelectedPlayerForEdit(player);
    setPlayerForm(player
      ? { player_type: player.user_id == null ? 'random' : 'registered', user_id: player.user_id || '', station_id: player.station_id || '', nickname: player.random_nickname || player.nickname || '' }
      : initialPlayerForm);
    setShowPlayerModal(true);
  };

  const handlePlayerSave = async (event) => {
    event.preventDefault();
    if (!playerForm.station_id) return showMessage('Select a station', 'error');
    setActionLoading('player-save');
    try {
      if (selectedPlayerForEdit) {
        await PlayersAPI.update(selectedPlayerForEdit.player_id, { station_id: Number(playerForm.station_id), nickname: playerForm.nickname.trim() });
      } else if (playerForm.player_type === 'registered') {
        if (!playerForm.user_id) throw new Error('Select a registered user');
        await PlayersAPI.create({ user_id: Number(playerForm.user_id), station_id: Number(playerForm.station_id) });
      } else {
        await PlayersAPI.createRandom({ station_id: Number(playerForm.station_id), nickname: playerForm.nickname.trim() });
      }
      showMessage(selectedPlayerForEdit ? 'Player updated' : 'Player created', 'success');
      setShowPlayerModal(false);
      setSelectedPlayerForEdit(null);
      await loadDashboard(true);
    } catch (err) {
      showMessage(getApiErrorMessage(err, 'Failed to save player'), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handlePlayersDelete = (ids) => {
    const normalizedIds = ids.map(Number).filter(Boolean);
    if (!normalizedIds.length) return;
    requestConfirm({
      title: `Delete ${normalizedIds.length} player${normalizedIds.length === 1 ? '' : 's'}?`,
      message: 'This removes the selected player records. Existing session history is retained when the database allows it.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setActionLoading('players-delete');
        try {
          if (normalizedIds.length === 1) await PlayersAPI.delete(normalizedIds[0]);
          else await PlayersAPI.bulkDelete(normalizedIds);
          setSelectedPlayerIds([]);
          setShowConfirm(null);
          showMessage('Players deleted', 'success');
          await loadDashboard(true);
        } catch (err) {
          showMessage(getApiErrorMessage(err, 'Failed to delete players'), 'error');
          setShowConfirm(null);
        } finally {
          setActionLoading('');
        }
      },
    });
  };

  const openAdminModal = (admin = null) => {
    setSelectedAdminForEdit(admin);
    setAdminForm(admin
      ? { admin_name: admin.admin_name || '', phone: admin.phone || '', password: '', role: admin.role || 'Admin', status: admin.status || 'Active' }
      : initialAdminForm);
    setShowAdminModal(true);
  };

  const handleAdminSave = async (event) => {
    event.preventDefault();
    setActionLoading('admin-save');
    try {
      const payload = { admin_name: adminForm.admin_name.trim(), phone: adminForm.phone.trim(), role: adminForm.role, status: adminForm.status };
      if (!payload.admin_name || !payload.phone) throw new Error('Name and phone are required');
      if (!selectedAdminForEdit && !adminForm.password) throw new Error('Password is required');
      if (adminForm.password) payload.password = adminForm.password;
      if (selectedAdminForEdit) await AdminsAPI.update(selectedAdminForEdit.admin_id, payload);
      else await AdminsAPI.create(payload);
      showMessage(selectedAdminForEdit ? 'Administrator updated' : 'Administrator created', 'success');
      setShowAdminModal(false);
      await loadDashboard(true);
    } catch (err) {
      showMessage(getApiErrorMessage(err, 'Failed to save administrator'), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleAdminsDelete = (ids) => {
    if (!ids.length) return;
    requestConfirm({
      title: `Delete ${ids.length} administrator${ids.length === 1 ? '' : 's'}?`,
      message: 'Deleted administrators will no longer be able to sign in.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setActionLoading('admins-delete');
        try {
          if (ids.length === 1) await AdminsAPI.delete(ids[0]);
          else await AdminsAPI.bulkDelete(ids);
          setSelectedAdminIds([]);
          setShowConfirm(null);
          showMessage('Administrators deleted', 'success');
          await loadDashboard(true);
        } catch (err) {
          showMessage(getApiErrorMessage(err, 'Failed to delete administrators'), 'error');
          setShowConfirm(null);
        } finally {
          setActionLoading('');
        }
      },
    });
  };

  const handleLogout = () => {
    requestConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      variant: 'warning',
      confirmLabel: 'Sign Out',
      onConfirm: () => {
        adminLogout();
        navigate(ADMIN_PORTAL_PATH, { replace: true });
      },
    });
  };

  if (!isAuthenticated && !isAdminLoading) return <Navigate to={ADMIN_PORTAL_PATH} replace />;

  const currentPage = NAV_ITEMS.find((item) => item.id === activePage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {message && <Toast message={message} onDismiss={dismissToast} />}

      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        adminName={adminName}
        adminRole={adminRole}
        onLogout={handleLogout}
      />

      <DesktopSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        adminName={adminName}
        adminRole={adminRole}
        onLogout={handleLogout}
      />

      <div className="sm:ml-64 min-h-screen pb-20 sm:pb-0">
        <MobileHeader title={currentPage?.label} onMenuClick={() => setMobileMenuOpen(true)} onRefresh={() => loadDashboard(true)} refreshing={refreshing} />
        <DesktopHeader title={currentPage?.label} subtitle={PAGE_SUBTITLES[activePage]} onRefresh={() => loadDashboard(true)} refreshing={refreshing} />

        {error && (
          <div className="mx-4 mt-4 sm:mx-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 flex-1">{error}</p>
            <button onClick={() => setError('')} className="p-1 rounded-lg hover:bg-red-100 text-red-600"><X size={16} /></button>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {activePage === 'overview' && (
            <OverviewPage
              adminName={adminName}
              stats={stats}
              loading={loading}
              zones={zones}
              onGrant={() => openGrantModal()}
              onNewPackage={() => openPackageModal()}
              onViewZones={() => setActivePage('zones')}
              onViewCredits={() => setActivePage('credits')}
              onOpenZone={openZoneDetails}
            />
          )}

          {activePage === 'zones' && (
            <ZonesPage
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filteredZones={filteredZones}
              zones={zones}
              loading={loading}
              onOpenZone={openZoneDetails}
              onGrant={() => openGrantModal()}
            />
          )}

          {activePage === 'players' && (
            <PlayersPage
              playerSearch={playerSearch}
              onSearchChange={setPlayerSearch}
              playerTypeFilter={playerTypeFilter}
              onTypeFilterChange={setPlayerTypeFilter}
              selectedPlayerIds={selectedPlayerIds}
              onToggleAll={(checked) => setSelectedPlayerIds(checked ? filteredPlayers.map((player) => player.player_id) : [])}
              onToggleOne={(playerId) => setSelectedPlayerIds((current) => current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId])}
              filteredPlayers={filteredPlayers}
              players={players}
              loading={loading}
              onAdd={() => openPlayerModal()}
              onEdit={openPlayerModal}
              onDelete={handlePlayersDelete}
            />
          )}

          {activePage === 'admins' && isSuperAdmin && (
            <AdminsPage
              adminSearch={adminSearch}
              onSearchChange={setAdminSearch}
              selectedAdminIds={selectedAdminIds}
              onToggleAll={(checked) => setSelectedAdminIds(checked ? filteredAdmins.map((admin) => admin.admin_id) : [])}
              onToggleOne={(adminId) => setSelectedAdminIds((current) => current.includes(adminId) ? current.filter((id) => id !== adminId) : [...current, adminId])}
              filteredAdmins={filteredAdmins}
              admins={admins}
              onAdd={() => openAdminModal()}
              onEdit={openAdminModal}
              onDelete={handleAdminsDelete}
            />
          )}

          {activePage === 'credits' && (
            <CreditsPage
              zones={zones}
              selectedZone={selectedZone}
              selectedZoneId={selectedZoneId}
              zoneCredits={zoneCredits}
              onSelectZone={setSelectedZoneId}
              onGrant={() => openGrantModal()}
              onDeduct={() => handleDeductCredits(selectedZone)}
            />
          )}

          {activePage === 'packages' && (
            <PackagesPage
              packages={packages}
              loading={loading}
              actionLoading={actionLoading}
              onCreate={() => openPackageModal()}
              onEdit={openPackageModal}
              onDelete={handlePackageDelete}
            />
          )}

          {activePage === 'costs' && isSuperAdmin && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">System Costs</h2>
                <p className="text-sm text-slate-500">Configure automatic cost rules used for zone credit grants.</p>
              </div>
              <SystemCosts costs={systemCosts} zones={zones} loading={actionLoading} onSave={handleSystemCostSave} onDelete={handleSystemCostDelete} />
            </>
          )}
        </div>
      </div>

      <AdminModals
        zones={zones}
        packages={packages}
        users={users}
        stations={stations}
        systemCosts={systemCosts}
        actionLoading={actionLoading}
        showZoneDetails={showZoneDetails}
        showZoneEdit={showZoneEdit}
        showGrantModal={showGrantModal}
        showPackageModal={showPackageModal}
        showPlayerModal={showPlayerModal}
        showAdminModal={showAdminModal}
        selectedZoneForDetails={selectedZoneForDetails}
        selectedPackageForEdit={selectedPackageForEdit}
        selectedPlayerForEdit={selectedPlayerForEdit}
        selectedAdminForEdit={selectedAdminForEdit}
        zoneForm={zoneForm}
        grantForm={grantForm}
        packageForm={packageForm}
        playerForm={playerForm}
        adminForm={adminForm}
        setZoneForm={setZoneForm}
        setGrantForm={setGrantForm}
        setPackageForm={setPackageForm}
        setPlayerForm={setPlayerForm}
        setAdminForm={setAdminForm}
        setShowZoneDetails={setShowZoneDetails}
        setShowZoneEdit={setShowZoneEdit}
        setShowGrantModal={setShowGrantModal}
        setShowPackageModal={setShowPackageModal}
        setShowPlayerModal={setShowPlayerModal}
        setShowAdminModal={setShowAdminModal}
        openZoneEdit={openZoneEdit}
        openGrantModal={openGrantModal}
        handleZoneSave={handleZoneSave}
        handleZoneVerify={handleZoneVerify}
        handleGrantCredits={handleGrantCredits}
        handlePackageSave={handlePackageSave}
        handlePlayerSave={handlePlayerSave}
        handleAdminSave={handleAdminSave}
      />

      <ConfirmDialog
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        title={showConfirm?.title}
        message={showConfirm?.message}
        confirmLabel={showConfirm?.confirmLabel}
        variant={showConfirm?.variant}
        loading={!!actionLoading}
        onConfirm={showConfirm?.onConfirm}
      />

      <MobileBottomNav activePage={activePage} onNavigate={setActivePage} adminRole={adminRole} />
    </div>
  );
}
