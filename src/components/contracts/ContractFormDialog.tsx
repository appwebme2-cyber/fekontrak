
import { 
  ConfirmableDialog, 
  ConfirmableDialogContent, 
  ConfirmableDialogHeader, 
  ConfirmableDialogTitle 
} from '@/components/ui/confirmable-dialog';
import { Kontrak } from '@/types/database';
import { ContractFormTabs } from './ContractFormTabs';
import { ContractFormNavigation } from './ContractFormNavigation';
import { useFormValidation } from './ContractFormValidation';
import { useSimpleContractFormState } from './hooks/useSimpleContractFormState';
import { useContractFormSubmission } from './hooks/useContractFormSubmission';
import { useContractFormChangeDetection } from './hooks/useContractFormChangeDetection';

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Kontrak | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const ContractFormDialog = ({
  open,
  onOpenChange,
  contract,
  onSubmit,
  isLoading = false
}: ContractFormDialogProps) => {
  console.log('🔄 ContractFormDialog render with contract:', contract?.id_kontrak);
  
  const {
    formData,
    setFormData,
    activeTab,
    setActiveTab
  } = useSimpleContractFormState({ contract, open });

  const { 
    isBasicValid, 
    isTechnicalValid, 
    isVendorValid, 
    isProgressValid
  } = useFormValidation(formData);

  const { handleSubmit } = useContractFormSubmission({
    formData,
    contract,
    onSubmit
  });

  const { hasUnsavedChanges } = useContractFormChangeDetection({
    formData,
    contract,
    open
  });

  if (!open) return null;

  return (
    <ConfirmableDialog open={open} onOpenChange={onOpenChange}>
      <ConfirmableDialogContent 
        className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        hasUnsavedChanges={hasUnsavedChanges}
        onConfirmClose={() => onOpenChange(false)}
      >
        <ConfirmableDialogHeader>
          <ConfirmableDialogTitle 
            className="text-xl"
            hasUnsavedChanges={hasUnsavedChanges}
          >
            {contract ? 'Edit Kontrak' : 'Tambah Kontrak Baru'}
          </ConfirmableDialogTitle>
        </ConfirmableDialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <ContractFormTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            formData={formData}
            setFormData={setFormData}
            isBasicValid={isBasicValid}
            isTechnicalValid={isTechnicalValid}
            isVendorValid={isVendorValid}
            isProgressValid={isProgressValid}
            contractId={contract?.id_kontrak}
          />

          <ContractFormNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            isEditing={!!contract}
          />
        </form>
      </ConfirmableDialogContent>
    </ConfirmableDialog>
  );
};
