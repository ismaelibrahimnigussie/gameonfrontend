export function emptyGameForm() {
  return {
    game_name: '',
    description: '',
    game_type: '',
    max_players: '',
  };
}

export function emptyDetailForm() {
  return {
    game_id: '',
    station_id: '',
    game_rule: '',
    duration_minutes: '30',
    extra_time_minutes: '15',
    main_price: '',
    extra_price: '',
  };
}

export function emptyStationForm() {
  return {
    game_id: '',
    station_name: '',
    status: 'Available',
  };
}

export function emptySessionForm() {
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
  };
}

export function logoutSessionForm() {
  return {
    detail_id: '',
    station_id: '',
    player_id: '',
    player_count: 2,
    player_nicknames: [],
    assign_random_player: true,
    mode: 'strict',
  };
}

export function resolveZoneId(targetProfile) {
  if (!targetProfile) return null;
  const ids = [
    targetProfile?.zone?.id, targetProfile?.zone?.zone_id,
    targetProfile?.zone_id, targetProfile?.id,
    targetProfile?.data?.zone_id, targetProfile?.data?.id,
    targetProfile?.zoneId, targetProfile?.zoneID,
    targetProfile?._id,
  ];
  return ids.find((id) => id !== null && id !== undefined && id !== '') || null;
}

function recordVerified(data) {
  if (!data) return false;
  const verified = data?.is_verified ?? data?.verified ?? data?.isVerified;
  if (verified === true || verified === 1 || verified === '1' || verified === 'true') return true;
  const by = data?.verified_by ?? data?.verifiedBy;
  return by !== null && by !== undefined && by !== '' && by !== '0';
}

export function loungeVerified(zoneInfo, targetProfile) {
  return recordVerified(zoneInfo) || recordVerified(targetProfile);
}

export function stationSnapshot(stations) {
  const activeStations = stations.filter((station) => (
    ['active', 'available'].includes(String(station.status || '').toLowerCase())
  )).length;
  const occupiedStations = stations.filter((station) => (
    String(station.status || '').toLowerCase() === 'occupied'
  )).length;
  const availabilityRate = stations.length > 0
    ? Math.round((activeStations / stations.length) * 100)
    : 0;
  return { activeStations, occupiedStations, availabilityRate };
}

export function openPlayerHistory(history, playerHistoryFilter) {
  const rows = Array.isArray(history) ? history : [];
  if (playerHistoryFilter === 'all') return rows;
  return rows.filter((session) => {
    const status = String(session.status || '').toLowerCase();
    const isUnended = !['finished', 'cancelled'].includes(status);
    const isUnpaid = String(session.payment_status || '').toLowerCase() !== 'paid';
    return isUnended || isUnpaid;
  });
}

export function editingGame(modal) {
  return modal.type === 'game' && Boolean(modal.data?.id);
}

export function editingDetail(modal) {
  return modal.type === 'detail' && Boolean(
    modal.data && (
      modal.data.detail_id ||
      (
        modal.data.id && (
          modal.data.station_id !== undefined ||
          modal.data.game_rule !== undefined ||
          modal.data.duration_minutes !== undefined ||
          modal.data.extra_time_minutes !== undefined ||
          modal.data.main_price !== undefined ||
          modal.data.extra_price !== undefined
        )
      )
    )
  );
}

export function stationDetailContext(modal) {
  return modal.type === 'detail' && Boolean(modal.data?.station_name);
}

export function sessionPlan(gameDetails, newSession) {
  const sessionPriceDetail = gameDetails.find((detail) => String(detail.id) === String(newSession.detail_id));
  const plannedRoundPrice = Number(sessionPriceDetail?.main_price || 0);
  const plannedPlayerCount = newSession.assign_random_player
    ? Math.max(Number(newSession.player_count || 1), 1)
    : (newSession.player_id ? 1 : 0);
  const plannedUpfrontTotal = plannedRoundPrice * Math.max(Number(newSession.planned_rounds || 1), 1) * plannedPlayerCount;
  return { sessionPriceDetail, plannedRoundPrice, plannedPlayerCount, plannedUpfrontTotal };
}

