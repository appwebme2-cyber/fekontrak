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
  id_ru?: string | null;
}

export interface UserFormData {
  email: string;
  full_name: string;
  role: 'admin' | ConfigurableRole;
  id_vendor?: string;
  /** Multi-RU: '' untuk admin = Super Admin (semua RU). Hanya diatur Super Admin. */
  id_ru: string;
}
