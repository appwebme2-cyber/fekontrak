
import { useState, useMemo } from 'react';
import { Kontrak } from '@/types/database';
import { normalizeWorkDirection, normalizeDiscipline, getUniqueWorkDirections, getUniqueDisciplines } from '@/utils/filterUtils';

export const useDashboardFilters = (contracts: Kontrak[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [contractWorkDirectionFilter, setContractWorkDirectionFilter] = useState('all');
  const [contractDisciplineFilter, setContractDisciplineFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract and normalize unique work directions and disciplines
  const workDirections = useMemo(() => {
    return getUniqueWorkDirections(contracts);
  }, [contracts]);

  const disciplines = useMemo(() => {
    return getUniqueDisciplines(contracts);
  }, [contracts]);

  // Fix the filter mapping to match the actual status values in database
  const normalizeStatusFilter = (filterValue: string, contractStatus: string) => {
    // Map filter values to actual database status values
    const statusMapping: Record<string, string[]> = {
      'all': [], // No filtering for 'all'
      'pre-kom': ['Pre-KOM'],
      'active': ['Aktif', 'Active'], // Handle both variations
      'completed': ['Selesai', 'Completed'] // Handle both variations
    };

    if (filterValue === 'all') return true;
    
    const mappedStatuses = statusMapping[filterValue] || [];
    return mappedStatuses.includes(contractStatus);
  };

  // Optimized filtering with useMemo and proper status normalization
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // Search filter
      const matchesSearch = !searchQuery || 
        contract.judul_kontrak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.no_dokumen_kontrak?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.no_po_pr?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter with proper mapping
      const matchesFilter = normalizeStatusFilter(activeFilter, contract.status_kontrak);
      
      // Normalize contract data for comparison
      const normalizedContractDirection = normalizeWorkDirection(contract.direksi_pekerjaan || '');
      const normalizedContractDiscipline = normalizeDiscipline(contract.disiplin || '');
      
      const matchesWorkDirection = contractWorkDirectionFilter === 'all' || 
        normalizedContractDirection === contractWorkDirectionFilter;
      const matchesDiscipline = contractDisciplineFilter === 'all' || 
        normalizedContractDiscipline === contractDisciplineFilter;
      
      return matchesSearch && matchesFilter && matchesWorkDirection && matchesDiscipline;
    });
  }, [contracts, searchQuery, activeFilter, contractWorkDirectionFilter, contractDisciplineFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setContractWorkDirectionFilter('all');
    setContractDisciplineFilter('all');
  };

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    contractWorkDirectionFilter,
    setContractWorkDirectionFilter,
    contractDisciplineFilter,
    setContractDisciplineFilter,
    viewMode,
    setViewMode,
    workDirections,
    disciplines,
    filteredContracts,
    resetFilters
  };
};
