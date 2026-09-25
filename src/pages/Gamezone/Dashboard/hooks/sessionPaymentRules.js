function sessionKey(record) {
  return record?.play_id || record?.id;
}

export function unpaidRounds(session) {
  const roundCount = Math.max(Number(session?.play_amount || 0), 1);
  const paid = new Set((session?.round_payments || []).map((payment) => Number(payment.round_number)));
  const rounds = [];
  for (let round = 1; round <= roundCount; round += 1) {
    if (!paid.has(round)) rounds.push(round);
  }
  return rounds;
}

function roundCharge(session, rounds) {
  return (Number(session.main_price || 0) * rounds.length)
    + (Math.max(Number(session.extra_time_count || 0), 0) * Number(session.extra_price || 0));
}

function paymentFields(source = {}) {
  return {
    payment_method: source.payment_method || 'Cash',
    payment_provider: source.payment_provider || '',
    transaction_reference: source.transaction_reference || '',
    sender_name: source.sender_name || '',
    notes: source.notes || '',
  };
}

export function endSessionPayment(session) {
  const amount = Number(session.user_paid_amount ?? session.total_paid_amount ?? session.main_price ?? 0);
  return { session, payment_amount: amount || '', ...paymentFields(), winAmount: 0 };
}

function queuedPlayer(playerId, playerOverride, previousData, modalData) {
  if (String(playerOverride?.player_id) === String(playerId)) return playerOverride;
  if (previousData.player?.player_id === playerId) return previousData.player;
  if (modalData?.player?.player_id === playerId) return modalData.player;
  return null;
}

export function queueRoundPayment(prev, session, rounds, playerOverride, keepSelectionOpen) {
  const isPaymentModal = prev.type === 'session-payment' && prev.data?.action === 'player-rounds';
  const previousData = (isPaymentModal || prev.data?.payment_entries) ? prev.data : {};
  const playerId = session.player_id;
  const entries = previousData.payment_entries || [];
  const entryKey = `${sessionKey(session)}:${playerId}`;
  if (entries.some((entry) => entry.key === entryKey)) return null;

  const player = queuedPlayer(playerId, playerOverride, previousData, prev.data);
  const paymentEntries = [...entries, {
    key: entryKey,
    session,
    player,
    player_id: playerId,
    round_numbers: rounds,
    amount: roundCharge(session, rounds),
  }];

  return {
    type: keepSelectionOpen ? 'player-profile' : 'session-payment',
    data: {
      ...previousData,
      ...(keepSelectionOpen ? {} : { action: 'player-rounds' }),
      session,
      player,
      player_id: playerId,
      round_numbers: rounds,
      payment_entries: paymentEntries,
      payment_amount: paymentEntries.reduce((total, entry) => total + entry.amount, 0) || '',
      ...paymentFields(previousData),
      stats: previousData.stats || prev.data?.stats || null,
      history: previousData.history || prev.data?.history || [],
    },
  };
}

export function reviewQueuedPayment(prev) {
  const entries = prev.data?.payment_entries || [];
  if (entries.length === 0) return null;
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
}

export function paymentRequestBody(payment, overrides = {}) {
  return {
    winAmount: Number(payment.winAmount || 0),
    payment_amount: Number(payment.payment_amount),
    payment_method: payment.payment_method,
    payment_timing: payment.payment_timing || 'After Game',
    payment_provider: payment.payment_provider,
    transaction_reference: payment.transaction_reference,
    sender_name: payment.sender_name,
    notes: payment.notes,
    ...overrides,
  };
}
