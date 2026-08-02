
import { NewBasicInfoForm } from './forms/NewBasicInfoForm';

interface ContractBasicInfoProps {
  formData: {
    judul_kontrak: string;
    no_dokumen_kontrak?: string;
    no_po_pr?: string;
    tipe_kontrak: string;
    status_kontrak: string;
    nilai_awal: string;
    tanggal_terima_dokumen: string;
    tanggal_maksimal_kom: string;
    tanggal_kom: string;
  };
  setFormData: (data: any) => void;
}

export const ContractBasicInfo = ({ formData, setFormData }: ContractBasicInfoProps) => {
  console.log('🔄 ContractBasicInfo render with formData:', formData);
  return <NewBasicInfoForm formData={formData} setFormData={setFormData} />;
};
