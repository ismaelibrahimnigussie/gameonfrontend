import SessionAPI from '../../../../api/modules/sessions.api';
import { sameId, sessionKey } from './sessionRules';

export function createSessionLifecycleActions(kit) {
  const {
    requireVerified,
    verifiedZoneSession,
    applyZoneSession,
    confirmed,
    toastWork,
    setSessions,
    setModal,
    showToast,
  } = kit;

  const handleStartSession = verifiedZoneSession(
    SessionAPI.startZoneSession,
    'Session started',
    'Failed to start session'
  );
  const handlePauseSession = verifiedZoneSession(
    SessionAPI.pauseZoneSession,
    'Session paused',
    'Failed to pause session'
  );
  const handleResumeSession = verifiedZoneSession(
    SessionAPI.resumeZoneSession,
    'Session continued',
    'Failed to continue session'
  );
  const handleAddExtraTime = verifiedZoneSession(
    SessionAPI.addExtraTimeZoneSession,
    'Extra time added',
    'Failed to add extra time',
    { rethrow: true }
  );

  const handleContinueSession = async (sessionId, roundResults = []) => {
    if (!requireVerified()) return;
    await applyZoneSession(
      () => SessionAPI.continueZoneSession(sessionId, { round_results: roundResults }),
      { successMessage: 'Round advanced', errorMessage: 'Failed to advance round', rethrow: true }
    );
  };

  const handleCancelSession = (sessionId) => confirmed(
    'Cancel this session?',
    () => applyZoneSession(
      () => SessionAPI.cancelZoneSession(sessionId),
      { successMessage: 'Session cancelled', errorMessage: 'Failed to cancel session' }
    )
  );

  const handleDeleteSession = (sessionId) => confirmed(
    'Delete this session permanently?',
    () => toastWork(async () => {
      await SessionAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((session) => !sameId(sessionKey(session), sessionId)));
      setModal((prev) => (
        prev.type === 'session' && sameId(sessionKey(prev.data), sessionId)
          ? { type: null, data: null }
          : prev
      ));
      showToast('Session deleted');
    }, 'Failed to delete session')
  );

  const handleBulkDeleteSessions = (sessionIds) => {
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) return undefined;
    const selected = new Set(sessionIds);
    return confirmed(
      `Delete ${sessionIds.length} selected session(s)?`,
      () => toastWork(async () => {
        await SessionAPI.bulkDeleteSessions(sessionIds);
        setSessions((prev) => prev.filter((session) => !selected.has(String(sessionKey(session)))));
        showToast(`${sessionIds.length} session(s) deleted`);
      }, 'Failed to delete selected sessions')
    );
  };

  return {
    handleStartSession,
    handlePauseSession,
    handleResumeSession,
    handleContinueSession,
    handleAddExtraTime,
    handleCancelSession,
    handleDeleteSession,
    handleBulkDeleteSessions,
  };
}
