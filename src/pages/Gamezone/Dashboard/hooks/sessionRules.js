const ACTIVE_SESSION_STATUSES = ['waiting', 'playing', 'paused'];
const BEFORE_GAME_METHODS = ['Cash', 'Mobile Banking'];

export const VERIFY_MESSAGE = 'Please verify your lounge first';
export const RANDOM_SESSION_CREDIT_MESSAGE = 'Add credits before creating a random-player session';
export const OCCUPIED_STATION_MESSAGE = 'This station is occupied. Finish or cancel the current session first.';

export function sessionKey(record) {
  return record?.play_id || record?.id;
}

export function sameId(left, right) {
  return String(left) === String(right);
}

export function stationIdOf(record) {
  return record?.station_id ?? record?.stationId ?? null;
}

export function inviteCode(stationId) {
  return stationId ? `STATION-${stationId}` : '';
}

export function defaultPlayerName(index) {
  return `Player ${index + 1}`;
}

export function stationNameOf(stations, stationId, fallback = 'Station') {
  return stations.find((station) => sameId(station.id, stationId))?.station_name || fallback;
}

export function findDetail(gameDetails, detailId) {
  if (!detailId) return null;
  return gameDetails.find((detail) => sameId(detail.id, detailId)) || null;
}

export function detailForStation(gameDetails, station) {
  const gameId = station.game_id ?? station.gameId;
  return gameDetails.find((detail) => sameId(detail.station_id, station.id))
    || gameDetails.find((detail) => sameId(detail.game_id, gameId))
    || null;
}

export function isStationOccupied(sessionList, stationId) {
  return sessionList.some((session) => (
    ACTIVE_SESSION_STATUSES.includes(String(session.status || '').toLowerCase())
    && sameId(session.station_id ?? session.stationId, stationId)
  ));
}

export function replacementPlayers(payload) {
  const candidates = payload?.data?.players ?? payload?.players ?? payload?.data ?? payload ?? [];
  return Array.isArray(candidates) ? candidates : [];
}

export function firstPlayerValue(candidates) {
  return candidates[0]?.player_id ? String(candidates[0].player_id) : '';
}

export function blankSessionDraft(overrides = {}) {
  return {
    detail_id: '',
    station_id: '',
    player_id: '',
    player_count: 2,
    player_nicknames: [],
    assign_random_player: true,
    mode: 'strict',
    payment_timing: 'After Game',
    planned_rounds: 1,
    payment_method: 'Cash',
    payment_provider: '',
    transaction_reference: '',
    sender_name: '',
    notes: '',
    ...overrides,
  };
}

export function playerCountFor(detail, requested) {
  const cap = Math.max(Number(detail?.max_players || detail?.maxPlayers || requested || 2), 1);
  return Math.max(Number(requested || cap || 2), 1);
}

function customNicknames(names, playerCount) {
  if (!Array.isArray(names)) return [];
  return names.slice(0, playerCount).flatMap((name, index) => {
    const trimmed = String(name || '').trim();
    return trimmed && trimmed !== defaultPlayerName(index) ? [trimmed] : [];
  });
}

export function draftStationId(draft, listedDetail, selectedDetail) {
  if (draft.station_id) return Number(draft.station_id);
  if (!draft.detail_id) return null;
  return Number(listedDetail?.station_id || selectedDetail?.station_id);
}

export function unfinishedPlayerMessage(candidates, playerId) {
  if (!playerId) return '';
  const selected = candidates.find((candidate) => sameId(candidate.player_id, playerId));
  if (!selected?.has_unfinished_session) return '';
  const name = selected.nickname || selected.username || 'This player';
  return `${name} is already in unfinished session #${selected.unfinished_session_id}. Finish or cancel that session first.`;
}

export function beforeGamePaymentError(draft, roundPrice) {
  if ((draft.payment_timing || 'After Game') !== 'Before Game') return '';
  if (!BEFORE_GAME_METHODS.includes(draft.payment_method)) return 'Select a payment method for Before Game payment';
  if (!Number.isFinite(roundPrice) || roundPrice <= 0) return 'This game has no valid round price';
  return '';
}

export function createSessionPayload(draft, { playerCount, stationId, zoneId }) {
  const payload = {
    detail_id: Number(draft.detail_id),
    assign_random_player: draft.assign_random_player ?? true,
    player_count: playerCount,
    mode: draft.mode || 'strict',
    payment_timing: draft.payment_timing || 'After Game',
    planned_rounds: Math.max(Number(draft.planned_rounds || 1), 1),
    payment_method: draft.payment_method,
    payment_provider: draft.payment_provider,
    transaction_reference: draft.transaction_reference,
    sender_name: draft.sender_name,
    notes: draft.notes,
  };
  const nicknames = customNicknames(draft.player_nicknames, playerCount);
  if (nicknames.length > 0) payload.player_nicknames = nicknames;
  if (stationId !== null && !Number.isNaN(stationId)) payload.station_id = stationId;
  if (draft.player_id) payload.player_id = Number(draft.player_id);
  if (zoneId) payload.created_by = Number(zoneId);
  return payload;
}

export function numericIds(value) {
  return String(value || '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function playersFromSession(session) {
  if (Array.isArray(session.players) && session.players.length > 0) return session.players;
  const names = String(session.player_names || '').split(',');
  return String(session.player_ids || '').split(',').flatMap((value, index) => {
    const playerId = Number(value.trim());
    if (!Number.isFinite(playerId) || playerId <= 0) return [];
    return [{ player_id: playerId, nickname: names[index]?.trim() || `Player ${value.trim()}` }];
  });
}

export function profileRoster(sessions, profilePlayers, player) {
  const seen = new Set();
  const roster = [];
  const push = (candidate) => {
    const paymentKey = candidate.payment_key
      || `${sessionKey(candidate.payment_session) || 'profile'}:${candidate.player_id}`;
    if (seen.has(paymentKey)) return;
    seen.add(paymentKey);
    roster.push({
      ...candidate,
      payment_session: candidate.payment_session || player.payment_session || null,
      payment_key: paymentKey,
    });
  };

  profilePlayers.forEach(push);
  sessions.forEach((candidateSession) => {
    playersFromSession(candidateSession).forEach((candidatePlayer) => {
      push({
        ...candidatePlayer,
        payment_session: candidateSession,
        payment_key: `${sessionKey(candidateSession)}:${candidatePlayer.player_id}`,
      });
    });
  });
  return roster;
}

export {
  endSessionPayment,
  paymentRequestBody,
  queueRoundPayment,
  reviewQueuedPayment,
  unpaidRounds,
} from './sessionPaymentRules';

export function buildTransferReminder({
  pendingSessionId,
  transferSession,
  targetStationName,
  transferPlayer,
  replacementPlayerId,
}) {
  return {
    session_id: pendingSessionId ? String(pendingSessionId) : null,
    source_session_id: String(sessionKey(transferSession)),
    source_station_name: transferSession.station_name || 'Unknown station',
    target_station_name: targetStationName,
    moved_player: {
      player_id: transferPlayer.player_id,
      nickname: transferPlayer.nickname || transferPlayer.username || null,
    },
    replacement_player: { player_id: Number(replacementPlayerId) },
  };
}
