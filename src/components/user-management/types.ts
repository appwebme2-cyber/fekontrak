import { ConfigurableRole } from '@/hooks/useRolePermissionsConfig';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  id_vendor?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface UserFormData {
  email: string;
  full_name: string;
  role: 'admin' | ConfigurableRole;
  id_vendor?: string;
}
