import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Sparkles, UserRound, History, Loader2 } from 'lucide-react';
import PlayersAPI from '../../api/modules/players.api';
import { getApiErrorMessage } from '../../lib/http';
import SessionsAPI from '../../api/modules/sessions.api';
import StationAPI from '../../api/modules/stations.api';
import ScannerPanel from './ScannerPanel';

export default function UserPortal({ authUser, onLogout }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [qrValue, setQrValue] = useState('');
  const [station, setStation] = useState(null);
  const [readyPlayer, setReadyPlayer] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerStats, setPlayerStats] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(true);
  const [assignmentRequest, setAssignmentRequest] = useState(null);

  useEffect(() => {
    let mounted = true;
    let playerId = null;

    const load = async () => {
      try {
        const userId = authUser?.userId || authUser?.user_id;
        if (!userId) return;
        const playersRes = await PlayersAPI.getByUser(userId);
        if (!mounted) return;
        setPlayers(playersRes?.data ?? playersRes ?? []);

        const playerList = playersRes?.data ?? playersRes ?? [];
        const firstPlayer = Array.isArray(playerList) ? playerList[0] : null;
        playerId = firstPlayer?.player_id || null;
        if (firstPlayer) setSelectedPlayerId(String(firstPlayer.player_id));
        if (Array.isArray(playerList) && playerList.length > 0) {
          const [sessionResponses, statsResponse] = await Promise.all([
            Promise.all(playerList.map((player) => SessionsAPI.getByPlayer(player.player_id))),
            firstPlayer ? PlayersAPI.getStats(firstPlayer.player_id) : Promise.resolve(null),
          ]);
          if (!mounted) return;
          const mergedSessions = sessionResponses.flatMap((response) => response?.data ?? response ?? []);
          setSessions([...new Map(mergedSessions.map((session) => [session.play_id || session.id, session])).values()]);
          setPlayerStats(statsResponse?.data ?? statsResponse ?? null);
        }
        const requestsResponse = await PlayersAPI.getMyStationRequests();
        if (mounted) setAssignmentRequest((requestsResponse?.data ?? requestsResponse ?? []).find((request) => request.status === 'Pending') || null);
        if (mounted) setLoadError('');
      } catch (error) {
        if (mounted) setLoadError(getApiErrorMessage(error, 'Could not load your player profile'));
      }
    };

    load();

    // Refresh only the activity list while the tab is visible.
    const refreshActivity = async () => {
      if (!mounted || !playerId || document.hidden) return;
      try {
        const sessionsRes = await SessionsAPI.getByPlayer(playerId);
        if (mounted) setSessions(sessionsRes?.data ?? sessionsRes ?? []);
      } catch {
        // Keep the sessions already on screen if a background refresh fails.
      }
    };

    const timer = window.setInterval(refreshActivity, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [authUser]);

  const resolveStation = async (code) => {
    try {
      const response = await StationAPI.getStationByQR(code);
      const nextStation = response?.data ?? response;
      setStation(nextStation);
      setScanError('');

      const userId = authUser?.userId || authUser?.user_id;
      if (userId && nextStation?.station_id) {
        const selectedId = selectedPlayer?.player_id || selectedPlayerId;
        const requestRes = await PlayersAPI.requestStationAssignment({
          player_id: Number(selectedId),
          station_id: Number(nextStation.station_id)
        });
        const request = requestRes?.data ?? requestRes ?? null;
        setAssignmentRequest(request);
        setReadyPlayer(null);
      } else {
        setReadyPlayer(null);
      }
    } catch (error) {
      setStation(null);
      setReadyPlayer(null);
      setScanError(error?.response?.data?.message || 'Station not found for that QR code.');
    }
  };

  const selectedPlayer = players.find((player) => String(player.player_id) === String(selectedPlayerId)) || null;

  const loadPlayerProfile = async (player) => {
    if (!player?.player_id) return;
    setSelectedPlayerId(String(player.player_id));
    setProfileLoading(true);
    setProfileError('');
    try {
      const [statsResponse, sessionsResponse] = await Promise.all([
        PlayersAPI.getStats(player.player_id),
        SessionsAPI.getByPlayer(player.player_id),
      ]);
      setPlayerStats(statsResponse?.data ?? statsResponse ?? null);
      setSessions(sessionsResponse?.data ?? sessionsResponse ?? []);
    } catch (error) {
      setProfileError(getApiErrorMessage(error, 'Could not load this player'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleScan = (results) => {
    const code = results?.[0]?.rawValue;
    if (code) {
      setQrValue(code);
      resolveStation(code);
      setCameraOpen(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#020208] text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 rounded-3xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#7B2CBF]">
                <Sparkles size={11} /> Player Portal
              </div>
              <h1 className="mt-3 text-xl font-black uppercase sm:text-3xl">Your Arcades</h1>
              <p className="text-xs text-slate-500">Scan a station QR, view sessions, and join the network.</p>
            </div>
            <button onClick={handleLogout} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
              <LogOut size={16} />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/5 bg-[#090914] p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Player</div>
              <div className="mt-2 text-lg font-bold">{authUser?.username || authUser?.name || 'Guest Player'}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#090914] p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Players</div>
              <div className="mt-2 text-lg font-bold">{players.length}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#090914] p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Sessions</div>
              <div className="mt-2 text-lg font-bold">{sessions.length}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#090914] p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">QR Mode</div>
              <div className="mt-2 text-lg font-bold">{cameraOpen ? 'Camera' : 'Manual'}</div>
            </div>
          </div>
        </div>

        <section className="mb-4 rounded-3xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Registered players</h2>
            {profileLoading && <Loader2 size={15} className="animate-spin text-cyan-300" />}
          </div>
          {players.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {players.map((player) => {
                const active = String(player.player_id) === String(selectedPlayerId);
                return (
                  <button
                    key={player.player_id}
                    type="button"
                    onClick={() => loadPlayerProfile(player)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${active ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-black/20 text-slate-300 hover:border-white/20 hover:text-white'}`}
                  >
                    <UserRound size={13} />
                    {player.nickname || player.username || `Player ${player.player_id}`}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">{loadError || 'No registered player profiles found.'}</p>
          )}
          {loadError && players.length > 0 && <p className="mt-3 text-xs text-rose-300">{loadError}</p>}
          {profileError && <p className="mt-3 text-xs text-rose-300">{profileError}</p>}
          {selectedPlayer && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Rounds</div><div className="mt-1 text-lg font-bold text-white">{Number(playerStats?.total_play_amount || 0)}</div></div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Sessions</div><div className="mt-1 text-lg font-bold text-white">{Number(playerStats?.total_sessions || sessions.length || 0)}</div></div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Won</div><div className="mt-1 text-lg font-bold text-emerald-300">{Number(playerStats?.total_won_amount || 0)} Br</div></div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Lost</div><div className="mt-1 text-lg font-bold text-amber-300">{Number(playerStats?.total_lost_amount || 0)} Br</div></div>
            </div>
          )}
        </section>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <ScannerPanel
            cameraOpen={cameraOpen}
            setCameraOpen={setCameraOpen}
            handleScan={handleScan}
            setScanError={setScanError}
            qrValue={qrValue}
            setQrValue={setQrValue}
            resolveStation={resolveStation}
            scanError={scanError}
            station={station}
            readyPlayer={readyPlayer}
            assignmentRequest={assignmentRequest}
            authUser={authUser}
          />

          <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your sessions and rounds</h2>
              <History size={15} className="text-cyan-300" />
            </div>
            <div className="mt-4 space-y-3">
              {sessions.slice(0, 4).map((session) => (
                <div key={session.play_id || session.id} className="rounded-2xl border border-white/5 bg-[#090914] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Session #{session.play_id || session.id}</div>
                      <div className="text-[11px] text-slate-500">{session.status || 'Waiting'} · {Number(session.play_amount || 0)} round{Number(session.play_amount || 0) === 1 ? '' : 's'}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-500" />
                  </div>
                </div>
              ))}
              {!sessions.length && (
                <div className="rounded-2xl border border-white/5 bg-[#090914] p-4 text-xs text-slate-500">
                  Scan a station QR to start your player journey.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
