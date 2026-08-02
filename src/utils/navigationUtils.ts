import { NavigateFunction } from 'react-router-dom';

/**
 * Navigation utilities for consistent routing across the application
 */

export const navigateToContract = (navigate: NavigateFunction, contractId: string) => {
  navigate(`/contracts/${contractId}`);
};

export const navigateToInvoice = (navigate: NavigateFunction, invoiceId: string) => {
  navigate(`/invoice-detail/${invoiceId}`);
};

export const navigateToVendor = (navigate: NavigateFunction, vendorId: string) => {
  navigate(`/vendors?vendor=${vendorId}`);
};

export const navigateToInvoiceManagement = (navigate: NavigateFunction, contractId?: string) => {
  if (contractId) {
    navigate(`/invoices?contract=${contractId}`);
  } else {
    navigate('/invoices');
  }
};

export const navigateToContractsWithFilter = (navigate: NavigateFunction, filters: {
  status?: string;
  type?: string;
  workDirection?: string;
  discipline?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  navigate(`/contracts${queryString ? `?${queryString}` : ''}`);
};

/**
 * Contract eligibility utilities for consistent filtering
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

export const getSLAEligibleContracts = (contracts: any[]) => {
  return contracts.filter(contract => {
    // Only include Pre-KOM contracts for SLA monitoring
    return contract.status_kontrak === 'Pre-KOM';
  });
};

/**
 * Common click handler patterns with event propagation prevention
 */
export const createContractClickHandler = (
  navigate: NavigateFunction, 
  contractId: string,
  onContractClick?: (contractId: string) => void
) => {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContractClick) {
      onContractClick(contractId);
    } else {
      navigateToContract(navigate, contractId);
    }
  };
};

export const createInvoiceClickHandler = (
  navigate: NavigateFunction, 
  invoiceId: string,
  onInvoiceClick?: (invoiceId: string) => void
) => {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInvoiceClick) {
      onInvoiceClick(invoiceId);
    } else {
      navigateToInvoice(navigate, invoiceId);
    }
  };
};