import { hasPermission, type AppAction, type AppModule } from '../utils/permissions';
import { useApp } from '../context/AppContext';

export function useCan(module: AppModule, action: AppAction): boolean {
  const {
    currentRole,
    isSupabaseLive,
    currentMemberRole,
    permissionOverrides,
    permissionsLoading,
    permissionsError,
  } = useApp();

  if (isSupabaseLive && (!currentMemberRole || permissionsLoading || permissionsError)) {
    return false;
  }

  const override = permissionOverrides[module]?.[action];
  return override ?? hasPermission(currentRole, module, action);
}
