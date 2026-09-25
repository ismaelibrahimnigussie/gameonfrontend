import StationAPI from '../../../../api/modules/stations.api';
import { getApiErrorMessage, unwrapData } from '../../../../lib/http';
import {
  RANDOM_SESSION_CREDIT_MESSAGE,
  VERIFY_MESSAGE,
  blankSessionDraft,
  firstPlayerValue,
  replacementPlayers,
  sameId,
  sessionKey,
} from './sessionRules';

export function createSessionActionKit(lounge) {
  const {
    setActiveTab,
    stations,
    gameDetails,
    sessions,
    setSessions,
    modal,
    setModal,
    setIsSubmitting,
    setFormError,
    newSession,
    setNewSession,
    setFocusSessionId,
    setTransferReminder,
    setTransferCandidates,
    setTransferLoading,
    setSessionPlayerCandidates,
    setSessionPlayerLoading,
    manualPlayerCandidates,
    setPlayerProfileLoading,
    setPlayerHistoryFilter,
    zoneId,
    selectedSessionDetail,
    getDefaultPlayerCount,
    isVerified,
    canCreateRandomSession,
    showToast,
    updateSessionState,
    loadData,
    closeModal,
  } = lounge;

  const warn = (message) => {
    showToast(message, 'warning');
    return false;
  };

  const requireVerified = () => isVerified || warn(VERIFY_MESSAGE);
  const requireRandomSessionCredits = () => canCreateRandomSession || warn(RANDOM_SESSION_CREDIT_MESSAGE);

  const patchModalData = (patch) => {
    setModal((prev) => ({ ...prev, data: { ...prev.data, ...patch } }));
  };

  const applyZoneSession = async (request, { successMessage, errorMessage, rethrow = false }) => {
    try {
      updateSessionState(unwrapData(await request()));
      showToast(successMessage);
    } catch (err) {
      showToast(getApiErrorMessage(err, errorMessage), 'error');
      if (rethrow) throw err;
    }
  };

  const runFormSubmit = async (work, errorMessage) => {
    setIsSubmitting(true);
    try {
      await work();
    } catch (err) {
      setFormError(getApiErrorMessage(err, errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toastWork = async (work, errorMessage) => {
    try {
      await work();
    } catch (err) {
      showToast(getApiErrorMessage(err, errorMessage), 'error');
    }
  };

  const confirmed = async (message, work) => {
    if (!requireVerified()) return;
    if (!window.confirm(message)) return;
    await work();
  };

  const verifiedZoneSession = (apiFn, successMessage, errorMessage, options = {}) => async (sessionId) => {
    if (!requireVerified()) return;
    await applyZoneSession(() => apiFn(sessionId), { successMessage, errorMessage, ...options });
  };

  const openPlayerPicker = async ({
    type,
    data,
    setCandidates,
    setLoading,
    stationId,
    playId,
    filter,
    field,
    errorMessage,
  }) => {
    setFormError('');
    setCandidates([]);
    setLoading(true);
    setModal({ type, data });
    try {
      const filtered = filter(replacementPlayers(await StationAPI.getReplacementPlayers(stationId, playId)));
      setCandidates(filtered);
      patchModalData({ [field]: firstPlayerValue(filtered) });
    } catch (error) {
      setFormError(getApiErrorMessage(error, errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const rememberCreatedSession = (created) => {
    const playId = created?.play_id ?? created?.id;
    setSessions((prev) => [
      { ...created },
      ...prev.filter((session) => !sameId(sessionKey(session), playId)),
    ]);
    setFocusSessionId(playId ? String(playId) : null);
    setActiveTab('sessions');
    setModal({ type: null, data: null });
    setNewSession(blankSessionDraft());
  };

  return {
    setActiveTab,
    stations,
    gameDetails,
    sessions,
    setSessions,
    modal,
    setModal,
    setFormError,
    newSession,
    setNewSession,
    setFocusSessionId,
    setTransferReminder,
    setTransferCandidates,
    setTransferLoading,
    setSessionPlayerCandidates,
    setSessionPlayerLoading,
    manualPlayerCandidates,
    setPlayerProfileLoading,
    setPlayerHistoryFilter,
    zoneId,
    selectedSessionDetail,
    getDefaultPlayerCount,
    showToast,
    updateSessionState,
    loadData,
    closeModal,
    patchModalData,
    warn,
    requireVerified,
    requireRandomSessionCredits,
    applyZoneSession,
    runFormSubmit,
    toastWork,
    confirmed,
    verifiedZoneSession,
    openPlayerPicker,
    rememberCreatedSession,
  };
}
