import { ADMIN_PORTAL_PATH } from '../../config/routes';
import { getApiErrorMessage, unwrapList } from '../../lib/http';
import { initialGrantForm, initialPackageForm, pickPackageId, pickZoneId } from './constants';

export function createAdminActions({
  setters, apis, showMessage, requestConfirm, loadDashboard, loadSelectedZoneCredits,
  zoneForm, selectedZoneForDetails, grantForm, packageForm, selectedPackageForEdit,
  playerForm, selectedPlayerForEdit, adminForm, selectedAdminForEdit, selectedZoneId,
  adminLogout, navigate,
}) {
  const {
    setActionLoading, setSystemCosts, setShowConfirm, setShowZoneEdit, setGrantForm, setShowGrantModal,
    setPackageForm, setSelectedPackageForEdit, setShowPackageModal, setShowPlayerModal,
    setSelectedPlayerForEdit, setSelectedPlayerIds, setShowAdminModal, setSelectedAdminIds,
  } = setters;
  const { GameZoneAPI, CreditAPI, PlayersAPI, AdminsAPI } = apis;

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
    } finally { setActionLoading(''); }
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
      } finally { setShowConfirm(null); }
    },
  });
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
    } finally { setActionLoading(''); }
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
        } finally { setActionLoading(''); }
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
    } finally { setActionLoading(''); }
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
        } finally { setActionLoading(''); }
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
    } finally { setActionLoading(''); }
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
        } finally { setActionLoading(''); }
      },
    });
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
    } finally { setActionLoading(''); }
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
        } finally { setActionLoading(''); }
      },
    });
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
    } finally { setActionLoading(''); }
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
        } finally { setActionLoading(''); }
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

  return {
    handleSystemCostSave, handleSystemCostDelete, handleZoneSave, handleZoneVerify, handleGrantCredits, handleDeductCredits,
    handlePackageSave, handlePackageDelete, handlePlayerSave, handlePlayersDelete, handleAdminSave, handleAdminsDelete, handleLogout,
  };
}
