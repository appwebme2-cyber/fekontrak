import { useMemo } from 'react';
import { useContracts } from '@/hooks/useContracts';
import { useAuth } from '@/hooks/useAuth';
import { isStaffOrAdminRole } from '@/hooks/useRolePermissionsConfig';

interface UseOptimizedContractsOptions {
  contractType?: string;
}

export const useOptimizedContracts = (options: UseOptimizedContractsOptions = {}) => {
  const { contractType } = options;

  const {
    contracts,
    isLoading,
    error,
    createContract,
    updateContract,
    deleteContract
  } = useContracts();

  const { userProfile } = useAuth();

  const canCRUD = isStaffOrAdminRole(userProfile?.role);

  // 🔥 filter by type (optional)
  const filteredContracts = useMemo(() => {
    if (!contractType || contractType === 'all') return contracts;

    return contracts.filter(
      (c: any) => c.tipe_kontrak === contractType
    );
  }, [contracts, contractType]);

  return {
    contracts: filteredContracts,
    totalCount: filteredContracts.length,
    hasMore: false,
    isLoading,
    error,
    createContract,
    updateContract,
    deleteContract,
    canCRUD,
    vendorsMap: {}, // tidak perlu lagi
  };
};