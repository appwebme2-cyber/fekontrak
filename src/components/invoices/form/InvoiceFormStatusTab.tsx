
import { InvoiceFormHorizontalTimeline } from './InvoiceFormHorizontalTimeline';

interface InvoiceFormStatusTabProps {
  formData: any;
  statusLoading: boolean;
  handleStatusChange: (currentStatus: string, statusValue: string, updateFormData: (field: string, value: any) => void) => void;
  updateFormData: (field: string, value: any) => void;
}

export const InvoiceFormStatusTab = ({
  formData,
  statusLoading,
  handleStatusChange,
  updateFormData
}: InvoiceFormStatusTabProps) => {
  return (
    <InvoiceFormHorizontalTimeline
      formData={formData}
      statusLoading={statusLoading}
      handleStatusChange={handleStatusChange}
      updateFormData={updateFormData}
    />
  );
};
