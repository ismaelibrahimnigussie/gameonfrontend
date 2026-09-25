import { useGameZoneAuth } from '../../../../context/GameZoneAuthContext';
import { projectLoungeState } from './loungeView';
import { useLoungeBindings } from './useLoungeBindings';
import { useLoungeFields } from './useLoungeFields';

export function useLoungeState() {
  const auth = useGameZoneAuth();
  const field = useLoungeFields();
  return projectLoungeState(auth, field, useLoungeBindings(auth, field));
}
