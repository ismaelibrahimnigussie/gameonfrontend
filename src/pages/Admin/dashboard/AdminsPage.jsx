import { Edit3, Search, Shield, Trash2, UserPlus } from 'lucide-react';
import { Avatar, Badge, Button, Card, EmptyState, Input } from '../components/ui';

export default function AdminsPage({
  adminSearch,
  onSearchChange,
  selectedAdminIds,
  onToggleAll,
  onToggleOne,
  filteredAdmins,
  admins,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Administrator Management</h2>
          <p className="text-sm text-slate-500">Create, update, deactivate, or remove administrator accounts</p>
        </div>
        <Button icon={UserPlus} onClick={onAdd}>Add Administrator</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={adminSearch} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search administrators..." icon={Search} className="flex-1" />
        <Button variant="secondary" disabled={!selectedAdminIds.length} icon={Trash2} onClick={() => onDelete(selectedAdminIds)}>Delete selected ({selectedAdminIds.length})</Button>
      </div>
      <Card title="Administrators" subtitle={`${filteredAdmins.length} shown of ${admins.length}`} noPadding>
        {filteredAdmins.length === 0 ? (
          <EmptyState icon={Shield} title="No administrators found" description="Create an administrator account to get started" action={<Button icon={UserPlus} onClick={onAdd}>Add Administrator</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={filteredAdmins.length > 0 && filteredAdmins.every((admin) => selectedAdminIds.includes(admin.admin_id))}
                      onChange={(event) => onToggleAll(event.target.checked)}
                      aria-label="Select all administrators"
                    />
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Administrator</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="w-24 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => {
                  const name = admin.admin_name || `Admin #${admin.admin_id}`;
                  const checked = selectedAdminIds.includes(admin.admin_id);
                  return (
                    <tr key={admin.admin_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={checked} onChange={() => onToggleOne(admin.admin_id)} aria-label={`Select ${name}`} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{name}</p>
                            <p className="text-xs text-slate-500">{admin.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><Badge variant={admin.role === 'Super Admin' ? 'purple' : 'info'}>{admin.role || 'Admin'}</Badge></td>
                      <td className="px-5 py-4"><Badge variant={admin.status === 'Inactive' ? 'danger' : 'success'}>{admin.status || 'Active'}</Badge></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="Edit administrator" onClick={() => onEdit(admin)}><Edit3 size={16} /></button>
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete administrator" onClick={() => onDelete([admin.admin_id])}><Trash2 size={16} /></button>
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
