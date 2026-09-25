import SessionAPI from '../../../../api/modules/sessions.api';
import { unwrapData } from '../../../../lib/http';
import {
  endSessionPayment,
  paymentRequestBody,
  queueRoundPayment,
  reviewQueuedPayment,
  sameId,
  sessionKey,
  unpaidRounds,
} from './sessionRules';

export function createPaymentActions(kit) {
  const {
    sessions,
    modal,
    setModal,
    setFormError,
    showToast,
    updateSessionState,
    closeModal,
    requireVerified,
    warn,
    runFormSubmit,
  } = kit;

  const handleEndSession = (sessionId) => {
    if (!requireVerified()) return;
    const session = sessions.find((item) => sameId(sessionKey(item), sessionId));
    if (!session) return showToast('Session not found', 'error');
    setFormError('');
    setModal({ type: 'session-payment', data: endSessionPayment(session) });
  };

  const handlePayPlayerRounds = (session, playerOverride = null, keepSelectionOpen = false) => {
    const rounds = unpaidRounds(session);
    if (!rounds.length) return warn('This player has no unpaid rounds');
    setFormError('');
    setModal((prev) => queueRoundPayment(prev, session, rounds, playerOverride, keepSelectionOpen) || prev);
  };

  const proceedToPlayerPayment = () => {
    setModal((prev) => {
      const next = reviewQueuedPayment(prev);
      if (!next) setFormError('Select at least one player to pay');
      return next || prev;
    });
  };

  const confirmEndSessionPayment = async () => {
    const payment = modal.data;
    const entries = payment?.action === 'player-rounds'
      ? (payment.payment_entries?.length ? payment.payment_entries : [payment])
      : [];
    const playId = sessionKey(payment?.session);
    if ((!playId && entries.length === 0) || !payment?.payment_amount || !payment?.payment_method) {
      return setFormError('Payment amount and method are required');
    }

    const body = paymentRequestBody(payment);
    await runFormSubmit(async () => {
      if (payment.action === 'player-rounds') {
        for (const entry of entries) {
          updateSessionState(unwrapData(await SessionAPI.payZonePlayerRounds(sessionKey(entry.session), {
            ...body,
            player_id: entry.player_id,
            round_numbers: entry.round_numbers,
            payment_amount: entry.amount,
          })));
        }
      } else {
        const request = payment.action === 'pay' ? SessionAPI.addZonePayment : SessionAPI.endZoneSession;
        updateSessionState(unwrapData(await request(playId, body)));
      }
      closeModal();
      showToast(payment.action === 'pay' || payment.action === 'player-rounds' ? 'Payment recorded' : 'Session ended');
    }, 'Failed to end session');
  };

  return {
    handleEndSession,
    handlePayPlayerRounds,
    proceedToPlayerPayment,
    confirmEndSessionPayment,
  };
}
