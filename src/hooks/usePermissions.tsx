import { useAuth } from '@/hooks/useAuth';
import {
  useRolePermissionsConfig,
  CONFIGURABLE_MENU_ITEMS,
  resolveConfigurableRole,
} from '@/hooks/useRolePermissionsConfig';

/** Label "Admin" tetap dan tidak bisa diubah lewat /role-settings. */
const ADMIN_LABEL = 'Admin';

/**
 * Role matrix bawaan (lihat src/hooks/useRolePermissionsConfig.tsx untuk default
 * dan halaman /role-settings untuk mengubahnya):
 * Admin                                    → akses penuh, tidak bisa diubah
 * Manager/Section Head/Supervisor/Technician → canCreate, canEdit, NO delete, NO user/vendor management (bisa dibedakan lewat Pengaturan Role)
 * Guest                                    → hanya lihat, tidak bisa apa-apa
 * External                                 → hanya lihat kontrak milik sendiri
 */
export const usePermissions = () => {
  const { userProfile } = useAuth();
  const { matrix, labels } = useRolePermissionsConfig();
  const role = userProfile?.role ?? 'guest';

  const isAdmin = role === 'admin';
  const configurableRole = resolveConfigurableRole(role);
  const isVendor = !isAdmin && configurableRole === 'external';

  const allMenuKeys = CONFIGURABLE_MENU_ITEMS.map((m) => m.key);

  const flags = isAdmin
    ? {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true,
        canManageVendors: true,
        canUploadDokumen: true,
        canApprovalDokumen: true,
        visibleMenus: allMenuKeys,
      }
    : matrix[configurableRole];

  const canViewMenu = (menuKey: string) => flags.visibleMenus.includes(menuKey);

  // Nama jenis akun yang bisa diubah Admin lewat /role-settings (lihat CONFIGURABLE_MENU_ITEMS).
  const roleLabels = { admin: ADMIN_LABEL, ...labels };
  const roleLabel = isAdmin ? ADMIN_LABEL : labels[configurableRole];

  return {
    role,
    isAdmin,
    isVendor,
    roleLabel,
    roleLabels,

    // Data operations
    canCreate : flags.canCreate,
    canEdit   : flags.canEdit,
    canDelete : flags.canDelete,

    // Module access
    canManageUsers   : flags.canManageUsers,
    canManageVendors : flags.canManageVendors,
    canUploadDokumen : flags.canUploadDokumen,
    canApprovalDokumen: flags.canApprovalDokumen,

    // Menu visibility (lihat halaman /role-settings)
    visibleMenus: flags.visibleMenus,
    canViewMenu,

    // Vendor-specific
    vendorId: userProfile?.id_vendor ?? null,
  };
};