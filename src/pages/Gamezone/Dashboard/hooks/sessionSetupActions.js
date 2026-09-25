import SessionAPI from '../../../../api/modules/sessions.api';
import { unwrapData } from '../../../../lib/http';
import {
  OCCUPIED_STATION_MESSAGE,
  beforeGamePaymentError,
  blankSessionDraft,
  createSessionPayload,
  defaultPlayerName,
  detailForStation,
  draftStationId,
  findDetail,
  inviteCode,
  isStationOccupied,
  playerCountFor,
  stationNameOf,
  unfinishedPlayerMessage,
} from './sessionRules';

export function createSessionSetupActions(kit) {
  const {
    setFormError,
    newSession,
    gameDetails,
    manualPlayerCandidates,
    stations,
    sessions,
    selectedSessionDetail,
    zoneId,
    setNewSession,
    setModal,
    getDefaultPlayerCount,
    showToast,
    requireVerified,
    requireRandomSessionCredits,
    warn,
    runFormSubmit,
    rememberCreatedSession,
  } = kit;

  const handleCreateSession = async (overrideData = null) => {
    const draft = overrideData || newSession;
    if (!requireVerified()) return;

    if (!draft.assign_random_player) {
      const detail = draft.detail_id ? findDetail(gameDetails, draft.detail_id) : null;
      const stationId = draft.station_id || detail?.station_id;
      if (!stationId) return setFormError('Select a station to generate an invite QR');
      setFormError('');
      setModal({
        type: 'session',
        data: {
          invite_only: true,
          detail_id: draft.detail_id,
          station_id: stationId,
          station_name: stationNameOf(stations, stationId),
          invite_code: inviteCode(stationId),
        },
      });
      showToast('Invite QR ready. Share it with the player.');
      return;
    }

    if (!requireRandomSessionCredits()) return;
    if (!draft.detail_id) return setFormError('Select a game rule first');
    const unfinished = unfinishedPlayerMessage(manualPlayerCandidates, draft.player_id);
    if (unfinished) return setFormError(unfinished);

    const listed = findDetail(gameDetails, draft.detail_id);
    const detail = listed || selectedSessionDetail;
    const playerCount = playerCountFor(detail, draft.player_count);
    const paymentError = beforeGamePaymentError(draft, Number(detail?.main_price || 0));
    if (paymentError) return setFormError(paymentError);

    const stationId = draftStationId(draft, listed, selectedSessionDetail);
    if (stationId !== null && !Number.isNaN(stationId) && isStationOccupied(sessions, stationId)) {
      return setFormError(OCCUPIED_STATION_MESSAGE);
    }

    setFormError('');
    await runFormSubmit(async () => {
      rememberCreatedSession(unwrapData(await SessionAPI.createZoneSession(
        createSessionPayload(draft, { playerCount, stationId, zoneId })
      )));
      showToast('Play session created successfully');
    }, 'Failed to create session');
  };

  const handleStartRandomSessionFromStation = (station) => {
    if (!requireVerified()) return;
    if (!requireRandomSessionCredits()) return;
    if (!station?.id) return;
    if (isStationOccupied(sessions, station.id)) return warn(OCCUPIED_STATION_MESSAGE);

    const chosenDetail = detailForStation(gameDetails, station);
    if (!chosenDetail) return warn('Add a game detail for this station first');
    const playerCount = getDefaultPlayerCount(chosenDetail);
    setNewSession(blankSessionDraft({
      detail_id: String(chosenDetail.id),
      station_id: String(station.id),
      player_count: playerCount,
      player_nicknames: Array.from({ length: playerCount }, (_, index) => defaultPlayerName(index)),
    }));
    setModal({
      type: 'session',
      data: {
        detail_id: chosenDetail.id,
        station_id: station.id,
        station_name: station.station_name,
        invite_code: inviteCode(station.id),
      },
    });
  };

  const handleInviteFromStation = (station) => {
    if (!requireVerified() || !station?.id) return;
    setNewSession(blankSessionDraft({
      station_id: station.id,
      assign_random_player: false,
    }));
    setModal({
      type: 'session',
      data: {
        invite_only: true,
        station_id: station.id,
        station_name: station.station_name,
        invite_code: inviteCode(station.id),
      },
    });
  };

  return {
    handleCreateSession,
    handleStartRandomSessionFromStation,
    handleInviteFromStation,
  };
}
