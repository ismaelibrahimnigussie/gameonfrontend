import { useCallback, useEffect } from 'react';
import PlayersAPI from '../../../../api/modules/players.api';
import SessionAPI from '../../../../api/modules/sessions.api';
import StationAPI from '../../../../api/modules/stations.api';

export function useSessionActions(lounge) {
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
    setManualPlayerCandidates,
    setManualPlayerLoading,
    setPlayerProfileLoading,
    setPlayerHistoryFilter,
    zoneId,
    selectedSessionDetail,
    selectedSessionStation,
    getDefaultPlayerCount,
    isVerified,
    canCreateRandomSession,
    showToast,
    updateSessionState,
    loadData,
    closeModal,
  } = lounge;

  const handleCreateSession = async (overrideData = null) => {
    const sessionData = overrideData || newSession;

    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!sessionData.assign_random_player) {
      const detail = sessionData.detail_id
        ? gameDetails.find((item) => String(item.id) === String(sessionData.detail_id))
        : null;
      const stationId = sessionData.station_id || detail?.station_id;
      if (!stationId) return setFormError('Select a station to generate an invite QR');
      setFormError('');
      const stationName = stations.find((s) => String(s.id) === String(stationId))?.station_name || 'Station';
      setModal({
        type: 'session',
        data: {
          invite_only: true,
          detail_id: sessionData.detail_id,
          station_id: stationId,
          station_name: stationName,
          invite_code: stationId ? `STATION-${stationId}` : '',
        }
      });
      showToast('Invite QR ready. Share it with the player.');
      return;
    }

    if (!canCreateRandomSession) {
      return showToast('Add credits before creating a random-player session', 'warning');
    }
    if (!sessionData.detail_id) return setFormError('Select a game rule first');

    if (sessionData.player_id) {
      const selectedCandidate = manualPlayerCandidates.find(
        (candidate) => String(candidate.player_id) === String(sessionData.player_id)
      );
      if (selectedCandidate?.has_unfinished_session) {
        return setFormError(
          `${selectedCandidate.nickname || selectedCandidate.username || 'This player'} is already in unfinished session #${selectedCandidate.unfinished_session_id}. Finish or cancel that session first.`
        );
      }
    }

    const detailForCount = gameDetails.find((item) => String(item.id) === String(sessionData.detail_id)) || selectedSessionDetail;
    const maxPlayersAllowed = Math.max(Number(detailForCount?.max_players || detailForCount?.maxPlayers || sessionData.player_count || 2), 1);
    const playerCount = Math.max(Number(sessionData.player_count || maxPlayersAllowed || 2), 1);
    const paymentTiming = sessionData.payment_timing || 'After Game';
    const plannedRounds = Math.max(Number(sessionData.planned_rounds || 1), 1);
    const roundPrice = Number(detailForCount?.main_price || 0);
    if (paymentTiming === 'Before Game') {
      if (!sessionData.assign_random_player && !sessionData.player_id) return setFormError('Select a player for Before Game payment');
      if (!['Cash', 'Mobile Banking'].includes(sessionData.payment_method)) return setFormError('Select a payment method for Before Game payment');
      if (!Number.isFinite(roundPrice) || roundPrice <= 0) return setFormError('This game has no valid round price');
    }

    setFormError('');

    setIsSubmitting(true);

    try {
      const customNicknames = Array.isArray(sessionData.player_nicknames)
        ? sessionData.player_nicknames
            .slice(0, playerCount)
            .map((name, index) => {
              const trimmed = String(name || '').trim();
              return trimmed && trimmed !== `Player ${index + 1}` ? trimmed : '';
            })
            .filter(Boolean)
        : [];
      const payload = {
        detail_id: Number(sessionData.detail_id),
        assign_random_player: sessionData.assign_random_player ?? true,
        player_count: playerCount,
        mode: sessionData.mode || 'strict',
        payment_timing: paymentTiming,
        planned_rounds: plannedRounds,
        payment_method: sessionData.payment_method,
        payment_provider: sessionData.payment_provider,
        transaction_reference: sessionData.transaction_reference,
        sender_name: sessionData.sender_name,
        notes: sessionData.notes,
      };

      if (customNicknames.length > 0) {
        payload.player_nicknames = customNicknames;
      }

      const resolvedStationId = sessionData.station_id
        ? Number(sessionData.station_id)
        : sessionData.detail_id
          ? Number(
              gameDetails.find((item) => String(item.id) === String(sessionData.detail_id))?.station_id ||
              selectedSessionDetail?.station_id
            )
          : null;

      if (resolvedStationId !== null && !Number.isNaN(resolvedStationId)) {
        payload.station_id = resolvedStationId;
      }

      const stationBusy = resolvedStationId !== null && sessions.some((session) => {
        const status = String(session.status || '').toLowerCase();
        const sessionStationId = session.station_id ?? session.stationId;
        return ['waiting', 'playing', 'paused'].includes(status)
          && String(sessionStationId) === String(resolvedStationId);
      });
      if (stationBusy) {
        setFormError('This station is occupied. Finish or cancel the current session first.');
        return;
      }

      if (sessionData.player_id) {
        payload.player_id = Number(sessionData.player_id);
      }

      if (zoneId) {
        payload.created_by = Number(zoneId);
      }

      const res = await SessionAPI.createZoneSession(payload);
      const created = res?.data ?? res;
      const playId = created?.play_id ?? created?.id;

      setSessions((prev) => [
        { ...created },
        ...prev.filter((session) => String(session.play_id || session.id) !== String(playId))
      ]);
      setFocusSessionId(playId ? String(playId) : null);
      setActiveTab('sessions');
      setModal({ type: null, data: null });
      setNewSession({
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
        notes: ''
      });
      showToast('Play session created successfully');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.startZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session started');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to start session', 'error');
    }
  };

  const handlePauseSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.pauseZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session paused');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to pause session', 'error');
    }
  };

  const handleResumeSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.resumeZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session continued');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to continue session', 'error');
    }
  };

  const handleContinueSession = async (sessionId, roundResults = []) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.continueZoneSession(sessionId, { round_results: roundResults });
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Round advanced');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to advance round', 'error');
      throw err;
    }
  };

  const handleAddExtraTime = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    try {
      const res = await SessionAPI.addExtraTimeZoneSession(sessionId);
      const updated = res?.data ?? res;
      if (updated && typeof updated === 'object' && (updated.play_id ?? updated.id)) updateSessionState(updated);
      await loadData(true);
      showToast('Extra time added');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to add extra time', 'error');
      throw err;
    }
  };

  const handleTransferPlayer = async (session, player) => {
    if (!session || !player) return;

    const currentStationId = session.station_id ?? session.stationId ?? null;
    const fallbackStation = stations.find((station) => String(station.id) !== String(currentStationId)) || null;
    const nextStationId = fallbackStation?.id ? String(fallbackStation.id) : '';

    if (!nextStationId) {
      showToast('No alternate station is available for this player', 'warning');
      return;
    }

    setFormError('');
    setTransferCandidates([]);
    setTransferLoading(true);
    setModal({
      type: 'transfer-player',
      data: {
        session,
        player,
        target_station_id: nextStationId,
        replacement_player_id: '',
      }
    });

    try {
      const res = await StationAPI.getReplacementPlayers(currentStationId || nextStationId, session.play_id || session.id);
      const candidates = res?.data?.players ?? res?.players ?? res?.data ?? res ?? [];
      const filtered = (Array.isArray(candidates) ? candidates : [])
        .filter((candidate) => String(candidate.player_id) !== String(player.player_id));
      setTransferCandidates(filtered);
      setModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          replacement_player_id: filtered[0]?.player_id ? String(filtered[0].player_id) : '',
        }
      }));
    } catch (error) {
      setFormError(error?.response?.data?.message || error.message || 'Failed to load replacement players');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleViewPlayerProfile = async (player, profilePlayers = []) => {
    const playerId = Number(player?.player_id);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      showToast('This player has no profile history yet', 'warning');
      return;
    }

    setFormError('');
    setPlayerProfileLoading(true);
    setPlayerHistoryFilter('open');
    const queuedPayments = modal.data?.payment_entries || [];
    const sessionCandidates = sessions.flatMap((candidateSession) => {
      const sessionPlayers = Array.isArray(candidateSession.players) && candidateSession.players.length > 0
        ? candidateSession.players
        : String(candidateSession.player_ids || '')
          .split(',')
          .map((value, index) => ({
            player_id: Number(value.trim()),
            nickname: String(candidateSession.player_names || '').split(',')[index]?.trim() || `Player ${value.trim()}`,
          }))
          .filter((candidate) => Number.isFinite(candidate.player_id) && candidate.player_id > 0);
      return sessionPlayers.map((candidatePlayer) => ({
        ...candidatePlayer,
        payment_session: candidateSession,
        payment_key: `${candidateSession.play_id || candidateSession.id}:${candidatePlayer.player_id}`,
      }));
    });
    const resolvedProfilePlayers = [...profilePlayers, ...sessionCandidates]
      .map((candidate) => ({
        ...candidate,
        payment_session: candidate.payment_session || player.payment_session || null,
        payment_key: candidate.payment_key || `${candidate.payment_session?.play_id || candidate.payment_session?.id || 'profile'}:${candidate.player_id}`,
      }))
      .filter((candidate, index, allCandidates) => allCandidates.findIndex((item) => item.payment_key === candidate.payment_key) === index);
    setModal({ type: 'player-profile', data: { player, profilePlayers: resolvedProfilePlayers, payment_entries: queuedPayments, payment_mode: queuedPayments.length ? 'multiple' : 'single', stats: null, history: [] } });
    try {
      const [statsResponse, historyResponse] = await Promise.all([
        PlayersAPI.getStats(playerId),
        PlayersAPI.getHistory(playerId),
      ]);
      setModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          stats: statsResponse?.data ?? statsResponse,
          history: historyResponse?.data ?? historyResponse ?? [],
        },
      }));
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to load player profile');
    } finally {
      setPlayerProfileLoading(false);
    }
  };

  const handleAddPlayerToSession = async (session) => {
    if (!session) return;
    const stationId = session.station_id ?? session.stationId ?? null;
    if (!stationId) {
      showToast('Station not found for this session', 'warning');
      return;
    }

    setFormError('');
    setSessionPlayerCandidates([]);
    setSessionPlayerLoading(true);
    setModal({
      type: 'session-add-player',
      data: {
        session,
        player_id: '',
      }
    });

    try {
      const res = await StationAPI.getReplacementPlayers(stationId, session.play_id || session.id);
      const candidates = res?.data?.players ?? res?.players ?? res?.data ?? res ?? [];
      const currentPlayerIds = String(session.player_ids || '')
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);
      const filtered = (Array.isArray(candidates) ? candidates : []).filter(
        (candidate) => !candidate.has_unfinished_session && !currentPlayerIds.includes(Number(candidate.player_id))
      );
      setSessionPlayerCandidates(filtered);
      setModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          player_id: filtered[0]?.player_id ? String(filtered[0].player_id) : '',
        }
      }));
    } catch (error) {
      setFormError(error?.response?.data?.message || error.message || 'Failed to load available players');
    } finally {
      setSessionPlayerLoading(false);
    }
  };

  const loadManualPlayerCandidates = useCallback(async () => {
    const stationId = selectedSessionStation?.id;
    if (!stationId) {
      setManualPlayerCandidates([]);
      return [];
    }

    setManualPlayerLoading(true);
    try {
      const res = await StationAPI.getReplacementPlayers(stationId, null);
      const candidates = res?.data?.players ?? res?.players ?? res?.data ?? res ?? [];
      const nextCandidates = Array.isArray(candidates) ? candidates : [];
      setManualPlayerCandidates(nextCandidates);
      return nextCandidates;
    } catch {
      setManualPlayerCandidates([]);
      return [];
    } finally {
      setManualPlayerLoading(false);
    }
  }, [selectedSessionStation?.id, setManualPlayerCandidates, setManualPlayerLoading]);

  useEffect(() => {
    if (modal.type !== 'session') return undefined;
    if (newSession.assign_random_player) return undefined;

    let mounted = true;
    (async () => {
      const candidates = await loadManualPlayerCandidates();
      if (!mounted) return;
      setNewSession((prev) => {
        if (prev.player_id || !candidates.length) return prev;
        const recommended = candidates[0]?.player_id ? String(candidates[0].player_id) : '';
        return recommended ? { ...prev, player_id: recommended } : prev;
      });
    })();

    return () => {
      mounted = false;
    };
  }, [modal.type, newSession.assign_random_player, loadManualPlayerCandidates, setNewSession]);

  const confirmAddPlayerToSession = async () => {
    const addSession = modal.data?.session;
    const playerId = modal.data?.player_id;

    if (!addSession) {
      setFormError('Select a session first');
      return;
    }

    if (!playerId) {
      setFormError('Select a player');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await SessionAPI.addZonePlayerToSession(addSession.play_id || addSession.id, {
        player_id: Number(playerId),
      });
      const updated = res?.data ?? res;
      updateSessionState(updated);
      setModal({ type: null, data: null });
      setSessionPlayerCandidates([]);
      await loadData(true);
      showToast('Player added to the waiting session');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to add player to session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveFlexiblePlayer = async (session, player) => {
    const sessionId = session?.play_id || session?.id;
    if (!sessionId || !player?.player_id) return;
    try {
      const res = await SessionAPI.leaveZonePlayerFromSession(sessionId, {
        player_id: Number(player.player_id),
      });
      const updated = res?.data ?? res;
      updateSessionState(updated);
      await loadData(true);
      showToast('Player left the session');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to remove player', 'error');
    }
  };

  const confirmTransferPlayer = async () => {
    const transferSession = modal.data?.session;
    const transferPlayer = modal.data?.player;
    const targetStationId = modal.data?.target_station_id;
    const replacementPlayerId = modal.data?.replacement_player_id;

    if (!transferSession || !transferPlayer) {
      setFormError('Select a player to transfer');
      return;
    }

    if (!targetStationId) {
      setFormError('Select a destination station');
      return;
    }

    if (!replacementPlayerId) {
      setFormError('Select a replacement player');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await StationAPI.transferPlayer(targetStationId, {
        player_id: Number(transferPlayer.player_id),
        session_id: Number(transferSession.play_id || transferSession.id),
        replacement_player_id: Number(replacementPlayerId),
      });
      const updatedPlayer = res?.data ?? res;
      const pendingSessionId = updatedPlayer?.pending_session?.play_id || updatedPlayer?.pending_session?.id || null;
      const targetStationName = stations.find((station) => String(station.id) === String(targetStationId))?.station_name || 'the selected station';
      setTransferReminder({
        session_id: pendingSessionId ? String(pendingSessionId) : null,
        source_session_id: String(transferSession.play_id || transferSession.id),
        source_station_name: transferSession.station_name || 'Unknown station',
        target_station_name: targetStationName,
        moved_player: {
          player_id: transferPlayer.player_id,
          nickname: transferPlayer.nickname || transferPlayer.username || null,
        },
        replacement_player: {
          player_id: Number(replacementPlayerId),
        }
      });
      setModal({ type: null, data: null });
      setTransferCandidates([]);
      await loadData(true);
      if (pendingSessionId) {
        setActiveTab('sessions');
        setFocusSessionId(String(pendingSessionId));
      }
      showToast(`${updatedPlayer?.nickname || transferPlayer.nickname || 'Player'} moved to ${targetStationName}`);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to transfer player');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    const session = sessions.find((item) => String(item.play_id || item.id) === String(sessionId));
    if (!session) return showToast('Session not found', 'error');
    setFormError('');
    setModal({
      type: 'session-payment',
      data: {
        session,
        payment_amount: Number(session.user_paid_amount ?? session.total_paid_amount ?? session.main_price ?? 0) || '',
        payment_method: 'Cash',
        payment_provider: '',
        transaction_reference: '',
        sender_name: '',
        notes: '',
        winAmount: 0,
      }
    });
  };

  const handlePayPlayerRounds = (session, playerOverride = null, keepSelectionOpen = false) => {
    const roundCount = Math.max(Number(session?.play_amount || 0), 1);
    const paidRounds = new Set((session?.round_payments || []).map((payment) => Number(payment.round_number)));
    const unpaidRounds = Array.from({ length: roundCount }, (_, index) => index + 1).filter((round) => !paidRounds.has(round));
    if (!unpaidRounds.length) return showToast('This player has no unpaid rounds', 'warning');

    setFormError('');
    setModal((prev) => {
      const isPaymentModal = prev.type === 'session-payment' && prev.data?.action === 'player-rounds';
      const previousData = isPaymentModal || prev.data?.payment_entries ? prev.data : {};
      const sessionId = session.play_id || session.id;
      const playerId = session.player_id;
      const entries = previousData.payment_entries || [];
      const entryKey = `${sessionId}:${playerId}`;
      if (entries.some((entry) => entry.key === entryKey)) return prev;

      const player = String(playerOverride?.player_id) === String(playerId)
        ? playerOverride
        : previousData.player?.player_id === playerId
        ? previousData.player
        : prev.data?.player?.player_id === playerId
          ? prev.data.player
          : null;
      const entry = {
        key: entryKey,
        session,
        player,
        player_id: playerId,
        round_numbers: unpaidRounds,
        amount: (Number(session.main_price || 0) * unpaidRounds.length)
          + (Math.max(Number(session.extra_time_count || 0), 0) * Number(session.extra_price || 0)),
      };
      const paymentEntries = [...entries, entry];

      return {
        type: keepSelectionOpen ? 'player-profile' : 'session-payment',
        data: {
          ...previousData,
          ...(keepSelectionOpen ? {} : { action: 'player-rounds' }),
          session,
          player,
          player_id: playerId,
          round_numbers: unpaidRounds,
          payment_entries: paymentEntries,
          payment_amount: paymentEntries.reduce((total, item) => total + item.amount, 0) || '',
          payment_method: previousData.payment_method || 'Cash',
          payment_provider: previousData.payment_provider || '',
          transaction_reference: previousData.transaction_reference || '',
          sender_name: previousData.sender_name || '',
          notes: previousData.notes || '',
          stats: previousData.stats || prev.data?.stats || null,
          history: previousData.history || prev.data?.history || [],
        },
      };
    });
  };

  const proceedToPlayerPayment = () => {
    setModal((prev) => {
      const entries = prev.data?.payment_entries || [];
      if (entries.length === 0) {
        setFormError('Select at least one player to pay');
        return prev;
      }
      return {
        type: 'session-payment',
        data: {
          ...prev.data,
          action: 'player-rounds',
          session: entries[0].session,
          player_id: entries[0].player_id,
          round_numbers: entries[0].round_numbers,
          payment_amount: entries.reduce((total, entry) => total + entry.amount, 0),
          payment_method: prev.data.payment_method || 'Cash',
        },
      };
    });
  };

  const confirmEndSessionPayment = async () => {
    const payment = modal.data;
    const paymentEntries = payment?.action === 'player-rounds'
      ? (payment.payment_entries?.length ? payment.payment_entries : [payment])
      : [];
    const sessionId = payment?.session?.play_id || payment?.session?.id;
    if ((!sessionId && paymentEntries.length === 0) || !payment?.payment_amount || !payment?.payment_method) {
      setFormError('Payment amount and method are required');
      return;
    }
    try {
      setIsSubmitting(true);
      const paymentData = {
        winAmount: Number(payment.winAmount || 0),
        payment_amount: Number(payment.payment_amount),
        payment_method: payment.payment_method,
        payment_timing: payment.payment_timing || 'After Game',
        payment_provider: payment.payment_provider,
        transaction_reference: payment.transaction_reference,
        sender_name: payment.sender_name,
        notes: payment.notes,
      };
      let updated;
      if (payment.action === 'player-rounds') {
        for (const entry of paymentEntries) {
          const res = await SessionAPI.payZonePlayerRounds(entry.session.play_id || entry.session.id, {
            ...paymentData,
            player_id: entry.player_id,
            round_numbers: entry.round_numbers,
            payment_amount: entry.amount,
          });
          updateSessionState(res?.data ?? res);
        }
      } else {
        const res = payment.action === 'pay'
          ? await SessionAPI.addZonePayment(sessionId, paymentData)
          : await SessionAPI.endZoneSession(sessionId, paymentData);
        updated = res?.data ?? res;
      }
      if (payment.action !== 'player-rounds') updateSessionState(updated);
      closeModal();
      showToast(payment.action === 'pay' || payment.action === 'player-rounds' ? 'Payment recorded' : 'Session ended');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to end session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!window.confirm('Cancel this session?')) return;
    try {
      const res = await SessionAPI.cancelZoneSession(sessionId);
      const updated = res?.data ?? res;
      updateSessionState(updated);
      showToast('Session cancelled');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to cancel session', 'error');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!window.confirm('Delete this session permanently?')) return;
    try {
      await SessionAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((session) => String(session.play_id || session.id) !== String(sessionId)));
      setModal((prev) => {
        if (prev.type === 'session' && String(prev.data?.play_id || prev.data?.id) === String(sessionId)) {
          return { type: null, data: null };
        }
        return prev;
      });
      showToast('Session deleted');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to delete session', 'error');
    }
  };

  const handleBulkDeleteSessions = async (sessionIds) => {
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) return;
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!window.confirm(`Delete ${sessionIds.length} selected session(s)?`)) return;
    try {
      await SessionAPI.bulkDeleteSessions(sessionIds);
      setSessions((prev) => prev.filter((session) => !sessionIds.includes(String(session.play_id || session.id))));
      showToast(`${sessionIds.length} session(s) deleted`);
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to delete selected sessions', 'error');
    }
  };

  const handleStartRandomSessionFromStation = (station) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!canCreateRandomSession) return showToast('Add credits before creating a random-player session', 'warning');
    if (!station?.id) return;

    const stationBusy = sessions.some((session) => {
      const status = String(session.status || '').toLowerCase();
      const sessionStationId = session.station_id ?? session.stationId;
      return ['waiting', 'playing', 'paused'].includes(status)
        && String(sessionStationId) === String(station.id);
    });
    if (stationBusy) {
      return showToast('This station is occupied. Finish or cancel the current session first.', 'warning');
    }

    const stationDetails = gameDetails.filter((detail) => String(detail.station_id) === String(station.id));
    const chosenDetail = stationDetails[0] || gameDetails.find((detail) => String(detail.game_id) === String(station.game_id ?? station.gameId));
    if (!chosenDetail) {
      showToast('Add a game detail for this station first', 'warning');
      return;
    }

    const defaultCount = getDefaultPlayerCount(chosenDetail);
    const defaultNicknames = Array.from({ length: defaultCount }, (_, index) => `Player ${index + 1}`);

    setNewSession({
      detail_id: String(chosenDetail.id),
      station_id: String(station.id),
      player_id: '',
      player_count: defaultCount,
      player_nicknames: defaultNicknames,
      assign_random_player: true,
      mode: 'strict',
      payment_timing: 'After Game',
      planned_rounds: 1,
      payment_method: 'Cash',
      payment_provider: '',
      transaction_reference: '',
      sender_name: '',
      notes: ''
    });

    setModal({
      type: 'session',
      data: {
        detail_id: chosenDetail.id,
        station_id: station.id,
        station_name: station.station_name,
        invite_code: `STATION-${station.id}`
      }
    });
  };

  const handleInviteFromStation = (station) => {
    if (!isVerified) return showToast('Please verify your lounge first', 'warning');
    if (!station?.id) return;
    setNewSession({
      detail_id: '',
      station_id: station.id,
      player_id: '',
      assign_random_player: false,
      mode: 'strict',
      payment_timing: 'After Game',
      planned_rounds: 1,
      payment_method: 'Cash',
      payment_provider: '',
      transaction_reference: '',
      sender_name: '',
      notes: ''
    });
    setModal({
      type: 'session',
      data: {
        invite_only: true,
        station_id: station.id,
        station_name: station.station_name,
        invite_code: `STATION-${station.id}`
      }
    });
  };

  return {
    handleCreateSession,
    handleStartSession,
    handlePauseSession,
    handleResumeSession,
    handleContinueSession,
    handleAddExtraTime,
    handleTransferPlayer,
    handleViewPlayerProfile,
    handleAddPlayerToSession,
    confirmAddPlayerToSession,
    handleLeaveFlexiblePlayer,
    confirmTransferPlayer,
    handleEndSession,
    handlePayPlayerRounds,
    proceedToPlayerPayment,
    confirmEndSessionPayment,
    handleCancelSession,
    handleDeleteSession,
    handleBulkDeleteSessions,
    handleStartRandomSessionFromStation,
    handleInviteFromStation,
  };
}
