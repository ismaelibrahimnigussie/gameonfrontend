import { Loader2, X } from 'lucide-react';
import GameAPI from '../../../../api/modules/games.api';

export default function GameModal({ d }) {
  const {
    modal,
    isSubmitting,
    formError,
    setFormError,
    newGame,
    setNewGame,
    closeModal,
    isEditingGame,
    handleCreate,
    handleUpdateGame,
  } = d;

  return (
    <>
      {modal.type === 'game' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#090914] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {isEditingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newGame.game_name.trim()) return setFormError('Game name is required');
              if (isEditingGame) {
                handleUpdateGame(modal.data.id, newGame);
                return;
              }
              handleCreate('game', newGame, GameAPI.create, '✨ Game created!');
            }} className="space-y-3">
              <input
                type="text"
                placeholder="Game Name *"
                value={newGame.game_name}
                onChange={e => setNewGame({ ...newGame, game_name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <input
                type="text"
                placeholder="Type/Genre (e.g. FIFA, Racing)"
                value={newGame.game_type}
                onChange={e => setNewGame({ ...newGame, game_type: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <input
                type="number"
                placeholder="Max Players"
                value={newGame.max_players}
                onChange={e => setNewGame({ ...newGame, max_players: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 transition-all"
              />
              <textarea
                rows={3}
                placeholder="Short Description"
                value={newGame.description}
                onChange={e => setNewGame({ ...newGame, description: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs focus:border-[#00F0FF]/50 outline-none text-white placeholder-slate-500 resize-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00F0FF] rounded-xl py-3 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditingGame ? 'Update Game' : 'Create Game')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
