import DetailModal from './DetailModal';
import GameModal from './GameModal';
import PlayerProfileModal from './PlayerProfileModal';
import SessionAddPlayerModal from './SessionAddPlayerModal';
import SessionModal from './SessionModal';
import SessionPaymentModal from './SessionPaymentModal';
import StationModal from './StationModal';
import TransferPlayerModal from './TransferPlayerModal';

export default function DashboardModals({ d }) {
  return (
    <>
      <GameModal d={d} />
      <StationModal d={d} />
      <SessionPaymentModal d={d} />
      <PlayerProfileModal d={d} />
      <TransferPlayerModal d={d} />
      <SessionAddPlayerModal d={d} />
      <SessionModal d={d} />
      <DetailModal d={d} />
    </>
  );
}
