
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InvoiceFormBasicTab } from './InvoiceFormBasicTab';
import { InvoiceFormStatusTab } from './InvoiceFormStatusTab';
import { InvoiceFormMemoTab } from './InvoiceFormMemoTab';
import { useInvoiceFormSubmission } from './InvoiceFormSubmission';

interface InvoiceFormContentProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  selectedContract?: any;
  isEditMode?: boolean;
  statusLoading: boolean;
  handleStatusChange: (currentStatus: string, statusValue: string, updateFormData: (field: string, value: any) => void) => void;
  validateForm: (formData: any) => boolean;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
  invoice?: any;
}

export const InvoiceFormContent = ({
  formData,
  updateFormData,
  selectedContract,
  isEditMode = false,
  statusLoading,
  handleStatusChange,
  validateForm,
  onSubmit,
  onClose,
  isLoading,
  invoice
}: InvoiceFormContentProps) => {
  const { handleSubmit } = useInvoiceFormSubmission({
    formData,
    validateForm: () => validateForm(formData),
    onSubmit,
    onClose
  });

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
        <TabsTrigger value="status">Status & Progress</TabsTrigger>
        <TabsTrigger value="memo">Memo & Dokumen</TabsTrigger>
      </TabsList>

      <form onSubmit={handleSubmit}>
        <TabsContent value="basic">
            <InvoiceFormBasicTab
              formData={formData}
              updateFormData={updateFormData}
              selectedContract={selectedContract}
              isEditMode={isEditMode}
            />
        </TabsContent>

        <TabsContent value="status">
          <InvoiceFormStatusTab
            formData={formData}
            updateFormData={updateFormData}
            statusLoading={statusLoading}
            handleStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="memo">
          <InvoiceFormMemoTab
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || statusLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Menyimpan...' : invoice ? 'Perbarui Tagihan' : 'Simpan Tagihan'}
          </Button>
        </div>
      </form>
    </Tabs>
  );
};
