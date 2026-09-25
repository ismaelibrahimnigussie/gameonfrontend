import { createPaymentActions } from './sessionPaymentActions';
import { createPlayerSessionActions } from './sessionPlayerActions';
import { createSessionActionKit } from './sessionActionKit';
import { createSessionLifecycleActions } from './sessionLifecycleActions';
import { createSessionSetupActions } from './sessionSetupActions';
import { useManualSessionPlayers } from './useManualSessionPlayers';

export function useSessionActions(lounge) {
  useManualSessionPlayers(lounge);
  const kit = createSessionActionKit(lounge);
  const setup = createSessionSetupActions(kit);
  const lifecycle = createSessionLifecycleActions(kit);
  const players = createPlayerSessionActions(kit);
  const payment = createPaymentActions(kit);

  return {
    handleCreateSession: setup.handleCreateSession,
    handleStartSession: lifecycle.handleStartSession,
    handlePauseSession: lifecycle.handlePauseSession,
    handleResumeSession: lifecycle.handleResumeSession,
    handleContinueSession: lifecycle.handleContinueSession,
    handleAddExtraTime: lifecycle.handleAddExtraTime,
    handleTransferPlayer: players.handleTransferPlayer,
    handleViewPlayerProfile: players.handleViewPlayerProfile,
    handleAddPlayerToSession: players.handleAddPlayerToSession,
    confirmAddPlayerToSession: players.confirmAddPlayerToSession,
    handleLeaveFlexiblePlayer: players.handleLeaveFlexiblePlayer,
    confirmTransferPlayer: players.confirmTransferPlayer,
    handleEndSession: payment.handleEndSession,
    handlePayPlayerRounds: payment.handlePayPlayerRounds,
    proceedToPlayerPayment: payment.proceedToPlayerPayment,
    confirmEndSessionPayment: payment.confirmEndSessionPayment,
    handleCancelSession: lifecycle.handleCancelSession,
    handleDeleteSession: lifecycle.handleDeleteSession,
    handleBulkDeleteSessions: lifecycle.handleBulkDeleteSessions,
    handleStartRandomSessionFromStation: setup.handleStartRandomSessionFromStation,
    handleInviteFromStation: setup.handleInviteFromStation,
  };
}
