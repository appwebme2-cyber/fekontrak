
import { useState, useEffect } from 'react';
import { ContractFormData, initialFormData, createFormDataFromContract } from '../utils/contractFormUtils';
import { Kontrak } from '@/types/database';

interface UseContractFormStateProps {
  contract: Kontrak | null;
  open: boolean;
}

export const useContractFormState = ({ contract, open }: UseContractFormStateProps) => {
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('basic');

  // Single effect to handle contract data loading
  useEffect(() => {
    if (open) {
      if (contract) {
        console.log('📝 Loading contract data for editing:', contract.id_kontrak);
        const newFormData = createFormDataFromContract(contract);
        setFormData(newFormData);
      } else {
        console.log('📝 Resetting form for new contract');
        setFormData(initialFormData);
      }
      setActiveTab('basic');
    }
  }, [contract?.id_kontrak, open]);

  const handleFormDataChange = (newData: Partial<ContractFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return {
    formData,
    setFormData: handleFormDataChange,
    activeTab,
    setActiveTab
  };
};
