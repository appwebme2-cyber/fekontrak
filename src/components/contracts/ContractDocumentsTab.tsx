
import { DocumentsForm } from './forms/DocumentsForm';

interface ContractDocumentsTabProps {
  formData: {
    contract_documents?: any[];
    amendment_documents?: any[];
  };
  setFormData: (data: any) => void;
}

export const ContractDocumentsTab = ({ formData, setFormData }: ContractDocumentsTabProps) => {
  console.log('📊 ContractDocumentsTab render with formData:', {
    contract_documents: formData.contract_documents?.length || 0,
    amendment_documents: formData.amendment_documents?.length || 0,
    formData: {
      contract_documents: formData.contract_documents,
      amendment_documents: formData.amendment_documents
    }
  });

  return (
    <div className="h-full">
      <DocumentsForm 
        formData={{
          contract_documents: formData.contract_documents || [],
          amendment_documents: formData.amendment_documents || []
        }} 
        setFormData={setFormData} 
      />
    </div>
  );
};
