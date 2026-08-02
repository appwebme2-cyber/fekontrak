/**
 * Contract eligibility utilities for consistent filtering across the application
 */

export interface ContractFilters {
  includeCompleted?: boolean;
  contractTypes?: string[];
  statuses?: string[];
}

/**
 * Get contracts eligible for general monitoring (Active and Pre-KOM)
 */
export const getEligibleContracts = (contracts: any[], includeCompleted = false) => {
  return contracts.filter(contract => {
    if (includeCompleted) {
      return true; // Include all contracts
    }
    
    // Only include active and pre-KOM contracts
    const status = contract.status_kontrak;
    return status === 'Aktif' || status === 'Active' || status === 'Pre-KOM';
  });
};

/**
 * Get contracts eligible for progress monitoring (Active Lumpsum/TSA only)
 */
export const getProgressEligibleContracts = (contracts: any[]) => {
  return contracts.filter(contract => {
    // Only include active contracts for progress monitoring
    const status = contract.status_kontrak;
    const isActive = status === 'Aktif' || status === 'Active';
    
    // Only include Lumpsum and TSA/LTSA contracts
    const contractType = contract.tipe_kontrak;
    const isEligibleType = contractType === 'Lumpsum' || contractType === 'TSA/LTSA';
    
    return isActive && isEligibleType;
  });
};

/**
 * Get contracts eligible for SLA KOM monitoring (Pre-KOM only)
 */
export const getSLAEligibleContracts = (contracts: any[]) => {
  return contracts.filter(contract => {
    // Only include Pre-KOM contracts for SLA monitoring
    return contract.status_kontrak === 'Pre-KOM';
  });
};

/**
 * Get contracts for financial analysis (configurable)
 */
export const getFinancialEligibleContracts = (contracts: any[], includeCompleted = true) => {
  if (includeCompleted) {
    return contracts;
  }
  
  return getEligibleContracts(contracts, false);
};

/**
 * Get contracts for risk assessment (Active and Pre-KOM with some exceptions)
 */
export const getRiskEligibleContracts = (contracts: any[], riskType: 'schedule' | 'financial' | 'amendment') => {
  switch (riskType) {
    case 'schedule':
      // Schedule risk only for active Lumpsum/TSA contracts
      return getProgressEligibleContracts(contracts);
    
    case 'financial':
      // Financial risk for all active and pre-KOM contracts
      return getEligibleContracts(contracts, false);
    
    case 'amendment':
      // Amendment risk for all active contracts (including completed for historical analysis)
      return contracts.filter(contract => {
        const status = contract.status_kontrak;
        return status === 'Aktif' || status === 'Active' || status === 'Selesai' || status === 'Completed';
      });
    
    default:
      return getEligibleContracts(contracts, false);
  }
};

/**
 * Contract status normalization
 */
export const normalizeContractStatus = (status: string): string => {
  switch (status) {
    case 'Aktif': return 'Active';
    case 'Selesai': return 'Completed';
    case 'Pre-KOM': return 'Pre-KOM';
    case 'Terminated': return 'Terminated';
    default: return status;
  }
};

/**
 * Check if contract is eligible for specific monitoring type
 */
export const isContractEligibleFor = (contract: any, monitoringType: 'progress' | 'sla' | 'financial' | 'general'): boolean => {
  const status = contract.status_kontrak;
  const contractType = contract.tipe_kontrak;
  
  switch (monitoringType) {
    case 'progress':
      return (status === 'Aktif' || status === 'Active') && 
             (contractType === 'Lumpsum' || contractType === 'TSA/LTSA');
    
    case 'sla':
      return status === 'Pre-KOM';
    
    case 'financial':
      return status === 'Aktif' || status === 'Active' || status === 'Pre-KOM' || status === 'Selesai' || status === 'Completed';
    
    case 'general':
      return status === 'Aktif' || status === 'Active' || status === 'Pre-KOM';
    
    default:
      return true;
  }
};