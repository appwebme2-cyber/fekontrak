
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Building, Phone, Edit, UserCheck, UserX } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pic' | 'user';
  company_name?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

interface UserCardProps {
  profile: UserProfile;
  onEdit?: (user: UserProfile) => void;
  index: number;
}

export const UserCard = ({ profile, onEdit, index }: UserCardProps) => {
  const getRoleBadge = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'pic': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'user': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    } as const;

    const labels = {
      'admin': 'Admin',
      'pic': 'PIC',
      'user': 'User'
    };

    return (
      <Badge className={colors[role as keyof typeof colors]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <UserCheck className="w-3 h-3 mr-1" />
          Aktif
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <UserX className="w-3 h-3 mr-1" />
          Tidak Aktif
        </Badge>
      );
    }
  };

  return (
    <Card className="card-hover animate-fade-in-scale" style={{ animationDelay: `${0.1 * index}s` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{profile.full_name}</h3>
              <div className="flex gap-2 mt-1">
                {getRoleBadge(profile.role)}
                {getStatusBadge(profile.is_active)}
              </div>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(profile)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>{profile.email}</span>
        </div>
        {profile.company_name && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>{profile.company_name}</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{profile.phone}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Bergabung: {new Date(profile.created_at).toLocaleDateString('id-ID')}
        </div>
      </CardContent>
    </Card>
  );
};
