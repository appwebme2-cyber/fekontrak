import { User, UserX, type LucideIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { usePermissions } from '@/hooks/usePermissions';
import { CONFIGURABLE_ROLES, resolveConfigurableRole } from '@/hooks/useRolePermissionsConfig';

interface UserRoleSummaryCardsProps {
  users: UserProfile[];
}

const ROLE_GRADIENTS: Record<string, string> = {
  admin: 'from-red-500 to-red-600',
  manager: 'from-blue-500 to-blue-600',
  section_head: 'from-indigo-500 to-indigo-600',
  supervisor: 'from-teal-500 to-teal-600',
  technician: 'from-cyan-500 to-cyan-600',
  head_office: 'from-emerald-500 to-emerald-600',
  external: 'from-orange-500 to-orange-600',
  guest: 'from-purple-500 to-purple-600',
};

/** Kartu ringkasan bergaya sama dengan kartu ringkasan di halaman Vendor. */
const SummaryCard = ({ icon: Icon, gradient, value, label }: { icon: LucideIcon; gradient: string; value: number; label: string }) => (
  <div className="flex items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm">
    <div className={`p-2 rounded-lg bg-gradient-to-tr ${gradient}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

export const UserRoleSummaryCards = ({ users }: UserRoleSummaryCardsProps) => {
  const { roleLabels } = usePermissions();

  const roleKeys: Array<'admin' | typeof CONFIGURABLE_ROLES[number]> = ['admin', ...CONFIGURABLE_ROLES];

  const countForRole = (role: string) =>
    users.filter((user) => (user.role === 'admin' ? 'admin' : resolveConfigurableRole(user.role)) === role).length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {roleKeys.map((role) => (
        <SummaryCard
          key={role}
          icon={User}
          gradient={ROLE_GRADIENTS[role] ?? 'from-gray-500 to-gray-600'}
          value={countForRole(role)}
          label={roleLabels[role]}
        />
      ))}
      <SummaryCard
        icon={UserX}
        gradient="from-gray-500 to-gray-600"
        value={users.filter((user) => !user.is_active).length}
        label="Tidak Aktif"
      />
    </div>
  );
};
