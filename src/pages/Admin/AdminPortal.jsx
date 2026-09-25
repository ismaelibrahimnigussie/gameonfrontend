import { Navigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { ADMIN_PORTAL_PATH } from '../../config/routes';
import { PAGE_SUBTITLES } from './constants';
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
import { useAdminPortal } from './useAdminPortal';

export default function AdminPortal() {
  const {
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
  } = useAdminPortal();

  if (!isAuthenticated && !isAdminLoading) return <Navigate to={ADMIN_PORTAL_PATH} replace />;

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
