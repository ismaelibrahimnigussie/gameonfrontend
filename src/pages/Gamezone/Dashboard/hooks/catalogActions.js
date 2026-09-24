import GameAPI from '../../../../api/modules/games.api';
import GameDetailsAPI from '../../../../api/modules/gameDetails.api';
import StationAPI from '../../../../api/modules/stations.api';

export function createCatalogActions(lounge) {
  const {
    games,
    setGames,
    setStations,
    setGameDetails,
    setSessions,
    modal,
    setModal,
    setIsSubmitting,
    setFormError,
    setNewGame,
    setNewDetail,
    setNewStation,
    setNewSession,
    zoneId,
    isVerified,
    showToast,
    closeModal,
  } = lounge;

  const syncGame = (nextGame) => {
    setGames((prev) =>
      prev.map((game) => (String(game.id) === String(nextGame.id) ? { ...game, ...nextGame } : game))
    );
    setStations((prev) =>
      prev.map((station) =>
        String(station.gameId ?? station.game_id) === String(nextGame.id)
          ? { ...station, gameName: nextGame.game_name ?? station.gameName }
          : station
      )
    );
  };

  const syncDetail = (nextDetail) => {
    setGameDetails((prev) =>
      prev.map((detail) => (String(detail.id) === String(nextDetail.id) ? { ...detail, ...nextDetail } : detail))
    );

    setStations((prev) =>
      prev.map((station) => {
        if (String(station.id) !== String(nextDetail.station_id)) return station;

        return {
          ...station,
          game_rule: nextDetail.game_rule ?? station.game_rule ?? '',
          duration_minutes: nextDetail.duration_minutes ?? station.duration_minutes ?? null,
          extra_time_minutes: nextDetail.extra_time_minutes ?? station.extra_time_minutes ?? null,
          main_price: nextDetail.main_price ?? station.main_price ?? null,
          extra_price: nextDetail.extra_price ?? station.extra_price ?? null,
        };
      })
    );
  };

  const removeGameLocally = (gameId) => {
    setGames((prev) => prev.filter((game) => String(game.id) !== String(gameId)));
    setStations((prev) =>
      prev.filter((station) => String(station.gameId ?? station.game_id) !== String(gameId))
    );
    setGameDetails((prev) =>
      prev.filter((detail) => String(detail.game_id ?? detail.gameId) !== String(gameId))
    );
  };

  const handleCreate = async (type, data, apiFn, successMsg) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await apiFn({ ...data, zone_id: zoneId });
      const created = res?.data ?? res;

      if (type === 'game') {
        setGames((prev) => [...prev, created]);
        setNewGame({ game_name: '', description: '', game_type: '', max_players: '' });
      } else if (type === 'station') {
        const game = games.find((g) => String(g.id) === String(data.game_id));
        setStations((prev) => [
          ...prev,
          { ...created, gameName: game?.game_name || 'Unknown', gameId: data.game_id }
        ]);
        setNewStation({ game_id: '', station_name: '', status: 'Available' });
      } else if (type === 'detail') {
        setGameDetails((prev) => [...prev, created]);

        if (created?.station_id) {
          setStations((prev) =>
            prev.map((station) =>
              String(station.id) === String(created.station_id)
                ? {
                    ...station,
                    game_rule: created.game_rule ?? station.game_rule ?? '',
                    duration_minutes: created.duration_minutes ?? station.duration_minutes ?? null,
                    extra_time_minutes: created.extra_time_minutes ?? station.extra_time_minutes ?? null,
                    main_price: created.main_price ?? station.main_price ?? null,
                    extra_price: created.extra_price ?? station.extra_price ?? null,
                  }
                : station
            )
          );
        }

        setNewDetail({
          game_id: '',
          station_id: '',
          game_rule: '',
          duration_minutes: '30',
          extra_time_minutes: '15',
          main_price: '',
          extra_price: ''
        });
      } else if (type === 'session') {
        setSessions((prev) => [created, ...prev]);
        setNewSession({
          detail_id: '',
          station_id: '',
          player_id: '',
          player_count: 2,
          player_nicknames: [],
          assign_random_player: true,
          mode: 'strict'
        });
        setModal({ type: 'session', data: created });
        setIsSubmitting(false);
        showToast(successMsg);
        return;
      }

      setModal({ type: null, data: null });
      showToast(successMsg);
    } catch (err) {
      const validationErrors = err?.response?.data?.errors
        ?.map((item) => `${item.field}: ${item.message}`)
        .join(', ');
      setFormError(validationErrors || err?.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await GameAPI.delete(gameId);
      removeGameLocally(gameId);
      showToast('Game deleted successfully');
    } catch (err) {
      showToast(err.message || 'Failed to delete game', 'error');
    }
  };

  const handleDeleteStation = async (stationId) => {
    try {
      await StationAPI.delete(stationId);
      setStations((prev) => prev.filter((station) => String(station.id) !== String(stationId)));
      if (modal.type === 'station' && String(modal.data?.id) === String(stationId)) {
        closeModal();
      }
      showToast('Station deleted successfully');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to delete station', 'error');
    }
  };

  const handleUpdateStation = async (stationId, formData) => {
    try {
      const res = await StationAPI.update(stationId, formData);
      const updated = res?.data ?? res;
      const targetGame = games.find((game) => String(game.id) === String(updated.game_id ?? formData.game_id ?? ''));
      setStations((prev) => prev.map((station) => {
        if (String(station.id) !== String(stationId)) return station;
        return {
          ...station,
          ...updated,
          game_id: updated.game_id ?? formData.game_id ?? station.game_id,
          gameId: updated.game_id ?? formData.game_id ?? station.gameId ?? station.game_id,
          gameName: targetGame?.game_name ?? station.gameName ?? updated.game_name ?? station.game_name,
        };
      }));
      closeModal();
      showToast('Station updated successfully');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to update station');
    }
  };

  const handleUpdateGame = async (gameId, formData) => {
    try {
      const res = await GameAPI.update(gameId, formData);
      const updated = res?.data ?? res;
      syncGame({ ...updated, id: updated.id ?? updated.game_id ?? gameId });
      closeModal();
      showToast('Game updated successfully');
    } catch (err) {
      setFormError(err.message || 'Failed to update game');
    }
  };

  const handleUpdateDetail = async (detailId, formData) => {
    try {
      const res = await GameDetailsAPI.update(detailId, formData);
      const updated = res?.data ?? res;
      syncDetail({ ...updated, id: updated.id ?? updated.detail_id ?? detailId });
      closeModal();
      showToast('Rule updated successfully');
    } catch (err) {
      const validationErrors = err?.response?.data?.errors
        ?.map((item) => `${item.field}: ${item.message}`)
        .join(', ');
      setFormError(validationErrors || err?.response?.data?.message || err.message || 'Failed to update rule');
    }
  };

  return {
    handleCreate,
    handleDeleteGame,
    handleDeleteStation,
    handleUpdateStation,
    handleUpdateGame,
    handleUpdateDetail,
  };
}
