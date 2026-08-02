
import { ProgressForm } from './forms/ProgressForm';

interface ContractProgressProps {
  formData: {
    progress_plan?: number;
    progress_actual?: number;
    aktivitas_saat_ini?: string;
    kendala?: string;
    tipe_kontrak: string;
    tanggal_lkp?: string;
  };
  setFormData: (data: any) => void;
}

export const ContractProgress = ({ formData, setFormData }: ContractProgressProps) => {
  return <ProgressForm formData={formData} setFormData={setFormData} />;
};
