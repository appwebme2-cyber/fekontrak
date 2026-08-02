
import { TechnicalDetailsForm } from './forms/TechnicalDetailsForm';

interface ContractDetailsProps {
  formData: {
    status_kontrak: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    disiplin: string;
    direksi_pekerjaan: string;
    tkdn_percentage: string;
    durasi_kontrak_hari: string;
    progress_plan: number;
    progress_actual: number;
    aktivitas_saat_ini: string;
    kendala: string;
  };
  setFormData: (data: any) => void;
}

export const ContractDetails = ({ formData, setFormData }: ContractDetailsProps) => {
  return <TechnicalDetailsForm formData={formData} setFormData={setFormData} />;
};
