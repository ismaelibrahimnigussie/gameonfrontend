import { Edit3, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { Avatar, Badge, Button, Card, EmptyState, Input, Select, Skeleton } from '../components/ui';

export default function PlayersPage({
  playerSearch,
  onSearchChange,
  playerTypeFilter,
  onTypeFilterChange,
  selectedPlayerIds,
  onToggleAll,
  onToggleOne,
  filteredPlayers,
  players,
  loading,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Player Management</h2>
          <p className="text-sm text-slate-500">Manage registered users and random players</p>
        </div>
        <Button icon={UserPlus} onClick={onAdd}>Add Player</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={playerSearch} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search name, phone, or station..." icon={Search} className="flex-1" />
        <Select value={playerTypeFilter} onChange={(event) => onTypeFilterChange(event.target.value)} options={[{ value: 'all', label: 'All players' }, { value: 'registered', label: 'Registered users' }, { value: 'random', label: 'Random players' }]} className="sm:w-52" />
        <Button variant="secondary" disabled={!selectedPlayerIds.length} icon={Trash2} onClick={() => onDelete(selectedPlayerIds)}>Delete selected ({selectedPlayerIds.length})</Button>
      </div>
      <Card title="Players" subtitle={`${filteredPlayers.length} shown of ${players.length}`} noPadding>
        {loading ? (
          <div className="p-5 space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
        ) : filteredPlayers.length === 0 ? (
          <EmptyState icon={Users} title="No players found" description="Try another search or create a player" action={<Button icon={UserPlus} onClick={onAdd}>Add Player</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={filteredPlayers.length > 0 && filteredPlayers.every((player) => selectedPlayerIds.includes(player.player_id))}
                      onChange={(event) => onToggleAll(event.target.checked)}
                      aria-label="Select all visible players"
                    />
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Player</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Station</th>
                  <th className="w-24 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const isRandom = player.user_id == null;
                  const name = player.random_nickname || player.nickname || player.username || `Player #${player.player_id}`;
                  const checked = selectedPlayerIds.includes(player.player_id);
                  return (
                    <tr key={player.player_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={checked} onChange={() => onToggleOne(player.player_id)} aria-label={`Select ${name}`} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{name}</p>
                            <p className="text-xs text-slate-500">{player.phone || player.username || 'No contact'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><Badge variant={isRandom ? 'warning' : 'info'}>{isRandom ? 'Random' : 'Registered'}</Badge></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{player.station_name || (player.station_id ? `Station #${player.station_id}` : 'Unassigned')}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="Edit player" onClick={() => onEdit(player)}><Edit3 size={16} /></button>
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete player" onClick={() => onDelete([player.player_id])}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
