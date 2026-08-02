
import { useState, useEffect } from 'react';
import { ContractFormData, initialFormData, createFormDataFromContract } from '../utils/contractFormUtils';
import { Kontrak } from '@/types/database';

interface UseSimpleContractFormStateProps {
  contract: Kontrak | null;
  open: boolean;
}

export const useSimpleContractFormState = ({ contract, open }: UseSimpleContractFormStateProps) => {
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      console.log('🔄 Dialog opened, initializing form data');
      if (contract) {
        console.log('📝 Loading contract data for editing:', contract.id_kontrak);
        console.log('📝 Contract documents before loading:', {
          contract_documents: contract.contract_documents,
          amendment_documents: contract.amendment_documents
        });
        
        const newFormData = createFormDataFromContract(contract);
        console.log('📝 Created form data from contract:', {
          id: newFormData,
          contract_documents_count: newFormData.contract_documents?.length || 0,
          amendment_documents_count: newFormData.amendment_documents?.length || 0
        });
        setFormData(newFormData);
      } else {
        console.log('📝 Resetting form for new contract');
        setFormData(initialFormData);
      }
      setActiveTab('basic');
    }
  }, [open, contract?.id_kontrak]);

  // Simple form data update function
  const updateFormData = (newData: Partial<ContractFormData>) => {
    console.log('🔄 Updating form data:', newData);
    setFormData(prevData => {
      const updatedData = { ...prevData, ...newData };
      console.log('🔄 Updated form data:', {
        ...updatedData,
        contract_documents_count: updatedData.contract_documents?.length || 0,
        amendment_documents_count: updatedData.amendment_documents?.length || 0
      });
      return updatedData;
    });
  };

  console.log('🔍 useSimpleContractFormState current state:', {
    contract_id: contract?.id_kontrak,
    formData_contract_documents: formData.contract_documents?.length || 0,
    formData_amendment_documents: formData.amendment_documents?.length || 0,
    activeTab
  });

  return {
    formData,
    setFormData: updateFormData,
    activeTab,
    setActiveTab
  };
};
