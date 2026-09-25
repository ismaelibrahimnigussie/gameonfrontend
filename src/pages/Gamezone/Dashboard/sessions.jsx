import { useEffect, useMemo, useState } from 'react';
import { SessionBoard } from './sessions/SessionBoard';
import { RoundResultDialog } from './sessions/RoundResultDialog';
import { SessionDetail } from './sessions/SessionDetail';
import { ConfirmDialog, ToastStack } from './sessions/sessionUi';
import {
  getRemainingTime,
  getSessionPlayers,
  sessionKey,
} from './sessions/sessionModel';

export default function Sessions({
  sessions = [],
  focusSessionId = null,
  onClearSessionFocus,
  onAddSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onContinueSession,
  onAddExtraTime,
  onEndSession,
  onCancelSession,
  onDeleteSession,
  onBulkDeleteSessions,
  onTransferPlayer,
  onViewPlayerProfile,
  onAddPlayerToSession,
  onLeaveFlexiblePlayer,
  transferReminder = null,
  onRefresh,
  isRefreshing,
  canManageSessions = true,
  sessionLockMessage = '',
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [now, setNow] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [expandedPlayersSessionId, setExpandedPlayersSessionId] = useState(null);
  const [expandedRoundNumber, setExpandedRoundNumber] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [roundResultSession, setRoundResultSession] = useState(null);
  const [roundResultDraft, setRoundResultDraft] = useState([]);
  const [roundResultBusy, setRoundResultBusy] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    const session = sessions.find((item) => String(sessionKey(item)) === String(activeSessionId));
    if (!session || String(session.status || '').toLowerCase() !== 'playing') return;
    if (getRemainingTime(session, now) <= 0) onPauseSession?.(activeSessionId);
  }, [activeSessionId, sessions, onPauseSession, now]);

  const openSession = (id) => {
    setActiveSessionId(id == null ? null : String(id));
    setExpandedPlayersSessionId(null);
    setExpandedRoundNumber(null);
    setDetailTab('overview');
  };

  const focusId = focusSessionId ? String(focusSessionId) : '';
  if (
    focusId
    && focusId !== String(activeSessionId || '')
    && sessions.some((item) => String(sessionKey(item)) === focusId)
  ) {
    openSession(focusId);
  }

  useEffect(() => {
    if (!focusId || !sessions.some((item) => String(sessionKey(item)) === focusId)) return;
    onClearSessionFocus?.();
  }, [focusId, sessions, onClearSessionFocus]);

  const activeSession = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find((item) => String(sessionKey(item)) === String(activeSessionId)) || null;
  }, [sessions, activeSessionId]);

  const pushToast = (message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3000);
  };

  const isPending = (id, actionKey) => pendingAction === `${id}:${actionKey}`;

  const runTask = async (key, task, successMessage) => {
    setPendingAction(key);
    try {
      await task();
      if (successMessage) pushToast(successMessage, 'success');
    } catch (err) {
      pushToast(err?.message || 'That action failed. Please try again.', 'error');
    } finally {
      setPendingAction((prev) => (prev === key ? null : prev));
    }
  };

  const runAction = (fn, id, actionKey, successMessage) => {
    if (!fn) return undefined;
    return runTask(`${id}:${actionKey}`, () => fn(id), successMessage);
  };

  const askConfirm = (next) => setConfirmState(next);
  const handleConfirm = async () => {
    if (!confirmState?.onConfirm) return;
    setConfirmBusy(true);
    try {
      await confirmState.onConfirm();
    } finally {
      setConfirmBusy(false);
      setConfirmState(null);
    }
  };

  const openRoundResultForm = (session) => {
    setRoundResultSession(session);
    setRoundResultDraft(getSessionPlayers(session).map((player) => ({
      session_player_id: player.session_player_id,
      player_id: player.player_id,
      nickname: player.nickname || player.username || `Player ${player.player_id || ''}`,
      result: '',
      score: '',
      prize_amount: '',
      result_note: '',
    })));
  };

  const submitRoundResults = async (skipResults = false) => {
    if (!roundResultSession || !onContinueSession) return;
    const id = sessionKey(roundResultSession);
    const results = skipResults
      ? []
      : roundResultDraft
        .filter((entry) => entry.result)
        .map(({ session_player_id, result, score, prize_amount, result_note }) => ({
          session_player_id, result, score, prize_amount, result_note,
        }));
    setRoundResultBusy(true);
    try {
      await onContinueSession(id, results);
      setRoundResultSession(null);
      setRoundResultDraft([]);
      pushToast(skipResults ? 'New round started without results' : 'Results saved and new round started');
    } catch (error) {
      pushToast(error?.message || 'Unable to start the new round', 'error');
    } finally {
      setRoundResultBusy(false);
    }
  };

  const requestBulkDelete = () => {
    if (!selectedIds.length) return;
    askConfirm({
      title: `Delete ${selectedIds.length} session${selectedIds.length === 1 ? '' : 's'}?`,
      message: 'This removes the selected sessions and their history for good. This can\'t be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await onBulkDeleteSessions?.(selectedIds);
        pushToast(`${selectedIds.length} session${selectedIds.length === 1 ? '' : 's'} deleted`);
        setSelectedIds([]);
      },
    });
  };

  const requestDeleteSession = (id, label) => {
    askConfirm({
      title: 'Delete this session?',
      message: `#${id}${label ? ` · ${label}` : ''} and its round history will be permanently removed.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await onDeleteSession?.(id);
        pushToast('Session deleted');
        if (String(activeSessionId) === String(id)) setActiveSessionId(null);
      },
    });
  };

  const requestCancelSession = (id, label) => {
    askConfirm({
      title: 'Cancel this session?',
      message: `#${id}${label ? ` · ${label}` : ''} will be marked cancelled. Players and the timer will stop.`,
      confirmLabel: 'Cancel session',
      onConfirm: () => runAction(onCancelSession, id, 'cancel', 'Session cancelled'),
    });
  };

  const overlays = (
    <>
      <RoundResultDialog
        session={roundResultSession}
        draft={roundResultDraft}
        busy={roundResultBusy}
        onChange={setRoundResultDraft}
        onClose={() => setRoundResultSession(null)}
        onSubmit={submitRoundResults}
      />
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
      <ToastStack toasts={toasts} />
    </>
  );

  if (activeSession) {
    return (
      <>
        <SessionDetail
          session={activeSession}
          now={now}
          detailTab={detailTab}
          setDetailTab={setDetailTab}
          playersExpanded={String(expandedPlayersSessionId || '') === String(sessionKey(activeSession))}
          setPlayersExpanded={setExpandedPlayersSessionId}
          expandedRoundNumber={expandedRoundNumber}
          setExpandedRoundNumber={setExpandedRoundNumber}
          canManageSessions={canManageSessions}
          transferReminder={transferReminder}
          isPending={isPending}
          runAction={runAction}
          runTask={runTask}
          openRoundResultForm={openRoundResultForm}
          requestCancelSession={requestCancelSession}
          onViewPlayerProfile={onViewPlayerProfile}
          onLeaveFlexiblePlayer={onLeaveFlexiblePlayer}
          onTransferPlayer={onTransferPlayer}
          onAddPlayerToSession={onAddPlayerToSession}
          onStartSession={onStartSession}
          onPauseSession={onPauseSession}
          onResumeSession={onResumeSession}
          onEndSession={onEndSession}
          onAddExtraTime={onAddExtraTime}
          onBack={() => openSession(null)}
        />
        {overlays}
      </>
    );
  }

  return (
    <SessionBoard
      sessions={sessions} now={now}
      activeTab={activeTab} setActiveTab={setActiveTab}
      searchQuery={searchQuery} setSearchQuery={setSearchQuery}
      dayFilter={dayFilter} setDayFilter={setDayFilter}
      sortBy={sortBy} setSortBy={setSortBy}
      filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}
      selectedIds={selectedIds} setSelectedIds={setSelectedIds}
      canManageSessions={canManageSessions} sessionLockMessage={sessionLockMessage}
      isRefreshing={isRefreshing} onAddSession={onAddSession} onRefresh={onRefresh}
      onViewPlayerProfile={onViewPlayerProfile} isPending={isPending} runAction={runAction}
      openSession={openSession} requestBulkDelete={requestBulkDelete}
      requestCancelSession={requestCancelSession} requestDeleteSession={requestDeleteSession}
      onStartSession={onStartSession} onPauseSession={onPauseSession} onResumeSession={onResumeSession}
      onContinueSession={onContinueSession} onAddExtraTime={onAddExtraTime} onEndSession={onEndSession}
    >
      {overlays}
    </SessionBoard>
  );
}


