
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserX } from 'lucide-react';
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
  external: 'from-orange-500 to-orange-600',
  guest: 'from-purple-500 to-purple-600',
};

export const UserRoleSummaryCards = ({ users }: UserRoleSummaryCardsProps) => {
  const { roleLabels } = usePermissions();

  const roleKeys: Array<'admin' | typeof CONFIGURABLE_ROLES[number]> = ['admin', ...CONFIGURABLE_ROLES];

  const countForRole = (role: string) =>
    users.filter((user) => (user.role === 'admin' ? 'admin' : resolveConfigurableRole(user.role)) === role).length;

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
      {roleKeys.map((role, idx) => (
        <Card
          key={role}
          className={`card-hover border-0 text-white bg-gradient-to-r ${ROLE_GRADIENTS[role] ?? 'from-gray-500 to-gray-600'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">{roleLabels[role]}</CardTitle>
            <User className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-count-up" style={{ animationDelay: `${0.1 * idx}s` }}>
              {countForRole(role)}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="card-hover border-0 text-white bg-gradient-to-r from-gray-500 to-gray-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90">Tidak Aktif</CardTitle>
          <UserX className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white animate-count-up" style={{ animationDelay: `${0.1 * roleKeys.length}s` }}>
            {users.filter(user => !user.is_active).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
