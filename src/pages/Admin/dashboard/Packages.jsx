import { Package, Plus } from 'lucide-react';
import { pickPackageId } from '../constants';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { PackageCard } from '../components/cards';

export default function PackagesPage({
  packages,
  loading,
  actionLoading,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Credit Packages</h2>
          <p className="text-sm text-slate-500">{packages.length} packages configured</p>
        </div>
        <Button icon={Plus} onClick={onCreate}>New Package</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-64 w-full" />)}
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No packages yet"
            description="Create your first credit package to offer to game zones"
            action={<Button icon={Plus} onClick={onCreate}>Create Package</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pickPackageId(pkg)}
              pkg={pkg}
              onEdit={() => onEdit(pkg)}
              onDelete={() => onDelete(pkg)}
              deleting={actionLoading === `del-${pickPackageId(pkg)}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