function filledGameForm(data) {
  return {
    game_name: data.game_name || '',
    description: data.description || '',
    game_type: data.game_type || '',
    max_players: data.max_players ?? '',
  };
}

function isDetailStationContext(data) {
  return Boolean(
    data?.station_name &&
    data?.game_rule === undefined &&
    data?.duration_minutes === undefined &&
    data?.extra_time_minutes === undefined &&
    data?.main_price === undefined &&
    data?.extra_price === undefined
  );
}

function detailModalPlan(type, data, gameDetails) {
  if (isDetailStationContext(data)) {
    const stationId = String(data.id ?? data.station_id ?? '');
    const existingDetail = gameDetails.find((detail) => String(detail.station_id) === stationId) || null;

    if (existingDetail) {
      return {
        newDetail: {
          game_id: String(existingDetail.game_id ?? data.game_id ?? data.gameId ?? ''),
          station_id: String(existingDetail.station_id ?? stationId),
          game_rule: existingDetail.game_rule || '',
          duration_minutes: existingDetail.duration_minutes ?? '30',
          extra_time_minutes: existingDetail.extra_time_minutes ?? '15',
          main_price: existingDetail.main_price ?? '',
          extra_price: existingDetail.extra_price ?? '',
        },
        modal: {
          type,
          data: {
            ...existingDetail,
            station_name: data.station_name || existingDetail.station_name || 'Station',
          },
        },
      };
    }

    return {
      newDetail: {
        game_id: String(data.game_id ?? data.gameId ?? ''),
        station_id: stationId,
        game_rule: '',
        duration_minutes: '30',
        extra_time_minutes: '15',
        main_price: '',
        extra_price: '',
      },
      modal: {
        type,
        data: {
          station_id: stationId,
          station_name: data.station_name || 'Station',
          game_id: data.game_id ?? data.gameId ?? '',
        },
      },
    };
  }

  return {
    newDetail: data?.id
      ? {
          game_id: data.game_id ?? '',
          station_id: data.station_id ?? '',
          game_rule: data.game_rule || '',
          duration_minutes: data.duration_minutes ?? '30',
          extra_time_minutes: data.extra_time_minutes ?? '15',
          main_price: data.main_price ?? '',
          extra_price: data.extra_price ?? '',
        }
      : {
          game_id: data?.id ?? '',
          station_id: '',
          game_rule: '',
          duration_minutes: '30',
          extra_time_minutes: '15',
          main_price: '',
          extra_price: '',
        },
    modal: { type, data },
  };
}

function sessionModalDraft(data, gameDetails) {
  const lockedDetailId = data?.detail_id ? String(data.detail_id) : '';
  const lockedStationId = data?.station_id ? String(data.station_id) : '';
  const defaultPlayerCount = Math.max(Number(data?.player_count || 2), 1);
  const draft = {
    detail_id: lockedDetailId,
    station_id: lockedStationId,
    player_id: '',
    player_count: defaultPlayerCount,
    player_nicknames: Array.from({ length: defaultPlayerCount }, (_, index) => `Player ${index + 1}`),
    assign_random_player: true,
    mode: 'strict',
    payment_timing: 'After Game',
    planned_rounds: 1,
    payment_method: 'Cash',
    payment_provider: '',
    transaction_reference: '',
    sender_name: '',
    notes: '',
  };

  if (lockedDetailId) {
    const matchingDetail = gameDetails.find((detail) => String(detail.id) === String(lockedDetailId));
    if (matchingDetail?.station_id) {
      draft.station_id = draft.station_id || String(matchingDetail.station_id);
      draft.detail_id = String(matchingDetail.id);
    }
  }

  return draft;
}

export function modalOpenPlan(type, data, { isVerified, gameDetails }) {
  if ((type === 'game' || type === 'detail' || type === 'station') && !isVerified) {
    return { blocked: 'verify' };
  }
  if (type === 'session' && !isVerified) {
    return { blocked: 'session' };
  }

  const plan = { modal: { type, data } };
  if (type === 'game') plan.newGame = data?.id ? filledGameForm(data) : emptyGameForm();
  if (type === 'detail') Object.assign(plan, detailModalPlan(type, data, gameDetails));
  if (type === 'session') plan.newSession = sessionModalDraft(data, gameDetails);
  return plan;
}
