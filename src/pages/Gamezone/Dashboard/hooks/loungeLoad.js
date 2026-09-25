import CreditAPI from '../../../../api/modules/credits.api';
import GameAPI from '../../../../api/modules/games.api';
import GameDetailsAPI from '../../../../api/modules/gameDetails.api';
import GameZoneAPI from '../../../../api/modules/gamezones.api';
import SessionAPI from '../../../../api/modules/sessions.api';
import StationAPI from '../../../../api/modules/stations.api';

function readBalance(payload) {
  return (
    payload?.data?.balance ??
    payload?.data?.credit_balance ??
    payload?.balance ??
    payload?.credit_balance ??
    0
  );
}

function flattenStations(gamesData, stationResults) {
  return stationResults.flatMap((result) => {
    const game = gamesData.find((item) => item.id === result.gameId);
    return (result.data || []).map((station) => ({
      ...station,
      gameName: game?.game_name || 'Unknown',
      gameId: result.gameId,
    }));
  });
}

export async function fetchLoungeCore(zoneId) {
  const [zoneRes, gamesRes, creditRes, detailsRes, sessionsRes] = await Promise.all([
    GameZoneAPI.getZoneById(zoneId),
    GameAPI.getGamesByZone(zoneId),
    CreditAPI.getZoneBalance(zoneId).catch(() => ({ balance: 0 })),
    GameDetailsAPI.getAll().catch(() => ({ data: [] })),
    SessionAPI.getZoneSessions().catch(() => ({ data: [] })),
  ]);

  return {
    zoneInfo: zoneRes?.data?.data ?? zoneRes?.data?.zone ?? zoneRes?.data ?? zoneRes?.zone ?? zoneRes,
    games: gamesRes?.games ?? gamesRes?.data ?? gamesRes ?? [],
    creditBalance: readBalance(creditRes),
    gameDetails: detailsRes?.data ?? detailsRes ?? [],
    sessions: sessionsRes?.data ?? sessionsRes ?? [],
  };
}

export async function fetchGameStations(gamesData) {
  const stationResults = await Promise.all(
    gamesData.filter((game) => game.id).map((game) => (
      StationAPI.getStationsByGame(game.id)
        .then((res) => ({ gameId: game.id, data: res?.stations ?? res?.data ?? res ?? [] }))
        .catch(() => ({ gameId: game.id, data: [] }))
    ))
  );

  return flattenStations(gamesData, stationResults);
}

function paidSessionPatch(updatedSession) {
  const systemPaid = Number(updatedSession.system_paid_amount ?? updatedSession.systemPaidAmount ?? updatedSession.credits_used ?? 0);
  const userPaid = Number(updatedSession.user_paid_amount ?? updatedSession.userPaidAmount ?? 0);
  const totalPaid = Number(updatedSession.total_paid_amount ?? updatedSession.totalPrice ?? userPaid + systemPaid);
  return {
    user_paid_amount: userPaid,
    system_paid_amount: systemPaid,
    total_paid_amount: totalPaid,
  };
}

export function mergeSessionList(sessions, updatedSession) {
  const sessionKey = updatedSession.play_id ?? updatedSession.id;
  const paid = paidSessionPatch(updatedSession);
  return sessions.map((session) => {
    const currentKey = session.play_id ?? session.id;
    if (String(currentKey) === String(sessionKey)) {
      return { ...session, ...updatedSession, ...paid };
    }
    return session;
  });
}

export function mergeSessionModal(prev, updatedSession) {
  if (prev.type !== 'session') return prev;
  const sessionKey = updatedSession.play_id ?? updatedSession.id;
  const modalKey = prev.data?.play_id ?? prev.data?.id;
  if (String(modalKey) !== String(sessionKey)) return prev;
  return {
    ...prev,
    data: {
      ...prev.data,
      ...updatedSession,
      ...paidSessionPatch(updatedSession),
    },
  };
}
