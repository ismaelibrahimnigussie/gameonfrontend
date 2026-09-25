import OverviewPage from "./Overview";
import GamesPage from "./Games";
import SessionsPage from "./sessions";
import StationsPage from "./Stations";
import ProfilePage from "./Profile";

export default function LoungeTabs({ d }) {
  const {
    activeTab,
    zoneInfo,
    games,
    stations,
    gameDetails,
    sessions,
    creditBalance,
    isRefreshing,
    setNewStation,
    focusSessionId,
    setFocusSessionId,
    transferReminder,
    initialLoadDoneRef,
    targetProfile,
    isVerified,
    canManage,
    canCreateRandomSession,
    sessionLockMessage,
    activeStations,
    occupiedStations,
    availabilityRate,
    showToast,
    loadData,
    handleSaveProfile,
    openModal,
    handleDeleteGame,
    handleDeleteStation,
    handleStartSession,
    handlePauseSession,
    handleResumeSession,
    handleContinueSession,
    handleAddExtraTime,
    handleTransferPlayer,
    handleViewPlayerProfile,
    handleAddPlayerToSession,
    handleLeaveFlexiblePlayer,
    handleEndSession,
    handleCancelSession,
    handleDeleteSession,
    handleBulkDeleteSessions,
    handleStartRandomSessionFromStation,
    handleInviteFromStation,
  } = d;

  return (
    <>
        {!isVerified && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Your zone is pending verification. You can browse the dashboard, but
            create and session actions are disabled until verification is
            complete.
          </div>
        )}

        {isVerified && Number(creditBalance || 0) <= 0 && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
            Your zone is verified, but session actions are paused until credits
            are added.
          </div>
        )}

        {/* Content View */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8 flex-1">
          {activeTab === "overview" && (
            <OverviewPage
              zoneInfo={zoneInfo}
              targetProfile={targetProfile}
              games={games}
              stations={stations}
              creditBalance={creditBalance}
              activeStations={activeStations}
              occupiedStations={occupiedStations}
              availabilityRate={availabilityRate}
              onAddGame={() => openModal("game")}
              onAddStation={() => {
                if (!canManage)
                  return showToast("Verify lounge first", "warning");
                if (!games.length)
                  return showToast("Create a game first", "warning");
                openModal("station");
              }}
              isVerified={isVerified}
              canManage={canManage}
              onRefresh={() => {
                initialLoadDoneRef.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "games" && (
            <GamesPage
              games={games}
              stations={stations}
              onAddGame={() => openModal("game")}
              onEditGame={(game) => openModal("game", game)}
              onDeleteGame={handleDeleteGame}
              isLocked={!canManage}
              onRefresh={() => {
                initialLoadDoneRef.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "sessions" && (
            <SessionsPage
              sessions={sessions}
              focusSessionId={focusSessionId}
              onClearSessionFocus={() => setFocusSessionId(null)}
              onAddSession={() => openModal("session")}
              onStartSession={handleStartSession}
              onPauseSession={handlePauseSession}
              onResumeSession={handleResumeSession}
              onContinueSession={handleContinueSession}
              onAddExtraTime={handleAddExtraTime}
              onEndSession={handleEndSession}
              onCancelSession={handleCancelSession}
              onDeleteSession={handleDeleteSession}
              onBulkDeleteSessions={handleBulkDeleteSessions}
              onTransferPlayer={handleTransferPlayer}
              onViewPlayerProfile={handleViewPlayerProfile}
              onAddPlayerToSession={handleAddPlayerToSession}
              onLeaveFlexiblePlayer={handleLeaveFlexiblePlayer}
              transferReminder={transferReminder}
              canManageSessions={isVerified}
              sessionLockMessage={sessionLockMessage}
              onRefresh={() => {
                initialLoadDoneRef.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "stations" && (
            <StationsPage
              stations={stations}
              games={games}
              gameDetails={gameDetails}
              sessions={sessions}
              isVerified={isVerified}
              canManageSessions={isVerified}
              canAssignRandomSession={canCreateRandomSession}
              onStartRandomSession={handleStartRandomSessionFromStation}
              onInviteStation={handleInviteFromStation}
              onManageRule={(station) => openModal("detail", station)}
              onEditStation={(station) => {
                if (!canManage)
                  return showToast("Verify lounge first", "warning");
                setNewStation({
                  game_id: String(station.gameId ?? station.game_id ?? ""),
                  station_name: station.station_name || "",
                  status: station.status || "Available",
                });
                openModal("station", station);
              }}
              onDeleteStation={handleDeleteStation}
              onAddStation={() => {
                if (!canManage)
                  return showToast("Verify lounge first", "warning");
                if (!games.length)
                  return showToast("Create a game first", "warning");
                setNewStation({
                  game_id: "",
                  station_name: "",
                  status: "Available",
                });
                openModal("station");
              }}
              onRefresh={() => {
                initialLoadDoneRef.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "profile" && (
            <ProfilePage
              zoneInfo={zoneInfo}
              targetProfile={targetProfile}
              isVerified={isVerified}
              creditBalance={creditBalance}
              onSaveProfile={handleSaveProfile}
              onRefresh={() => {
                initialLoadDoneRef.current = false;
                loadData(true);
              }}
              isRefreshing={isRefreshing}
            />
          )}

          <footer className="mt-12 text-center text-[10px] text-slate-600 font-mono border-t border-white/5 pt-6">
            GAMEON LOUNGE CONTROLLER • 2027
          </footer>
        </div>
    </>
  );
}
