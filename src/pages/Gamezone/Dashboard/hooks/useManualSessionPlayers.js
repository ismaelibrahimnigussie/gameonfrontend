import { useCallback, useEffect } from 'react';
import StationAPI from '../../../../api/modules/stations.api';
import { firstPlayerValue, replacementPlayers } from './sessionRules';

export function useManualSessionPlayers({
  modal,
  newSession,
  selectedSessionStation,
  setManualPlayerCandidates,
  setManualPlayerLoading,
  setNewSession,
}) {
  const loadManualPlayerCandidates = useCallback(async () => {
    const stationId = selectedSessionStation?.id;
    if (!stationId) {
      setManualPlayerCandidates([]);
      return [];
    }

    setManualPlayerLoading(true);
    try {
      const nextCandidates = replacementPlayers(await StationAPI.getReplacementPlayers(stationId, null));
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
    if (modal.type !== 'session' || newSession.assign_random_player) return undefined;

    let mounted = true;
    (async () => {
      const candidates = await loadManualPlayerCandidates();
      if (!mounted) return;
      setNewSession((prev) => {
        if (prev.player_id || !candidates.length) return prev;
        const recommended = firstPlayerValue(candidates);
        return recommended ? { ...prev, player_id: recommended } : prev;
      });
    })();

    return () => {
      mounted = false;
    };
  }, [modal.type, newSession.assign_random_player, loadManualPlayerCandidates, setNewSession]);
}
