import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { UserProfile } from '../types';
import { usePermissions } from '@/hooks/usePermissions';
import { resolveConfigurableRole } from '@/hooks/useRolePermissionsConfig';

interface UserTableRowProps {
  user: UserProfile;
  index: number;
  isAdmin: boolean;
  currentUserId?: string;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
}

export const UserTableRow = ({
  user,
  index,
  isAdmin,
  currentUserId,
  onToggleStatus,
  onEdit,
  onDelete
}: UserTableRowProps) => {
  const { roleLabels } = usePermissions();

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'admin':        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'manager':      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'section_head': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'supervisor':   'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'technician':   'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'external':     'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'guest':        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };

    const resolvedRole = role === 'admin' ? 'admin' : resolveConfigurableRole(role);

    return (
      <Badge className={colors[resolvedRole] || 'bg-gray-100 text-gray-800'}>
        {roleLabels[resolvedRole as keyof typeof roleLabels] || role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <UserCheck className="w-3 h-3 mr-1" /> Aktif
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <UserX className="w-3 h-3 mr-1" /> Tidak Aktif
      </Badge>
    );
  };

  return (
    <TableRow className="animate-fade-in-scale" style={{ animationDelay: `${0.1 * index}s` }}>
      <TableCell className="font-medium">{user.full_name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{getRoleBadge(user.role)}</TableCell>
      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
      <TableCell>{user.id_vendor || '-'}</TableCell>
      {isAdmin && (
        <TableCell>
          <Switch
            checked={user.is_active}
            onCheckedChange={() => onToggleStatus(user.id, user.is_active)}
            disabled={user.id === currentUserId}
          />
        </TableCell>
      )}
      {isAdmin && (
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              disabled={user.id === currentUserId}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={user.id === currentUserId}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};