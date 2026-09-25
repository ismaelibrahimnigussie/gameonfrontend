import { useRef, useState } from 'react';
import {
  emptyDetailForm,
  emptyGameForm,
  emptySessionForm,
  emptyStationForm,
} from './loungeModel';

export function useLoungeFields() {
  const [activeTab, setActiveTab] = useState('overview');
  const [zoneInfo, setZoneInfo] = useState(null);
  const [games, setGames] = useState([]);
  const [stations, setStations] = useState([]);
  const [gameDetails, setGameDetails] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newGame, setNewGame] = useState(emptyGameForm);
  const [newDetail, setNewDetail] = useState(emptyDetailForm);
  const [newStation, setNewStation] = useState(emptyStationForm);
  const [newSession, setNewSession] = useState(emptySessionForm);
  const [focusSessionId, setFocusSessionId] = useState(null);
  const [transferReminder, setTransferReminder] = useState(null);
  const [transferCandidates, setTransferCandidates] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [sessionPlayerCandidates, setSessionPlayerCandidates] = useState([]);
  const [sessionPlayerLoading, setSessionPlayerLoading] = useState(false);
  const [manualPlayerCandidates, setManualPlayerCandidates] = useState([]);
  const [manualPlayerLoading, setManualPlayerLoading] = useState(false);
  const [playerProfileLoading, setPlayerProfileLoading] = useState(false);
  const [playerHistoryFilter, setPlayerHistoryFilter] = useState('open');
  const initialLoadDoneRef = useRef(false);

  return {
    activeTab,
    setActiveTab,
    zoneInfo,
    setZoneInfo,
    games,
    setGames,
    stations,
    setStations,
    gameDetails,
    setGameDetails,
    sessions,
    setSessions,
    creditBalance,
    setCreditBalance,
    isLoading,
    setIsLoading,
    isRefreshing,
    setIsRefreshing,
    loadError,
    setLoadError,
    toast,
    setToast,
    modal,
    setModal,
    isSubmitting,
    setIsSubmitting,
    formError,
    setFormError,
    newGame,
    setNewGame,
    newDetail,
    setNewDetail,
    newStation,
    setNewStation,
    newSession,
    setNewSession,
    focusSessionId,
    setFocusSessionId,
    transferReminder,
    setTransferReminder,
    transferCandidates,
    setTransferCandidates,
    transferLoading,
    setTransferLoading,
    sessionPlayerCandidates,
    setSessionPlayerCandidates,
    sessionPlayerLoading,
    setSessionPlayerLoading,
    manualPlayerCandidates,
    setManualPlayerCandidates,
    manualPlayerLoading,
    setManualPlayerLoading,
    playerProfileLoading,
    setPlayerProfileLoading,
    playerHistoryFilter,
    setPlayerHistoryFilter,
    initialLoadDoneRef,
  };
}
