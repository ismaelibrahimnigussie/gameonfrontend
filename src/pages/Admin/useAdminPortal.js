/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import GameZoneAPI from '../../api/modules/gamezones.api';
import CreditAPI from '../../api/modules/credits.api';
import PlayersAPI from '../../api/modules/players.api';
import UsersAPI from '../../api/modules/users.api';
import StationsAPI from '../../api/modules/stations.api';
import AdminsAPI from '../../api/modules/admins.api';
import { getApiErrorMessage, unwrapList } from '../../lib/http';
import {
  NAV_ITEMS,
  initialAdminForm,
  initialGrantForm,
  initialPackageForm,
  initialPlayerForm,
  initialZoneForm,
  pickZoneId,
} from './constants';
import { createAdminActions } from './adminActions';

export function useAdminPortal() {
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

  const openPlayerModal = (player = null) => {
    setSelectedPlayerForEdit(player);
    setPlayerForm(player
      ? { player_type: player.user_id == null ? 'random' : 'registered', user_id: player.user_id || '', station_id: player.station_id || '', nickname: player.random_nickname || player.nickname || '' }
      : initialPlayerForm);
    setShowPlayerModal(true);
  };

  const openAdminModal = (admin = null) => {
    setSelectedAdminForEdit(admin);
    setAdminForm(admin
      ? { admin_name: admin.admin_name || '', phone: admin.phone || '', password: '', role: admin.role || 'Admin', status: admin.status || 'Active' }
      : initialAdminForm);
    setShowAdminModal(true);
  };

  const {
    handleSystemCostSave, handleSystemCostDelete, handleZoneSave, handleZoneVerify, handleGrantCredits,
    handleDeductCredits, handlePackageSave, handlePackageDelete, handlePlayerSave, handlePlayersDelete,
    handleAdminSave, handleAdminsDelete, handleLogout,
  } = createAdminActions({
    setters: {
      setActionLoading, setSystemCosts, setShowConfirm, setShowZoneEdit, setGrantForm, setShowGrantModal,
      setPackageForm, setSelectedPackageForEdit, setShowPackageModal, setShowPlayerModal,
      setSelectedPlayerForEdit, setSelectedPlayerIds, setShowAdminModal, setSelectedAdminIds,
    },
    apis: { GameZoneAPI, CreditAPI, PlayersAPI, AdminsAPI },
    showMessage, requestConfirm, loadDashboard, loadSelectedZoneCredits, adminLogout, navigate,
    zoneForm, selectedZoneForDetails, grantForm, packageForm, selectedPackageForEdit,
    playerForm, selectedPlayerForEdit, adminForm, selectedAdminForEdit, selectedZoneId,
  });

  const currentPage = NAV_ITEMS.find((item) => item.id === activePage);

  return {
    isAuthenticated, isAdminLoading, adminName, adminRole, isSuperAdmin, currentPage,
    activePage, setActivePage, loading, refreshing, actionLoading, error, setError, message, dismissToast,
    mobileMenuOpen, setMobileMenuOpen, loadDashboard, handleLogout,
    zones, packages, systemCosts, players, users, stations, admins, zoneCredits, stats,
    selectedZone, selectedZoneId, setSelectedZoneId, filteredZones, filteredPlayers, filteredAdmins,
    searchQuery, setSearchQuery, playerSearch, setPlayerSearch, playerTypeFilter, setPlayerTypeFilter,
    selectedPlayerIds, setSelectedPlayerIds, adminSearch, setAdminSearch, selectedAdminIds, setSelectedAdminIds,
    showZoneDetails, showZoneEdit, showGrantModal, showPackageModal, showPlayerModal, showAdminModal, showConfirm,
    setShowZoneDetails, setShowZoneEdit, setShowGrantModal, setShowPackageModal, setShowPlayerModal, setShowAdminModal, setShowConfirm,
    selectedZoneForDetails, selectedPackageForEdit, selectedPlayerForEdit, selectedAdminForEdit,
    zoneForm, grantForm, packageForm, playerForm, adminForm,
    setZoneForm, setGrantForm, setPackageForm, setPlayerForm, setAdminForm,
    openZoneDetails, openZoneEdit, openGrantModal, openPackageModal, openPlayerModal, openAdminModal,
    handleZoneSave, handleZoneVerify, handleGrantCredits, handleDeductCredits, handlePackageSave, handlePackageDelete,
    handlePlayerSave, handlePlayersDelete, handleAdminSave, handleAdminsDelete, handleSystemCostSave, handleSystemCostDelete,
  };
}
