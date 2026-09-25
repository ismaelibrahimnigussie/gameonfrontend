import PlayersAPI from '../../../../api/modules/players.api';
import SessionAPI from '../../../../api/modules/sessions.api';
import StationAPI from '../../../../api/modules/stations.api';
import { getApiErrorMessage, unwrapData } from '../../../../lib/http';
import {
  buildTransferReminder,
  numericIds,
  profileRoster,
  sessionKey,
  stationIdOf,
  stationNameOf,
  sameId,
} from './sessionRules';

export function createPlayerSessionActions(kit) {
  const {
    stations,
    sessions,
    modal,
    setModal,
    setFormError,
    setActiveTab,
    setFocusSessionId,
    setTransferReminder,
    setTransferCandidates,
    setTransferLoading,
    setSessionPlayerCandidates,
    setSessionPlayerLoading,
    setPlayerProfileLoading,
    setPlayerHistoryFilter,
    showToast,
    updateSessionState,
    loadData,
    patchModalData,
    warn,
    openPlayerPicker,
    runFormSubmit,
    applyZoneSession,
  } = kit;

  const handleTransferPlayer = async (session, player) => {
    if (!session || !player) return;
    const currentStationId = stationIdOf(session);
    const nextStation = stations.find((station) => !sameId(station.id, currentStationId));
    const nextStationId = nextStation?.id ? String(nextStation.id) : '';
    if (!nextStationId) return warn('No alternate station is available for this player');

    await openPlayerPicker({
      type: 'transfer-player',
      data: { session, player, target_station_id: nextStationId, replacement_player_id: '' },
      setCandidates: setTransferCandidates,
      setLoading: setTransferLoading,
      stationId: currentStationId || nextStationId,
      playId: sessionKey(session),
      filter: (candidates) => candidates.filter((candidate) => !sameId(candidate.player_id, player.player_id)),
      field: 'replacement_player_id',
      errorMessage: 'Failed to load replacement players',
    });
  };

  const handleViewPlayerProfile = async (player, profilePlayers = []) => {
    const playerId = Number(player?.player_id);
    if (!Number.isFinite(playerId) || playerId <= 0) return warn('This player has no profile history yet');

    const queuedPayments = modal.data?.payment_entries || [];
    setFormError('');
    setPlayerProfileLoading(true);
    setPlayerHistoryFilter('open');
    setModal({
      type: 'player-profile',
      data: {
        player,
        profilePlayers: profileRoster(sessions, profilePlayers, player),
        payment_entries: queuedPayments,
        payment_mode: queuedPayments.length ? 'multiple' : 'single',
        stats: null,
        history: [],
      },
    });

    try {
      const [statsResponse, historyResponse] = await Promise.all([
        PlayersAPI.getStats(playerId),
        PlayersAPI.getHistory(playerId),
      ]);
      patchModalData({
        stats: unwrapData(statsResponse),
        history: unwrapData(historyResponse) ?? [],
      });
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to load player profile'));
    } finally {
      setPlayerProfileLoading(false);
    }
  };

  const handleAddPlayerToSession = async (session) => {
    if (!session) return;
    const stationId = stationIdOf(session);
    if (!stationId) return warn('Station not found for this session');
    const taken = new Set(numericIds(session.player_ids));

    await openPlayerPicker({
      type: 'session-add-player',
      data: { session, player_id: '' },
      setCandidates: setSessionPlayerCandidates,
      setLoading: setSessionPlayerLoading,
      stationId,
      playId: sessionKey(session),
      filter: (candidates) => candidates.filter((candidate) => (
        !candidate.has_unfinished_session && !taken.has(Number(candidate.player_id))
      )),
      field: 'player_id',
      errorMessage: 'Failed to load available players',
    });
  };

  const confirmAddPlayerToSession = async () => {
    const addSession = modal.data?.session;
    const playerId = modal.data?.player_id;
    if (!addSession) return setFormError('Select a session first');
    if (!playerId) return setFormError('Select a player');

    await runFormSubmit(async () => {
      updateSessionState(unwrapData(await SessionAPI.addZonePlayerToSession(sessionKey(addSession), {
        player_id: Number(playerId),
      })));
      setModal({ type: null, data: null });
      setSessionPlayerCandidates([]);
      showToast('Player added to the waiting session');
    }, 'Failed to add player to session');
  };

  const handleLeaveFlexiblePlayer = async (session, player) => {
    const playId = sessionKey(session);
    if (!playId || !player?.player_id) return;
    await applyZoneSession(
      () => SessionAPI.leaveZonePlayerFromSession(playId, { player_id: Number(player.player_id) }),
      { successMessage: 'Player left the session', errorMessage: 'Failed to remove player' }
    );
  };

  const confirmTransferPlayer = async () => {
    const transferSession = modal.data?.session;
    const transferPlayer = modal.data?.player;
    const targetStationId = modal.data?.target_station_id;
    const replacementPlayerId = modal.data?.replacement_player_id;
    const problem = [
      [!transferSession || !transferPlayer, 'Select a player to transfer'],
      [!targetStationId, 'Select a destination station'],
      [!replacementPlayerId, 'Select a replacement player'],
    ].find(([failed]) => failed)?.[1];
    if (problem) return setFormError(problem);

    await runFormSubmit(async () => {
      const updatedPlayer = unwrapData(await StationAPI.transferPlayer(targetStationId, {
        player_id: Number(transferPlayer.player_id),
        session_id: Number(sessionKey(transferSession)),
        replacement_player_id: Number(replacementPlayerId),
      }));
      const pendingSessionId = sessionKey(updatedPlayer?.pending_session) || null;
      const targetStationName = stationNameOf(stations, targetStationId, 'the selected station');
      setTransferReminder(buildTransferReminder({
        pendingSessionId,
        transferSession,
        targetStationName,
        transferPlayer,
        replacementPlayerId,
      }));
      setModal({ type: null, data: null });
      setTransferCandidates([]);
      await loadData(true);
      if (pendingSessionId) {
        setActiveTab('sessions');
        setFocusSessionId(String(pendingSessionId));
      }
      showToast(`${updatedPlayer?.nickname || transferPlayer.nickname || 'Player'} moved to ${targetStationName}`);
    }, 'Failed to transfer player');
  };

  return {
    handleTransferPlayer,
    handleViewPlayerProfile,
    handleAddPlayerToSession,
    confirmAddPlayerToSession,
    handleLeaveFlexiblePlayer,
    confirmTransferPlayer,
  };
}
