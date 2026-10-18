import { getSupabase } from '../../../lib/supabase';
import type { AppAction, AppModule, UserRole } from '../../../utils/permissions';

export type PermissionOverrides = Partial<Record<AppModule, Partial<Record<AppAction, boolean>>>>;

export async function fetchRolePermissionOverrides(
  organizationId: string,
  role: UserRole,
): Promise<PermissionOverrides> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Koneksi Supabase belum tersedia untuk memuat izin.');

  const { data, error } = await supabase
    .from('roles_permissions')
    .select('module, action, allowed')
    .eq('organization_id', organizationId)
    .eq('role', role);

  if (error) throw error;

  const overrides: PermissionOverrides = {};
  for (const permission of data ?? []) {
    const module = permission.module as AppModule;
    const action = permission.action as AppAction;
    if (!['dashboard', 'projects', 'rab', 'field_reports', 'procurement', 'warehouse', 'finance', 'safety', 'approvals', 'users', 'settings'].includes(module)) {
      continue;
    }
    if (!['view', 'create', 'edit', 'delete', 'approve'].includes(action)) continue;
    overrides[module] = {
      ...overrides[module],
      [action]: permission.allowed,
    };
  }
  return overrides;
}
