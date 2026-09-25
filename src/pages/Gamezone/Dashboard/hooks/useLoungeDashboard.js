import { createCatalogActions } from './catalogActions';
import { useLoungeState } from './useLoungeState';
import { useSessionActions } from './useSessionActions';

export function useLoungeDashboard() {
  const lounge = useLoungeState();
  const catalog = createCatalogActions(lounge);
  const sessions = useSessionActions(lounge);
  return { ...lounge, ...catalog, ...sessions };
}
