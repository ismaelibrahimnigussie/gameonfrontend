import { useMemo } from 'react';
import { Gamepad2, Plus, QrCode, RefreshCw, Search, ShieldAlert, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { SessionCard } from './SessionCard';
import {
  SORT_OPTIONS,
  filterSessions,
  formatDateLabel,
  sessionKey,
  toLocalDateKey,
} from './sessionModel';

export function SessionBoard({
  sessions,
  now,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  dayFilter,
  setDayFilter,
  sortBy,
  setSortBy,
  filtersOpen,
  setFiltersOpen,
  selectedIds,
  setSelectedIds,
  canManageSessions,
  sessionLockMessage,
  isRefreshing,
  onAddSession,
  onRefresh,
  onViewPlayerProfile,
  isPending,
  runAction,
  openSession,
  requestBulkDelete,
  requestCancelSession,
  requestDeleteSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onContinueSession,
  onAddExtraTime,
  onEndSession,
  children,
}) {
  const daySessions = useMemo(() => (
    dayFilter === 'all'
      ? sessions
      : sessions.filter((session) => toLocalDateKey(session.started_at || session.created_at) === dayFilter)
  ), [sessions, dayFilter]);

  const stats = useMemo(() => {
    const count = (status) => daySessions.filter((session) => String(session.status || '').toLowerCase() === status).length;
    return {
      total: daySessions.length,
      playing: count('playing'),
      waiting: count('waiting'),
      paused: count('paused'),
      finished: count('finished'),
    };
  }, [daySessions]);

  const revenueSummary = useMemo(() => {
    const payments = daySessions
      .flatMap((session) => (Array.isArray(session.session_payments) ? session.session_payments : []))
      .filter((payment) => String(payment.payment_status || '').toLowerCase() === 'paid');
    return {
      amount: payments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      payments: payments.length,
      date: dayFilter === 'all' ? 'All dates' : formatDateLabel(dayFilter),
    };
  }, [daySessions, dayFilter]);

  const dayOptions = useMemo(() => {
    const uniqueDays = new Set();
    sessions.forEach((session) => {
      const key = toLocalDateKey(session.started_at || session.created_at);
      if (key) uniqueDays.add(key);
    });
    return Array.from(uniqueDays).sort((a, b) => b.localeCompare(a)).map((value) => ({
      value,
      label: formatDateLabel(value),
    }));
  }, [sessions]);

  const sortClock = sortBy === 'remaining' ? now : 0;
  const filteredSessions = useMemo(
    () => filterSessions(daySessions, { activeTab, searchQuery, sortBy, now: sortClock }),
    [daySessions, activeTab, searchQuery, sortBy, sortClock]
  );

  const allVisibleIds = filteredSessions.map((session) => String(sessionKey(session)));
  const allVisibleSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectSession = (sessionId) => {
    const id = String(sessionId);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => (
      allVisibleSelected
        ? prev.filter((id) => !allVisibleIds.includes(id))
        : Array.from(new Set([...prev, ...allVisibleIds]))
    ));
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'playing', label: 'Live', count: stats.playing },
    { id: 'waiting', label: 'Wait', count: stats.waiting },
    { id: 'paused', label: 'Pause', count: stats.paused },
    { id: 'finished', label: 'Done', count: stats.finished },
  ];
  const filtersActive = Boolean(searchQuery || activeTab !== 'all' || dayFilter !== 'all');
  const activeFilterCount = (dayFilter !== 'all' ? 1 : 0) + (sortBy !== 'priority' ? 1 : 0);

  return (
    <div className="space-y-4 animate-fadeIn pt-16 lg:pt-0 pb-20 lg:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 size={18} className="text-[#00F0FF] shrink-0" />
            <span className="truncate">Sessions</span>
          </h1>
          <p className="text-xs text-slate-400">{stats.total} total · {stats.playing} live now</p>
        </div>
        <button type="button" onClick={onAddSession} disabled={!canManageSessions} className="px-3 sm:px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 rounded-xl text-xs sm:text-sm font-semibold text-black transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-[#00F0FF]/20 shrink-0">
          <Plus size={14} /> <span className="hidden xs:inline">New session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Revenue collected</p>
          <p className="mt-1 text-2xl font-black text-white">{revenueSummary.amount.toLocaleString()} <span className="text-sm font-semibold text-emerald-200">Br</span></p>
          <p className="mt-1 text-[10px] text-emerald-100/70">Paid payments · {revenueSummary.date}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Paid records</p>
          <p className="mt-1 text-2xl font-black text-white">{revenueSummary.payments}</p>
          <p className="mt-1 text-[10px] text-cyan-100/70">Payments marked paid</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date issued</p>
          <p className="mt-1 text-lg font-bold text-white">{revenueSummary.date}</p>
          <p className="mt-1 text-[10px] text-slate-500">Based on the date filter above</p>
        </div>
      </div>

      <div className="bg-black/40 rounded-2xl p-2 sm:p-3 border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-1 min-w-[200px] overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter sessions by status">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" role="tab" aria-selected={isActive} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all rounded-lg whitespace-nowrap ${isActive ? 'bg-[#00F0FF] text-black' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                  <span className="flex items-center gap-1.5">{tab.label}<span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-slate-500'}`}>{tab.count}</span></span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search" aria-label="Search sessions" className="w-28 xs:w-36 sm:w-44 pl-8 pr-7 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-[#00F0FF]/50 outline-none transition" />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-0.5">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setFiltersOpen((value) => !value)} aria-label="Day and sort filters" aria-expanded={filtersOpen} className={`relative p-2 rounded-lg border transition ${filtersOpen || activeFilterCount > 0 ? 'border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <SlidersHorizontal size={14} />
                {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00F0FF] text-[9px] font-bold text-black">{activeFilterCount}</span>}
              </button>
              {filtersOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFiltersOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-white/10 bg-[#0b0f14] p-3 shadow-2xl animate-fadeIn space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Day</label>
                      <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)} className="mt-1 w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none">
                        <option value="all">All days</option>
                        {dayOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
                      <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="mt-1 w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none">
                        {SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </div>
                    {activeFilterCount > 0 && (
                      <button type="button" onClick={() => { setDayFilter('all'); setSortBy('priority'); }} className="w-full text-[11px] text-center text-slate-400 hover:text-white transition py-1">
                        Reset filters
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh sessions" className="p-2 text-slate-500 hover:text-[#00F0FF] hover:bg-white/5 rounded-lg transition shrink-0">
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#00F0FF]' : ''} />
            </button>
          </div>
        </div>
        {(dayFilter !== 'all' || filteredSessions.length > 0) && (
          <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
            <p className="text-[10px] text-slate-500">{filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'} · {dayFilter === 'all' ? 'all days' : formatDateLabel(dayFilter)}</p>
            {filteredSessions.length > 0 && (
              <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer select-none">
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="h-3.5 w-3.5 accent-[#00F0FF]" />
                Select all
              </label>
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-2 text-xs text-[#00F0FF] animate-fadeIn">
          <span className="font-medium">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSelectedIds([])} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition">Clear</button>
            <button type="button" onClick={requestBulkDelete} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-300 hover:bg-rose-500/25 transition">
              <Trash2 size={12} /> Delete selected
            </button>
          </div>
        </div>
      )}

      {!canManageSessions && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-400">
          <ShieldAlert size={14} className="shrink-0" />
          <span className="truncate">{sessionLockMessage || 'Verification required'}</span>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-black/40 border border-white/10 rounded-2xl">
          <QrCode size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-300 font-medium">{filtersActive ? 'No sessions match your filters' : 'No sessions yet'}</p>
          <p className="mt-1 text-xs text-slate-500">{filtersActive ? 'Try clearing search or filters.' : 'Start your first session to see it here.'}</p>
          {filtersActive ? (
            <button type="button" onClick={() => { setSearchQuery(''); setActiveTab('all'); setDayFilter('all'); }} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white transition">
              Clear filters
            </button>
          ) : (
            <button type="button" onClick={onAddSession} disabled={!canManageSessions} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 rounded-xl text-xs font-medium text-black transition disabled:opacity-50">
              <Plus size={14} /> New session
            </button>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
          {filteredSessions.map((session) => (
            <SessionCard
              key={sessionKey(session)}
              session={session}
              now={now}
              selected={selectedIds.includes(String(sessionKey(session)))}
              canManageSessions={canManageSessions}
              isPending={isPending}
              onOpen={openSession}
              onToggleSelect={toggleSelectSession}
              onViewPlayerProfile={onViewPlayerProfile}
              runAction={runAction}
              onStartSession={onStartSession}
              onResumeSession={onResumeSession}
              onContinueSession={onContinueSession}
              onPauseSession={onPauseSession}
              onAddExtraTime={onAddExtraTime}
              onEndSession={onEndSession}
              onRequestCancel={requestCancelSession}
              onRequestDelete={requestDeleteSession}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
