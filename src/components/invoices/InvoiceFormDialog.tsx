
import { 
  ConfirmableDialog, 
  ConfirmableDialogContent, 
  ConfirmableDialogHeader, 
  ConfirmableDialogTitle 
} from '@/components/ui/confirmable-dialog';
import { Tagihan } from '@/types/database';
import { useInvoiceFormLogic } from './form/hooks/useInvoiceFormLogic';
import { useInvoiceFormChangeDetection } from './form/hooks/useInvoiceFormChangeDetection';
import { InvoiceFormContent } from './form/InvoiceFormContent';

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Tagihan | null;
  initialContractId?: string;
  onSubmit: (data: Omit<Tagihan, 'id_tagihan' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export const InvoiceFormDialog = ({
  open,
  onOpenChange,
  invoice,
  initialContractId,
  onSubmit,
  isLoading = false
}: InvoiceFormDialogProps) => {
  const {
    formData,
    updateFormData,
    statusLoading,
    handleStatusChange,
    validateForm,
    selectedContract,
    isEditMode,
    contractsLoading
  } = useInvoiceFormLogic({ open, invoice, initialContractId });

  const { hasUnsavedChanges } = useInvoiceFormChangeDetection({
    formData,
    invoice,
    open
  });

  console.log('🔍 InvoiceFormDialog render:', { 
    open, 
    invoice: invoice?.id_tagihan, 
    formData_id_kontrak: formData.id_kontrak,
    selectedContract: selectedContract?.id_kontrak,
    isEditMode
  });

  return (
    <ConfirmableDialog open={open} onOpenChange={onOpenChange}>
      <ConfirmableDialogContent 
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        hasUnsavedChanges={hasUnsavedChanges}
        onConfirmClose={() => onOpenChange(false)}
      >
        <ConfirmableDialogHeader>
          <ConfirmableDialogTitle 
            className="text-xl font-semibold"
            hasUnsavedChanges={hasUnsavedChanges}
          >
            {invoice ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}
          </ConfirmableDialogTitle>
        </ConfirmableDialogHeader>
        
        <InvoiceFormContent
          formData={formData}
          updateFormData={updateFormData}
          selectedContract={selectedContract}
          isEditMode={isEditMode}
          statusLoading={statusLoading}
          handleStatusChange={handleStatusChange}
          validateForm={validateForm}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
          isLoading={isLoading || contractsLoading}
          invoice={invoice}
        />
      </ConfirmableDialogContent>
    </ConfirmableDialog>
  );
};
